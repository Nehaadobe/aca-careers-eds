/**
 * Story index helper: fetches EDS sheet JSON (the site query index and the
 * external-stories sheet), normalises rows into story objects, and offers
 * filter/sort utilities, plus the story card image and date builders. Used by the
 * story-listing, article-list and article-header blocks.
 *
 * Every loader resolves (never rejects): a missing or broken source yields [].
 */
import { createOptimizedPicture } from './aem.js';

const MAX_PAGES = 50;

/** Default story sources: the blog index, the external-stories sheet and the listing paths. */
export const STORY_SOURCES = {
  index: '/blog/query-index.json',
  external: '/blog/external-stories.json',
  pathPrefix: '/blog/',
  exclude: ['/blog', '/blog/authors', '/blog/search'],
};

/** The story listing page and its URL filter parameter per story field. */
export const STORY_LISTING = {
  path: '/blog',
  params: { roles: 'role', topics: 'topic' },
};
const sheetCache = new Map();

/**
 * Splits a comma-separated value (or an array of them) into trimmed items.
 * @param {string|string[]|undefined} value
 * @returns {string[]}
 */
export function splitList(value) {
  if (Array.isArray(value)) return value.flatMap(splitList);
  if (value === undefined || value === null) return [];
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

/**
 * Lower-cases and collapses whitespace, for case-insensitive comparisons.
 * @param {string} value
 * @returns {string}
 */
export function normalizeText(value) {
  return String(value ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Whether a URL resolves to the current origin.
 * @param {string} href
 * @returns {boolean}
 */
export function isSameOrigin(href) {
  if (!href) return false;
  try {
    return new URL(href, window.location.href).origin === window.location.origin;
  } catch (e) {
    return false;
  }
}

/**
 * Parses a date cell into a UTC timestamp (ms). Accepts ISO strings, readable
 * dates ("October 13, 2026"), unix seconds (query-index lastModified), unix ms
 * and spreadsheet serial day numbers. Returns 0 when the value is not a date.
 * Date-only values map to UTC midnight so they display the same everywhere.
 * @param {string|number|undefined} value
 * @returns {number}
 */
export function parseDate(value) {
  if (value === undefined || value === null) return 0;
  const str = String(value).trim();
  if (!str) return 0;
  if (/^\d+(\.\d+)?$/.test(str)) {
    const n = Number(str);
    let ms = n;
    if (n < 100000) ms = Math.round((n - 25569) * 86400000); // spreadsheet serial day
    else if (n < 1e11) ms = n * 1000; // unix seconds
    return ms > 0 ? ms : 0;
  }
  const t = Date.parse(str);
  if (Number.isNaN(t)) return 0;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str) || /\d:\d/.test(str)) return t;
  // Readable date without a time: Date.parse used local midnight.
  const d = new Date(t);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Picks the rows of an EDS sheet response (single or multi-sheet). */
function pickSheet(json) {
  if (!json || typeof json !== 'object') return { data: [] };
  if (Array.isArray(json.data)) return json;
  const names = json[':names'];
  if (Array.isArray(names) && names.length) {
    const name = names.includes('default') ? 'default' : names[0];
    return pickSheet(json[name]);
  }
  return { data: [] };
}

async function fetchJson(url) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    return await resp.json();
  } catch (e) {
    return null;
  }
}

async function fetchAllRows(url) {
  let base;
  try {
    base = new URL(url, window.location.href);
  } catch (e) {
    return [];
  }
  let page = pickSheet(await fetchJson(base.href));
  const rows = [...page.data];
  const total = Number(page.total) || rows.length;
  let requests = 1;
  // EDS sheets are paginated (offset/limit/total): follow until complete.
  while (rows.length < total && page.data.length && requests < MAX_PAGES) {
    const next = new URL(base.href);
    next.searchParams.set('offset', rows.length);
    next.searchParams.set('limit', Number(page.limit) || page.data.length);
    // eslint-disable-next-line no-await-in-loop
    page = pickSheet(await fetchJson(next.href));
    rows.push(...page.data);
    requests += 1;
  }
  return rows.filter((row) => row && typeof row === 'object');
}

/**
 * Fetches all rows of an EDS sheet JSON, following pagination. Cached per URL
 * for the page lifetime. Resolves to [] on any failure.
 * @param {string} url
 * @returns {Promise<object[]>}
 */
export function fetchSheet(url) {
  if (!url) return Promise.resolve([]);
  if (!sheetCache.has(url)) sheetCache.set(url, fetchAllRows(url));
  return sheetCache.get(url);
}

/**
 * Reads the authored values of one key from the library block-options sheet
 * (key | blocks | values | type | label), the same list authors pick from in the
 * slash menu. "Label=value" entries resolve to their value. Resolves to [] when
 * the sheet or the key is missing.
 * @param {string} url e.g. /tools/library/blocks.json?sheet=options
 * @param {string} key e.g. roles
 * @returns {Promise<string[]>}
 */
export async function loadOptionValues(url, key) {
  const rows = await fetchSheet(url);
  const row = rows.find((r) => normalizeText(r.key) === normalizeText(key));
  if (!row) return [];
  return String(row.values || '')
    .split('|')
    .map((item) => item.split('=').pop().trim())
    .filter(Boolean);
}

/**
 * Turns a sheet row into a story. Query-index rows use `path`; external rows
 * use `url`. Rows without a title or link are dropped (returns null).
 * @param {object} row
 * @returns {object|null}
 */
export function normalizeStory(row) {
  const href = String(row.url || row.path || '').trim();
  const title = String(row.title || '').trim();
  if (!href || !title) return null;
  let url;
  try {
    url = new URL(href, window.location.href);
  } catch (e) {
    return null;
  }
  const external = url.origin !== window.location.origin;
  const image = String(row.image || '').trim();
  return {
    title,
    description: String(row.description || '').trim(),
    url: external ? url.href : `${url.pathname}${url.search}${url.hash}`,
    path: external ? '' : url.pathname,
    external,
    image: image && !image.includes('default-meta-image') ? image : '',
    imageAlt: String(row.imageAlt || row['image-alt'] || '').trim(),
    date: parseDate(row.date || row.publishDate || row['publication-date'] || row.lastModified),
    roles: splitList(row.roles),
    topics: splitList(row.topics),
    author: String(row.author || '').trim(),
  };
}

function trimSlash(path) {
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

/**
 * Loads and merges stories from the query index(es) and an external-stories sheet.
 * @param {object} options
 * @param {string|string[]} [options.index] query index URL(s); for a page in several
 *   indexes the first index wins
 * @param {string} [options.external] external stories sheet URL
 * @param {string} [options.pathPrefix] keep index entries under this path
 * @param {string[]} [options.exclude] index paths to drop (listing pages)
 * @returns {Promise<object[]>}
 */
export async function loadStories({
  index = STORY_SOURCES.index,
  external = '',
  pathPrefix = STORY_SOURCES.pathPrefix,
  exclude = STORY_SOURCES.exclude,
} = {}) {
  const indexes = Array.isArray(index) ? index : [index];
  const [externalRows, ...indexSheets] = await Promise.all(
    [fetchSheet(external), ...indexes.map(fetchSheet)],
  );
  const indexRows = indexSheets.flat();
  const excluded = new Set(exclude.map(trimSlash));
  const internal = indexRows
    .map(normalizeStory)
    .filter((story) => story && !story.external
      && (!pathPrefix || story.path.startsWith(pathPrefix))
      && !excluded.has(trimSlash(story.path)));
  const offsite = externalRows.map(normalizeStory).filter(Boolean);

  const seen = new Set();
  return [...internal, ...offsite].filter((story) => {
    const key = trimSlash(story.url);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Builds a lookup that resolves an authored link to a loaded story. Same-origin
 * links match by pathname (trailing slash, query and hash ignored); external
 * links match by full URL (trailing slash and hash ignored).
 * @param {object[]} stories normalized stories (see loadStories)
 * @returns {function(string): (object|null)}
 */
export function createStoryLookup(stories) {
  const internal = new Map();
  const external = new Map();
  const externalKey = (url) => `${url.origin}${trimSlash(url.pathname)}${url.search}`;
  stories.forEach((story) => {
    if (story.external) {
      try {
        const key = externalKey(new URL(story.url));
        if (!external.has(key)) external.set(key, story);
      } catch (e) { /* skip malformed */ }
    } else if (!internal.has(trimSlash(story.path))) {
      internal.set(trimSlash(story.path), story);
    }
  });
  return (href) => {
    if (!href) return null;
    let url;
    try {
      url = new URL(href, window.location.href);
    } catch (e) {
      return null;
    }
    if (url.origin === window.location.origin) {
      return internal.get(trimSlash(url.pathname)) || null;
    }
    return external.get(externalKey(url)) || null;
  };
}

/**
 * Filters stories by keyword (every word must appear in the title or
 * description) and by facet values (AND across facets, case-insensitive).
 * @param {object[]} stories
 * @param {object} criteria
 * @param {string} [criteria.query]
 * @param {Object<string, string>} [criteria.facets] e.g. { roles: 'Finance' }
 * @returns {object[]}
 */
export function filterStories(stories, { query = '', facets = {} } = {}) {
  const words = normalizeText(query).split(' ').filter(Boolean);
  const active = Object.entries(facets)
    .filter(([, value]) => value)
    .map(([key, value]) => [key, normalizeText(value)]);
  return stories.filter((story) => {
    if (words.length) {
      const haystack = normalizeText(`${story.title} ${story.description}`);
      if (!words.every((word) => haystack.includes(word))) return false;
    }
    return active.every(([key, value]) => (story[key] || [])
      .some((item) => normalizeText(item) === value));
  });
}

const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });

/**
 * Returns a sorted copy. Undated stories always sort last.
 * @param {object[]} stories
 * @param {'newest'|'oldest'|'title-a-z'|'title-z-a'} sort
 * @returns {object[]}
 */
export function sortStories(stories, sort = 'newest') {
  const byTitle = (a, b) => collator.compare(a.title, b.title);
  const byDate = (dir) => (a, b) => {
    if (!a.date !== !b.date) return a.date ? -1 : 1;
    return (a.date - b.date) * dir || byTitle(a, b);
  };
  const compare = {
    oldest: byDate(1),
    'title-a-z': byTitle,
    'title-z-a': (a, b) => byTitle(b, a),
  }[sort] || byDate(-1);
  return [...stories].sort(compare);
}

/**
 * Formats a story timestamp the way the source site does ("September 08, 2026").
 * @param {number} date
 * @param {string} [locale]
 * @returns {string}
 */
const dateFormats = new Map();

export function formatStoryDate(date, locale = 'en-US') {
  if (!date) return '';
  if (!dateFormats.has(locale)) {
    dateFormats.set(locale, new Intl.DateTimeFormat(locale, {
      month: 'long', day: '2-digit', year: 'numeric', timeZone: 'UTC',
    }));
  }
  return dateFormats.get(locale).format(new Date(date));
}

/**
 * A <time> element for a story date: "March 07, 2024", datetime yyyy-mm-dd.
 * @param {number|string|Date} date
 * @returns {HTMLTimeElement|null}
 */
export function buildStoryTime(date) {
  if (!date) return null;
  const time = document.createElement('time');
  time.dateTime = new Date(date).toISOString().slice(0, 10);
  time.textContent = formatStoryDate(date);
  return time;
}

/**
 * The image of a story card in a wrapper div: an optimized picture for images on this site,
 * a plain lazy image otherwise (other hosts, and SVG, which createOptimizedPicture cannot
 * transcode).
 * @param {{image: string, imageAlt: string}} story
 * @param {string} className wrapper class
 * @returns {HTMLDivElement|null} null when the story has no image
 */
export function buildStoryImage(story, className) {
  if (!story.image) return null;
  const wrapper = document.createElement('div');
  wrapper.className = className;
  const svg = /\.svg($|[?#])/i.test(story.image);
  if (isSameOrigin(story.image) && !svg) {
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
