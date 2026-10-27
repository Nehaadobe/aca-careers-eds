/**
 * Run configuration from environment variables, validated up front.
 *
 *   VISUAL_MODE            "reference" (capture LIVE baselines) or "compare"; set by visual/run.js
 *   VISUAL_REFERENCE_URL   LIVE production origin; used only in reference mode
 *   VISUAL_BASE_URL        site under test (local preview or deployed preview); compare mode only
 *   VISUAL_ACTUAL_PATH_PREFIX  path prefix on the site under test (defaults to "/content" for
 *                          localhost, where `aem up --html-folder content` serves pages; "" elsewhere)
 *   VISUAL_ACTUAL_PROFILE  markup of the site under test: "eds" (default) or "live" (default when
 *                          VISUAL_BASE_URL is the LIVE origin); selects per-side selectors
 *   VISUAL_EDGES=1         add widths one pixel below each breakpoint
 *   VISUAL_WORKERS         worker count (default 2: keeps LIVE request rate low)
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SUITE_DIR = path.dirname(fileURLToPath(import.meta.url));
export const SCREENSHOT_DIR = path.join(SUITE_DIR, '__screenshots__');
export const META_FILE = path.join(SCREENSHOT_DIR, 'baseline-meta.json');
export const STAGING_ROOT = path.join(SCREENSHOT_DIR, '.staging');

/** Capture settings shared by reference and actual sides; part of the baseline fingerprint. */
export const CAPTURE_SETTINGS = {
  stabilizeVersion: 1,
  browserName: 'chromium',
  colorScheme: 'light',
  locale: 'en-US',
  timezoneId: 'America/Los_Angeles',
  reducedMotion: 'reduce',
  deviceScaleFactor: 1,
  /**
   * Hosts blocked on both sides (requests aborted), with reasons. Fonts (use.typekit.net,
   * p.typekit.net), images (iprsoftwaremedia.com) and jQuery stay allowed: rendering needs them.
   */
  blockedHosts: [
    { host: 'cdn.cookielaw.org', reason: 'OneTrust consent banner (LIVE); overlays content' },
    { host: 'geolocation.onetrust.com', reason: 'OneTrust geolocation lookup for the consent banner' },
    { host: 'www.googletagmanager.com', reason: 'analytics tag manager' },
    { host: 'analytics.google.com', reason: 'Google Analytics' },
    { host: 'www.google-analytics.com', reason: 'Google Analytics' },
    { host: 'stats.g.doubleclick.net', reason: 'analytics beacon' },
  ],
};

/** Default comparison tolerances (Playwright's documented defaults for screenshots). */
export const DEFAULT_TOLERANCE = { threshold: 0.2, maxDiffPixelRatio: 0.01 };

export const LIVE_ORIGIN = 'https://careers.blueshieldca.com';

function parseOrigin(name, value) {
  let url;
  try {
    url = new URL(value);
  } catch (e) {
    throw new Error(`${name} is not a valid URL: "${value}"`);
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${name} must be an http(s) URL: "${value}"`);
  }
  if (url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`${name} must be an origin only (no path/query): "${value}" -> use "${url.origin}"`);
  }
  return url.origin;
}

function defaultPrefix(origin) {
  const { hostname } = new URL(origin);
  return ['localhost', '127.0.0.1'].includes(hostname) ? '/content' : '';
}

let cached;

/**
 * Validated run configuration. Throws with a clear message on any invalid/missing input.
 * Never falls back from one origin to another.
 */
export function getRunConfig() {
  if (cached) return cached;
  const mode = process.env.VISUAL_MODE;
  if (!['reference', 'compare'].includes(mode)) {
    throw new Error('Run the suite through the npm scripts (npm run visual / npm run visual:baseline); '
      + `VISUAL_MODE must be "reference" or "compare" (got "${mode || ''}").`);
  }

  let referenceOrigin = null;
  let actualOrigin = null;
  if (mode === 'reference') {
    if (!process.env.VISUAL_REFERENCE_URL) {
      throw new Error('Baseline capture needs VISUAL_REFERENCE_URL, e.g. '
        + `VISUAL_REFERENCE_URL=${LIVE_ORIGIN} npm run visual:baseline`);
    }
    referenceOrigin = parseOrigin('VISUAL_REFERENCE_URL', process.env.VISUAL_REFERENCE_URL);
  } else {
    if (!process.env.VISUAL_BASE_URL) {
      throw new Error('Comparison needs VISUAL_BASE_URL (the site under test), e.g. '
        + 'VISUAL_BASE_URL=http://localhost:3000 npm run visual');
    }
    actualOrigin = parseOrigin('VISUAL_BASE_URL', process.env.VISUAL_BASE_URL);
  }

  let actualPathPrefix = '';
  if (actualOrigin) {
    const raw = process.env.VISUAL_ACTUAL_PATH_PREFIX;
    actualPathPrefix = raw === undefined ? defaultPrefix(actualOrigin) : raw;
    if (actualPathPrefix && !/^\/[\w\-/]*[^/]$/.test(actualPathPrefix)) {
      throw new Error(`VISUAL_ACTUAL_PATH_PREFIX must start with "/" and not end with "/": "${actualPathPrefix}"`);
    }
  }

  // which markup the site under test uses: "eds" (migrated site, default) or "live" (the LIVE
  // implementation, e.g. to check repeatability of LIVE against its own references)
  let actualProfile = null;
  if (actualOrigin) {
    const raw = process.env.VISUAL_ACTUAL_PROFILE;
    actualProfile = raw || (actualOrigin === LIVE_ORIGIN ? 'live' : 'eds');
    if (!['eds', 'live'].includes(actualProfile)) {
      throw new Error(`VISUAL_ACTUAL_PROFILE must be "eds" or "live" (got "${raw}")`);
    }
  }

  const workersRaw = process.env.VISUAL_WORKERS;
  const workers = workersRaw === undefined ? 2 : Number(workersRaw);
  if (!Number.isInteger(workers) || workers < 1 || workers > 16) {
    throw new Error(`VISUAL_WORKERS must be an integer from 1 to 16 (got "${workersRaw}")`);
  }

  cached = {
    mode,
    referenceOrigin,
    actualOrigin,
    actualPathPrefix,
    actualProfile,
    edges: process.env.VISUAL_EDGES === '1',
    workers,
  };
  return cached;
}

/**
 * URL for a case path on the side being run.
 * Actual side: "/" maps to "<prefix>/index" when a prefix is set (local html-folder preview).
 * @param {object} cfg run config
 * @param {string} casePath common/side path, starting with "/"
 */
export function urlFor(cfg, casePath) {
  if (cfg.mode === 'reference') return `${cfg.referenceOrigin}${casePath}`;
  const p = cfg.actualPathPrefix && casePath === '/' ? '/index' : casePath;
  return `${cfg.actualOrigin}${cfg.actualPathPrefix}${p}`;
}
