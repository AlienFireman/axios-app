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
  and put it away. Termato holds your queue **server-side** and fires each one
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
  left it, even days later.
- **New sessions on the fly**, whenever you need one.
- **Run whatever you want in it** — Claude Code, another AI CLI, or just your shell.
  The terminal is yours; Termato makes it portable.

## Hundreds of sessions, beautifully organized

Work across as many terminals as you like, grouped by project and instantly findable.
Jump between **hundreds of sessions** without losing track of a single one — from any
device, all kept tidy and in order.

## Terminal *or* chat — your choice

Use your terminal the way you always have. Or, if you run **Claude Code**, switch to
Termato’s clean, friendly **chat interface** — it talks to your Claude Code subscription
underneath, so you get a polished, mobile-ready way to work with your AI without leaving
the terminal behind. Some people love the terminal; some love the chat. Termato gives you
both, side by side.

> The terminal stands on its own and works with anything. Claude Code simply unlocks the
> chat experience on top of it.

## An agent that can drive the interface

When you pair Termato with an AI agent, it can **control the workspace itself**. Finish a
task and your agent can open the built-in browser and **show you the result the moment
you come back to the chat** — so it doesn’t just describe what it built, it puts it in
front of you.

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
- **Invisible to the internet.** Remote access runs over an **outbound-only encrypted
  tunnel**. Your machine opens no inbound ports and can’t be discovered, scanned, or
  reached from the public internet.
- **Authenticated end to end.** Every request — the app and your live previews alike —
  is gated behind hardened, cryptographically signed sessions.
- **Runs only on hardware you control.** No cloud, no telemetry, no analytics — ever.

---

## More that makes it a joy to use

- **Live previews** of the apps you build, right next to your terminal — in a built-in
  browser, on any device.
- **A fast, polished editor** with tabs and a markdown toolbar.
- **Voice input**, **usage at a glance**, and **skills + scheduled agents**.
- **Start any project in seconds** — import a folder, clone a repo, or scaffold a new
  one, and Termato works out how to run it for you.
- A UI that’s quick, fluid, and a genuine pleasure to use on every screen.

---

## Install

One line — it’ll ask for a username and password, then set itself up:

```bash
git clone https://github.com/AlienFireman/termato-app.git ~/.termato && bash ~/.termato/install.sh
```

Termato is **self-hosted** and self-contained: it bundles its own runtime, picks free
ports, configures a private reverse proxy and the encrypted tunnel, and runs under pm2
with start-on-boot — all without touching the rest of your system. Works on
**Debian/Ubuntu** and **macOS**.

The terminal works on its own with nothing extra. To use the AI **chat** features, you’ll
need the **Claude Code** CLI and an Anthropic account (Termato drives Claude under your
own subscription).

See **[INSTALL.md](INSTALL.md)** for details.

## Updating

Termato checks for new versions on startup and from **Settings → Server**. Click
**Update & Restart** — no terminal required.

---

<div align="center">
<sub><strong><a href="https://termato.com">termato.com</a></strong> · This repository contains the
production build of Termato, ready to install. The application source is maintained privately.</sub>
</div>
