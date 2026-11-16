/* eslint-disable */
/* global WebImporter */

/**
 * Parser for quote. Matched once per .bioTiles-item (one block per employee quote).
 * Block structure (blocks/quote/README.md):
 *   row 1: portrait image (optional)
 *   row 2: quotation
 *   row 3: attribution ("— Name, Title")
 * Stray "google-site-verification: ..." text in the source quote is dropped.
 */
const VERIFICATION = /google-site-verification:\s*\S+/gi;

function cleanText(text) {
  return (text || '')
    .replace(VERIFICATION, '')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function parse(element, { document }) {
  const cells = [];

  // Row 1: portrait. Source alt holds escaped "<br />" markup; normalise it.
  const img = element.querySelector('.bioTiles-photo img, figure img, img');
  if (img) {
    const alt = (img.getAttribute('alt') || '')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/^[\s—–-]+/, '')
      .replace(/\s+/g, ' ')
      .trim();
    img.setAttribute('alt', alt);
    cells.push([img]);
  }

  // Row 2: quotation, without verification text.
  const quote = element.querySelector('.bioTiles-quote');
  if (quote) {
    const clone = quote.cloneNode(true);
    clone.querySelectorAll('font, span').forEach((el) => {
      if (el.isConnected && /^google-site-verification:/i.test((el.textContent || '').trim())) {
        const font = el.closest('font');
        (font && clone.contains(font) ? font : el).remove();
      }
    });
    const text = cleanText(clone.textContent);
    if (text) {
      const p = document.createElement('p');
      p.textContent = text;
      cells.push([p]);
    }
  }

  // Row 3: attribution "— Name,<br>Title" -> keep the line break between name and title.
  const author = element.querySelector('.bioTiles-author');
  if (author) {
    const parts = author.innerHTML
      .split(/<br\s*\/?>/i)
      .map((part) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = part;
        return cleanText(tmp.textContent);
      })
      .filter(Boolean);
    if (parts.length) {
      const p = document.createElement('p');
      parts.forEach((part, i) => {
        if (i) p.append(document.createElement('br'));
        p.append(document.createTextNode(part));
      });
      cells.push([p]);
    }
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote', cells });
  element.replaceWith(block);
}
