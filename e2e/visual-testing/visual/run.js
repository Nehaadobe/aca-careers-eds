#!/usr/bin/env node
/**
 * Entry point for all visual runs. Selects the mode explicitly and forwards remaining
 * arguments (e.g. --grep @home --project=mobile-390) to `playwright test`.
 *
 *   node visual/run.js baseline [playwright args]   capture LIVE references
 *   node visual/run.js compare  [playwright args]   compare the site under test
 *
 * Snapshot-update flags are rejected: comparisons never write references, and references
 * are written only by this suite's own capture code in baseline mode.
 */

import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MODES = { baseline: 'reference', compare: 'compare' };
const FORBIDDEN = [/^-u$/, /^--update-snapshots(=.*)?$/, /^--update-source-method(=.*)?$/];

const [command, ...args] = process.argv.slice(2);
const mode = MODES[command];
if (!mode) {
  console.error('Usage: node visual/run.js <baseline|compare> [playwright test args]');
  process.exit(2);
}
const bad = args.find((a) => FORBIDDEN.some((re) => re.test(a)));
if (bad) {
  console.error(`"${bad}" is not allowed. Comparisons never update references; capture approved LIVE `
    + 'references explicitly with: VISUAL_REFERENCE_URL=https://careers.blueshieldca.com npm run visual:baseline');
  process.exit(2);
}

const suiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const cli = require.resolve('@playwright/test/cli');

const child = spawn(process.execPath, [cli, 'test', ...args], {
  cwd: suiteRoot,
  stdio: 'inherit',
  env: { ...process.env, VISUAL_MODE: mode },
});
child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Playwright exited on ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
