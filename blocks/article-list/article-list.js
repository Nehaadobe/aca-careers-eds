import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';
import {
  createStoryLookup,
  formatStoryDate,
  loadStories,
  splitList,
} from '../../scripts/story-index.js';

/**
 * Article list block: a curated grid of story cards. Authored content:
 *
 *   /blog/some-story                      one link per single-cell row (authored order)
 *   https://news.example.com/article      external links resolve via the external sheet
 *   Columns | 3                           2, 3 or 4 (default 3)
 *   Ground | Tinted                       Light, Tinted or Dark (default Light)
 *   Display Article date | Yes            Yes or No (default Yes)
 *   Display Short description | Yes       Yes or No (default Yes)
 *   Link Label | View highlights          card link label; No hides it (default:
 *                                         "View highlights" on Tinted/Dark grounds,
 *                                         none on Light, as on the source rows)
 *
 * Internal links resolve against the blog index (stories, with dates), then the
 * sitemap index (any other published page), external links against
 * /blog/external-stories.json. Unresolved links are skipped with a console warning.
 */

const INDEX_URL = ['/blog/query-index.json', '/sitemap.json'];
const EXTERNAL_URL = '/blog/external-stories.json';
const COLUMNS = ['2', '3', '4'];
const GROUNDS = ['light', 'tinted', 'dark'];

function isNo(value) {
  return ['no', 'false', 'off', 'hide', '0'].includes(toClassName(value));
}

/** Splits the authored rows into story links and key | value options. */
function readContent(block) {
  const links = [];
  const options = {};
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const [first, second] = cells;
    const key = first ? toClassName(first.textContent) : '';
    const firstHasLink = first && first.querySelector('a[href]');
    if (second && key && !firstHasLink) {
      options[key] = second.textContent.trim();
      return;
    }
    row.querySelectorAll('a[href]').forEach((a) => links.push(a.getAttribute('href')));
    // a link pasted as plain text (no anchor)
    if (!row.querySelector('a[href]')) {
      splitList(row.textContent).filter((t) => /^(\/|https?:\/\/)/.test(t))
        .forEach((t) => links.push(t));
    }
  });
  return { links, options };
}

function buildImage(story) {
  const wrapper = document.createElement('div');
  wrapper.className = 'article-list-card-image';
  let url = null;
  try {
    url = new URL(story.image, window.location.href);
  } catch (e) { /* treated as external */ }
  // createOptimizedPicture keeps only the pathname and cannot transcode SVG
  if (url && url.origin === window.location.origin && !/\.svg$/i.test(url.pathname)) {
    wrapper.append(createOptimizedPicture(story.image, story.imageAlt, false, [{ width: '750' }]));
  } else {
    const img = document.createElement('img');
    img.src = story.image;
    img.alt = story.imageAlt;
    img.loading = 'lazy';
    img.decoding = 'async';
    wrapper.append(img);
  }
  return wrapper;
}

function buildCard(story, { showDate, showDescription, linkLabel }) {
  const li = document.createElement('li');
  const link = document.createElement('a');
  link.className = 'article-list-card';
  link.href = story.url;
  if (story.external) link.rel = 'noopener';

  if (story.image) link.append(buildImage(story));

  const body = document.createElement('div');
  body.className = 'article-list-card-body';
  const title = document.createElement('h3');
  title.className = 'article-list-card-title';
  title.textContent = story.title;
  body.append(title);

  if (showDate && story.date) {
    const date = document.createElement('p');
    date.className = 'article-list-card-date';
    date.textContent = formatStoryDate(story.date);
    body.append(date);
  }
  if (showDescription && story.description) {
    const description = document.createElement('p');
    description.className = 'article-list-card-description';
    description.textContent = story.description;
    body.append(description);
  }
  if (linkLabel) {
    const more = document.createElement('span');
    more.className = 'article-list-card-more';
    more.textContent = linkLabel;
    body.append(more);
  }

  link.append(body);
  li.append(link);
  return li;
}

export default async function decorate(block) {
  const { links, options } = readContent(block);

  const columns = COLUMNS.includes(String(options.columns).trim()) ? options.columns.trim() : '3';
  const ground = GROUNDS.includes(toClassName(options.ground)) ? toClassName(options.ground) : 'light';
  block.classList.add(`columns-${columns}`, `ground-${ground}`);
  // the source shows "View highlights" on the More Stories band, not on plain tile rows
  const label = options['link-label'];
  let linkLabel = ground === 'light' ? '' : 'View highlights';
  if (label !== undefined) linkLabel = isNo(label) ? '' : label;
  block.classList.toggle('with-link-label', Boolean(linkLabel));
  const config = {
    showDate: !isNo(options['display-article-date']),
    showDescription: !isNo(options['display-short-description']),
    linkLabel,
  };

  const list = document.createElement('ul');
  list.className = 'article-list-items';
  block.replaceChildren(list);

  if (!links.length) return;

  const stories = await loadStories({
    index: INDEX_URL,
    external: EXTERNAL_URL,
    pathPrefix: '',
    exclude: [],
  });
  const lookup = createStoryLookup(stories);

  links.forEach((href) => {
    const story = lookup(href);
    if (!story) {
      // eslint-disable-next-line no-console
      console.warn(`article-list: no indexed story for "${href}", skipped`);
      return;
    }
    list.append(buildCard(story, config));
  });
}
