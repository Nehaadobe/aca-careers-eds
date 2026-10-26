/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-home (renamed to "Hero (home)" by block-options transformer).
 * Source: div.hero on careers.blueshieldca.com homepage.
 * Block structure (blocks/hero/README.md):
 *   row 1: background image
 *   row 2: heading (H2) + CTA link in its own paragraph
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 1: background image
  const img = element.querySelector('.hero-media img, .hero-media_item img, img');
  if (img) cells.push([img]);

  // Row 2: heading + CTA
  const content = [];
  const heading = element.querySelector('.hero-title, .hero-text h1, .hero-text h2, h1, h2');
  if (heading) {
    if (/^H[1-6]$/.test(heading.tagName)) {
      content.push(heading);
    } else {
      const h2 = document.createElement('h2');
      h2.textContent = heading.textContent.trim();
      content.push(h2);
    }
  }

  const ctas = element.querySelectorAll('.hero-action a[href]');
  ctas.forEach((a) => {
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = a.getAttribute('href'); // keep Oracle Recruiting Cloud URL as-is
    link.textContent = a.textContent.replace(/\s+/g, ' ').trim();
    p.append(link);
    content.push(p);
  });

  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-home', cells });
  element.replaceWith(block);
}
