/**
 * Inventory validation and helpers shared by both specs.
 */

import crypto from 'node:crypto';
import { PAGES, DEFAULT_MASKS } from './pages.js';
import { BLOCKS } from './blocks.js';

const SIDES = ['reference', 'actual'];
const CAPTURES = ['element', 'union', 'viewport'];
const ACTIONS = ['hover', 'click'];

function fail(id, msg) {
  throw new Error(`Inventory case "${id}": ${msg}`);
}

function checkMasks(id, masks) {
  (masks || []).forEach((m) => {
    if (!m.selector) fail(id, 'mask without selector');
    if (!m.reason) fail(id, `mask "${m.selector}" needs a documented reason`);
  });
}

function checkSelectorSpec(id, spec, label) {
  if (!spec || typeof spec.selector !== 'string' || !spec.selector) fail(id, `${label} needs a selector`);
  if (spec.count !== undefined && (!Number.isInteger(spec.count) || spec.count < 0)) fail(id, `${label} count must be an integer`);
}

function checkCommon(c, viewportNames) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(c.id || '')) fail(c.id, 'id must be kebab-case');
  if (!Array.isArray(c.tags) || !c.tags.length) fail(c.id, 'needs at least one tag');
  c.tags.forEach((t) => { if (!/^@[a-z0-9-]+$/.test(t)) fail(c.id, `invalid tag "${t}"`); });
  ['path', 'referencePath', 'actualPath'].forEach((k) => {
    if (c[k] !== undefined && !String(c[k]).startsWith('/')) fail(c.id, `${k} must start with "/"`);
  });
  if (!c.path) fail(c.id, 'needs a path');
  if (c.status !== undefined && !Number.isInteger(c.status)) fail(c.id, 'status must be an integer');
  if (c.viewports) {
    const { names, minWidth, maxWidth } = c.viewports;
    (names || []).forEach((n) => { if (!viewportNames.has(n)) fail(c.id, `unknown viewport "${n}"`); });
    [minWidth, maxWidth].forEach((w) => { if (w !== undefined && !Number.isInteger(w)) fail(c.id, 'min/maxWidth must be integers'); });
  }
  if (c.tolerance) {
    if (!c.tolerance.reason) fail(c.id, 'tolerance override needs a documented reason');
    const { threshold, maxDiffPixelRatio } = c.tolerance;
    if (threshold !== undefined && !(threshold >= 0 && threshold <= 1)) fail(c.id, 'threshold must be 0..1');
    if (maxDiffPixelRatio !== undefined && !(maxDiffPixelRatio >= 0 && maxDiffPixelRatio <= 1)) fail(c.id, 'maxDiffPixelRatio must be 0..1');
  }
}

function checkBlock(c) {
  if (!CAPTURES.includes(c.capture)) fail(c.id, `capture must be one of ${CAPTURES.join(', ')}`);
  if (c.pointer && !['park', 'keep'].includes(c.pointer)) fail(c.id, 'pointer must be "park" or "keep"');
  SIDES.forEach((side) => {
    const s = c[side];
    if (!s) fail(c.id, `missing "${side}" definition`);
    if (c.capture === 'element') checkSelectorSpec(c.id, s.target, `${side}.target`);
    if (c.capture === 'union') {
      if (!Array.isArray(s.union) || s.union.length < 2) fail(c.id, `${side}.union needs 2+ selectors`);
    }
    (s.steps || []).forEach((st, i) => {
      if (!ACTIONS.includes(st.action)) fail(c.id, `${side}.steps[${i}] action must be hover or click`);
      checkSelectorSpec(c.id, st, `${side}.steps[${i}]`);
    });
    (s.assert || []).forEach((a, i) => checkSelectorSpec(c.id, a, `${side}.assert[${i}]`));
    checkMasks(c.id, s.masks);
  });
}

/**
 * Validates both inventories; throws on the first problem.
 * @param {Array<{name: string}>} viewports
 */
export function validateInventories(viewports) {
  const names = new Set(viewports.map((v) => v.name));
  const ids = new Set();
  [...PAGES, ...BLOCKS].forEach((c) => {
    if (ids.has(c.id)) fail(c.id, 'duplicate id (ids must be unique across pages and blocks)');
    ids.add(c.id);
    checkCommon(c, names);
  });
  PAGES.forEach((c) => SIDES.forEach((side) => checkMasks(c.id, c[side]?.masks)));
  SIDES.forEach((side) => checkMasks('default-masks', DEFAULT_MASKS[side]));
  BLOCKS.forEach(checkBlock);
}

/**
 * Whether a case runs at a viewport.
 * @returns {string|null} null when applicable, otherwise the skip reason
 */
export function skipReason(c, viewport) {
  const r = c.viewports;
  if (!r) return null;
  if (r.names && !r.names.includes(viewport.name)) return `only for ${r.names.join(', ')}`;
  if (r.minWidth !== undefined && viewport.width < r.minWidth) return `only at ${r.minWidth}px and wider`;
  if (r.maxWidth !== undefined && viewport.width > r.maxWidth) return `only at ${r.maxWidth}px and narrower`;
  return null;
}

/** Path for one side of a case. */
export function sidePath(c, side) {
  if (side === 'reference') return c.referencePath || c.path;
  return c.actualPath || c.path;
}

/** Masks for one side: page defaults + case masks. */
export function sideMasks(c, side, isPage) {
  return [...(isPage ? DEFAULT_MASKS[side] : []), ...(c[side]?.masks || [])];
}

/**
 * Fingerprint of everything that determines a case's reference screenshot (reference side
 * only: changing actual-side selectors must not invalidate approved LIVE references).
 */
export function referenceFingerprint(c, isPage) {
  const data = {
    id: c.id,
    path: sidePath(c, 'reference'),
    status: c.status || 200,
    capture: isPage ? 'full-page' : c.capture,
    pointer: c.pointer || 'park',
    reference: c.reference || {},
    masks: sideMasks(c, 'reference', isPage),
  };
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex').slice(0, 16);
}
