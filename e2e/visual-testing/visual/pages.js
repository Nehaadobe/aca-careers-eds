/**
 * Page inventory: one representative page per template, chosen because the same content
 * exists on LIVE and on the migrated site. Full-page screenshots.
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

export const PAGES = [
  {
    id: 'home',
    tags: ['@home'],
    path: '/',
  },
  {
    id: 'total-rewards',
    tags: ['@total-rewards', '@landing'],
    path: '/total-rewards',
  },
  {
    id: 'life-at-blue-shield',
    tags: ['@life', '@landing'],
    path: '/life-at-blue-shield',
  },
  {
    id: 'how-to-get-hired',
    tags: ['@hiring', '@landing'],
    path: '/how-to-get-hired',
  },
  {
    id: 'growth-development',
    tags: ['@growth', '@landing'],
    path: '/growth-development',
  },
  {
    id: 'why-relocate',
    tags: ['@why-relocate', '@content'],
    path: '/why-relocate',
  },
  {
    id: 'story-interns-2026',
    tags: ['@story'],
    path: '/blog/reflections-from-our-2026-interns',
    reference: {
      masks: [
        {
          selector: 'section.contentSection.blue_bottom',
          reason: '"More Stories" band lists the latest stories, which change as stories are published',
        },
      ],
    },
    actual: {
      masks: [
        {
          selector: '.section.related-stories',
          reason: '"More Stories" band (same as LIVE); filled from the site index, empty without it',
          optional: true,
        },
      ],
    },
  },
];
