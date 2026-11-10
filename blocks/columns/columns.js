import { getYouTubeId, unwrapPicture } from '../../scripts/scripts.js';
import { bindVideoLink } from '../../scripts/video-modal.js';

/**
 * Columns block: one row per line of columns, one cell per column.
 *
 * Options (block classes):
 *   - `alternating` - image/text rows; the authored cell order sets the side (image
 *     cell first = image left, text cell first = image right); rows stack (image
 *     first) on mobile. A media cell holding a poster
 *     image and a YouTube link becomes a play button that opens the video in a
 *     modal dialog.
 *   - `curve` - page header rows: a text cell (H1 and intro) and a photo cell
 *     with one curved corner. The authored cell order sets the side: photo cell
 *     first = photo left, text cell first = photo right; the curve faces the text.
 *     Rows stack (photo first) on mobile; a row without a photo is title only.
 */

/**
 * True when the cell holds a picture and nothing else except, optionally,
 * links (e.g. a video URL).
 * @param {Element} cell
 */
function isMediaCell(cell) {
  if (!cell.querySelector('picture')) return false;
  if (cell.querySelector('h1, h2, h3, h4, h5, h6, ul, ol')) return false;
  const clone = cell.cloneNode(true);
  clone.querySelectorAll('a').forEach((a) => a.remove());
  return clone.textContent.trim() === '';
}

/**
 * Turns a poster picture and a YouTube link in a media cell into a single
 * play button link.
 * @param {Element} cell
 */
function decorateVideo(cell) {
  const link = [...cell.querySelectorAll('a[href]')].find((a) => getYouTubeId(a.href));
  const picture = cell.querySelector('picture');
  if (!link || !picture) return;

  const img = picture.querySelector('img');
  const linkText = link.textContent.trim();
  const isUrlText = /^https?:\/\//.test(linkText);
  const title = (img?.alt || (isUrlText ? '' : linkText) || link.title || '').trim();

  const play = document.createElement('a');
  play.href = link.href;
  play.className = 'columns-video';
  play.setAttribute('aria-label', title ? `Play video: ${title}` : 'Play video');
  const icon = document.createElement('span');
  icon.className = 'columns-video-play video-play';
  icon.setAttribute('aria-hidden', 'true');
  play.append(picture, icon);

  cell.replaceChildren(play);
  bindVideoLink(play, title || 'Video');
}

function decorateAlternating(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const media = cells.find(isMediaCell);
    if (!media) return;
    media.classList.add('columns-media');
    cells.filter((c) => c !== media).forEach((c) => c.classList.add('columns-text'));
    row.classList.add(cells.indexOf(media) === 0 ? 'columns-alternating-image-left' : 'columns-alternating-image-right');
    // Image first in the DOM so it stacks above the text on mobile;
    // CSS puts it on the authored side on wide screens.
    if (row.firstElementChild !== media) row.prepend(media);
    decorateVideo(media);
  });
}

function decorateCurve(block) {
  // page header spacing (styles.css) applies to the section that holds it
  block.closest('.section')?.classList.add('columns-curve-container');
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const media = cells.find(isMediaCell);
    cells.filter((c) => c !== media).forEach((c) => c.classList.add('columns-text'));
    if (!media) {
      row.classList.add('columns-curve-no-image');
      return;
    }
    // a picture authored inside a paragraph: keep the picture only
    unwrapPicture(media.querySelector('picture'));
    media.classList.add('columns-media');
    row.classList.add(cells.indexOf(media) === 0 ? 'columns-curve-image-left' : 'columns-curve-image-right');
    // photo first in the DOM so it stacks above the text on mobile; CSS sets the side
    if (row.firstElementChild !== media) row.prepend(media);
  });
}

export default function decorate(block) {
  const cols = [...(block.firstElementChild?.children || [])];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  if (block.classList.contains('alternating')) decorateAlternating(block);
  if (block.classList.contains('curve')) decorateCurve(block);
}
