/* eslint-disable */
/* global WebImporter */

/**
 * Stellarus transformer ("stellarus-landing" template only).
 *
 * beforeTransform:
 *   - removes the SPA chrome that is not page content: <nav> (Stellarus nav fragment),
 *     <footer> (Stellarus footer fragment), the mobile drawer, and the decorative
 *     backdrop layers (orbs, starfield, constellation SVG, grain) — those are theme CSS
 *   - sets page metadata Theme = stellarus; the page uses the careers site nav and
 *     footer (/nav, /footer), restyled by the Stellarus theme
 */

const IMPORT_TEMPLATE = 'stellarus-landing';

export default function transform(hookName, element, payload) {
  if (!payload || !payload.template || payload.template.name !== IMPORT_TEMPLATE) return;
  if (hookName !== 'beforeTransform') return;

  element.querySelectorAll('nav, footer, #stl-mobile-drawer, .stl-orb, .stl-grain, script, noscript, style')
    .forEach((el) => el.remove());
  const careers = element.querySelector('#careers');
  if (careers) {
    // keep only the careers section: drop sibling decoration layers around <main>
    const main = careers.closest('main') || careers.parentElement;
    [...element.querySelectorAll('#root > div')].forEach((layer) => {
      if (!layer.contains(main)) layer.remove();
    });
    careers.querySelectorAll('svg').forEach((svg) => svg.remove());
  }

  if (payload.extraMetadata) {
    payload.extraMetadata.Theme = 'stellarus';
  }
}
