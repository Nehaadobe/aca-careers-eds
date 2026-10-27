/**
 * Banner block: heading, copy and a call to action over a background image.
 *
 * Authoring: row 1 background image (optional), row 2 heading, paragraphs and CTA link.
 * The image and content may also share one cell.
 *
 * Options (block classes):
 *   - `locations` - dark band with the image (e.g. a map) beside the content
 *     instead of behind it on wide screens.
 *   - `statement` - a large statement paragraph on a blue band; no image.
 *   - `image-cta` - full-bleed photo with a centered heading and CTA button over it.
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const contentCell = cells.find((cell) => cell.textContent.trim() !== '');

  const content = document.createElement('div');
  content.className = 'banner-content';
  if (contentCell) {
    contentCell.querySelectorAll('picture').forEach((pic) => {
      if (pic !== picture) return;
      const p = pic.closest('p');
      if (p && p.textContent.trim() === '' && p.children.length === 1) p.remove();
      else pic.remove();
    });
    content.append(...contentCell.childNodes);

    // A link alone in its paragraph is the CTA, even without bold/italic formatting.
    // The dark locations band uses the white (secondary) pill, like the source.
    const buttonStyle = block.classList.contains('locations') ? 'secondary' : 'primary';
    content.querySelectorAll('p > a[href]').forEach((a) => {
      const p = a.parentElement;
      if (a.classList.contains('button') || a.querySelector('img')) return;
      if (p.textContent.trim() !== a.textContent.trim()) return;
      a.classList.add('button', buttonStyle);
      a.title = a.title || a.textContent.trim();
      p.classList.add('button-wrapper');
    });
  }

  const children = [];
  if (picture) {
    const media = document.createElement('div');
    media.className = 'banner-media';
    media.append(picture);
    children.push(media);
  } else {
    block.classList.add('no-image');
  }
  children.push(content);

  block.replaceChildren(...children);
}
