import { createOptimizedPicture } from '../../scripts/aem.js';
import { getYouTubeId } from '../../scripts/scripts.js';
import { bindVideoLink } from '../../scripts/video-modal.js';

/**
 * Cards block: one row per card; an optional image cell, then a body cell.
 *
 * Options (block classes):
 *   - `feature-links` - text-only tiles with a chevron CTA link.
 *   - `icon-tiles` - small centered icon, title and rich description; 3-column grid.
 *   - `video-tiles` - square thumbnail with a play icon and a title bar; the card's
 *     YouTube link opens the video in a modal dialog.
 *
 * Story cards are not a cards option: use the article-list block.
 */

const HEADINGS = 'h1, h2, h3, h4, h5, h6';

/** Removes button styling that decorateButtons may have added to a link. */
function unbutton(a) {
  a.classList.remove('button', 'primary', 'secondary', 'accent');
  const p = a.closest('p.button-wrapper');
  if (p) p.classList.remove('button-wrapper');
}

/** Removes a paragraph left empty after its content was moved. */
function removeIfEmpty(el) {
  if (el && el.tagName === 'P' && el.textContent.trim() === '' && !el.querySelector('img, picture')) el.remove();
}

function decorateFeatureLinks(ul) {
  // Mark the trailing lone link as the tile CTA.
  ul.querySelectorAll('.cards-card-body').forEach((body) => {
    const links = [...body.querySelectorAll('a[href]')];
    const cta = links[links.length - 1];
    if (!cta) return;
    const p = cta.closest('p');
    if (p && p.textContent.trim() === cta.textContent.trim()) {
      p.classList.add('cards-card-cta');
      unbutton(cta);
    }
  });
}

function decorateVideoTiles(ul) {
  ul.querySelectorAll(':scope > li').forEach((li) => {
    const links = [...li.querySelectorAll('a[href]')];
    const video = links.find((a) => getYouTubeId(a.href)) || links[0];
    const img = li.querySelector('img');
    let heading = li.querySelector(HEADINGS);
    const title = (heading?.textContent || video?.textContent || img?.alt || '').trim();

    // Image cell: unwrap a linked thumbnail and add the play icon.
    const imageCell = li.querySelector('.cards-card-image') || img?.closest('li > div');
    if (imageCell) {
      imageCell.querySelectorAll('a[href]').forEach((a) => {
        if (!a.querySelector('picture, img')) return;
        const parent = a.parentElement;
        a.replaceWith(...a.childNodes);
        removeIfEmpty(parent);
      });
      if (video) {
        const play = document.createElement('span');
        play.className = 'cards-video-play video-play';
        play.setAttribute('aria-hidden', 'true');
        imageCell.append(play);
      }
    }

    if (!video) return;
    const href = video.getAttribute('href');

    // The title bar carries the single link for the card.
    let body = li.querySelector('.cards-card-body');
    if (!body) {
      body = document.createElement('div');
      body.className = 'cards-card-body';
      li.append(body);
    }
    if (!heading) {
      heading = document.createElement('h3');
      heading.textContent = title;
      body.prepend(heading);
    }
    let titleLink = heading.querySelector('a[href]');
    if (!titleLink) {
      titleLink = document.createElement('a');
      titleLink.href = href;
      titleLink.append(...heading.childNodes);
      if (!titleLink.textContent.trim()) titleLink.textContent = title || 'Play video';
      heading.append(titleLink);
    }
    // Drop other links to the same video (e.g. a bare URL paragraph), now redundant.
    li.querySelectorAll('a[href]').forEach((a) => {
      if (a === titleLink || a.getAttribute('href') !== href) return;
      const parent = a.parentElement;
      a.remove();
      removeIfEmpty(parent);
    });

    heading.classList.add('cards-card-title');
    unbutton(titleLink);
    titleLink.classList.add('cards-card-link');
    // Keep the title as the accessible name (it is also the heading's name);
    // bindVideoLink adds aria-haspopup="dialog" to announce the player.
    li.classList.add('cards-card-linked');
    bindVideoLink(titleLink, title);
  });
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    if (li.textContent.trim() || li.querySelector('picture')) ul.append(li);
  });

  if (block.classList.contains('feature-links')) decorateFeatureLinks(ul);
  if (block.classList.contains('video-tiles')) decorateVideoTiles(ul);

  const isIcons = block.classList.contains('icon-tiles');
  const breakpoints = isIcons ? [{ width: '240' }] : [{ width: '750' }];
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, breakpoints)));
  block.replaceChildren(ul);
}
