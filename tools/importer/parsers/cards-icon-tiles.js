/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-icon-tiles (renamed to "Cards (icon-tiles)" by block-options transformer).
 * Source: .tileIcons grid on careers.blueshieldca.com landing pages
 * (/total-rewards: 3 grids, /how-to-get-hired: process steps). Each .tileIcons is one block.
 * Block structure (Cards convention, 2 columns): one row per tile:
 *   cell 1: icon image (absolute /_gallery/get_file/... or iprsoftwaremedia URL, kept as-is)
 *   cell 2: H3 title + rich description (paragraphs, inline links kept)
 */
const isBlank = (s) => s.replace(/[\s​ ]+/g, '') === '';

function descriptionContent(desc, document) {
  if (!desc) return [];
  const out = [];
  let run = null;
  const flush = () => {
    if (run && !isBlank(run.textContent)) out.push(run);
    run = null;
  };
  [...desc.childNodes].forEach((node) => {
    if (node.nodeType === 1 && /^(P|UL|OL|H[1-6]|BLOCKQUOTE)$/.test(node.tagName)) {
      flush();
      if (!isBlank(node.textContent) || node.querySelector('img')) out.push(node);
      return;
    }
    if (node.nodeType === 1 && node.tagName === 'DIV') {
      flush();
      out.push(...descriptionContent(node, document));
      return;
    }
    if (node.nodeType !== 1 && node.nodeType !== 3) return;
    if (!run) run = document.createElement('p');
    run.append(node);
  });
  flush();
  return out;
}

export default function parse(element, { document }) {
  const cells = [];

  const items = element.querySelectorAll('article.tileIcons-item');
  items.forEach((item) => {
    const img = item.querySelector('.tileIcons-icon img, figure img, img');
    const imageCell = img ? [img] : [''];

    const body = [];
    const titleEl = item.querySelector('.tileIcons-title');
    if (titleEl && !isBlank(titleEl.textContent)) {
      const h3 = document.createElement('h3');
      h3.textContent = titleEl.textContent.replace(/\s+/g, ' ').trim();
      body.push(h3);
    }
    body.push(...descriptionContent(item.querySelector('.tileIcons-description'), document));

    if (!img && !body.length) return;
    cells.push([imageCell, body.length ? body : ['']]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon-tiles', cells });
  element.replaceWith(block);
}
