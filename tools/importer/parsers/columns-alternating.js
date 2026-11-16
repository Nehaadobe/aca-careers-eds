/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-alternating (renamed to "Columns (alternating)" by block-options transformer).
 * Source: .ipr_indexChess on careers.blueshieldca.com (/growth-development: 1 video row,
 * /life-at-blue-shield/our-workplace-model: 2 image rows).
 * Block structure (Columns convention; blocks/columns/README.md option "alternating"):
 *   one row per article.ipr_indexChess-item:
 *     cell 1 (media): image, optionally followed by a youtube.com/watch link (the block
 *                     turns poster + link into a play button with the play icon)
 *     cell 2 (text):  optional H3 title, paragraphs, lists, links
 *
 * The source wraps the video poster in an image-only <a>; the importer drops links with
 * no text, so the YouTube link is rebuilt as a text link after the image.
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

  const items = element.querySelectorAll('article.ipr_indexChess-item');
  items.forEach((item) => {
    // Media cell: poster/image + optional YouTube link
    const media = [];
    const figure = item.querySelector('.ipr_indexChess-image');
    const img = (figure || item).querySelector('img');
    if (img) media.push(img);
    const videoLink = (figure || item).querySelector('a[href*="youtube.com"], a[href*="youtu.be"]');
    if (videoLink) {
      const href = videoLink.getAttribute('href');
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = href;
      p.append(a);
      media.push(p);
    }

    // Text cell: H3 title + rich description
    const text = [];
    const titleEl = item.querySelector('.ipr_indexChess-title');
    if (titleEl && !isBlank(titleEl.textContent)) {
      const h3 = document.createElement('h3');
      h3.textContent = titleEl.textContent.replace(/\s+/g, ' ').trim();
      text.push(h3);
    }
    const desc = item.querySelector('.ipr_indexChess-description');
    if (desc) text.push(...richContent(desc, document));

    if (!media.length && !text.length) return;
    cells.push([media.length ? media : [''], text.length ? text : ['']]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-alternating', cells });
  element.replaceWith(block);
}
