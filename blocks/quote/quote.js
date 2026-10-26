import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Quote block: employee quotation with an optional circular portrait and attribution.
 *
 * Authoring: row 1 portrait image (optional), row 2 quotation, row 3 attribution
 * (name, role). Cells are identified by content, so the portrait may be omitted
 * or rows reordered; with a single text cell there is no attribution.
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const picture = block.querySelector('picture');
  const textCells = cells.filter((cell) => cell.textContent.trim() !== '');

  const figure = document.createElement('figure');
  figure.className = 'quote-figure';

  if (picture) {
    const img = picture.querySelector('img');
    const portrait = document.createElement('div');
    portrait.className = 'quote-portrait';
    portrait.append(img
      ? createOptimizedPicture(img.src, img.getAttribute('alt') || '', false, [{ width: '240' }])
      : picture);
    figure.append(portrait);
  }

  const [quotationCell, ...rest] = textCells;
  if (quotationCell) {
    const blockquote = document.createElement('blockquote');
    blockquote.className = 'quote-quotation';
    quotationCell.querySelectorAll('picture').forEach((p) => p.remove());
    blockquote.append(...quotationCell.childNodes);
    figure.append(blockquote);
  }

  const attributionCell = rest[rest.length - 1];
  if (attributionCell) {
    const caption = document.createElement('figcaption');
    caption.className = 'quote-attribution';
    attributionCell.querySelectorAll('picture').forEach((p) => p.remove());
    attributionCell.querySelectorAll('em').forEach((em) => {
      const cite = document.createElement('cite');
      cite.innerHTML = em.innerHTML;
      em.replaceWith(cite);
    });
    caption.append(...attributionCell.childNodes);
    figure.append(caption);
  }

  block.replaceChildren(figure);
}
