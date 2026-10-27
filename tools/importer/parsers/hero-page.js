/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-page (renamed to "Hero (page)" by block-options transformer).
 * Source: div.page-header:not(.no_hero) on careers.blueshieldca.com landing pages.
 * Block structure (Hero convention: 1 column; blocks/hero/README.md, option "page"):
 *   row 1: background image (photo)
 *   row 2: title (H1) + subheading paragraph(s)
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
  const cells = [];

  // Row 1: background image
  const img = element.querySelector('.page-hero img, .page-figure img');
  if (img) cells.push([img]);

  // Row 2: title + subheading
  const content = [];
  const title = element.querySelector('.page-title');
  if (title) {
    const h1 = document.createElement('h1');
    h1.textContent = title.textContent.replace(/\s+/g, ' ').trim();
    content.push(h1);
  }
  const subtitle = element.querySelector('.page-subtitle');
  if (subtitle) content.push(...toParagraphs(subtitle, document));

  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-page', cells });
  element.replaceWith(block);
}
