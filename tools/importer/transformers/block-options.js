/* eslint-disable */
/* global WebImporter */

/**
 * Block options transformer.
 *
 * The project delivers block variants as block OPTIONS (e.g. class "hero home"),
 * so the authored block table name must be "Base (option)" instead of the variant id
 * that parsers emit. Runs in afterTransform (after parsers have created block tables)
 * and renames each block table's header cell using BLOCK_OPTIONS_MAP.
 *
 * Data-driven: add entries for later templates to BLOCK_OPTIONS_MAP (mirrors
 * migration-work/block-options-map.json). Import scripts may also pass extra or
 * overriding entries via payload.blockOptionsMap.
 *
 * BLOCK_OPTIONS_MAP is a module-level const (not a named `export`) because the
 * transformer validation hook evaluates this file as a classic script and only
 * rewrites `export default`; it is exposed as transform.BLOCK_OPTIONS_MAP instead.
 */
const BLOCK_OPTIONS_MAP = {
  'hero-home': 'Hero (home)',
  'cards-feature-links': 'Cards (feature-links)',
  'banner-locations': 'Banner (locations)',
  gallery: 'Gallery',
  quote: 'Quote',
  // landing template
  'hero-page': 'Hero (page)',
  'cards-icon-tiles': 'Cards (icon-tiles)',
  'cards-story-grid': 'Cards (story-grid)',
  'cards-video-tiles': 'Cards (video-tiles)',
  'banner-statement': 'Banner (statement)',
  'banner-image-cta': 'Banner (image-cta)',
  'columns-alternating': 'Columns (alternating)',
  accordion: 'Accordion',
  // content-page template
  'story-listing': 'Story Listing',
};

// Normalize "Hero Home", "hero-home", "hero_home" -> "hero-home".
function normalize(name) {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

function buildLookup(map) {
  return Object.keys(map).reduce((acc, key) => {
    if (key.startsWith('_')) return acc; // skip notes/comments such as "_note"
    acc[normalize(key)] = map[key];
    return acc;
  }, {});
}

function headerCell(table) {
  const firstRow = table.querySelector(':scope > thead > tr, :scope > tbody > tr, :scope > tr');
  if (!firstRow) return null;
  const cells = firstRow.querySelectorAll(':scope > th, :scope > td');
  // Block header rows have exactly one cell (spanning all columns).
  return cells.length === 1 ? cells[0] : null;
}

export default function transform(hookName, element, payload) {
  // Expose the map for import scripts / later templates.
  if (!transform.BLOCK_OPTIONS_MAP) transform.BLOCK_OPTIONS_MAP = BLOCK_OPTIONS_MAP;

  if (hookName === 'afterTransform') {
    const lookup = buildLookup({
      ...BLOCK_OPTIONS_MAP,
      ...((payload && payload.blockOptionsMap) || {}),
    });

    element.querySelectorAll('table').forEach((table) => {
      const cell = headerCell(table);
      if (!cell) return;
      const current = (cell.textContent || '').trim();
      const target = lookup[normalize(current)];
      if (!target || target === current) return;
      cell.textContent = target;
    });
  }
}
