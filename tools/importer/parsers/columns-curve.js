/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-curve (renamed to "Columns (curve)" by block-options transformer): the page
 * header, formerly Hero (page).
 * Source: div.page-header:not(.no_hero) on careers.blueshieldca.com landing pages.
 * Block structure (blocks/columns/README.md, option "curve"): one row, two cells:
 *   cell 1: title (H1) + subheading paragraph(s)
 *   cell 2: photo
 * Text cell first = photo on the right, as on the source.
 *
 * The subtitle mixes bare text with <p> elements (e.g. /life-at-blue-shield), so it is
 * normalized into paragraphs: runs of text/inline nodes become one <p>, existing block
 * elements are kept, empty paragraphs are dropped.
 */
const BLOCK_TAGS = /^(P|UL|OL|H[1-6]|BLOCKQUOTE|TABLE|DIV)$/;
const isBlank = (s) => s.replace(/[\s​ ]+/g, '') === '';

function toParagraphs(container, document) {
  const out = [];
  let run = null;
  const flush = () => {
    if (run && !isBlank(run.textContent)) out.push(run);
    run = null;
  };
  [...container.childNodes].forEach((node) => {
    if (node.nodeType === 1 && BLOCK_TAGS.test(node.tagName)) {
      flush();
      if (isBlank(node.textContent) && !node.querySelector('img')) return;
      if (node.tagName === 'DIV') out.push(...toParagraphs(node, document));
      else out.push(node);
      return;
    }
    if (node.nodeType !== 1 && node.nodeType !== 3) return;
    if (!run) run = document.createElement('p');
    run.append(node);
  });
  flush();
  // Tidy whitespace/zero-width chars in text-only paragraphs.
  out.forEach((el) => {
    if (el.tagName === 'P' && el.children.length === 0) {
      el.textContent = el.textContent.replace(/​/g, '').replace(/[\s ]+/g, ' ').trim();
    }
  });
  return out;
}

export default function parse(element, { document }) {
  // Text cell: title + subheading
  const content = [];
  const title = element.querySelector('.page-title');
  if (title) {
    const h1 = document.createElement('h1');
    h1.textContent = title.textContent.replace(/\s+/g, ' ').trim();
    content.push(h1);
  }
  const subtitle = element.querySelector('.page-subtitle');
  if (subtitle) content.push(...toParagraphs(subtitle, document));

  // Photo cell, after the text: photo on the right
  const img = element.querySelector('.page-hero img, .page-figure img');
  const row = [content];
  if (img) row.push(img);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-curve', cells: [row] });
  element.replaceWith(block);
}
