/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-feature-links (renamed to "Cards (feature-links)" by block-options transformer).
 * Source: .homegallery_tiles on careers.blueshieldca.com homepage (3 text-only tiles).
 * Block structure (blocks/cards/README.md, "no images" shape): one row per card with a
 * single body cell: title heading, description paragraph, CTA link in its own paragraph.
 */
export default function parse(element, { document }) {
  const cells = [];

  const items = element.querySelectorAll('article.homegallery_tiles-item');
  items.forEach((item) => {
    const body = [];

    const title = item.querySelector('.homegallery_tiles-title');
    if (title && title.textContent.trim()) {
      const h3 = document.createElement('h3');
      h3.textContent = title.textContent.replace(/\s+/g, ' ').trim();
      body.push(h3);
    }

    const desc = item.querySelector('.homegallery_tiles-description');
    if (desc) {
      // Collapse source line breaks/&nbsp; padding into one paragraph of text.
      const text = desc.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
      if (text) {
        const p = document.createElement('p');
        p.textContent = text;
        body.push(p);
      }
    }

    const link = item.querySelector('.homegallery_tiles-link a[href]');
    if (link) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = link.textContent.replace(/\s+/g, ' ').trim();
      p.append(a);
      body.push(p);
    }

    if (body.length) cells.push([body]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature-links', cells });
  element.replaceWith(block);
}
