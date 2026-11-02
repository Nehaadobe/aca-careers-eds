/**
 * Image block: an inline story image with an optional caption.
 *
 * Authored shape: one cell with the picture, optionally followed by a caption
 * paragraph. The caption may also sit in a second cell or row.
 *
 * Options (block classes):
 *   - `left`  - floats left (400px, at most the column width); the text that
 *               follows wraps on the right.
 *   - `right` - floats right (400px, at most the column width); the text that
 *               follows wraps on the left.
 *   - none    - full-width image, no float.
 */

/** Takes every image out of a node, as <picture> elements (bare <img> gets wrapped). */
function extractPictures(node) {
  if (node.matches('picture')) return [node];
  const found = node.matches('img') ? [node] : [...node.querySelectorAll('picture, img')]
    .filter((el) => el.matches('picture') || !el.closest('picture'));
  return found.map((el) => {
    if (el.matches('picture')) {
      el.remove();
      return el;
    }
    const picture = document.createElement('picture');
    picture.append(el);
    return picture;
  });
}

/** Adds a caption node; a wrapper paragraph holding block children is flattened. */
function addCaption(caption, node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const p = document.createElement('p');
    p.textContent = node.textContent.trim();
    caption.push(p);
  } else if (node.matches('p') && node.querySelector(':scope > :is(p, div)')) {
    [...node.childNodes].forEach((child) => {
      if (child.textContent.trim() !== '') addCaption(caption, child);
    });
  } else {
    caption.push(node);
  }
}

export default function decorate(block) {
  const pictures = [];
  const caption = [];

  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    [...cell.childNodes].forEach((node) => {
      // the picture and caption may share one node (wrapTextNodes wraps mixed cells)
      if (node.nodeType === Node.ELEMENT_NODE && (node.matches('picture, img') || node.querySelector('picture, img'))) {
        pictures.push(...extractPictures(node));
      }
      if (node.textContent.trim() !== '') addCaption(caption, node);
    });
  });

  if (!pictures.length && !caption.length) {
    block.replaceChildren();
    return;
  }

  const figure = document.createElement('figure');
  figure.className = 'image-figure';
  figure.append(...pictures);
  if (caption.length) {
    const figcaption = document.createElement('figcaption');
    figcaption.className = 'image-caption';
    figcaption.append(...caption);
    figure.append(figcaption);
  }
  block.replaceChildren(figure);
}
