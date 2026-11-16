import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Gallery block: a responsive row of display-only images.
 *
 * Authoring: one row per image. A cell holds the image and an optional caption
 * paragraph. Several images in one row are also accepted. Images are not clickable:
 * links around or next to an image are ignored.
 */

/**
 * Collects image items from authored rows, tolerating missing/extra cells.
 * @param {Element} block
 * @returns {{alt: string, src: string, caption: string}[]}
 */
function collectItems(block) {
  const items = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const pictures = [...cell.querySelectorAll('picture')];
    const captionText = [...cell.querySelectorAll('p')]
      .filter((p) => !p.querySelector('picture, img, a'))
      .map((p) => p.textContent.trim())
      .filter(Boolean)
      .join(' ');

    pictures.forEach((picture) => {
      const img = picture.querySelector('img');
      if (!img) return;
      items.push({
        alt: img.getAttribute('alt') || '',
        src: img.currentSrc || img.src,
        caption: pictures.length === 1 ? captionText : '',
      });
    });
  });
  return items;
}

export default function decorate(block) {
  const items = collectItems(block);
  if (!items.length) return;

  const list = document.createElement('ul');
  list.className = 'gallery-list';

  items.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'gallery-item';
    li.append(createOptimizedPicture(item.src, item.alt, false, [
      { media: '(min-width: 900px)', width: '900' },
      { width: '750' },
    ]));
    if (item.caption) {
      const caption = document.createElement('p');
      caption.className = 'gallery-caption';
      caption.textContent = item.caption;
      li.append(caption);
    }
    list.append(li);
  });

  block.replaceChildren(list);
}
