import { readBlockConfig, toClassName } from '../../scripts/aem.js';
import { createTag as el } from '../../scripts/scripts.js';
import {
  buildStoryImage,
  buildStoryTime,
  filterStories,
  loadOptionValues,
  loadStories,
  sortStories,
  splitList,
  STORY_LISTING,
  STORY_SOURCES,
} from '../../scripts/story-index.js';

/**
 * Story listing block: searchable, filterable, sortable and paginated grid of
 * stories built at runtime from the site query index plus an external-stories
 * sheet. Authored content is configuration only (key | value rows):
 *
 *   Filters | Roles, Topics          facets to show (each needs story data)
 *   Page Size | 9
 *   Sort | Newest                    Newest, Oldest, Title A-Z, Title Z-A
 *   Roles | A, B, C                  dropdown options; when not authored they come from
 *   Topics | A, B, C                   the library options sheet, else from the stories
 *   Filter Values | /tools/library/blocks.json?sheet=options   optional options sheet
 *   Index | /blog/query-index.json   optional
 *   External Stories | /blog/external-stories.json   optional
 *   Path | /blog/                    optional index path prefix
 *   Exclude | /blog, /blog/authors   optional listing pages to drop
 *   Search Label, Search Placeholder, Filter Label, Clear Label, Sort Label,
 *   Roles Label, Topics Label, No Results   optional UI text
 *
 * State lives in the URL (?q=&role=&topic=&sort=&page=) so views are
 * shareable and back/forward restores them.
 */

const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'title-a-z', label: 'Title A-Z' },
  { value: 'title-z-a', label: 'Title Z-A' },
];

let instance = 0;

/** First value of a config cell (cells with several paragraphs become arrays). */
function text(value, fallback = '') {
  const v = Array.isArray(value) ? value.join(', ') : value;
  return v === undefined || v === null || String(v).trim() === '' ? fallback : String(v).trim();
}

function readConfig(block) {
  const raw = readBlockConfig(block);
  const facetNames = splitList(raw.filters ?? 'Roles, Topics').map(toClassName).filter(Boolean);
  const facets = facetNames.map((key) => ({
    key,
    param: STORY_LISTING.params[key] || key.replace(/s$/, ''),
    label: text(raw[`${key}-label`], key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ')),
    options: splitList(raw[key]),
  }));
  const pageSize = parseInt(text(raw['page-size']), 10);
  const sort = toClassName(text(raw.sort));
  return {
    facets,
    pageSize: pageSize > 0 ? pageSize : 9,
    defaultSort: SORTS.some((s) => s.value === sort) ? sort : 'newest',
    index: text(raw.index, STORY_SOURCES.index),
    external: text(raw['external-stories'], STORY_SOURCES.external),
    optionsSheet: text(raw['filter-values'], '/tools/library/blocks.json?sheet=options'),
    pathPrefix: text(raw.path, STORY_SOURCES.pathPrefix),
    exclude: raw.exclude ? splitList(raw.exclude) : STORY_SOURCES.exclude,
    labels: {
      search: text(raw['search-label'], 'Search Blogs'),
      placeholder: text(raw['search-placeholder'], 'Search Blog'),
      filter: text(raw['filter-label'], 'Filter Posts'),
      clear: text(raw['clear-label'], 'Clear Filters'),
      sort: text(raw['sort-label'], 'Sort By'),
      noResults: text(raw['no-results'], 'No stories match your search. Try different keywords or clear the filters.'),
    },
  };
}

/** Legacy listing filter IDs from the previous site (/blog?c=<id>). */
const LEGACY_CATEGORIES = {
  28778: ['role', 'Commercial Markets'],
  28786: ['role', 'Consumer Markets'],
  28779: ['role', 'Customer Experience'],
  28787: ['role', 'Finance'],
  28780: ['role', 'Foundation'],
  28788: ['role', 'Health Solutions'],
  28781: ['role', 'Information Technology'],
  28789: ['role', 'Innovation'],
  28782: ['role', 'Law'],
  28790: ['role', 'Marketing'],
  28783: ['role', 'Medi-Cal'],
  28784: ['role', 'Operations'],
  28791: ['role', 'People and Engagement'],
  28785: ['role', 'Promise Medical Clinics'],
  28792: ['role', 'Transformation'],
  29654: ['topic', 'Awards and Recognition'],
  28798: ['topic', 'Blue Shield Foundation'],
  29652: ['topic', 'Corporate Citizenship'],
  28775: ['topic', 'Culture of Belonging'],
  30058: ['topic', 'Employee Resource Groups'],
  29653: ['topic', 'Growth and Development'],
  28776: ['topic', 'Growth and Development Programs'],
  28777: ['topic', 'Life at Blue Shield'],
};

/** Reads list state from the current URL, validated against the config. */
function readState(config) {
  const params = new URLSearchParams(window.location.search);
  const sort = params.get('sort');
  const page = parseInt(params.get('page'), 10);
  const facets = {};
  config.facets.forEach((facet) => {
    const legacy = params.getAll('c')
      .map((id) => LEGACY_CATEGORIES[id])
      .find((cat) => cat && cat[0] === facet.param);
    const value = (params.get(facet.param) || (legacy ? legacy[1] : '')).trim();
    const match = facet.options.find((opt) => opt.toLowerCase() === value.toLowerCase());
    facets[facet.key] = match || '';
  });
  return {
    q: (params.get('q') || '').trim(),
    facets,
    sort: SORTS.some((s) => s.value === sort) ? sort : config.defaultSort,
    page: page > 0 ? page : 1,
  };
}

/** Builds the query string for a state; defaults are omitted. Other params survive. */
function stateUrl(config, state, page = state.page) {
  const params = new URLSearchParams(window.location.search);
  const set = (key, value) => (value ? params.set(key, value) : params.delete(key));
  set('q', state.q);
  config.facets.forEach((facet) => set(facet.param, state.facets[facet.key]));
  set('sort', state.sort !== config.defaultSort ? state.sort : '');
  set('page', page > 1 ? String(page) : '');
  const query = params.toString();
  return `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
}

/** Page numbers to show, with null marking an ellipsis: 1 2 3 … 13. */
function pageList(current, total) {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 2) [2, 3].forEach((p) => pages.add(p));
  if (current >= total - 1) [total - 1, total - 2].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const list = [];
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1];
    if (prev && p - prev === 2) list.push(prev + 1);
    else if (prev && p - prev > 2) list.push(null);
    list.push(p);
  });
  return list;
}

function buildCard(story) {
  const link = el('a', { className: 'story-listing-card-link', href: story.url }, story.title);
  if (story.external) link.rel = 'noopener';
  const body = el(
    'div',
    { className: 'story-listing-card-body story-card-body' },
    el('h3', { className: 'story-listing-card-title story-card-title' }, link),
  );
  if (story.date) {
    body.append(el('p', { className: 'story-listing-card-date story-card-date' }, buildStoryTime(story.date)));
  }
  if (story.description) {
    body.append(el('p', { className: 'story-listing-card-description story-card-description' }, story.description));
  }
  const card = el('li', { className: 'story-listing-card story-card' }, buildStoryImage(story, 'story-listing-card-image story-card-image'), body);
  if (story.external) card.classList.add('story-listing-card-external');
  return card;
}

function buildSelect(id, name, label, options, placeholder) {
  const select = el('select', { id, name, className: 'story-listing-select' });
  if (placeholder !== undefined) select.append(el('option', { value: '' }, placeholder));
  options.forEach((opt) => select.append(el('option', { value: opt.value ?? opt }, opt.label ?? opt)));
  if (label) select.setAttribute('aria-label', label);
  return select;
}

function buildControls(config, id) {
  const { labels } = config;
  const form = el('form', { className: 'story-listing-filters', role: 'search', 'aria-label': labels.search });

  const search = el('input', {
    type: 'search', id: `${id}-q`, name: 'q', className: 'story-listing-input', placeholder: labels.placeholder, autocomplete: 'off',
  });
  const submit = el(
    'button',
    { type: 'submit', className: 'story-listing-search-button', 'aria-label': labels.search },
    el('span', { className: 'story-listing-search-icon', 'aria-hidden': 'true' }),
  );
  form.append(el(
    'div',
    { className: 'story-listing-field story-listing-search' },
    el('label', { className: 'story-listing-label', for: `${id}-q` }, labels.search),
    el('div', { className: 'story-listing-search-input' }, search, submit),
  ));

  const selects = {};
  if (config.facets.length) {
    const group = el('div', { className: 'story-listing-selects' });
    config.facets.forEach((facet) => {
      selects[facet.key] = buildSelect(`${id}-${facet.param}`, facet.param, facet.label, facet.options, facet.label);
      group.append(selects[facet.key]);
    });
    form.append(el(
      'div',
      {
        className: 'story-listing-field story-listing-facets', role: 'group', 'aria-labelledby': `${id}-filter-label`,
      },
      el(
        'div',
        { className: 'story-listing-field-header' },
        el('span', { className: 'story-listing-label', id: `${id}-filter-label` }, labels.filter),
        el('a', { className: 'story-listing-clear', href: window.location.pathname }, labels.clear),
      ),
      group,
    ));
  } else {
    form.append(el(
      'div',
      { className: 'story-listing-field story-listing-facets' },
      el(
        'div',
        { className: 'story-listing-field-header' },
        el('a', { className: 'story-listing-clear', href: window.location.pathname }, labels.clear),
      ),
    ));
  }

  const sort = buildSelect(`${id}-sort`, 'sort', null, SORTS);
  form.append(el(
    'div',
    { className: 'story-listing-field story-listing-sort' },
    el('label', { className: 'story-listing-label', for: `${id}-sort` }, labels.sort),
    sort,
  ));

  return {
    form, search, selects, sort, clear: form.querySelector('.story-listing-clear'),
  };
}

function buildPagination(config, state, totalPages, nav) {
  nav.replaceChildren();
  nav.hidden = totalPages <= 1;
  if (totalPages <= 1) return;
  const arrow = (dir, target, label) => {
    const a = el(
      'a',
      { className: `story-listing-page-${dir}`, 'aria-label': label },
      el('span', { className: 'story-listing-page-arrow', 'aria-hidden': 'true' }),
    );
    if (target >= 1 && target <= totalPages) {
      a.href = stateUrl(config, state, target);
      a.dataset.page = target;
    } else {
      a.setAttribute('aria-disabled', 'true');
    }
    return a;
  };
  const list = el('ol', { className: 'story-listing-pages' });
  pageList(state.page, totalPages).forEach((p) => {
    if (p === null) {
      // three periods, as on the source (the ellipsis glyph is narrower)
      list.append(el('li', { className: 'story-listing-page-gap', 'aria-hidden': 'true' }, '...'));
      return;
    }
    const a = el('a', {
      href: stateUrl(config, state, p), 'data-page': p, 'aria-label': `Page ${p}`, 'aria-current': p === state.page ? 'page' : null,
    }, String(p));
    list.append(el('li', { className: p === state.page ? 'story-listing-page-current' : null }, a));
  });
  nav.append(arrow('prev', state.page - 1, 'Previous page'), list, arrow('next', state.page + 1, 'Next page'));
}

export default async function decorate(block) {
  instance += 1;
  const id = `story-listing-${instance}`;
  const config = readConfig(block);
  const controls = buildControls(config, id);
  const status = el('p', { className: 'story-listing-count', role: 'status', 'aria-live': 'polite' }, 'Loading stories…');
  const grid = el('ul', { className: 'story-listing-grid story-card-grid', id: `${id}-results`, tabindex: '-1' });
  const nav = el('nav', { className: 'story-listing-pagination', 'aria-label': 'Pagination', hidden: true });
  block.replaceChildren(controls.form, status, grid, nav);
  block.classList.add('story-listing-loading');
  block.setAttribute('aria-busy', 'true');

  let stories = [];
  let state = readState(config);
  let loaded = false;

  const syncControls = () => {
    controls.search.value = state.q;
    config.facets.forEach((facet) => {
      controls.selects[facet.key].value = state.facets[facet.key];
    });
    controls.sort.value = state.sort;
  };

  const render = () => {
    if (!loaded) return;
    const filtered = filterStories(stories, { query: state.q, facets: state.facets });
    const sorted = sortStories(filtered, state.sort);
    const totalPages = Math.max(1, Math.ceil(sorted.length / config.pageSize));
    state.page = Math.min(state.page, totalPages);
    const start = (state.page - 1) * config.pageSize;
    const pageItems = sorted.slice(start, start + config.pageSize);

    grid.replaceChildren(...pageItems.map(buildCard));
    block.classList.toggle('story-listing-empty', !sorted.length);
    if (!sorted.length) {
      status.textContent = stories.length ? config.labels.noResults : 'No stories are available right now.';
    } else {
      const noun = sorted.length === 1 ? 'story' : 'stories';
      status.textContent = totalPages > 1
        ? `Showing ${start + 1}–${start + pageItems.length} of ${sorted.length} ${noun}`
        : `${sorted.length} ${noun}`;
    }
    buildPagination(config, state, totalPages, nav);
  };

  const update = (changes, { push = true } = {}) => {
    state = {
      ...state, ...changes, facets: { ...state.facets, ...(changes.facets || {}) },
    };
    const url = stateUrl(config, state);
    if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history[push ? 'pushState' : 'replaceState'](null, '', url);
    }
    render();
  };

  // Search: submit applies immediately; typing applies after a pause.
  let typing;
  controls.form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearTimeout(typing);
    update({ q: controls.search.value.trim(), page: 1 });
  });
  controls.search.addEventListener('input', () => {
    clearTimeout(typing);
    typing = setTimeout(() => {
      const q = controls.search.value.trim();
      if (q !== state.q) update({ q, page: 1 }, { push: false });
    }, 300);
  });
  config.facets.forEach((facet) => {
    controls.selects[facet.key].addEventListener('change', (e) => {
      update({ facets: { [facet.key]: e.target.value }, page: 1 });
    });
  });
  controls.sort.addEventListener('change', (e) => update({ sort: e.target.value, page: 1 }));
  controls.clear.addEventListener('click', (e) => {
    e.preventDefault();
    clearTimeout(typing);
    const facets = Object.fromEntries(config.facets.map((facet) => [facet.key, '']));
    update({
      q: '', facets, sort: config.defaultSort, page: 1,
    });
    syncControls();
  });
  nav.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-page]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    update({ page: Number(a.dataset.page) });
    grid.focus({ preventScroll: true });
    if (block.getBoundingClientRect().top < 0) block.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  window.addEventListener('popstate', () => {
    state = readState(config);
    syncControls();
    render();
  });

  syncControls();

  stories = await loadStories({
    index: config.index,
    external: config.external,
    pathPrefix: config.pathPrefix,
    exclude: config.exclude,
  });

  // Facets without authored options use the library options sheet (authored order,
  // so values without stories are listed too); failing that, the stories' values.
  await Promise.all(config.facets.map(async (facet) => {
    if (facet.options.length) return;
    let values = await loadOptionValues(config.optionsSheet, facet.key);
    if (!values.length) {
      values = [...new Set(stories.flatMap((story) => story[facet.key] || []))]
        .sort((a, b) => a.localeCompare(b));
    }
    facet.options = values;
    values.forEach((v) => controls.selects[facet.key].append(el('option', { value: v }, v)));
  }));

  state = readState(config);
  syncControls();
  loaded = true;
  block.classList.remove('story-listing-loading');
  block.removeAttribute('aria-busy');
  render();
}
