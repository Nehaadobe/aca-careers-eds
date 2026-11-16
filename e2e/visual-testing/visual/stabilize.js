/**
 * Shared page preparation, applied identically to LIVE (reference) and the site under test.
 * Every step waits for an explicit DOM/asset condition and throws a VisualError on failure.
 */

import { CAPTURE_SETTINGS } from './config.js';
import { VisualError } from './errors.js';

const RETRYABLE = [429, 503];
const MAX_NAV_ATTEMPTS = 4;
const RETRY_BUDGET_MS = 60_000;
const READY_TIMEOUT = 30_000;
const SCROLL_STEP_WAIT_MS = 120;
const MAX_SCROLL_STEPS = 250;
const MAX_PAGE_HEIGHT = 40_000;

const FREEZE_CSS = `
*, *::before, *::after {
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
  caret-color: transparent !important;
  scroll-behavior: auto !important;
}`;

/**
 * Aborts requests to the approved blocked hosts. Must run before navigation.
 * @param {import('@playwright/test').Page} page
 */
export async function installRequestBlocking(page) {
  const hosts = new Set(CAPTURE_SETTINGS.blockedHosts.map((h) => h.host));
  await page.context().route((url) => hosts.has(url.hostname), (route) => route.abort('blockedbyclient'));
}

function retryDelayMs(response, attempt) {
  const header = response.headers()['retry-after'];
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, 30_000);
  const date = header ? Date.parse(header) : NaN;
  if (Number.isFinite(date)) return Math.min(Math.max(date - Date.now(), 0), 30_000);
  return 1000 * 2 ** attempt;
}

/**
 * Navigates and checks the response: expected status, same origin, expected path.
 * Retries 429/503 with bounded backoff honoring Retry-After.
 */
export async function gotoChecked(page, url, expectedStatus = 200) {
  const target = new URL(url);
  const started = Date.now();
  for (let attempt = 0; ; attempt += 1) {
    let response;
    try {
      // eslint-disable-next-line no-await-in-loop
      response = await page.goto(url, { waitUntil: 'load' });
    } catch (e) {
      throw new VisualError('navigation', `Could not load ${url}: ${e.message.split('\n')[0]}`);
    }
    if (!response) throw new VisualError('navigation', `No response for ${url}`);
    const status = response.status();
    const waited = Date.now() - started;
    if (RETRYABLE.includes(status) && attempt < MAX_NAV_ATTEMPTS - 1) {
      const delay = retryDelayMs(response, attempt);
      if (waited + delay <= RETRY_BUDGET_MS) {
        // eslint-disable-next-line no-await-in-loop
        await page.waitForTimeout(delay);
        // eslint-disable-next-line no-continue
        continue;
      }
    }
    if (status !== expectedStatus) {
      throw new VisualError('navigation', `${url} returned HTTP ${status} (expected ${expectedStatus})`);
    }
    const final = new URL(page.url());
    if (final.origin !== target.origin) {
      throw new VisualError('navigation', `${url} redirected off-site to ${final.href} (login or error page?)`);
    }
    const norm = (p) => p.replace(/\/$/, '') || '/';
    if (norm(final.pathname) !== norm(target.pathname)) {
      throw new VisualError('navigation', `${url} ended at unexpected path ${final.pathname}`);
    }
    return response;
  }
}

async function waitFor(page, description, fn, arg) {
  try {
    await page.waitForFunction(fn, arg, { timeout: READY_TIMEOUT, polling: 100 });
  } catch (e) {
    throw new VisualError('readiness', `Timed out waiting for ${description} on ${page.url()}`);
  }
}

/**
 * Waits for the application to be ready.
 * reference (LIVE): document complete + ready selector visible.
 * actual (EDS): body.appear, every section and block decorated (header/footer when present).
 */
export async function waitForAppReady(page, side, readySelector) {
  await waitFor(page, 'document load', () => document.readyState === 'complete');
  const ready = page.locator(readySelector);
  try {
    await ready.first().waitFor({ state: 'visible', timeout: READY_TIMEOUT });
  } catch (e) {
    throw new VisualError('readiness', `Ready selector "${readySelector}" never became visible on ${page.url()}`);
  }
  if (side === 'actual') {
    await waitFor(page, 'EDS sections and blocks to finish decorating', () => {
      if (!document.body.classList.contains('appear')) return false;
      const pending = document.querySelectorAll(
        'main .section:not([data-section-status="loaded"]), [data-block-status]:not([data-block-status="loaded"])',
      );
      return pending.length === 0;
    });
  }
}

/**
 * Scrolls in bounded steps to the bottom to trigger lazy loading, waits for the page height
 * to settle, then returns to the top. Fails if the page keeps growing (infinite content).
 */
export async function settleLazyContent(page) {
  const result = await page.evaluate(async ({ stepWait, maxSteps, maxHeight }) => {
    const pause = (ms) => new Promise((r) => { setTimeout(r, ms); });
    let steps = 0;
    let lastHeight = -1;
    let stable = 0;
    while (steps < maxSteps) {
      const height = document.documentElement.scrollHeight;
      if (height > maxHeight) return { ok: false, reason: `page grew past ${maxHeight}px` };
      const atBottom = window.scrollY + window.innerHeight >= height - 1;
      if (atBottom) {
        stable = height === lastHeight ? stable + 1 : 0;
        if (stable >= 3) break;
      }
      lastHeight = height;
      window.scrollBy(0, Math.max(200, Math.floor(window.innerHeight * 0.8)));
      steps += 1;
      // eslint-disable-next-line no-await-in-loop
      await pause(stepWait);
    }
    if (steps >= maxSteps) return { ok: false, reason: `height did not settle after ${maxSteps} scroll steps` };
    window.scrollTo(0, 0);
    return { ok: true };
  }, { stepWait: SCROLL_STEP_WAIT_MS, maxSteps: MAX_SCROLL_STEPS, maxHeight: MAX_PAGE_HEIGHT });
  if (!result.ok) throw new VisualError('readiness', `Lazy content did not settle on ${page.url()}: ${result.reason}`);
}

/**
 * Waits for every rendered image to finish loading and for web fonts. Broken rendered
 * images and failed font faces are errors.
 */
export async function waitForAssets(page) {
  await waitFor(page, 'rendered images to finish loading', () => [...document.images]
    .filter((img) => img.getClientRects().length > 0 && (img.currentSrc || img.src))
    .every((img) => img.complete));
  const problems = await page.evaluate(async () => {
    await document.fonts.ready;
    const broken = [...document.images]
      .filter((img) => img.getClientRects().length > 0 && (img.currentSrc || img.src))
      .filter((img) => img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src);
    // required fonts = declared web-font families that rendered text uses as its first choice;
    // optional fallback faces (e.g. local('Arial') metric fallbacks) are not required
    const unquote = (s) => s.trim().replace(/^["']|["']$/g, '');
    const faces = [...document.fonts];
    const declared = new Set(faces.map((f) => unquote(f.family)));
    const used = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(), i = 0; n && i < 5000; n = walker.nextNode(), i += 1) {
      const el = n.parentElement;
      if (el && n.textContent.trim() && el.getClientRects().length) {
        used.add(unquote(getComputedStyle(el).fontFamily.split(',')[0]));
      }
    }
    const fonts = [...used].filter((fam) => declared.has(fam)).flatMap((fam) => {
      const own = faces.filter((f) => unquote(f.family) === fam);
      const failed = own.filter((f) => f.status === 'error').map((f) => `${fam} ${f.weight} ${f.style}`);
      return own.some((f) => f.status === 'loaded') ? failed : [`${fam} (no face loaded)`, ...failed];
    });
    return { broken: [...new Set(broken)], fonts: [...new Set(fonts)] };
  });
  if (problems.broken.length) {
    throw new VisualError('readiness', `Broken images on ${page.url()}: ${problems.broken.slice(0, 5).join(', ')}`
      + `${problems.broken.length > 5 ? ` (+${problems.broken.length - 5} more)` : ''}`);
  }
  if (problems.fonts.length) {
    throw new VisualError('readiness', `Web fonts failed to load on ${page.url()}: ${problems.fonts.join(', ')}`);
  }
}

/** Disables animation/transition/caret/smooth scroll and pauses media. */
export async function freezeMotion(page) {
  await page.addStyleTag({ content: FREEZE_CSS });
  await page.evaluate(() => {
    document.querySelectorAll('video, audio').forEach((m) => {
      m.pause();
      // eslint-disable-next-line no-param-reassign
      m.currentTime = 0;
    });
  });
}

/** Moves the pointer to the top-left corner, away from hover-sensitive content. */
export async function parkPointer(page) {
  await page.mouse.move(0, 0);
}

/** Waits for two animation frames at the top of the page. */
export async function settleFrame(page) {
  await page.evaluate(() => new Promise((resolve) => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  }));
}

/**
 * Full preparation pipeline. Same steps on both sides.
 * @returns {Promise<void>}
 */
export async function preparePage(page, {
  url, side, readySelector, expectedStatus,
}) {
  await installRequestBlocking(page);
  await gotoChecked(page, url, expectedStatus);
  await waitForAppReady(page, side, readySelector);
  await freezeMotion(page);
  await settleLazyContent(page);
  if (side === 'actual') await waitForAppReady(page, side, readySelector);
  await waitForAssets(page);
  await parkPointer(page);
  await settleFrame(page);
}
