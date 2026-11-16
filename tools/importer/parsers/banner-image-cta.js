/* eslint-disable */
/* global WebImporter */

/**
 * Parser for banner-image-cta (renamed to "Banner (image-cta)" by block-options transformer).
 * Source: section.ipr_banner on careers.blueshieldca.com/life-at-blue-shield.
 * Block structure (blocks/banner/README.md, option "image-cta"):
 *   row 1: background image
 *   row 2: H2 heading + CTA link in its own paragraph (Oracle Recruiting Cloud URL unchanged)
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 1: background image
  const img = element.querySelector('.ipr_banner-figure img');
  if (img) cells.push([img]);

  // Row 2: heading + CTA
  const content = [];
  const title = element.querySelector('.ipr_banner-title');
  if (title && title.textContent.trim()) {
    const h2 = document.createElement('h2');
    h2.textContent = title.textContent.replace(/\s+/g, ' ').trim();
    content.push(h2);
  }

  const text = element.querySelector('.ipr_banner-text');
  if (text) {
    // Any copy between the heading and the button.
    text.querySelectorAll(':scope > p, :scope > .ipr_banner-description p').forEach((p) => {
      if (p.textContent.trim()) content.push(p);
    });
  }

  element.querySelectorAll('.ipr_banner-btn a[href]').forEach((a) => {
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.replace(/\s+/g, ' ').trim();
    p.append(link);
    content.push(p);
  });

  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'banner-image-cta', cells });
  element.replaceWith(block);
}
