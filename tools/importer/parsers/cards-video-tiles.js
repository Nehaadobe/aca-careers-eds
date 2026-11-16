/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-video-tiles (renamed to "Cards (video-tiles)" by block-options transformer).
 * Source: .ipr_videoTiles on careers.blueshieldca.com/life-at-blue-shield.
 * Block structure (Cards convention, 2 columns): one row per .ipr_videoTiles-item:
 *   cell 1: thumbnail image
 *   cell 2: H3 title + youtube.com/watch link in its own paragraph
 * (the block moves the video link onto the title and opens it in a modal).
 *
 * The source wraps each tile in a block-level <a>; the link is rebuilt as a text link.
 */
export default function parse(element, { document }) {
  const cells = [];

  const items = element.querySelectorAll('.ipr_videoTiles-item');
  items.forEach((item) => {
    const img = item.querySelector('.ipr_videoTiles-figure img, img');
    const link = item.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : '';

    const body = [];
    const titleEl = item.querySelector('.ipr_videoTiles-title');
    const title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      body.push(h3);
    }
    if (href) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = href;
      p.append(a);
      body.push(p);
    }

    if (!img && !body.length) return;
    cells.push([img ? [img] : [''], body.length ? body : ['']]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-video-tiles', cells });
  element.replaceWith(block);
}
