#!/usr/bin/env node
'use strict';
//
// `termato` — the server-side command line for a Termato install.
//
//   termato start              start the server (pm2)
//   termato stop               stop the server
//   termato restart            restart the server
//   termato update             update to the latest release (--force to reinstall)
//   termato clients            list authorised clients
//   termato clients add        authorise a new client (shows a 6-digit code)
//   termato clients remove N   revoke authorised client N (from the list)
//
// A "client" is anywhere you sign in to this Termato server from — typically a web
// browser session on a phone or computer. Each client is authorised individually and
// gets its own signed cookie.
//
// The clients commands talk to the LOCALLY-RUNNING server over loopback only, which
// is what makes "direct server access" the trust anchor for authorising any client.
// See app/lib/clients.cjs.

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const readline = require('node:readline');
const { spawnSync, spawn } = require('node:child_process');

// Resolve the install root from this script's REAL location (works when symlinked
// onto PATH, e.g. /usr/local/bin/termato → <install>/bin/termato.js).
const INSTALL_DIR = path.resolve(path.dirname(fs.realpathSync(__filename)), '..');
const PM2_NAME = 'termato';

function readPort() {
  try {
    const env = fs.readFileSync(path.join(INSTALL_DIR, '.env.local'), 'utf8');
    const m = env.match(/^\s*PORT\s*=\s*(\d+)/m);
    if (m) return Number(m[1]);
  } catch { /* fall through */ }
  return Number(process.env.PORT) || 3002;
}
const PORT = readPort();

// ── tiny terminal colour ───────────────────────────────────────────────────────
const c = (n, s) => (process.stdout.isTTY ? `[${n}m${s}[0m` : s);
const bold = (s) => c('1', s);
const dim = (s) => c('2', s);
const red = (s) => c('31', s);
const green = (s) => c('32', s);
const cyan = (s) => c('36', s);
function die(msg) { console.error(red(`termato: ${msg}`)); process.exit(1); }

// ── loopback HTTP to the running server ─────────────────────────────────────────
function api(method, pathname, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      host: '127.0.0.1', port: PORT, method, path: pathname,
      // Mark this as a loopback call explicitly. The auth middleware trusts a
      // direct on-box call by its x-forwarded-for, but if we DON'T set one,
      // Next.js auto-injects the socket's remote address — and on some platforms
      // (notably macOS dual-stack loopback) that value isn't one the allowlist
      // recognises, so the middleware 401s our own local CLI. Setting it here is
      // safe: public traffic always arrives via Cloudflare (CF-* headers present),
      // which the loopback check separately rejects.
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '127.0.0.1', ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) },
    }, (res) => {
      let chunks = '';
      res.on('data', (d) => { chunks += d; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = chunks ? JSON.parse(chunks) : null; } catch { /* non-JSON */ }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function apiOrExit(method, pathname, body) {
  let res;
  try {
    res = await api(method, pathname, body);
  } catch {
    die(`couldn't reach the Termato server on 127.0.0.1:${PORT}. Is it running? Try: termato start`);
  }
  return res;
}

// ── pm2 process control ─────────────────────────────────────────────────────────
function pm2(args) {
  const r = spawnSync('pm2', args, { stdio: 'inherit', cwd: INSTALL_DIR });
  if (r.error) die('pm2 not found on PATH. Install it with: npm install -g pm2');
  return r.status || 0;
}

function isRunning() {
  const r = spawnSync('pm2', ['describe', PM2_NAME], { stdio: 'ignore', cwd: INSTALL_DIR });
  return (r.status || 0) === 0;
}

function cmdStart() {
  if (isRunning()) return pm2(['restart', PM2_NAME, '--update-env']);
  return pm2(['start', 'ecosystem.config.js', '--update-env']);
}
const cmdStop = () => pm2(['stop', PM2_NAME]);
const cmdRestart = () => pm2(['restart', PM2_NAME, '--update-env']);

// ── clients ─────────────────────────────────────────────────────────────────────
function relTime(ts) {
  if (!ts) return 'never';
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

async function cmdClientsList() {
  const res = await apiOrExit('GET', '/api/clients');
  if (res.status === 403) die('client management must be run on the server itself.');
  const list = res.body?.clients || [];
  if (!list.length) {
    console.log(dim('No authorised clients yet.'));
    console.log(dim('A client is a browser session you sign in from (phone or computer).'));
    console.log(dim('Authorise one with: termato clients add'));
    return;
  }
  console.log(bold('Authorised clients') + dim('  (browser sessions allowed to sign in):'));
  list.forEach((cl, i) => {
    const label = cl.label || cl.userAgent || 'client';
    const loc = [cl.ip, cl.country].filter(Boolean).join(' · ');
    console.log(`  ${bold(`${i + 1}.`)} ${label}`);
    console.log(`     ${dim(`${loc || 'unknown'} · last active ${relTime(cl.lastSeen)} · added ${relTime(cl.createdAt)}`)}`);
  });
}

function prompt(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (a) => { rl.close(); resolve(a.trim()); });
  });
}

async function cmdClientsAdd() {
  const start = await apiOrExit('POST', '/api/clients/enroll', { action: 'start' });
  if (start.status === 403) die('client management must be run on the server itself.');
  const { windowId, code } = start.body || {};
  if (!code) {
    // Surface the real reason instead of a blanket "couldn't open a window". The
    // most common cause is the loopback call being rejected by the auth layer
    // (401) or the server returning an error page (5xx / non-JSON).
    const status = start.status;
    const detail = start.body?.error
      ? `: ${start.body.error}`
      : (start.body ? '' : ' (no JSON body — likely a server error page)');
    if (status === 401) {
      console.error(red('termato: the server did not recognise this as a local (loopback) call'));
      console.error(dim(`  Got HTTP 401 from 127.0.0.1:${PORT}. Run this on the SERVER itself, not over a tunnel.`));
      console.error(dim('  If you ARE on the server: check the Termato logs (pm2 logs termato) — the'));
      console.error(dim('  loopback request is arriving with an unexpected x-forwarded-for header.'));
      process.exit(1);
    }
    die(`could not open an enrollment window (HTTP ${status}${detail}).`);
  }

  const pretty = `${code.slice(0, 3)} ${code.slice(3)}`;
  console.log('');
  console.log(bold('  Authorise a new client'));
  console.log(dim('  A client is a browser session that can sign in to this server'));
  console.log(dim('  (e.g. Termato open on your phone or laptop).'));
  console.log('');
  console.log('  On that browser, open Termato and enter this code:');
  console.log('');
  console.log(`        ${cyan(bold(pretty))}`);
  console.log('');
  console.log(dim('  Waiting for a client… (expires in 5 minutes, Ctrl-C to cancel)'));

  // Poll the window until something happens.
  for (;;) {
    await new Promise((r) => setTimeout(r, 1000));
    const res = await apiOrExit('GET', `/api/clients/enroll?windowId=${windowId}`);
    const st = res.body || {};

    if (st.state === 'pending') continue;

    if (st.state === 'cancelled') {
      const w = st.wrongAttempt || {};
      const who = [w.ip, w.country].filter(Boolean).join(' · ') || 'unknown';
      console.log('');
      console.log(red('  ✗ Incorrect code entered from ') + bold(who));
      console.log(dim('    Enrollment cancelled. Run “termato clients add” again to retry.'));
      process.exit(1);
    }
    if (st.state === 'expired' || st.state === 'gone') {
      console.log('');
      console.log(red('  ✗ The code expired. Run “termato clients add” again.'));
      process.exit(1);
    }
    if (st.state === 'entered') {
      const d = st.candidate || {};
      const loc = [d.ip, d.country].filter(Boolean).join(' · ') || 'unknown';
      console.log('');
      console.log(bold('  A client entered the correct code:'));
      console.log(`    IP:      ${d.ip || 'unknown'}`);
      console.log(`    Country: ${d.country || 'unknown'}`);
      console.log(`    Browser: ${d.userAgent || 'unknown'}`);
      console.log('');
      console.log(dim('  Only approve this if it matches the client you are connecting right now.'));
      const answer = (await prompt('  Authorise this client? [y/N] ')).toLowerCase();
      const approve = answer === 'y' || answer === 'yes';

      const decide = await apiOrExit('POST', '/api/clients/enroll', {
        action: 'decide', windowId, approve, label: d.userAgent,
      });
      if (decide.status !== 200) die(`could not finalise (${decide.body?.error || decide.status}).`);

      if (approve) {
        console.log(green('  ✓ Client authorised!') + ` (${loc})`);
      } else {
        console.log(dim('  Declined. The client was not authorised.'));
      }
      process.exit(0);
    }
    // any other terminal state → stop
    console.log(dim('  Enrollment closed.'));
    process.exit(0);
  }
}

async function cmdClientsRemove(arg) {
  const index = Number(arg);
  if (!Number.isInteger(index) || index < 1) die('usage: termato clients remove <number>');
  const res = await apiOrExit('DELETE', '/api/clients', { index });
  if (res.status === 403) die('client management must be run on the server itself.');
  if (res.status === 404) die(`no client ${index} (run “termato clients” to see the list).`);
  if (res.status !== 200) die(`could not remove client ${index}.`);
  const r = res.body?.removed;
  console.log(green(`✓ Removed client ${index}`) + (r?.label ? ` (${r.label})` : ''));
  console.log(dim('  That browser session is signed out immediately and must re-authorise to return.'));
}

// ── update ──────────────────────────────────────────────────────────────────────
// Drive the same self-updater the browser uses (app/api/update/route.js) over loopback:
// GET to check, POST to kick off a job, then poll the job until the server restarts.
async function cmdUpdate(flags) {
  const force = flags.includes('--force') || flags.includes('-f');

  process.stdout.write(dim('Checking for updates… '));
  const check = await apiOrExit('GET', '/api/update');
  const info = check.body || {};
  console.log('');

  if (!info.packaged) {
    die('this is not a packaged install — updates only apply to the distributed build (use the Rebuild panel for a source checkout).');
  }
  if (info.error) {
    console.log(red(`  Update check failed: ${info.error}`));
    if (!force) process.exit(1);
    console.log(dim('  Continuing anyway (--force).'));
  }

  if (!info.updateAvailable && !force) {
    console.log(green('✓ Termato is up to date.') + dim(` (${info.currentShort || 'unknown'})`));
    if (info.builtAt) console.log(dim(`  built ${new Date(info.builtAt).toLocaleString()}`));
    console.log(dim('  Run “termato update --force” to reinstall the current release.'));
    process.exit(0);
  }

  if (info.updateAvailable) {
    console.log(bold('  Update available'));
    console.log(`    current: ${info.currentShort || 'unknown'}`);
    console.log(`    latest:  ${cyan(info.latestShort || 'unknown')}`);
  } else {
    console.log(dim('  Already on the latest commit — reinstalling (--force).'));
  }
  console.log('');

  const start = await apiOrExit('POST', '/api/update');
  if (start.status === 400) die(start.body?.error || 'updates only apply to a packaged install.');
  const jobId = start.body?.jobId;
  if (!jobId) die(`could not start the update (HTTP ${start.status}).`);
  if (start.body?.alreadyRunning) console.log(dim('  An update is already running — following it…'));

  process.stdout.write('  Updating (git reset + npm ci)… ');

  // Poll the job. The server sets status:'restarting' just before it spawns a detached
  // pm2 restart, so once we see that we're done — the loopback poll would die anyway as
  // the process recycles.
  let lastStatus = '';
  for (;;) {
    await new Promise((r) => setTimeout(r, 1500));
    let res;
    try {
      res = await api('GET', `/api/update?jobId=${jobId}`);
    } catch {
      // Server went away mid-restart — treat as success (the restart was the last step).
      console.log(green('done'));
      console.log(green('✓ Update applied — Termato is restarting.'));
      process.exit(0);
    }
    const job = res.body || {};
    if (job.status === lastStatus) continue;
    lastStatus = job.status;

    if (job.status === 'update-failed' || job.status === 'restart-failed') {
      console.log(red('failed'));
      die(job.error || 'update failed.');
    }
    if (job.status === 'restarting') {
      console.log(green('done'));
      const failed = (job.migrations || []).filter((m) => !m.ok);
      if (failed.length) {
        console.log(red(`  ⚠ ${failed.length} migration(s) failed (update still applied):`));
        for (const m of failed) console.log(dim(`    • ${m.id}: ${m.error}`));
      }
      console.log(green('✓ Update applied — Termato is restarting.'));
      process.exit(0);
    }
    // status still 'updating' → keep waiting
  }
}

// ── uninstall ─────────────────────────────────────────────────────────────────
function readEnvLocal() {
  const out = {};
  try {
    const txt = fs.readFileSync(path.join(INSTALL_DIR, '.env.local'), 'utf8');
    for (const line of txt.split('\n')) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (m) out[m[1]] = m[2].trim();
    }
  } catch { /* no env file */ }
  return out;
}

// Read this install's tunnel secret from its cloudflared credentials file. The hub uses
// it as PROOF OF OWNERSHIP when deprovisioning — only the holder of this secret may tear
// the tunnel down. Returns '' if not found (deprovision then fails closed on the hub).
function readTunnelSecret() {
  try {
    const dir = path.join(INSTALL_DIR, '.cloudflared');
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.json')) continue;
      try {
        const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        if (j && j.TunnelSecret) return String(j.TunnelSecret);
      } catch { /* not a credentials json */ }
    }
  } catch { /* no .cloudflared dir */ }
  return '';
}

// Ask the hub to remove this user's tunnel + subdomains. Best-effort. We must prove we
// own the tunnel by sending its secret — the hub will refuse (403) without it.
async function deprovision(provisionUrl, username, key, secret) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(`${provisionUrl.replace(/\/$/, '')}/deprovision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(key ? { 'X-Provision-Key': key } : {}) },
      body: JSON.stringify({ username, secret }),
      signal: ctrl.signal,
    });
    let detail = '';
    try { const j = await res.json(); detail = j?.detail || j?.error || ''; } catch { /* non-JSON */ }
    return { ok: res.ok, status: res.status, detail };
  } finally {
    clearTimeout(timer);
  }
}

// Remove the `termato` symlink — but only if it actually points at THIS install.
function removeSymlink() {
  const self = fs.realpathSync(__filename);
  for (const link of ['/usr/local/bin/termato', path.join(process.env.HOME || '', '.local/bin/termato')]) {
    try {
      if (!fs.existsSync(link)) continue;
      let target = '';
      try { target = fs.realpathSync(link); } catch { /* dangling */ }
      if (target && target !== self) continue; // someone else's termato — leave it
      try {
        fs.unlinkSync(link);
        console.log(green(`  ✓ removed ${link}`));
      } catch (e) {
        if (e.code === 'EACCES' || e.code === 'EPERM') {
          const r = spawnSync('sudo', ['rm', '-f', link], { stdio: 'inherit' });
          console.log((r.status || 0) === 0 ? green(`  ✓ removed ${link} (sudo)`) : dim(`  · couldn't remove ${link} — remove it manually`));
        } else {
          console.log(dim(`  · couldn't remove ${link}: ${e.message}`));
        }
      }
    } catch { /* ignore */ }
  }
}

async function cmdUninstall(flags) {
  const yes = flags.includes('--yes') || flags.includes('-y');
  const env = readEnvLocal();
  const username = env.TERMATO_USERNAME || '';
  const provisionUrl = env.TERMATO_PROVISION_URL || 'https://provision.termato.com';
  const key = env.TERMATO_PROVISION_KEY || process.env.TERMATO_PROVISION_KEY || '';

  console.log(bold('Uninstall Termato — this permanently:'));
  console.log('    • stops & deletes the pm2 processes (termato, termato-caddy, termato-tunnel)');
  console.log('    • removes the `termato` command from your PATH');
  console.log(`    • deletes the install directory and ALL data (chats, settings):\n        ${INSTALL_DIR}`);
  if (username) console.log(`    • asks the hub to remove your tunnel + subdomains for '${username}'`);
  console.log('');

  if (!yes) {
    const a = (await prompt('Type "uninstall" to confirm: ')).toLowerCase();
    if (a !== 'uninstall') { console.log(dim('Cancelled.')); process.exit(0); }
  }

  // 1. Deprovision (best-effort — box may be offline, or the hub may have provisioning
  //    turned off; either way the local teardown below still proceeds).
  if (username) {
    process.stdout.write(`  Removing tunnel + subdomains for '${username}'… `);
    try {
      const secret = readTunnelSecret();
      const r = await deprovision(provisionUrl, username, key, secret);
      if (r.ok) console.log(green('done'));
      else if (r.status === 503) console.log(red('skipped') + dim(' (hub provisioning is off — ask the operator to remove it)'));
      else if (r.status === 401) console.log(red('skipped') + dim(' (hub needs a provisioning key)'));
      else if (r.status === 403) console.log(red('skipped') + dim(' (hub couldn\'t verify tunnel ownership — ask the operator to remove it)'));
      else console.log(red(`failed (${r.status})`) + (r.detail ? dim(` ${r.detail}`) : ''));
    } catch {
      console.log(red('skipped') + dim(` (couldn't reach ${provisionUrl})`));
    }
  }

  // 2. pm2 processes (best-effort; pm2 may not be on PATH).
  console.log('  Stopping services…');
  spawnSync('pm2', ['delete', 'termato', 'termato-caddy', 'termato-tunnel'], { stdio: 'ignore', cwd: INSTALL_DIR });
  spawnSync('pm2', ['save'], { stdio: 'ignore', cwd: INSTALL_DIR });

  // 3. CLI symlink.
  console.log('  Removing the termato command…');
  removeSymlink();

  // 4. Install dir. We're running from inside it (and from its bundled Node), so hand
  //    the recursive delete to a detached system shell that runs once we've exited.
  console.log(`  Deleting ${INSTALL_DIR}…`);
  spawn('sh', ['-c', `sleep 1; rm -rf ${JSON.stringify(INSTALL_DIR)}`], { detached: true, stdio: 'ignore' }).unref();

  console.log('');
  console.log(green('✓ Termato uninstalled.'));
  console.log(dim('  (If pm2 starts on boot only for Termato, you can also run: pm2 unstartup)'));
  process.exit(0);
}

function usage() {
  console.log(`${bold('termato')} — Termato server control

  ${bold('termato start')}              start the server
  ${bold('termato stop')}               stop the server
  ${bold('termato restart')}            restart the server

  ${bold('termato update')}             update to the latest release (--force to reinstall current)

  ${dim('A client is a browser session that can sign in to this server (phone/computer).')}
  ${bold('termato clients')}            list authorised clients
  ${bold('termato clients add')}        authorise a new client (shows a 6-digit code to enter)
  ${bold('termato clients remove N')}   revoke authorised client N

  ${bold('termato uninstall')}          remove Termato from this machine (--yes to skip the prompt)
`);
}

(async () => {
  const [cmd, sub, arg] = process.argv.slice(2);
  switch (cmd) {
    case 'start':   process.exit(cmdStart());
    case 'stop':    process.exit(cmdStop());
    case 'restart': process.exit(cmdRestart());
    case 'update': return cmdUpdate(process.argv.slice(3));
    case 'uninstall': return cmdUninstall(process.argv.slice(3));
    case 'clients':
      if (!sub)               return cmdClientsList();
      if (sub === 'add')      return cmdClientsAdd();
      if (sub === 'remove')   return cmdClientsRemove(arg);
      die(`unknown: termato clients ${sub}`);
      break;
    case undefined:
    case 'help':
    case '-h':
    case '--help':
      return usage();
    default:
      die(`unknown command: ${cmd}`);
  }
})().catch((e) => die(e.message || String(e)));
