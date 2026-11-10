import { decorateLoneLinkButtons, unwrapPicture } from '../../scripts/scripts.js';

/**
 * Hero block.
 *
 * Authored shape (either works):
 *   - row 1: background image, row 2: heading + optional CTA link
 *   - a single cell holding the image followed by the heading/CTA (boilerplate shape)
 *
 * Options (block classes):
 *   - `home` - full-bleed, centered headline and CTA over the image (the same look as no
 *     option: authors may use Hero or Hero (home)).
 *   (Page headers - H1 and intro beside a photo with a curved corner - are the
 *   Columns (curve) block.)
 *   - `centered` - centered text intro, usually without an image: optional eyebrow
 *     paragraph before the H1, body copy, then CTA buttons side by side.
 */

/**
 * Centered option: marks the eyebrow (text paragraphs before the heading), groups
 * consecutive button paragraphs into one row, and flattens the block to
 * [media?, content] so an empty image row leaves no gap.
 * @param {Element} block
 * @param {Element|null} picture
 * @param {Element|undefined} contentCell
 */
function decorateCentered(block, picture, contentCell) {
  const children = [];
  if (picture) {
    const media = document.createElement('div');
    media.className = 'hero-media-wrap';
    media.append(picture);
    children.push(media);
  }
  if (contentCell) {
    decorateLoneLinkButtons(contentCell);
    contentCell.querySelectorAll(':scope > p').forEach((p) => {
      if (p.textContent.trim() === '' && !p.querySelector('img, picture, a')) p.remove();
    });

    const heading = contentCell.querySelector(':scope > :is(h1, h2, h3)');
    if (heading) {
      let prev = heading.previousElementSibling;
      while (prev) {
        if (prev.matches('p') && !prev.classList.contains('button-wrapper')) prev.classList.add('hero-eyebrow');
        prev = prev.previousElementSibling;
      }
    }

    let actions = null;
    [...contentCell.children].forEach((child) => {
      if (!child.classList.contains('button-wrapper')) {
        actions = null;
        return;
      }
      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'hero-actions';
        child.before(actions);
      }
      actions.append(child);
    });
    children.push(contentCell);
  }
  block.replaceChildren(...children);
}

export default function decorate(block) {
  const picture = block.querySelector('picture');
  const cells = [...block.querySelectorAll(':scope > div > div')];

  // The content cell is the first cell with text (heading, copy or CTA).
  const contentCell = cells.find((cell) => cell.textContent.trim() !== '');

  if (picture) {
    // Unwrap a picture that the author placed inside a paragraph.
    unwrapPicture(picture);
    picture.classList.add('hero-media');
  }

  if (contentCell) contentCell.classList.add('hero-content');
  if (!picture) block.classList.add('no-image');

  // photo heroes (default and home): a link alone in its paragraph is the CTA button
  if (!block.classList.contains('centered') && contentCell) {
    decorateLoneLinkButtons(contentCell);
  }

  if (block.classList.contains('centered')) decorateCentered(block, picture, contentCell);
}
