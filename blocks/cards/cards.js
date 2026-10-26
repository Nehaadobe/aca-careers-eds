import { createOptimizedPicture } from '../../scripts/aem.js';
import { bindVideoLink, getYouTubeId } from '../../scripts/video-modal.js';
import {
  isSameOrigin, loadStories, normalizeText, sortStories, splitList,
} from '../../scripts/story-index.js';
import { getPageMetadata } from '../../scripts/scripts.js';

/**
 * Cards block: one row per card; an optional image cell, then a body cell.
 *
 * Options (block classes):
 *   - `feature-links` - text-only tiles with a chevron CTA link.
 *   - `icon-tiles` - small centered icon, title and rich description; 3-column grid.
 *   - `story-grid` - image, title, short description; the whole card follows its link.
 *   - `video-tiles` - square thumbnail with a play icon and a title bar; the card's
 *     YouTube link opens the video in a modal dialog.
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

/**
 * Picks the link the whole card should follow: a link in the title, otherwise
 * the last text link, otherwise a link wrapping the image.
 * @param {Element} li
 * @returns {HTMLAnchorElement|undefined}
 */
function primaryLink(li) {
  const inHeading = li.querySelector(`:is(${HEADINGS}) a[href]`);
  if (inHeading) return inHeading;
  const links = [...li.querySelectorAll('a[href]')];
  const textLinks = links.filter((a) => !a.querySelector('picture, img'));
  return textLinks[textLinks.length - 1] || links[0];
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

function decorateStoryGrid(ul) {
  ul.querySelectorAll(':scope > li').forEach((li) => {
    const link = primaryLink(li);
    if (!link) return;
    unbutton(link);
    link.classList.add('cards-card-link');
    li.classList.add('cards-card-linked');
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
        play.className = 'cards-video-play';
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

/** Builds one story card in the authored story-grid shape (image cell + body cell). */
function buildStoryCard(story) {
  const li = document.createElement('li');
  if (story.image) {
    const imageCell = document.createElement('div');
    imageCell.className = 'cards-card-image';
    if (isSameOrigin(story.image)) {
      imageCell.append(createOptimizedPicture(story.image, story.imageAlt, false, [{ width: '750' }]));
    } else {
      const img = document.createElement('img');
      img.src = story.image;
      img.alt = story.imageAlt;
      img.loading = 'lazy';
      img.decoding = 'async';
      imageCell.append(img);
    }
    li.append(imageCell);
  }
  const body = document.createElement('div');
  body.className = 'cards-card-body';
  const heading = document.createElement('h3');
  const link = document.createElement('a');
  link.href = story.url;
  link.textContent = story.title;
  heading.append(link);
  body.append(heading);
  if (story.description) {
    const p = document.createElement('p');
    p.textContent = story.description;
    body.append(p);
  }
  // Visual "read more" cue like the source tiles; the stretched title link is the real link.
  const more = document.createElement('p');
  more.className = 'cards-card-more';
  more.setAttribute('aria-hidden', 'true');
  more.textContent = 'View highlights';
  body.append(more);
  li.append(body);
  return li;
}

/**
 * Picks related stories for the current page: stories sharing a Role or Topic
 * first, then the rest, each group newest first; the current page is excluded.
 * @param {number} count
 * @returns {Promise<object[]>}
 */
async function pickRelatedStories(count) {
  const stories = await loadStories();
  const here = window.location.pathname.replace(/\/+$/, '');
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  const canonicalPath = canonical ? new URL(canonical).pathname.replace(/\/+$/, '') : '';
  const isCurrent = (story) => {
    const path = story.path.replace(/\/+$/, '');
    // endsWith also covers local previews served under a path prefix (/content/blog/...)
    return path && (path === canonicalPath || here === path || here.endsWith(path));
  };
  const own = new Set([
    ...splitList(getPageMetadata('role')),
    ...splitList(getPageMetadata('topic')),
  ].map(normalizeText));
  const related = (story) => [...story.roles, ...story.topics]
    .some((value) => own.has(normalizeText(value)));

  const sorted = sortStories(stories.filter((story) => !isCurrent(story)), 'newest');
  return [...sorted.filter(related), ...sorted.filter((story) => !related(story))].slice(0, count);
}

/**
 * Option `related`: header rows (a heading only) become the block title and
 * story cards are filled from the query index. Without stories the block (and
 * its section, when left empty) is removed so no empty band remains.
 */
async function decorateRelated(block, ul) {
  block.classList.add('story-grid');
  const headingRows = [...ul.children].filter((li) => li.querySelector(HEADINGS)
    && !li.querySelector('picture, img, a[href]') && li.children.length === 1);
  const headings = headingRows.map((li) => {
    li.remove();
    const header = li.firstElementChild;
    header.className = 'cards-related-heading';
    return header;
  });

  if (!ul.children.length) {
    const stories = await pickRelatedStories(3);
    stories.forEach((story) => ul.append(buildStoryCard(story)));
  }

  if (!ul.children.length) {
    const wrapper = block.parentElement;
    const section = block.closest('.section');
    (wrapper && wrapper !== section ? wrapper : block).remove();
    if (section && ![...section.children].some((child) => child.textContent.trim() || child.querySelector('img'))) {
      section.remove();
    }
    return;
  }
  decorateStoryGrid(ul);
  block.prepend(...headings);
}

export default async function decorate(block) {
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
  if (block.classList.contains('story-grid')) decorateStoryGrid(ul);
  if (block.classList.contains('video-tiles')) decorateVideoTiles(ul);

  const isIcons = block.classList.contains('icon-tiles');
  const breakpoints = isIcons ? [{ width: '240' }] : [{ width: '750' }];
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, breakpoints)));
  block.replaceChildren(ul);

  if (block.classList.contains('related')) await decorateRelated(block, ul);
}
