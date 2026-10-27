import { decorateBlock, loadBlock } from '../../scripts/aem.js';
import { splitList, parseDate } from '../../scripts/story-index.js';

/**
 * Article header for blog stories. Auto-built by scripts.js (buildAutoBlocks)
 * on `Template: blog-article` pages; it can also be authored.
 *
 * Rows, in any order:
 *   - key/value rows: Role, Topic (comma-separated), Publication Date
 *     (yyyy-mm-dd), Author (comma-separated for several), Author Title
 *   - a row holding the H1 title
 *   - a row holding the hero: a picture or a nested embed block
 *   - a row holding a nested share block
 *
 * Renders category links (to the story listing's ?role= / ?topic= state),
 * title, formatted date, byline, the share block, then the full-width hero.
 */

const LISTING_PATH = '/blog';

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
};

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children.filter((child) => child !== null && child !== undefined));
  return node;
}

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
  if (!time) return null;
  const label = new Intl.DateTimeFormat('en-US', {
    // source format: "March 07, 2024"
    month: 'long', day: '2-digit', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(time));
  const node = el('time', null, label);
  node.dateTime = new Date(time).toISOString().slice(0, 10);
  return el('p', 'article-header-date', node);
}

function buildCategories(config) {
  const items = [
    ...splitList(config.role).map((value) => ['role', value]),
    ...splitList(config.topic).map((value) => ['topic', value]),
  ];
  if (!items.length) return null;
  const list = el('ul', 'article-header-categories');
  items.forEach(([param, value]) => {
    const link = el('a', null, value);
    link.href = `${LISTING_PATH}?${new URLSearchParams({ [param]: value })}`;
    list.append(el('li', null, link));
  });
  return list;
}

function joinNames(names) {
  if (names.length < 2) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

function buildByline(config) {
  const names = splitList(config.author);
  if (!names.length) return null;
  const byline = el('div', 'article-header-byline', el('p', 'article-header-author', joinNames(names)));
  if (config.authorTitle) byline.append(el('p', 'article-header-author-title', config.authorTitle));
  return byline;
}

/** Decorates and loads a nested block (decorateBlocks only handles top-level ones). */
async function loadNested(nested) {
  if (!nested.dataset.blockName) decorateBlock(nested);
  await loadBlock(nested);
}

export default async function decorate(block) {
  const { config, content } = readRows(block);

  const inner = el('div', 'article-header-content');
  inner.append(...[buildCategories(config), content.title].filter(Boolean));
  if (content.title) content.title.classList.add('article-header-title');
  const date = formatDate(config.date);
  if (date) inner.append(date);

  const byline = buildByline(config);
  if (byline || content.share) {
    // the share block gets its own wrapper (decorateBlock marks the parent as `share-wrapper`)
    const share = content.share ? el('div', null, content.share) : null;
    inner.append(el('div', 'article-header-meta', byline, share));
  }

  const parts = [inner];
  if (content.hero) {
    const hero = el('div', 'article-header-hero', content.hero);
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
