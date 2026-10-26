/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-story-grid (renamed to "Cards (story-grid)" by block-options transformer).
 * Source: section.contentSection .tiles on careers.blueshieldca.com/growth-development.
 * Block structure (Cards convention, 2 columns): one row per article.tiles-item:
 *   cell 1: story image
 *   cell 2: H3 title linked to the story URL + description paragraph
 *
 * The source wraps the whole tile in a block-level <a class="tiles-wrapper">; the link is
 * rebuilt on the title (the block makes the whole card follow the title link).
 */
export default function parse(element, { document }) {
  const cells = [];

  const items = element.querySelectorAll('article.tiles-item');
  items.forEach((item) => {
    const img = item.querySelector('.tiles-figure img, img');
    const wrapLink = item.querySelector('a.tiles-wrapper[href], a[href]');
    const href = wrapLink ? wrapLink.getAttribute('href') : '';

    const body = [];
    const titleEl = item.querySelector('.tiles-title');
    const titleText = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (titleText) {
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = titleText;
        h3.append(a);
      } else {
        h3.textContent = titleText;
      }
      body.push(h3);
    }
    const desc = item.querySelector('.tiles-description');
    if (desc && desc.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.replace(/\s+/g, ' ').trim();
      body.push(p);
    }

    if (!img && !body.length) return;
    cells.push([img ? [img] : [''], body.length ? body : ['']]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-story-grid', cells });
  element.replaceWith(block);
}
