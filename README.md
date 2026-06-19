<div align="center">

# Axios

### Your own AI coding workspace — self-hosted, private, and on every device.

Axios turns Claude Code into a full web workspace that runs **entirely on your own
machine**. Chat with Claude, run real terminals, edit files, preview the apps you
build, and manage parallel tasks across git branches — from your laptop or your
phone, with nothing of yours ever leaving your computer.

</div>

---

## Why Axios

- **It’s yours.** Axios runs on your own hardware as your own user. There’s no Axios
  cloud, no sign-up, no subscription to us, and no telemetry. Your code, your chats,
  and your history live in plain files on your disk and nowhere else.
- **Work from anywhere.** A built-in encrypted tunnel makes your workspace reachable
  from any device — including your phone over cellular — without opening a single
  inbound port or exposing anything to the public internet.
- **Built for real work, not demos.** Persistent Claude sessions, parallel tasks on
  isolated git branches, live app previews, and full terminals — the things you
  actually need to ship.
- **Truly multi-device.** The desktop and mobile interfaces are first-class. Start a
  task at your desk, check on it from the couch, kick off a fix from your phone.

---

## Features

### 🤖 AI coding, the way you work
- Chat with **Claude** in persistent sessions — one long-lived assistant per task,
  with full streaming responses.
- Pick the right model per chat (Opus, Sonnet, Haiku, Fable); each chat remembers
  its own choice.
- Claude has real **shell + filesystem access** to your project, so it can read,
  write, run, and test code — not just suggest snippets.

### 🌿 Parallel tasks without the mess
- Every task can run in its own **git worktree** — an isolated branch checkout — so
  multiple pieces of work proceed in parallel without stepping on each other.
- Review and **merge with one click** when a task is done.
- A smart sidebar groups chats by project and branch, with live “working” and unread
  indicators so you always know what’s active.

### 🖥️ Real terminals in the browser
- Full interactive terminals (real PTYs) on desktop **and** mobile.
- A modern **block-style terminal** that keeps your command history tidy.
- Terminals auto-title themselves, survive disconnects, and quietly resume your
  Claude session right where it left off — even after a restart.

### 🌐 See what you build
- Spin up **live preview servers** for your projects and view them in a built-in
  browser pane — your running app, right next to your chat.
- Friendly, memorable preview URLs (named after animals, not port numbers).
- One-click **dev / production** preview modes.

### ✍️ A proper editor
- A fast **CodeMirror** editor with syntax highlighting for many languages.
- Sublime-style **tabs**, a file explorer with rename/delete, and per-file unsaved
  edit tracking.
- A dedicated **Markdown toolbar** and a built-in `NOTES.md` scratchpad for each
  project.

### 📦 Start any project in seconds
- **Import a folder**, **clone a repo**, or **scaffold a new project from scratch**.
- Axios analyzes the project and configures how to run it automatically — dev server,
  build, and preview all set up for you.

### ⚡ Thoughtful extras
- **Voice input** — talk to Claude and have it transcribed.
- **Usage at a glance** — see your Claude subscription limits without leaving the app.
- **Skills & automated agents** for repeatable and scheduled work.
- **Dark & light themes**, keyboard shortcuts, and a desktop-app experience.
- **One-click updates** from the Settings panel keep you on the latest build.

---

## Private & secure by design

Axios is **self-hosted**: the app, your projects, your files, and your entire chat
history stay on your own machine, stored as ordinary files in the install directory.
There is no database we host, no account system, and no analytics phoning home.

- **Nothing of yours is uploaded to us — ever.** Axios has no backend. We never see
  your code, prompts, or data.
- **Your AI account, your data path.** When Claude works on your code, those requests
  go directly to Anthropic under *your own* Claude subscription — exactly as Claude
  Code already does. Axios adds no middleman and keeps no copy.
- **No open ports.** Remote access uses an outbound, encrypted **Cloudflare Tunnel**.
  Your machine is never exposed to inbound connections and isn’t findable on the
  public internet.
- **Locked behind your login.** Access is gated by a password stored only as a
  one-way **scrypt hash** (the plaintext is never saved), with session cookies signed
  by an independent secret and brute-force throttling on the login.
- **Previews stay private too.** Live preview URLs are gated behind your session, so
  work-in-progress apps aren’t visible to anyone but you.
- **Non-invasive on your system.** The installer bundles its own runtime, picks free
  ports automatically, and never touches your system web server or ports 80/443.

> **Run it where it belongs.** Axios acts with the full permissions of the user that
> runs it — anything that user can read or change, Claude can too. Run it on your own
> machine or a dedicated box, not on a server holding other people’s data.

---

## Install

Two lines — pick a username and a password when prompted:

```bash
git clone https://github.com/AlienFireman/axios-app.git ~/.axios
bash ~/.axios/install.sh
```

The installer is self-contained and considerate: it bundles its own Node runtime,
finds free ports, sets up your private reverse proxy and encrypted tunnel, and runs
everything under pm2 with start-on-boot — all without touching the rest of your
system. Works on **Debian/Ubuntu** and **macOS**.

When it finishes, open your workspace at `https://axios-<username>.fordweb.io` and
try it from your phone.

See **[INSTALL.md](INSTALL.md)** for requirements, configuration, and details.

## Updating

Axios checks for new builds on startup and from **Settings → Server**. Click
**Update & Restart** to pull the latest version and restart — no terminal required.

## Requirements

- macOS or Debian/Ubuntu Linux
- The **Claude Code** CLI and an Anthropic account (Axios drives Claude under your
  own subscription)
- That’s it — Node, the reverse proxy, and the tunnel are all set up for you.

---

<div align="center">
<sub>This repository contains the production build of Axios, ready to install.
The application source is maintained privately.</sub>
</div>
