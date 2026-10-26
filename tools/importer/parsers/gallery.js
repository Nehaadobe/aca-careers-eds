/* eslint-disable */
/* global WebImporter */

/**
 * Parser for gallery.
 * Source: .homegallery on careers.blueshieldca.com homepage and /total-rewards (3 images
 * linked to /_gallery/get_file/...), and .dei_cards .homegallery on /a-culture-of-belonging
 * (images wrapped in empty <a href=""> - emitted as images only).
 * Block structure (blocks/gallery/README.md): one row per image; the cell holds the
 * image and a link to the full-size file (used by the lightbox).
 *
 * The full-size link is emitted as a separate text link after the image (the block
 * accepts a loose link per image) because image-only links have no text and would
 * be dropped by the importer.
 */
/**
 * True when the link has a real target. Empty hrefs (e.g. <a href=""> around the
 * /a-culture-of-belonging .dei_cards images), fragment-only hrefs and links that resolve
 * to the current page itself are not full-size links and are dropped.
 */
function isRealLink(href, document) {
  const value = (href || '').trim();
  if (!value || value.startsWith('#') || /^javascript:/i.test(value)) return false;
  try {
    const base = document.baseURI || (document.location && document.location.href);
    if (!base || base === 'about:blank') return true;
    const target = new URL(value, base);
    const page = new URL(base);
    const samePage = target.origin === page.origin
      && target.pathname.replace(/\/$/, '') === page.pathname.replace(/\/$/, '')
      && target.search === page.search;
    return !samePage;
  } catch (e) {
    return true;
  }
}

export default function parse(element, { document }) {
  const cells = [];

  const items = element.querySelectorAll('.homegallery-item');
  items.forEach((item) => {
    const img = item.querySelector('img');
    if (!img) return;

    const cell = [img];
    const link = item.querySelector('a[href]');
    const href = link && link.getAttribute('href');
    if (isRealLink(href, document)) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href; // /_gallery/get_file/?file_id=... (made absolute by cleanup transformer)
      a.textContent = img.getAttribute('alt') || 'View full size';
      p.append(a);
      cell.push(p);
    }
    cells.push([cell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'gallery', cells });
  element.replaceWith(block);
}
