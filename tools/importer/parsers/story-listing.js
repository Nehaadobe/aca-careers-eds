/* eslint-disable */
/* global WebImporter */

/**
 * Parser for story-listing (Document Authoring, renamed "Story Listing" by block-options).
 * Matched on the /blog and /blog/authors listing shell:
 *   div.container:has(form.indexFilter) > form.indexFilter + div.tiles + div.pagination
 *
 * The block is CONFIGURATION ONLY (blocks/story-listing/README.md, readBlockConfig):
 * two-cell key | value rows. Tiles and pagination are runtime data (query index +
 * external-stories sheet) and are intentionally NOT emitted.
 *
 * Live DOM carries name="c" / aria-label="Filter posts by Roles" / placeholder="Search Blog";
 * the cleaned capture strips attributes, so each value has a structural fallback.
 */
const clean = (t) => (t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

// "Filter posts by Roles" -> "Roles"; fall back to the placeholder option text.
function facetName(select) {
  const label = clean(select.getAttribute('aria-label'));
  const m = label.match(/\bby\s+(.+)$/i);
  if (m) return clean(m[1]);
  if (label) return label;
  const first = select.querySelector('option');
  return first ? clean(first.textContent) : '';
}

// Placeholder = option with empty value (live) or, lacking value attrs, the first option.
function facetOptions(select) {
  const options = [...select.querySelectorAll('option')];
  const hasValues = options.some((o) => o.hasAttribute('value'));
  return options
    .filter((o, i) => (hasValues ? o.getAttribute('value') !== '' : i > 0))
    .map((o) => clean(o.textContent))
    .filter(Boolean);
}

export default function parse(element, { document }) {
  const form = element.querySelector('form.indexFilter') || element;

  const sortSelect = form.querySelector('select#s, select[name="s"]');
  let facetSelects = [...form.querySelectorAll('select[name="c"]')];
  if (!facetSelects.length) {
    facetSelects = [...form.querySelectorAll('select.form-select')].filter((s) => s !== sortSelect);
  }

  const facets = facetSelects
    .map((s) => ({ name: facetName(s), options: facetOptions(s) }))
    .filter((f) => f.name);

  // Default sort: selected option, else first.
  let sort = 'Newest';
  if (sortSelect) {
    const opt = sortSelect.querySelector('option[selected]') || sortSelect.querySelector('option');
    if (opt && clean(opt.textContent)) sort = clean(opt.textContent);
  }

  // Page size: number of tiles rendered on the source page.
  const tileCount = element.querySelectorAll('.tiles .tiles-item, .tiles article').length;
  const pageSize = tileCount || 9;

  // Search placeholder: placeholder attr, else aria-label, else the section title.
  const search = form.querySelector('input[name="q"], #blog-search input.form-control, input.form-control');
  let placeholder = '';
  if (search) placeholder = clean(search.getAttribute('placeholder')) || clean(search.getAttribute('aria-label'));
  if (!placeholder) {
    const title = form.querySelector('#blog-search .indexFilter-title');
    placeholder = title ? clean(title.textContent) : 'Search Blog';
  }

  const cells = [];
  if (facets.length) cells.push(['Filters', facets.map((f) => f.name).join(', ')]);
  cells.push(['Page Size', String(pageSize)]);
  cells.push(['Sort', sort]);
  facets.forEach((f) => {
    if (f.options.length) cells.push([f.name, f.options.join(', ')]);
  });
  cells.push(['Path', '/blog/']);
  cells.push(['External Stories', '/blog/external-stories.json']);
  if (placeholder) cells.push(['Search Placeholder', placeholder]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'story-listing', cells });
  element.replaceWith(block);
}
