import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Gallery block: a responsive row of images; activating one opens it full size
 * in an accessible lightbox dialog (prev/next, Escape closes, focus is trapped).
 *
 * Authoring: one row per image. A cell holds the image and, optionally, a link
 * to the full-size file (either wrapping the image or as a separate link) and a
 * caption paragraph. Several images in one row are also accepted.
 */

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/**
 * Collects image items from authored rows, tolerating missing/extra cells.
 * @param {Element} block
 * @returns {{picture: Element, alt: string, full: string, caption: string}[]}
 */
function collectItems(block) {
  const items = [];
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    const pictures = [...cell.querySelectorAll('picture')];
    const looseLinks = [...cell.querySelectorAll('a[href]')].filter((a) => !a.querySelector('picture, img'));
    const captionText = [...cell.querySelectorAll('p')]
      .filter((p) => !p.querySelector('picture, img, a'))
      .map((p) => p.textContent.trim())
      .filter(Boolean)
      .join(' ');

    pictures.forEach((picture, i) => {
      const img = picture.querySelector('img');
      if (!img) return;
      const wrappingLink = picture.closest('a[href]');
      const link = wrappingLink || (pictures.length === 1 ? looseLinks[0] : looseLinks[i]);
      items.push({
        picture,
        alt: img.getAttribute('alt') || '',
        src: img.currentSrc || img.src,
        full: link ? link.href : '',
        caption: pictures.length === 1 ? captionText : '',
      });
    });
  });
  return items;
}

/**
 * Builds the full-size image element for the lightbox.
 * Uses the linked full-size file when given, otherwise a large optimized rendition.
 */
function buildFullImage(item) {
  if (item.full) {
    const img = document.createElement('img');
    img.src = item.full;
    img.alt = item.alt;
    img.decoding = 'async';
    return img;
  }
  return createOptimizedPicture(item.src, item.alt, false, [
    { media: '(min-width: 900px)', width: '2000' },
    { width: '900' },
  ]);
}

function createLightbox(items, labelBase) {
  const dialog = document.createElement('dialog');
  dialog.className = 'gallery-lightbox';
  dialog.setAttribute('aria-label', labelBase);

  dialog.innerHTML = `
    <div class="gallery-lightbox-inner">
      <button type="button" class="gallery-lightbox-prev" aria-label="Previous image"><span aria-hidden="true">&lsaquo;</span></button>
      <figure class="gallery-lightbox-figure">
        <button type="button" class="gallery-lightbox-close" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <div class="gallery-lightbox-media"></div>
        <figcaption class="gallery-lightbox-caption"></figcaption>
        <p class="gallery-lightbox-status" aria-live="polite"></p>
      </figure>
      <button type="button" class="gallery-lightbox-next" aria-label="Next image"><span aria-hidden="true">&rsaquo;</span></button>
    </div>`;

  const media = dialog.querySelector('.gallery-lightbox-media');
  const caption = dialog.querySelector('.gallery-lightbox-caption');
  const status = dialog.querySelector('.gallery-lightbox-status');
  const prev = dialog.querySelector('.gallery-lightbox-prev');
  const next = dialog.querySelector('.gallery-lightbox-next');
  const close = dialog.querySelector('.gallery-lightbox-close');
  let index = 0;
  let opener = null;

  if (items.length < 2) {
    prev.hidden = true;
    next.hidden = true;
  }

  const show = (i) => {
    index = (i + items.length) % items.length;
    const item = items[index];
    media.replaceChildren(buildFullImage(item));
    caption.textContent = item.caption || '';
    caption.hidden = !item.caption;
    // Visible counter reads "1 of 3" (as on the source lightbox); the alt text
    // stays available to assistive technology through a visually hidden span.
    const srText = document.createElement('span');
    srText.className = 'gallery-lightbox-sr';
    srText.textContent = `Image ${index + 1} of ${items.length}${item.alt ? `: ${item.alt}` : ''}`;
    const visible = document.createElement('span');
    visible.setAttribute('aria-hidden', 'true');
    visible.textContent = `${index + 1} of ${items.length}`;
    status.replaceChildren(visible, srText);
  };

  const closeDialog = () => {
    if (dialog.open) dialog.close();
  };

  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  close.addEventListener('click', closeDialog);

  // Click on the backdrop (outside the content) closes.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) closeDialog();
  });

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && items.length > 1) {
      e.preventDefault();
      show(index - 1);
    } else if (e.key === 'ArrowRight' && items.length > 1) {
      e.preventDefault();
      show(index + 1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeDialog();
    } else if (e.key === 'Tab') {
      // Keep focus cycling inside the dialog.
      const focusables = [...dialog.querySelectorAll(FOCUSABLE)].filter((el) => !el.hidden);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  dialog.addEventListener('close', () => {
    document.body.classList.remove('gallery-lightbox-open');
    media.replaceChildren();
    if (opener) opener.focus();
  });

  return {
    dialog,
    open(i, trigger) {
      opener = trigger;
      show(i);
      document.body.classList.add('gallery-lightbox-open');
      dialog.showModal();
      close.focus();
    },
  };
}

export default function decorate(block) {
  const items = collectItems(block);
  if (!items.length) return;

  const list = document.createElement('ul');
  list.className = 'gallery-list';
  let lightbox;

  items.forEach((item, i) => {
    const li = document.createElement('li');
    li.className = 'gallery-item';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'gallery-trigger';
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute(
      'aria-label',
      `Open image ${i + 1} of ${items.length}${item.alt ? `: ${item.alt}` : ''}`,
    );
    trigger.append(createOptimizedPicture(item.src, item.alt, false, [
      { media: '(min-width: 900px)', width: '900' },
      { width: '750' },
    ]));

    trigger.addEventListener('click', () => {
      if (!lightbox) {
        lightbox = createLightbox(items, block.getAttribute('aria-label') || 'Image gallery');
        block.append(lightbox.dialog);
      }
      lightbox.open(i, trigger);
    });

    li.append(trigger);
    list.append(li);
  });

  block.replaceChildren(list);
}
