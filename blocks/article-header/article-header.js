import { decorateBlock, loadBlock } from '../../scripts/aem.js';
import { createTag as el } from '../../scripts/scripts.js';
import {
  buildStoryTime,
  parseDate,
  splitList,
  STORY_LISTING,
} from '../../scripts/story-index.js';

/**
 * Article header for blog stories. Auto-built by scripts.js (buildAutoBlocks)
 * on `Template: blog-article` pages; it can also be authored.
 *
 * Rows, in any order:
 *   - key/value rows: Roles, Topics (comma-separated), Publication Date
 *     (yyyy-mm-dd), Author, Author Title and Author Image (semicolon-separated,
 *     one entry per author in the same order; names may contain commas)
 *   - a row holding the H1 title
 *   - a row holding the hero: a picture or a nested embed block
 *   - a row holding a nested share block
 *
 * Renders category links (to the story listing's ?role= / ?topic= state),
 * title, formatted date, byline, the share block, then the full-width hero.
 */

const FIELDS = {
  role: 'role',
  roles: 'role',
  topic: 'topic',
  topics: 'topic',
  'publication date': 'date',
  date: 'date',
  author: 'author',
  authors: 'author',
  'author title': 'authorTitle',
  'author titles': 'authorTitle',
  'author image': 'authorImage',
  'author images': 'authorImage',
};

/** Splits rows into config values and content elements. */
function readRows(block) {
  const config = {};
  const content = { title: null, hero: null, share: null };
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const key = FIELDS[(cells[0]?.textContent || '').trim().toLowerCase()];
    if (cells.length >= 2 && key) {
      config[key] = cells[1].textContent.trim();
      return;
    }
    cells.forEach((cell) => {
      const share = cell.querySelector('div.share');
      const embed = cell.querySelector('div.embed');
      const heading = cell.querySelector('h1, h2');
      const picture = cell.querySelector('picture');
      if (share && !content.share) content.share = share;
      else if (embed && !content.hero) content.hero = embed;
      else if (heading && !content.title) content.title = heading;
      else if (picture && !content.hero) content.hero = picture;
    });
  });
  return { config, content };
}

function formatDate(value) {
  const time = parseDate(value);
  // source format: "March 07, 2024"
  return time ? el('p', { className: 'article-header-date' }, buildStoryTime(time)) : null;
}

function buildCategories(config) {
  const items = [
    ...splitList(config.role).map((value) => [STORY_LISTING.params.roles, value]),
    ...splitList(config.topic).map((value) => [STORY_LISTING.params.topics, value]),
  ];
  if (!items.length) return null;
  const list = el('ul', { className: 'article-header-categories' });
  items.forEach(([param, value]) => {
    const link = el('a', null, value);
    link.href = `${STORY_LISTING.path}?${new URLSearchParams({ [param]: value })}`;
    list.append(el('li', null, link));
  });
  return list;
}

/** Splits a semicolon-separated value (entries may contain commas). */
function splitEntries(value) {
  return String(value || '').split(';').map((item) => item.trim()).filter(Boolean);
}

/** One entry per author: name, title and photo matched by position. */
function buildByline(config) {
  const names = splitEntries(config.author);
  if (!names.length) return null;
  const titles = splitEntries(config.authorTitle);
  const photos = splitEntries(config.authorImage);
  const byline = el('ul', { className: 'article-header-byline' });
  if (names.length > 1) byline.classList.add('article-header-byline-multiple');
  names.forEach((name, i) => {
    const text = el('div', { className: 'article-header-author-text' }, el('p', { className: 'article-header-author' }, name));
    if (titles[i]) text.append(el('p', { className: 'article-header-author-title' }, titles[i]));
    const item = el('li', { className: 'article-header-author-item' });
    if (photos[i]) {
      const img = el('img', { className: 'article-header-author-photo' });
      img.src = photos[i];
      img.alt = '';
      img.loading = 'lazy';
      img.width = 48;
      img.height = 48;
      item.append(img);
    }
    item.append(text);
    byline.append(item);
  });
  return byline;
}

/** Decorates and loads a nested block (decorateBlocks only handles top-level ones). */
async function loadNested(nested) {
  if (!nested.dataset.blockName) decorateBlock(nested);
  await loadBlock(nested);
}

export default async function decorate(block) {
  const { config, content } = readRows(block);

  const inner = el('div', { className: 'article-header-content' });
  inner.append(...[buildCategories(config), content.title].filter(Boolean));
  if (content.title) content.title.classList.add('article-header-title');
  const date = formatDate(config.date);
  if (date) inner.append(date);

  const byline = buildByline(config);
  if (byline || content.share) {
    // the share block gets its own wrapper (decorateBlock marks the parent as `share-wrapper`)
    const share = content.share ? el('div', null, content.share) : null;
    inner.append(el('div', { className: 'article-header-meta' }, byline, share));
  }

  const parts = [inner];
  if (content.hero) {
    const hero = el('div', { className: 'article-header-hero' }, content.hero);
    const img = hero.querySelector('picture > img');
    if (img && content.hero.tagName === 'PICTURE') {
      // The hero is the LCP candidate on article pages.
      img.loading = 'eager';
      img.fetchPriority = 'high';
    }
    parts.push(hero);
  }
  block.replaceChildren(...parts);

  const nested = [content.share, content.hero]
    .filter((node) => node && node.matches('div.share, div.embed'));
  await Promise.all(nested.map(loadNested));
}
