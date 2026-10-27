/**
 * Reference (baseline) storage and comparison.
 *
 * Layout: visual/__screenshots__/<spec>/<case>/<viewport>.png + baseline-meta.json.
 * Paths never include the tested host, so capture and comparison resolve the same files.
 *
 * Reference mode: screenshots are written to a staging folder; the summary reporter promotes
 * them only when the whole run succeeded (a failed or interrupted capture never replaces or
 * extends the approved set).
 * Compare mode: references are only read. Nothing here can write into __screenshots__.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import {
  CAPTURE_SETTINGS, DEFAULT_TOLERANCE, META_FILE, SCREENSHOT_DIR, LIVE_ORIGIN,
} from './config.js';
import { VisualError } from './errors.js';

const require = createRequire(import.meta.url);
const PLAYWRIGHT_VERSION = require('@playwright/test/package.json').version;
const META_SCHEMA = 1;

export const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

export function settingsFingerprint() {
  return sha256(JSON.stringify({ META_SCHEMA, CAPTURE_SETTINGS })).slice(0, 16);
}

export function baselineRel(spec, caseId, viewportName) {
  return `${spec}/${caseId}/${viewportName}.png`;
}

export function readMeta() {
  if (!fs.existsSync(META_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
  } catch (e) {
    throw new VisualError('stale-baseline', `${META_FILE} is not valid JSON; recapture the references.`);
  }
}

export function environmentInfo(browserVersion) {
  return {
    playwright: PLAYWRIGHT_VERSION,
    browser: { name: CAPTURE_SETTINGS.browserName, version: browserVersion },
    platform: { os: os.platform(), release: os.release(), arch: os.arch() },
  };
}

export function captureCommand(grepTag, project) {
  const filters = [grepTag && `--grep ${grepTag}`, project && `--project=${project}`].filter(Boolean).join(' ');
  return `VISUAL_REFERENCE_URL=${LIVE_ORIGIN} npm run visual:baseline${filters ? ` -- ${filters}` : ''}`;
}

/**
 * Reference mode: stages a captured screenshot and its metadata entry.
 */
export function stageCapture(rel, buffer, entry) {
  const staging = process.env.VISUAL_STAGING_DIR;
  if (!staging) throw new VisualError('config', 'No staging folder: baseline capture must run through npm run visual:baseline');
  const file = path.join(staging, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buffer);
  fs.writeFileSync(`${file}.json`, JSON.stringify({ ...entry, sha256: sha256(buffer) }, null, 2));
}

function decode(buffer, label) {
  try {
    return PNG.sync.read(buffer);
  } catch (e) {
    throw new VisualError('stale-baseline', `${label} is not a valid PNG`);
  }
}

/**
 * Compare mode: checks the reference is present and compatible, then compares pixels.
 * Attaches expected/actual/diff images (Playwright's HTML report shows them as an image diff).
 */
export async function compareWithBaseline(testInfo, {
  rel, actual, caseFingerprint, viewport, browserVersion, tolerance, recapture,
}) {
  const meta = readMeta();
  const file = path.join(SCREENSHOT_DIR, rel);
  const entry = meta?.files?.[rel];
  if (!meta || !entry || !fs.existsSync(file)) {
    throw new VisualError('missing-baseline', `No approved LIVE reference for ${rel}. Capture it with:\n  ${recapture}`);
  }
  if (meta.settingsFingerprint !== settingsFingerprint()) {
    throw new VisualError('stale-baseline', 'References were captured with different capture settings '
      + `(fingerprint ${meta.settingsFingerprint}, now ${settingsFingerprint()}). Delete visual/__screenshots__ and recapture.`);
  }
  if (meta.browser?.version !== browserVersion || meta.playwright !== PLAYWRIGHT_VERSION) {
    throw new VisualError('stale-baseline', `References were captured with Playwright ${meta.playwright} / `
      + `${meta.browser?.name} ${meta.browser?.version}; this run uses ${PLAYWRIGHT_VERSION} / ${browserVersion}. Recapture with:\n  ${recapture}`);
  }
  if (entry.caseFingerprint !== caseFingerprint) {
    throw new VisualError('stale-baseline', `The reference definition of this case changed since ${rel} was captured. Recapture with:\n  ${recapture}`);
  }
  if (entry.viewport?.width !== viewport.width || entry.viewport?.height !== viewport.height) {
    throw new VisualError('stale-baseline', `${rel} was captured at ${entry.viewport?.width}x${entry.viewport?.height}, `
      + `viewport is now ${viewport.width}x${viewport.height}. Recapture with:\n  ${recapture}`);
  }
  const expectedBuf = fs.readFileSync(file);
  if (sha256(expectedBuf) !== entry.sha256) {
    throw new VisualError('stale-baseline', `${rel} does not match its recorded checksum (edited or partial copy). Recapture with:\n  ${recapture}`);
  }

  const name = rel.replace(/\.png$/, '').replace(/\//g, '-');
  const expected = decode(expectedBuf, rel);
  const got = decode(actual, 'actual screenshot');
  await testInfo.attach(`${name}-expected.png`, { body: expectedBuf, contentType: 'image/png' });
  await testInfo.attach(`${name}-actual.png`, { body: actual, contentType: 'image/png' });

  if (expected.width !== got.width || expected.height !== got.height) {
    throw new VisualError('size', `Screenshot size differs: reference ${expected.width}x${expected.height}, `
      + `actual ${got.width}x${got.height}`);
  }
  const { threshold, maxDiffPixelRatio } = { ...DEFAULT_TOLERANCE, ...tolerance };
  const diff = new PNG({ width: got.width, height: got.height });
  const diffPixels = pixelmatch(expected.data, got.data, diff.data, got.width, got.height, { threshold });
  const ratio = diffPixels / (got.width * got.height);
  testInfo.annotations.push({ type: 'diff', description: `${diffPixels} px (${(ratio * 100).toFixed(3)}%)` });
  if (ratio > maxDiffPixelRatio) {
    await testInfo.attach(`${name}-diff.png`, { body: PNG.sync.write(diff), contentType: 'image/png' });
    throw new VisualError('pixels', `${diffPixels} pixels differ (${(ratio * 100).toFixed(3)}% > `
      + `${(maxDiffPixelRatio * 100).toFixed(3)}% allowed, threshold ${threshold})`);
  }
}

function listFiles(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) return d.name === '.staging' ? [] : listFiles(full, base);
    return [path.relative(base, full)];
  });
}

/** Checksums of every approved reference file (used to prove comparisons left them untouched). */
export function snapshotStoreDigest() {
  return listFiles(SCREENSHOT_DIR).sort()
    .map((rel) => `${rel}:${sha256(fs.readFileSync(path.join(SCREENSHOT_DIR, rel)))}`);
}

/**
 * Promotes a successful staged capture into the approved set and updates metadata.
 * Refuses to mix references from another origin or incompatible settings/browser.
 * @returns {{ promoted: string[] }}
 */
export function promoteStaging(stagingDir, referenceOrigin) {
  const staged = listFiles(stagingDir).filter((f) => f.endsWith('.png'));
  if (!staged.length) throw new Error('Nothing was captured');
  const entries = staged.map((rel) => ({
    rel,
    entry: JSON.parse(fs.readFileSync(path.join(stagingDir, `${rel}.json`), 'utf8')),
  }));
  const env = entries[0].entry.environment;
  if (entries.some(({ entry }) => entry.environment.browser.version !== env.browser.version)) {
    throw new Error('Captured with mixed browser versions; recapture');
  }
  const existing = readMeta();
  if (existing) {
    const problems = [];
    if (existing.referenceOrigin !== referenceOrigin) problems.push(`reference origin ${existing.referenceOrigin} vs ${referenceOrigin}`);
    if (existing.settingsFingerprint !== settingsFingerprint()) problems.push('capture settings changed');
    if (existing.browser?.version !== env.browser.version) problems.push(`browser ${existing.browser?.version} vs ${env.browser.version}`);
    if (existing.playwright !== env.playwright) problems.push(`Playwright ${existing.playwright} vs ${env.playwright}`);
    if (problems.length) {
      throw new Error(`Existing references are incompatible (${problems.join('; ')}). They were left unchanged. `
        + 'To replace the whole set, delete visual/__screenshots__ and capture again without filters.');
    }
  }
  const meta = existing || {
    schema: META_SCHEMA,
    referenceOrigin,
    settingsFingerprint: settingsFingerprint(),
    captureSettings: CAPTURE_SETTINGS,
    playwright: env.playwright,
    browser: env.browser,
    platform: env.platform,
    files: {},
  };
  entries.forEach(({ rel, entry }) => {
    const dest = path.join(SCREENSHOT_DIR, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(stagingDir, rel), dest);
    const { environment, ...rest } = entry;
    meta.files[rel] = { ...rest, platform: environment.platform };
  });
  meta.updatedAt = new Date().toISOString();
  const tmp = `${META_FILE}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(meta, null, 2)}\n`);
  fs.renameSync(tmp, META_FILE);
  return { promoted: entries.map((e) => e.rel) };
}
