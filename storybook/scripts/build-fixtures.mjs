/**
 * Refreshes the Storybook content fixtures and generated stories from the local content export
 * (../content, the same .plain.html files the local preview uses).
 *
 *   npm run fixtures
 *
 * Writes:
 *   public/fixtures/blocks/*      authoring library block pages (one story per example)
 *   public/fixtures/templates/*   authoring library page templates
 *   public/fixtures/pages/**      real pages shown under "Page templates"
 *   public/nav.plain.html, public/footer.plain.html, public/media-da/**   header and footer
 *   public/drafts/fragments/**    shared fragments
 *   public/blog/query-index.json, public/sitemap.json   story indexes (from all story pages)
 *   public/blog/external-stories.json, public/tools/library/blocks*.json  sheets
 *   stories/blocks/*.stories.js, stories/templates/*.stories.js   generated stories
 * Hand-written files (public/fixtures/foundations/*, stories/guides, stories/foundations) are kept.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = path.resolve(ROOT, '..');
const CONTENT = path.join(REPO, 'content');
const PUBLIC = path.join(ROOT, 'public');
const STORIES = path.join(ROOT, 'stories');

/** Real pages shown as page templates: [fixture path, story name]. */
const PAGES = [
  ['index', 'Home'],
  ['life-at-blue-shield', 'Life at Blue Shield (section landing)'],
  ['life-at-blue-shield/our-workplace-model', 'Our workplace model'],
  ['a-culture-of-belonging', 'A culture of belonging'],
  ['growth-development', 'Growth and development'],
  ['total-rewards', 'Total rewards'],
  ['how-to-get-hired', 'How to get hired'],
  ['events', 'Events'],
  ['why-relocate', 'Why relocate (text page)'],
  ['blog', 'Blog (story listing)'],
  ['blog/veterans-bring-talent-and-loyalty-to-the-table', 'Story with image hero'],
  ['blog/asian-american-and-pacific-islander-heritage-month', 'Story with video hero'],
  ['blog/blue-shield-of-california-internship-program-2024', 'Story with floated images'],
  ['stellarus/careers', 'Stellarus careers'],
];

const TEMPLATE_NAMES = {
  'story-article': 'Story article',
  'section-landing': 'Section landing page',
  'text-page': 'Text page',
  'stellarus-landing': 'Stellarus landing page',
};

const read = (file) => fs.readFileSync(file, 'utf8');
const write = (file, text) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
};
const copyDir = (from, to) => {
  if (fs.existsSync(from)) fs.cpSync(from, to, { recursive: true });
};
/** Empties a generated folder but keeps it, so a running Storybook keeps watching it. */
const clearDir = (dir) => {
  fs.mkdirSync(dir, { recursive: true });
  fs.readdirSync(dir).forEach((entry) => fs.rmSync(path.join(dir, entry), { recursive: true, force: true }));
};
const textOf = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/** Splits a .plain.html file into its top-level section HTML strings. */
function sections(html) {
  const out = [];
  let depth = 0;
  let start = -1;
  const re = /<(\/?)div\b[^>]*>/g;
  let m = re.exec(html);
  while (m) {
    if (!m[1]) {
      if (depth === 0) start = m.index;
      depth += 1;
    } else {
      depth -= 1;
      if (depth === 0 && start >= 0) out.push(html.slice(start, re.lastIndex));
    }
    m = re.exec(html);
  }
  return out;
}

/** Reads the metadata block of a page as { key: value } (keys as authored). */
function metadata(html) {
  const block = html.match(/<div class="metadata">([\s\S]*?)<\/div><\/div><\/div>/);
  const meta = {};
  if (!block) return meta;
  const rows = `${block[1]}</div></div>`.match(/<div><div>[\s\S]*?<\/div><div>[\s\S]*?<\/div><\/div>/g) || [];
  rows.forEach((row) => {
    const [, key, value] = row.match(/<div><div>([\s\S]*?)<\/div><div>([\s\S]*?)<\/div><\/div>/);
    const img = value.match(/<img[^>]+src="([^"]+)"/);
    meta[textOf(key)] = img ? img[1] : textOf(value);
  });
  return meta;
}

/** Page fixture: relative media (./media/x.png) points at the copied fixture media. */
function copyPage(rel, toDir) {
  const html = read(path.join(CONTENT, `${rel}.plain.html`));
  const dir = path.posix.dirname(rel) === '.' ? '' : `/${path.posix.dirname(rel)}`;
  const fixed = html.replace(/(src|srcset)="\.\/media\//g, `$1="/fixtures/${toDir}${dir}/media/`);
  write(path.join(PUBLIC, 'fixtures', toDir, `${rel}.plain.html`), fixed);
  copyDir(path.join(CONTENT, path.dirname(rel), 'media'), path.join(PUBLIC, 'fixtures', toDir, path.dirname(rel), 'media'));
}

const sheet = (rows) => `${JSON.stringify({
  total: rows.length, offset: 0, limit: rows.length, data: rows, ':type': 'sheet',
}, null, 2)}\n`;

const ident = (name) => name.replace(/\(([^)]*)\)/g, ' $1').replace(/[^a-z0-9]+(.)?/gi, (_, c) => (c ? c.toUpperCase() : ''))
  .replace(/^./, (c) => c.toUpperCase()) || 'Example';

function readme(block) {
  const file = path.join(REPO, 'blocks', block, 'README.md');
  return fs.existsSync(file) ? read(file).replace(/^# .*\n+/, '') : '';
}

function storiesFile({
  title, docs, stories, chrome = false, minHeight,
}) {
  const used = new Set();
  const lines = [
    '// Generated by scripts/build-fixtures.mjs (npm run fixtures). Do not edit by hand.',
    "import { frameStory } from '../../src/frame.js';",
    '',
    'export default {',
    `  title: ${JSON.stringify(title)},`,
    "  tags: ['autodocs'],",
    `  parameters: { docs: { description: { component: ${JSON.stringify(docs)} } } },`,
    '};',
    '',
  ];
  stories.forEach(({
    name, fixture, section, story,
  }) => {
    let id = ident(name);
    while (used.has(id)) id += 'X';
    used.add(id);
    const options = [];
    if (chrome) options.push('chrome: true');
    if (minHeight) options.push(`minHeight: ${minHeight}`);
    const opts = options.length ? `, { ${options.join(', ')} }` : '';
    const sectionArg = section === undefined ? 'undefined' : section;
    lines.push(`export const ${id} = {`);
    lines.push(`  ...frameStory(${JSON.stringify(fixture)}, ${sectionArg}${opts}),`);
    lines.push(`  name: ${JSON.stringify(name)},`);
    if (story) lines.push(`  parameters: { docs: { description: { story: ${JSON.stringify(story)} } } },`);
    lines.push('};', '');
  });
  return lines.join('\n');
}

// --- shared documents and media -------------------------------------------------------------
['nav', 'footer'].forEach((doc) => write(path.join(PUBLIC, `${doc}.plain.html`), read(path.join(CONTENT, `${doc}.plain.html`))));
copyDir(path.join(CONTENT, 'media-da'), path.join(PUBLIC, 'media-da'));
// shared fragments, at their site paths (the Fragment block example includes one)
copyDir(path.join(CONTENT, 'drafts/fragments'), path.join(PUBLIC, 'drafts/fragments'));

// --- sheets ---------------------------------------------------------------------------------
write(path.join(PUBLIC, 'blog/external-stories.json'), read(path.join(CONTENT, 'blog/external-stories.json')));
const library = JSON.parse(read(path.join(CONTENT, 'tools/library/blocks.json')));
write(path.join(PUBLIC, 'tools/library/blocks.json'), sheet(library.data.data));
library[':names'].forEach((name) => write(path.join(PUBLIC, `tools/library/blocks.${name}.json`), sheet(library[name].data)));

// --- indexes (same columns as default-query.yaml) --------------------------------------------
const blogRows = [];
const siteRows = [];
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) return ['tools', 'drafts', 'media', 'media-da'].includes(e.name) ? [] : walk(full);
  return e.name.endsWith('.plain.html') ? [full] : [];
});
walk(CONTENT).sort().forEach((file) => {
  const rel = path.relative(CONTENT, file).replace(/\.plain\.html$/, '').split(path.sep).join('/');
  if (['nav', 'footer', 'stellarus/nav', 'stellarus/footer', 'AUTHOR-GUIDE'].includes(rel)) return;
  const meta = metadata(read(file));
  const pagePath = rel === 'index' ? '/' : `/${rel}`;
  const base = {
    path: pagePath,
    title: (meta.Title || '').replace(/\s*\|.*$/, ''),
    description: meta.Description || '',
    image: meta.Image || '',
    template: meta.Template || '',
    robots: '',
    lastModified: '1793417274',
  };
  siteRows.push({ ...base, theme: meta.Theme || '' });
  if (rel.startsWith('blog/')) {
    blogRows.push({
      ...base,
      date: meta['Publication Date'] || '',
      roles: meta.Roles || '',
      topics: meta.Topics || '',
      author: meta.Author || '',
    });
  }
});
write(path.join(PUBLIC, 'blog/query-index.json'), sheet(blogRows));
write(path.join(PUBLIC, 'sitemap.json'), sheet(siteRows));

// --- block stories --------------------------------------------------------------------------
const libraryNames = Object.fromEntries(library.data.data.map((r) => [r.path.split('/').pop(), r.name]));
clearDir(path.join(PUBLIC, 'fixtures/blocks'));
clearDir(path.join(STORIES, 'blocks'));
const blockDir = path.join(CONTENT, 'tools/library/blocks');
let blockStories = 0;
fs.readdirSync(blockDir).filter((f) => f.endsWith('.plain.html')).sort().forEach((file) => {
  const block = file.replace('.plain.html', '');
  const html = read(path.join(blockDir, file));
  write(path.join(PUBLIC, 'fixtures/blocks', file), html);
  const stories = sections(html)
    .filter((s) => !s.includes('class="metadata"') && textOf(s))
    .map((s, i) => {
      const name = s.match(/<div><div>name<\/div><div>([\s\S]*?)<\/div><\/div>/i);
      const desc = s.match(/<div><div>description<\/div><div>([\s\S]*?)<\/div><\/div>/i);
      return {
        name: name ? textOf(name[1]) : `Example ${i + 1}`, fixture: `blocks/${block}`, section: i, story: desc ? textOf(desc[1]) : '',
      };
    });
  blockStories += stories.length;
  write(path.join(STORIES, 'blocks', `${block}.stories.js`), storiesFile({
    title: `Blocks/${libraryNames[block] || block}`, docs: readme(block), stories,
  }));
});
// header and footer: loaded on every page from /nav and /footer
write(path.join(STORIES, 'blocks', 'header-footer.stories.js'), storiesFile({
  title: 'Blocks/Header and footer',
  docs: `${readme('header')}\n\n---\n\n${readme('footer')}`,
  chrome: true,
  stories: [{ name: 'Header and footer', fixture: 'foundations/empty-page', story: 'Shared by all brands; switch the Brand toolbar to see each theme. Use the viewport toolbar for the mobile menu.' }],
}));

// --- page templates -------------------------------------------------------------------------
clearDir(path.join(PUBLIC, 'fixtures/templates'));
clearDir(path.join(PUBLIC, 'fixtures/pages'));
clearDir(path.join(STORIES, 'templates'));
const templateDir = path.join(CONTENT, 'tools/library/templates');
const templates = fs.readdirSync(templateDir).filter((f) => f.endsWith('.plain.html')).sort().map((file) => {
  const name = file.replace('.plain.html', '');
  copyPage(`tools/library/templates/${name}`, 'templates');
  return { name: TEMPLATE_NAMES[name] || name, fixture: `templates/tools/library/templates/${name}` };
});
write(path.join(STORIES, 'templates', 'library-templates.stories.js'), storiesFile({
  title: 'Page templates/Library templates',
  docs: 'The page templates authors insert from the Document Authoring library (Library → Templates), with their sample content.',
  chrome: true,
  minHeight: 900,
  stories: templates,
}));
PAGES.forEach(([rel]) => copyPage(rel, 'pages'));
write(path.join(STORIES, 'templates', 'pages.stories.js'), storiesFile({
  title: 'Page templates/Site pages',
  docs: 'Real migrated pages (content copied from the site), one per template and layout, rendered with the site header and footer.',
  chrome: true,
  minHeight: 900,
  stories: PAGES.map(([rel, name]) => ({ name, fixture: `pages/${rel}` })),
}));

console.log(`fixtures: ${blockStories} block examples, ${templates.length} templates, ${PAGES.length} pages, ${blogRows.length} stories in the blog index, ${siteRows.length} pages in the sitemap index`);
