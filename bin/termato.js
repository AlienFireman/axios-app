#!/usr/bin/env node
'use strict';
//
// `termato` — the server-side command line for a Termato install.
//
//   termato start              start the server (pm2)
//   termato stop               stop the server
//   termato restart            restart the server
//   termato clients            list authorised devices
//   termato clients add        authorise a new device (shows a 6-digit code)
//   termato clients remove N   revoke authorised device N (from the list)
//
// The clients commands talk to the LOCALLY-RUNNING server over loopback only, which
// is what makes "direct server access" the trust anchor for authorising any device.
// See app/lib/clients.cjs.

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const readline = require('node:readline');
const { spawnSync } = require('node:child_process');

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
      headers: { 'Content-Type': 'application/json', ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) },
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
    console.log(dim('No authorised devices. Add one with: termato clients add'));
    return;
  }
  console.log(bold('Authorised devices:'));
  list.forEach((cl, i) => {
    const label = cl.label || cl.userAgent || 'device';
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
  if (!code) die('could not open an enrollment window.');

  const pretty = `${code.slice(0, 3)} ${code.slice(3)}`;
  console.log('');
  console.log(bold('  Connect a device'));
  console.log('  On the new device, open Termato and enter this code:');
  console.log('');
  console.log(`        ${cyan(bold(pretty))}`);
  console.log('');
  console.log(dim('  Waiting for a device… (expires in 5 minutes, Ctrl-C to cancel)'));

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
      console.log(bold('  A device entered the correct code:'));
      console.log(`    IP:      ${d.ip || 'unknown'}`);
      console.log(`    Country: ${d.country || 'unknown'}`);
      console.log(`    Device:  ${d.userAgent || 'unknown'}`);
      console.log('');
      const answer = (await prompt('  Authorise this device? [y/N] ')).toLowerCase();
      const approve = answer === 'y' || answer === 'yes';

      const decide = await apiOrExit('POST', '/api/clients/enroll', {
        action: 'decide', windowId, approve, label: d.userAgent,
      });
      if (decide.status !== 200) die(`could not finalise (${decide.body?.error || decide.status}).`);

      if (approve) {
        console.log(green('  ✓ Device added!') + ` (${loc})`);
      } else {
        console.log(dim('  Declined. The device was not authorised.'));
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
  if (res.status === 404) die(`no device ${index} (run “termato clients” to see the list).`);
  if (res.status !== 200) die(`could not remove device ${index}.`);
  const r = res.body?.removed;
  console.log(green(`✓ Removed device ${index}`) + (r?.label ? ` (${r.label})` : ''));
}

function usage() {
  console.log(`${bold('termato')} — Termato server control

  ${bold('termato start')}              start the server
  ${bold('termato stop')}               stop the server
  ${bold('termato restart')}            restart the server

  ${bold('termato clients')}            list authorised devices
  ${bold('termato clients add')}        authorise a new device
  ${bold('termato clients remove N')}   revoke authorised device N
`);
}

(async () => {
  const [cmd, sub, arg] = process.argv.slice(2);
  switch (cmd) {
    case 'start':   process.exit(cmdStart());
    case 'stop':    process.exit(cmdStop());
    case 'restart': process.exit(cmdRestart());
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
