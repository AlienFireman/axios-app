<div align="center">

<img src="public/logo.svg" alt="Termato" width="300" />

### Your terminals. Every device. Anywhere.

Termato is the modern way to run and manage terminal sessions — on your laptop, your
phone, or both at once. Spin up sessions on the fly, resume any of them in one tap with
full context, and pick up exactly where you left off from whatever device is in your
hand. Pair it with Claude Code for the **full power of AI coding in your pocket** — or
use it with any CLI or AI tool you like.

```bash
git clone https://github.com/AlienFireman/termato-app.git ~/.termato && bash ~/.termato/install.sh
```

<sub>Free · macOS &amp; Linux · **[termato.com](https://termato.com)**</sub>

</div>

<!--
  TODO (Dan): drop hero media here — ideally a short GIF (or side-by-side stills) of
  the SAME session running on desktop and on a phone, the terminal, and the chat view.
  Replace this comment, e.g.:
  <p align="center"><img src="docs/hero.gif" alt="Termato on desktop and phone" width="860"></p>
-->

---

## A terminal that goes where you go

This is the heart of Termato: **the terminal session you started at your desk is the
same one waiting in your pocket** — no setup, no syncing, no thinking about it.

- **Hand off mid-thought.** Start working in a session on your desktop, get up to
  leave, and carry straight on from your phone. Your place is exactly where you left it.
- **Queue and walk away.** Line up follow-up messages from your phone, close the app,
  and put it away. Termato keeps your queue **on your own machine** and fires each one
  automatically as the current turn finishes — your work keeps moving while you don’t
  have to.
- **One workspace, every device.** Desktop and mobile are both first-class and always
  in sync. There’s no stripped-down “mobile version” — it’s the whole thing, on a phone.

## The smartest terminal on any screen

Termato’s terminal is the **fastest, most capable, most user-friendly terminal across
every device** — and, unusually, it’s genuinely a pleasure to use on a phone.

- **Desktop and phone at once, perfectly in sync.**
- **No mangled wrapping. No reflow chaos.** A modern rendering engine keeps every line
  crisp and readable at any width, on any screen — the cross-device terminal problems
  you’re used to simply aren’t there.
- **Resume in one tap, with full context** — reopen any session and it’s exactly as you
  left it, even weeks later.
- **New sessions on the fly**, whenever you need one.
- **Run whatever you want in it** — Claude Code, Codex, another AI CLI, or just your shell.
  The terminal is yours; Termato makes it portable.

## Hundreds of sessions, beautifully organized

Work across as many terminals as you like, grouped by project and instantly findable.
Jump between **hundreds of sessions** without losing track of a single one — from any
device, all kept tidy and in order.

## Terminal *or* chat — your choice

Run **Claude Code** in your terminal exactly the way you do today — that’s the familiar
route, and it’s fully supported. When you’d rather have something more visual, Termato also
gives you a clean, **mobile-friendly chat interface** over Claude Code: the same
subscription underneath, wrapped in a polished UI that’s a genuine pleasure to use on a
phone. Live in the terminal, live in the chat, or move between them whenever you like.

> Prefer to stay in the terminal? Stay there — the chat is an option, never a requirement.

## Browser previews, kept in context

Every live preview stays tied to the chat or terminal workspace it belongs to, so what
you’re looking at always matches what you’re working on. And when you pair Termato with an
AI agent, it can open the preview **for you, in the right workspace** — set up and waiting
for your review when you come back, instead of a backgrounded CLI suddenly throwing a
browser window in front of whatever else you’re doing.

## It fits your workflow — and changes nothing about it

Termato slips in **alongside** your existing setup. Use Claude Code inside Termato or
outside it; Termato never touches, reconfigures, or interferes with your configuration.
There’s nothing to migrate and nothing to undo. (Context compaction and management are
handled by Claude Code itself — Termato stays out of the way.)

---

## Security & privacy, at the core

Privacy and security aren’t a feature in Termato — they’re the foundation. The
architecture is built so your work never has to be trusted to anyone but you.

- **No middleman. No Termato server.** Your code, your sessions, and your history never
  pass through us — there is nothing in the middle to intercept, log, or breach. We
  couldn’t see your data if we wanted to, because it never reaches us.
- **Straight to the source.** When you use AI, requests go directly to your provider
  under your own account — no extra hop, no broker, no copy kept anywhere.
- **Reachable from anywhere — but only by you.** Open your workspace from any device through
  your own private endpoint, while your machine exposes **no inbound ports** for anyone to
  find or scan. The encrypted tunnel only ever reaches *out* — the public internet can never
  reach *in*.
- **A serious front door.** Everything sits behind a hardened login wall with brute-force
  protection, cryptographically signed sessions, and optional IP allow-listing — for the app
  and your live previews alike.
- **Runs only on hardware you control.** No cloud, no telemetry, no analytics.

---

## More that makes it a joy to use

- **Live previews** of the apps you build, right next to your terminal — in a built-in
  browser, on any device.
- **A fast, polished editor** with tabs and a markdown toolbar.
- **Voice input** and **usage at a glance**.
- **Build anything.** Python apps, web apps, scripts, APIs — whatever you’d build with
  Claude Code, you can build here. Import a folder, clone a repo, or start from scratch, and
  Termato works out how to run it; anything visual, like a website or web app, renders live
  in the built-in browser.
- A UI that’s quick, fluid, and a genuine pleasure to use on every screen.

---

## Install

One line to install. Termato sets up everything for you — its own runtime, free ports, and
secure remote access — and asks only two quick things: a **username** (the personal
subdomain you’ll open Termato at) and a **password** (your private login). Then you’re in.

```bash
git clone https://github.com/AlienFireman/termato-app.git ~/.termato && bash ~/.termato/install.sh
```

Termato is **self-hosted** and self-contained: it bundles its own runtime, picks free
ports, configures a private reverse proxy and the encrypted tunnel, and runs under pm2
with start-on-boot — all without touching the rest of your system. Works on
**Debian/Ubuntu** and **macOS**.

You get the **full power of Termato with no AI subscription at all** — every terminal,
preview, and cross-device feature works out of the box. Only the AI **chat** interface
needs a **Claude Code** CLI and an Anthropic account (support for Codex and other AI
subscriptions is coming soon).

See **[INSTALL.md](INSTALL.md)** for details.

## Updating

Termato checks for new versions on startup and from **Settings → Server**. Click
**Update & Restart** — no terminal required.

---

<div align="center">
<sub><strong><a href="https://termato.com">termato.com</a></strong> · This repository contains the
production build of Termato, ready to install. The application source is maintained privately.</sub>
</div>
