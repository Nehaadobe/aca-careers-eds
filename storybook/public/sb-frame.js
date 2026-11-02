/**
 * Story frame: turns a content fixture into an Edge Delivery Services page and runs the site.
 *
 * Query parameters (set by stories via src/frame.js):
 *   fixture  path under /fixtures without .plain.html, e.g. blocks/hero, pages/index,
 *            or a built-in view: __tokens (design tokens of the current brand)
 *   section  keep only this section (0-based, counted without the metadata section)
 *   theme    brand theme; "auto" keeps the fixture's Theme metadata (Blue Shield by default)
 *   chrome   "1" shows the header and footer (page stories), otherwise they are hidden
 *   group    __tokens only: which token groups to show (colors | type | space)
 *   id       frame id, echoed in the height messages to the story
 */
const params = new URLSearchParams(window.location.search);
const frameId = params.get('id') || '';

/** Same rule the server uses for metadata names ("Publication Date" -> publication-date). */
const toClassName = (name) => String(name).toLowerCase().replace(/[^0-9a-z]/gi, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

/**
 * Static hosting cannot answer multi-sheet requests (`blocks.json?sheet=options`): map them
 * to one file per sheet (`blocks.options.json`), written by scripts/build-fixtures.mjs.
 */
const siteFetch = window.fetch.bind(window);
window.fetch = (input, init) => {
  const url = new URL(typeof input === 'string' ? input : input.url, window.location.href);
  const sheet = url.searchParams.get('sheet');
  if (url.origin === window.location.origin && url.pathname.endsWith('.json') && sheet) {
    url.pathname = url.pathname.replace(/\.json$/, `.${sheet}.json`);
    url.search = '';
    return siteFetch(url.href, init);
  }
  return siteFetch(input, init);
};

function addMeta(attr, name, content) {
  if (!content) return;
  const meta = document.createElement('meta');
  meta.setAttribute(attr, name);
  meta.content = content;
  document.head.append(meta);
}

/**
 * Moves the fixture's metadata block into <head>, as the server does on a real page.
 * @param {Element} block the metadata block
 */
function applyMetadata(block) {
  [...block.children].forEach((row) => {
    const [keyCell, valueCell] = row.children;
    if (!keyCell || !valueCell) return;
    const name = toClassName(keyCell.textContent);
    const img = valueCell.querySelector('img');
    const value = img ? img.getAttribute('src') : valueCell.textContent.trim();
    if (name === 'title') document.title = value;
    else if (name === 'image') addMeta('property', 'og:image', value);
    else if (name === 'description') addMeta('name', 'description', value);
    else addMeta('name', name, value);
  });
}

function reportHeight() {
  const height = Math.ceil(document.documentElement.getBoundingClientRect().height);
  window.parent.postMessage({ sbFrame: frameId, height }, '*');
}

async function loadFixture(main) {
  const fixture = params.get('fixture');
  if (fixture === '__tokens') {
    const { default: renderTokens } = await import('/sb-tokens.js');
    await renderTokens(main, params.get('group') || 'colors');
    return;
  }
  const resp = await fetch(`/fixtures/${fixture}.plain.html`);
  if (!resp.ok) throw new Error(`Fixture "${fixture}" not found (${resp.status})`);
  const source = document.createElement('div');
  source.innerHTML = await resp.text();

  const sections = [...source.children].filter((el) => el.tagName === 'DIV');
  const metaSection = sections.find((s) => s.querySelector(':scope > .metadata'));
  if (metaSection) {
    applyMetadata(metaSection.querySelector(':scope > .metadata'));
    metaSection.querySelector(':scope > .metadata').remove();
  }
  let content = sections.filter((s) => s.children.length || s.textContent.trim());
  const section = params.get('section');
  if (section !== null) content = [content[Number(section)]].filter(Boolean);
  // library-only blocks: name and description for the authoring library panel
  content.forEach((s) => s.querySelectorAll(':scope > .library-metadata').forEach((el) => el.remove()));
  main.append(...content);
}

async function start() {
  const main = document.querySelector('main');
  const theme = params.get('theme') || 'auto';
  if (params.get('chrome') !== '1') document.body.classList.add('sb-no-chrome');
  new ResizeObserver(reportHeight).observe(document.documentElement);
  try {
    await loadFixture(main);
  } catch (error) {
    document.body.classList.add('sb-frame-error');
    main.textContent = error.message;
    reportHeight();
    return;
  }
  if (theme !== 'auto') {
    document.head.querySelectorAll('meta[name="theme"]').forEach((meta) => meta.remove());
    addMeta('name', 'theme', theme);
  }
  // no cookie banner in stories
  addMeta('name', 'consent', 'off');
  await import('/scripts/scripts.js');
}

start();
