/**
 * Story index helper: fetches EDS sheet JSON (the site query index and the
 * external-stories sheet), normalises rows into story objects, and offers
 * filter/sort utilities. Used by the story-listing block; meant to be reused
 * by related-stories cards on blog articles.
 *
 * Every loader resolves (never rejects): a missing or broken source yields [].
 */

const MAX_PAGES = 50;
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
 * Loads and merges stories from the query index and an external-stories sheet.
 * @param {object} options
 * @param {string} [options.index] query index URL
 * @param {string} [options.external] external stories sheet URL
 * @param {string} [options.pathPrefix] keep index entries under this path
 * @param {string[]} [options.exclude] index paths to drop (listing pages)
 * @returns {Promise<object[]>}
 */
export async function loadStories({
  index = '/query-index.json',
  external = '',
  pathPrefix = '/blog/',
  exclude = ['/blog', '/blog/authors', '/blog/search'],
} = {}) {
  const [indexRows, externalRows] = await Promise.all([fetchSheet(index), fetchSheet(external)]);
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
export function formatStoryDate(date, locale = 'en-US') {
  if (!date) return '';
  return new Intl.DateTimeFormat(locale, {
    month: 'long', day: '2-digit', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(date));
}
