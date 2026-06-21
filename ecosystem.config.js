// App port: defaults to 3002, but the installer may move it (PORT env) if 3002 is
// already taken on a shared box. Honor PORT so the pm2 process and Next agree.
const port = process.env.PORT || 3002;

module.exports = {
  apps: [{
    name: 'termato',
    script: 'server.js',
    args: '',
    // Resolve to wherever Termato is installed (e.g. ~/.termato). pm2 sets the app's
    // working dir to this, which is what every data/projects path derives from
    // via process.cwd().
    cwd: __dirname,
    // Run under the Node the installer bundled into ~/.termato/.node, so the runtime
    // matches the build regardless of the user's system Node. Unset (e.g. in dev on
    // the hub) → pm2 uses its default node.
    interpreter: process.env.TERMATO_NODE_BIN || undefined,
    env: {
      // Production by default. Dev mode (`next dev` / hot reload) is currently
      // broken on this setup (Turbopack CodeMirror-alias incompatibility + the
      // custom server not proxying HMR), so booting into it gives a white screen.
      // server.js runs `next dev` only when TERMATO_DEV==='1'; pinning '0' forces
      // prod and overrides any stray TERMATO_DEV inherited from the pm2 daemon env.
      NODE_ENV: 'production',
      TERMATO_DEV: '0',
      PORT: String(port),
    },
  }],
};
