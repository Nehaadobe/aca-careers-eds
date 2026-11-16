import fs from 'node:fs';

/**
 * Page inventory: every migrated page (generated list in pages-inventory.json: 10 BSC pages and
 * the Stellarus page at all viewports, 76 stories at mobile-390 and desktop-1440). Full-page
 * screenshots. The site under test is served from /drafts-preview/<path>.html (pages assembled
 * from content/<path>.plain.html with their metadata), so each case has an actualPath.
 *
 * Case fields
 *   id, tags          stable unique id; tags for --grep (e.g. @home)
 *   path              common path (LIVE route)
 *   referencePath / actualPath   per-side path when routes differ
 *   status            expected HTTP status (default 200)
 *   reference / actual  per-side { ready, masks: [{ selector, reason, optional }] }
 *   viewports         optional { names, minWidth, maxWidth }
 *   tolerance         optional { threshold, maxDiffPixelRatio, reason } (reason required)
 *
 * Default readiness selectors: LIVE "#site_content", migrated "main" (plus EDS block/section
 * status checks, see stabilize.js). Default masks are in MASKS below.
 */

/** Masks applied to every page case, per side. */
export const DEFAULT_MASKS = {
  reference: [
    {
      selector: '.footer-feedback, #poll',
      reason: 'LIVE "[+] Feedback" poll widget: third-party, out of migration scope; not always present',
      optional: true,
    },
  ],
  actual: [],
};

export const PAGES = JSON.parse(
  fs.readFileSync(new URL('./pages-inventory.json', import.meta.url), 'utf8'),
);
