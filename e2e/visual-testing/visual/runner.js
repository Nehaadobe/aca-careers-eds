/**
 * Runs one inventory case at one viewport: prepare the page, set up state, capture, then
 * stage (reference mode) or compare (compare mode). Shared by pages.spec.js and blocks.spec.js.
 */

import { test } from '@playwright/test';
import { getRunConfig, urlFor } from './config.js';
import {
  skipReason, sidePath, sideMasks, referenceFingerprint,
} from './inventory.js';
import { preparePage, parkPointer, settleFrame } from './stabilize.js';
import {
  baselineRel, stageCapture, compareWithBaseline, environmentInfo, captureCommand,
} from './baseline.js';
import { VisualError, kindOf } from './errors.js';

const DEFAULT_READY = { reference: '#site_content', actual: 'main' };

function annotate(testInfo, type, description) {
  testInfo.annotations.push({ type, description });
}

/** Locator for a selector spec, requiring the exact expected match count. */
async function exact(page, spec, label) {
  let loc = page.locator(spec.selector);
  if (spec.hasText) loc = loc.filter({ hasText: spec.hasText });
  const expected = spec.count ?? 1;
  const n = await loc.count();
  if (n !== expected) {
    throw new VisualError('target', `${label} "${spec.selector}"${spec.hasText ? ` (text "${spec.hasText}")` : ''} `
      + `matched ${n} element(s), expected ${expected}`);
  }
  return loc;
}

async function runSteps(page, sideDef) {
  for (const step of sideDef.steps || []) {
    // eslint-disable-next-line no-await-in-loop
    const loc = await exact(page, step, `${step.action} target`);
    // eslint-disable-next-line no-await-in-loop
    if (step.action === 'hover') await loc.hover();
    // eslint-disable-next-line no-await-in-loop
    else await loc.click();
  }
  for (const a of sideDef.assert || []) {
    // eslint-disable-next-line no-await-in-loop
    const loc = await exact(page, a, 'state assertion');
    if (a.visible) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await loc.first().waitFor({ state: 'visible', timeout: 5_000 });
      } catch (e) {
        throw new VisualError('target', `Expected "${a.selector}" to be visible after setup`);
      }
    }
  }
}

async function maskLocators(page, masks) {
  const locs = [];
  for (const m of masks) {
    const loc = page.locator(m.selector);
    // eslint-disable-next-line no-await-in-loop
    const n = await loc.count();
    if (!n && !m.optional) throw new VisualError('target', `Mask "${m.selector}" matched nothing (${m.reason})`);
    if (n) locs.push(loc);
  }
  return locs;
}

/** Union bounding box of several single-match selectors, validated against the viewport. */
async function unionClip(page, selectors, viewport) {
  const boxes = [];
  for (const selector of selectors) {
    // eslint-disable-next-line no-await-in-loop
    const loc = await exact(page, { selector }, 'union part');
    // eslint-disable-next-line no-await-in-loop
    const box = await loc.boundingBox();
    if (!box || !box.width || !box.height) throw new VisualError('target', `Union part "${selector}" has no visible box`);
    boxes.push(box);
  }
  const x = Math.floor(Math.min(...boxes.map((b) => b.x)));
  const y = Math.floor(Math.min(...boxes.map((b) => b.y)));
  const right = Math.ceil(Math.max(...boxes.map((b) => b.x + b.width)));
  const bottom = Math.ceil(Math.max(...boxes.map((b) => b.y + b.height)));
  if (x < 0 || y < 0 || right > viewport.width || bottom > viewport.height) {
    throw new VisualError('target', `Union region ${x},${y}-${right},${bottom} exceeds the ${viewport.width}x${viewport.height} viewport`);
  }
  return {
    x, y, width: right - x, height: bottom - y,
  };
}

async function capture(page, kind, caseDef, sideDef, masks, viewport) {
  const common = {
    animations: 'disabled', caret: 'hide', scale: 'css', mask: masks,
  };
  if (kind === 'page') return page.screenshot({ ...common, fullPage: true });
  if (caseDef.capture === 'viewport') return page.screenshot({ ...common, fullPage: false });
  if (caseDef.capture === 'union') {
    const clip = await unionClip(page, sideDef.union, viewport);
    return page.screenshot({ ...common, clip });
  }
  const target = await exact(page, sideDef.target, 'target');
  await target.scrollIntoViewIfNeeded();
  return target.screenshot(common);
}

/**
 * @param {{ spec: 'pages'|'blocks', kind: 'page'|'block', caseDef: object,
 *   page: import('@playwright/test').Page, browser: import('@playwright/test').Browser,
 *   testInfo: import('@playwright/test').TestInfo }} args
 */
export async function runCase({
  spec, kind, caseDef, page, browser, testInfo,
}) {
  const cfg = getRunConfig();
  const { viewport } = testInfo.project.metadata;
  const reason = skipReason(caseDef, viewport);
  test.skip(reason !== null, reason || '');

  // selector/readiness profile: LIVE markup for captures and for LIVE-as-target checks
  const side = cfg.mode === 'reference' || cfg.actualProfile === 'live' ? 'reference' : 'actual';
  const sideDef = caseDef[side] || {};
  const url = urlFor(cfg, sidePath(caseDef, side));
  const rel = baselineRel(spec, caseDef.id, viewport.name);
  const isPage = kind === 'page';
  const caseFingerprint = referenceFingerprint(caseDef, isPage);
  const recapture = captureCommand(caseDef.tags[0], viewport.name);

  annotate(testInfo, 'case', `${spec}/${caseDef.id}`);
  annotate(testInfo, 'viewport', `${viewport.name} (${viewport.width}x${viewport.height})`);
  annotate(testInfo, cfg.mode === 'reference' ? 'reference-url' : 'actual-url', url);
  if (cfg.mode === 'compare') annotate(testInfo, 'reference-path', sidePath(caseDef, 'reference'));

  let phase = 'navigation';
  try {
    await preparePage(page, {
      url,
      side,
      readySelector: sideDef.ready || DEFAULT_READY[side],
      expectedStatus: caseDef.status || 200,
    });
    phase = 'target';
    await runSteps(page, sideDef);
    if ((caseDef.pointer || 'park') === 'park') await parkPointer(page);
    if (caseDef.capture === 'viewport' || caseDef.capture === 'union') await settleFrame(page);
    const masks = await maskLocators(page, sideMasks(caseDef, side, isPage));
    const buffer = await capture(page, kind, caseDef, sideDef, masks, viewport);

    if (cfg.mode === 'reference') {
      phase = 'capture';
      stageCapture(rel, buffer, {
        referenceUrl: url,
        capturedAt: new Date().toISOString(),
        caseFingerprint,
        viewport: { width: viewport.width, height: viewport.height },
        environment: environmentInfo(browser.version()),
      });
      annotate(testInfo, 'captured', rel);
      return;
    }
    phase = 'compare';
    await compareWithBaseline(testInfo, {
      rel,
      actual: buffer,
      caseFingerprint,
      viewport,
      browserVersion: browser.version(),
      tolerance: caseDef.tolerance,
      recapture,
    });
  } catch (error) {
    annotate(testInfo, 'failure-kind', kindOf(error, phase));
    throw error;
  }
}
