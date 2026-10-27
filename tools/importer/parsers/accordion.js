/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion (block "Accordion", no variation).
 * Source: .faq on careers.blueshieldca.com/how-to-get-hired.
 * Block structure (Accordion convention, 2 columns): one row per .faq-item:
 *   cell 1: question (plain text; the source "#tab_..." toggle anchor is dropped)
 *   cell 2: answer as rich text (paragraphs, lists, links incl. mailto kept)
 *
 * Answers mix bare text with <p>/<span>, so inline runs are wrapped into paragraphs.
 */
const BLOCK_TAGS = /^(P|UL|OL|H[1-6]|BLOCKQUOTE|TABLE)$/;
const isBlank = (s) => s.replace(/[\s​ ]+/g, '') === '';

/** Splits a paragraph on <br><br> into several paragraphs and trims edge <br>s. */
function splitOnDoubleBreak(p, document) {
  const parts = p.innerHTML.split(/(?:<br\s*\/?>\s*(?:<\/?span>\s*)*){2,}/i);
  return parts
    .map((html) => {
      const np = document.createElement('p');
      np.innerHTML = html.replace(/^(\s|<br\s*\/?>|&nbsp;)+|(\s|<br\s*\/?>|&nbsp;)+$/gi, '');
      return np;
    })
    .filter((np) => !isBlank(np.textContent) || np.querySelector('img'));
}

/** Normalizes mixed inline/block rich text into a list of block elements. */
function richContent(container, document) {
  const out = [];
  let run = null;
  const flush = () => {
    if (run && !isBlank(run.textContent)) out.push(...splitOnDoubleBreak(run, document));
    run = null;
  };
  [...container.childNodes].forEach((node) => {
    if (node.nodeType === 1 && node.tagName === 'DIV') {
      flush();
      out.push(...richContent(node, document));
      return;
    }
    if (node.nodeType === 1 && BLOCK_TAGS.test(node.tagName)) {
      flush();
      if (isBlank(node.textContent) && !node.querySelector('img')) return;
      if (node.tagName === 'P') out.push(...splitOnDoubleBreak(node, document));
      else out.push(node);
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

  const items = element.querySelectorAll('.faq-item');
  items.forEach((item) => {
    const header = item.querySelector('.faq-header .faq-caller, .faq-header');
    const question = header ? header.textContent.replace(/\s+/g, ' ').trim() : '';

    const body = item.querySelector('.faq-body_wrapper, .faq-body');
    const answer = body ? richContent(body, document) : [];

    if (!question && !answer.length) return;
    cells.push([question || '', answer.length ? answer : ['']]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
