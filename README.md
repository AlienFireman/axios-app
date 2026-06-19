# Axios

Self-hosted AI coding workspace. This repository holds the **built, ready-to-run
distribution** — install it directly, no build step required.

## Install

```bash
git clone https://github.com/AlienFireman/axios-app.git ~/.axios
bash ~/.axios/install.sh
```

The installer is non-invasive: it bundles its own Node runtime, picks free ports,
sets up a private reverse proxy + secure tunnel, and runs under pm2 — without
touching your system web server or ports 80/443.

## Updating

Axios checks this repo for new commits on startup and from **Settings → Server**.
Click **Update & Restart** to pull the latest build and restart.

---
_Built from source a5847603 at 2026-06-19T00:03:27.919Z. The application
source is maintained privately; this repo contains the production build only._
