/* eslint-disable */
/* global WebImporter */

/**
 * Parser for gallery.
 * Source: .homegallery on careers.blueshieldca.com homepage and /total-rewards (3 images
 * linked to /_gallery/get_file/...), and .dei_cards .homegallery on /a-culture-of-belonging
 * (images wrapped in empty <a href=""> - emitted as images only).
 * Block structure (blocks/gallery/README.md): one row per image; the cell holds the
 * image only. Photos are display-only, so the source's full-size links are dropped.
 */
export default function parse(element, { document }) {
  const cells = [];

  const items = element.querySelectorAll('.homegallery-item');
  items.forEach((item) => {
    const img = item.querySelector('img');
    if (!img) return;

    // Photos are display-only (client decision): the full-size links are not migrated.
    cells.push([[img]]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'gallery', cells });
  element.replaceWith(block);
}
