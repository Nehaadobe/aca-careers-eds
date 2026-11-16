/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-centered ("Hero (centered)").
 * Source: https://www.stellarus.com/careers, section#careers (React SPA, rendered DOM):
 *   eyebrow span ("Careers"), H1, body paragraphs, two CTA links (primary pill, secondary pill).
 *
 * Block table (library Hero convention, 1 column):
 *   row 1: block name with variant -> "Hero (centered)"
 *   row 2: background image (optional) -> left empty, the source hero has no image
 *   row 3: eyebrow paragraph, title (H1), subheading paragraphs, calls to action
 *          (primary CTA in <strong>, secondary CTA in <em>)
 * Decorative SVGs (constellation, arrow icons) are dropped.
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const content = [];

  const h1 = element.querySelector('h1');
  const eyebrowEl = h1 && [...element.querySelectorAll('span, p, div')]
    .find((el) => el.children.length === 0 && clean(el.textContent)
      && (el.compareDocumentPosition(h1) & 4) && !el.closest('h1'));
  if (eyebrowEl) {
    const p = document.createElement('p');
    p.textContent = clean(eyebrowEl.textContent);
    content.push(p);
  }
  if (h1) {
    const title = document.createElement('h1');
    title.textContent = clean(h1.textContent);
    content.push(title);
  }
  element.querySelectorAll('p').forEach((p) => {
    if (eyebrowEl && (p === eyebrowEl || p.contains(eyebrowEl))) return;
    const text = clean(p.textContent);
    if (!text || p.querySelector('a')) return;
    const subheading = document.createElement('p');
    subheading.textContent = text;
    content.push(subheading);
  });
  [...element.querySelectorAll('a[href]')].forEach((a, i) => {
    const text = clean(a.textContent);
    if (!text) return;
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = text;
    const emphasis = document.createElement(i === 0 ? 'strong' : 'em');
    emphasis.append(link);
    const p = document.createElement('p');
    p.append(emphasis);
    content.push(p);
  });

  const cells = [
    [''], // background image (optional) - none on the source
    [content],
  ];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Hero', variants: ['centered'], cells });
  element.replaceWith(block);
}
