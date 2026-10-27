/**
 * Hero block.
 *
 * Authored shape (either works):
 *   - row 1: background image, row 2: heading + optional CTA link
 *   - a single cell holding the image followed by the heading/CTA (boilerplate shape)
 *
 * Options (block classes):
 *   - `home` - full-bleed, centered headline and CTA over the image.
 *   - `page` - page header: H1 and subtitle paragraph(s) on the left, photo with a
 *     rounded corner on the right; stacks on mobile.
 */

/**
 * Turns a link that sits alone in its paragraph into a button, for authors who
 * did not bold/italicise it (decorateButtons only handles formatted links).
 * @param {Element} container
 */
function buttonizeLoneLinks(container) {
  container.querySelectorAll('p > a[href]').forEach((a) => {
    const p = a.parentElement;
    if (a.classList.contains('button') || a.querySelector('img')) return;
    if (p.textContent.trim() !== a.textContent.trim()) return;
    a.classList.add('button', 'primary');
    a.title = a.title || a.textContent.trim();
    p.classList.add('button-wrapper');
  });
}

export default function decorate(block) {
  const picture = block.querySelector('picture');
  const cells = [...block.querySelectorAll(':scope > div > div')];

  // The content cell is the first cell with text (heading, copy or CTA).
  const contentCell = cells.find((cell) => cell.textContent.trim() !== '');

  if (picture) {
    // Unwrap a picture that the author placed inside a paragraph.
    const p = picture.closest('p');
    if (p && p.textContent.trim() === '' && p.children.length === 1) p.replaceWith(picture);
    picture.classList.add('hero-media');
  }

  if (contentCell) contentCell.classList.add('hero-content');
  if (!picture) block.classList.add('no-image');

  if (block.classList.contains('home') && contentCell) {
    buttonizeLoneLinks(contentCell);
  }

  if (block.classList.contains('page')) {
    // Flatten to [media, content] so the two can sit side by side.
    const children = [];
    if (picture) {
      const media = document.createElement('div');
      media.className = 'hero-media-wrap';
      media.append(picture);
      children.push(media);
    }
    if (contentCell) {
      // The picture may have shared the content cell; drop the empty paragraph it left.
      contentCell.querySelectorAll(':scope > p').forEach((p) => {
        if (p.textContent.trim() === '' && !p.querySelector('img, picture, a')) p.remove();
      });
      children.push(contentCell);
    }
    block.replaceChildren(...children);
  }
}
