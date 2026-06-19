# Installing Axios

Axios is a **per-user** tool: it runs as your normal user account (no root, no
service user) and operates inside your home directory — it manages your git
repos, creates worktrees under `$HOME/.worktrees`, and reads your `~/.claude`
config. Recommended install location: **`~/.axios`**.

All data/project paths derive automatically from the install directory
(`process.cwd()`, which pm2 sets) and your home (`$HOME` / `os.homedir()`), so it
works at any path for any user.

> ⚠️ **Where you run Axios matters.** Axios is Claude Code with shell + filesystem
> access **as the user that runs it** — anything that user can read or change, Axios
> can too. Don't install it on a server hosting other people's sites, production
> data, or secrets you can't afford to expose. For a shared/production box, isolate
> it: a dedicated unprivileged user, a container, or a separate machine.

## How it reaches the internet (Cloudflare Tunnel)

Most people run Axios on a home computer or laptop **behind NAT** (no public IP, no
port-forwarding). The default install sets up a **Cloudflare Tunnel** so the machine
is reachable from anywhere — including your phone — with nothing exposed inbound. You
don't register a domain or configure DNS; your admin mints a set of subdomains under
`fordweb.io` for you and sends you a small **provision bundle** file.

You get:
- the app at **`https://axios-<username>.fordweb.io`**
- dev-server previews at **`https://<animal>-<username>.fordweb.io`** (e.g.
  `beaver-dan.fordweb.io`) — animal words instead of port numbers.

The install is deliberately **non-invasive on a shared box**: it ships its own
pinned Node runtime in `~/.axios/.node` (so the build/runtime never depend on — or
touch — your system Node), never touches the system Caddy / nginx / ports 80/443
(it runs its own private Caddy on a high localhost port under pm2), auto-picks all
local ports, and appends to pm2 rather than redefining it.

## Quick install (recommended)

Provisioning is handled online — you just pick a username and password:

```bash
git clone https://github.com/AlienFireman/axios.git ~/.axios
bash ~/.axios/install.sh
```

The installer prompts for your username and password — nothing else to configure.
(For an unattended install you can pre-set `AXIOS_USERNAME` / `AXIOS_PASSWORD` to
skip the prompts.) By default the installer requests your subdomains
+ tunnel from **`provision.fordweb.io`** (override with `AXIOS_PROVISION_URL`), so
there's nothing to hand off. It then sets up a private Node 22 runtime in
`~/.axios/.node`, installs anything else missing (pm2, jq, and the Caddy +
cloudflared **binaries** — no system services),
builds the app, writes a private Caddy + tunnel config, starts everything under pm2
(`axios`, `axios-caddy`, `axios-tunnel`), and enables start-on-boot. Auto-install
supports **Debian/Ubuntu (apt)** and **macOS (Homebrew)**; other distros get a clear
"install X yourself" message.

> The hosted endpoint only answers while provisioning is **enabled** on the hub (see
> [Self-serve provisioning](#self-serve-provisioning-optional-no-manual-minting)). If
> you get a 503, ask the operator to turn it on. If you have a pre-minted bundle file
> instead, pass `AXIOS_PROVISION_BUNDLE=~/dan-axios-bundle.json` and the username/URL
> are ignored.

When it finishes, open `https://axios-<username>.fordweb.io` — try it on your phone
over cellular to confirm the tunnel works.

## Admin: minting a user

`admin/mint-user.sh <username> [slots]` (default 20 preview slots) calls the
Cloudflare API to:
- create a locally-managed tunnel `axios-<username>`,
- create proxied CNAMEs for `axios-<username>` and each `<animal>-<username>`
  (the first N animals from `app/lib/animals.js`) → `<tunnel-id>.cfargotunnel.com`,
- emit `<username>-axios-bundle.json` containing the tunnel id, the tunnel
  **credentials** (scoped to that one tunnel — they grant no DNS/account access, so
  they're safe to hand to the user), and the animal list.

Requires `curl`, `jq`, `openssl`, `node`, and env vars `CF_API_TOKEN` (Account ▸
Cloudflare Tunnel ▸ Edit **and** Zone ▸ DNS ▸ Edit), `CF_ACCOUNT_ID`, `CF_ZONE_ID`.
Set `AXIOS_DOMAIN` to override the default `fordweb.io`.

## Self-serve provisioning (optional, no manual minting)

If you'd rather not run `mint-user.sh` by hand for each user, run the **provisioning
service** on your hub server. It holds the Cloudflare token, and when **enabled** it
lets install scripts request their own bundle. You flip it on only while someone is
installing, so it isn't an open door.

```bash
# on your hub (token stays here)
CF_API_TOKEN=… CF_ACCOUNT_ID=… CF_ZONE_ID=… \
  PROVISION_KEY=optional-shared-secret \
  pm2 start provision-server.js --name axios-provision
```
Then reverse-proxy a TLS hostname to it (default port **4180**), e.g. a Caddy block
for `provision.fordweb.io → 127.0.0.1:4180`.

Turn it **on / off instantly** (no restart) with a flag file:
```bash
touch .provision-enabled    # ON  — accepts requests
rm    .provision-enabled    # OFF — returns 503
curl https://provision.fordweb.io/status   # { "enabled": true|false }
```
Defense-in-depth while on: optional `PROVISION_KEY` (callers must send a matching
`X-Provision-Key`), a per-IP rate limit, strict username validation, and a temp-dir
mint whose bundle is deleted right after it's returned. It reuses `mint-user.sh`
verbatim, so the token never leaves the hub.

Users then just run the [Quick install](#quick-install-recommended) — `install.sh`
defaults to `AXIOS_PROVISION_URL=https://provision.fordweb.io`, POSTs the username,
receives the bundle, and proceeds as normal (the fetched bundle is written to a
`chmod 600` temp file and removed at the end). If you set a `PROVISION_KEY`, users
must pass a matching `AXIOS_PROVISION_KEY`. To point at a different host, set
`AXIOS_PROVISION_URL`.

## Configuration

`install.sh` writes a git-ignored **`.env.local`** that Next.js loads for build and
runtime. For a tunnel install it contains:

| Var | Purpose |
|-----|---------|
| `AXIOS_PASSWORD_HASH` | One-way **scrypt** hash of the login password — the plaintext is never stored. Written by the installer; change later with `npm run set-password`. |
| `AXIOS_SESSION_SECRET` | Random key that signs the `axios_auth` session cookie (independent of the password). Auto-generated; rotate to log everyone out (`npm run set-password -- --rotate-sessions`). |
| `PORT` | App port — auto-picked, defaults to 3002, moved if taken. |
| `AXIOS_USERNAME` / `NEXT_PUBLIC_AXIOS_USERNAME` | Your subdomain label. |
| `NEXT_PUBLIC_AXIOS_PREVIEW_DOMAIN` | Base domain (default `fordweb.io`). |
| `AXIOS_PORT_BASE` / `NEXT_PUBLIC_AXIOS_PORT_BASE` | Base of the preview port band (auto-picked). |
| `AXIOS_PREVIEW_SLOTS` / `NEXT_PUBLIC_AXIOS_PREVIEW_SLOTS` | Number of preview slots. |

`NEXT_PUBLIC_*` vars are inlined at **build time**, so the installer writes
`.env.local` before `npm run build`.

### Changing the login password

The password is stored only as a one-way scrypt hash, so there's nothing to read
back — to change it, set a new one:

```bash
cd ~/.axios && npm run set-password            # prompts (hidden), updates .env.local
pm2 restart axios --update-env
```

This rewrites `AXIOS_PASSWORD_HASH` (and removes any leftover plaintext
`AXIOS_PASSWORD` from an older install). Your existing session survives unless you
add `-- --rotate-sessions`, which also mints a fresh `AXIOS_SESSION_SECRET` and logs
every device out. If you ever lock yourself out via the brute-force throttle, delete
`data/auth-throttle.json` and try again.

## Processes & paths

- pm2 apps: **`axios`** (the Next app), **`axios-caddy`** (private reverse proxy,
  `private.Caddyfile`, bound to `127.0.0.1:<high port>`), **`axios-tunnel`**
  (cloudflared). Rebuild + reload after pulling changes:
  ```bash
  npm run build && pm2 restart axios
  ```
- Tunnel config + credentials live in `<install>/.cloudflared/` (git-ignored,
  `chmod 600`). The downloaded `caddy`/`cloudflared` binaries (when not already on
  the system) go in `<install>/bin/` (git-ignored).
- `projects.json` (your project list) is git-ignored and not shipped, so a fresh
  clone starts with no projects and creates it when you add your first.

## Advanced: public-server install (legacy)

If you're running on a **publicly reachable server with its own domain** and don't
want the tunnel, set `AXIOS_INSTALL_TYPE=server`. This runs the original flow: it
prompts for an app host, a `{port}.domain` preview pattern, and a port range, and
writes a snippet into the **system** Caddy (`/etc/caddy/axios.caddy`). You are
responsible for pointing wildcard DNS at the box. This path is kept for flexibility
but is not offered interactively.
