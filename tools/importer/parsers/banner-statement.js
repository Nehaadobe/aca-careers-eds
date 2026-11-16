/* eslint-disable */
/* global WebImporter */

/**
 * Parser for banner-statement (renamed to "Banner (statement)" by block-options transformer).
 * Source: section.ipr_textBanner on careers.blueshieldca.com/growth-development.
 * Block structure (blocks/banner/README.md, option "statement" - no image):
 *   one row: the statement text as a paragraph. The source styles it as an H3, but it
 *   is body copy, so it is authored as a <p> (inline formatting/links kept).
 */
export default function parse(element, { document }) {
  const cells = [];

  const desc = element.querySelector('.ipr_textBanner-description') || element;
  const sources = [...desc.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > p')];

  const content = [];
  if (sources.length) {
    sources.forEach((el) => {
      if (el.textContent.trim() === '') return;
      const p = document.createElement('p');
      p.append(...el.childNodes);
      content.push(p);
    });
  } else if (desc.textContent.trim() !== '') {
    const p = document.createElement('p');
    p.textContent = desc.textContent.replace(/\s+/g, ' ').trim();
    content.push(p);
  }

  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'banner-statement', cells });
  element.replaceWith(block);
}
