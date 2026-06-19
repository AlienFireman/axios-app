import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// CodeMirror / Lezer must each resolve to a SINGLE copy. The project `.npmrc` uses
// `install-strategy=nested`, which otherwise scatters many copies of the Lezer cores
// (`@lezer/common`, `@lezer/highlight`, `@lezer/lr`). CodeMirror throws
// "multiple instances of @codemirror/state" when its core is duplicated, and
// duplicate `@lezer/*` silently breaks syntax highlighting (node tags from one copy
// don't match the highlight style resolving against another). Each core is declared as
// a direct dep so npm hoists ONE top-level copy; here we additionally alias every
// importer to that copy. Resolve the package entry (not `/package.json`, which the
// packages' `exports` field blocks) and exact-match it (`$`) so only the bare specifier
// is redirected. Each resolve is guarded so a missing package can't crash app boot.
// The live app is `server.js → next({ dev })` (webpack, no NODE_PATH), so the webpack
// alias is what matters at runtime; turbopack is covered too.
const CM_SINGLETONS = [
  '@codemirror/state', '@codemirror/view', '@codemirror/language',
  '@codemirror/autocomplete', '@codemirror/commands', '@codemirror/search',
  '@lezer/common', '@lezer/highlight', '@lezer/lr',
];

function resolveEntry(pkg) {
  try { return require.resolve(pkg); } catch { return null; }
}

// webpack: exact-match the bare specifier ("pkg$") → single resolved entry file.
function webpackAliases() {
  const alias = {};
  for (const pkg of CM_SINGLETONS) {
    const entry = resolveEntry(pkg);
    if (entry) alias[`${pkg}$`] = entry;
  }
  return alias;
}

// turbopack: maps the bare specifier → single resolved entry file.
function turbopackAliases() {
  const alias = {};
  for (const pkg of CM_SINGLETONS) {
    const entry = resolveEntry(pkg);
    if (entry) alias[pkg] = entry;
  }
  return alias;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
    resolveAlias: turbopackAliases(),
  },
  allowedDevOrigins: ['*.fordweb.io'],
  devIndicators: false,
  // node-pty (and the prebuilt fork) are native modules used only by the server
  // (terminals.js, imported by some API routes). Keep them OUT of the bundle so
  // they're required at runtime — otherwise Turbopack treats the optional
  // `require('node-pty')` fallback as a fatal module-not-found and 500s every route.
  serverExternalPackages: ['@homebridge/node-pty-prebuilt-multiarch', 'node-pty'],
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = { ...(config.resolve.alias || {}), ...webpackAliases() };
    return config;
  },
};

export default nextConfig;
