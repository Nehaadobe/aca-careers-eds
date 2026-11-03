import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  getMetadata,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  buildBlock,
  readBlockConfig,
  toCamelCase,
  toClassName,
} from './aem.js';

if (window.trustedTypes && window.trustedTypes.createPolicy) {
  const innerTT = window.trustedTypes.createPolicy('tt-inner', {
    createHTML: (s) => s, // avoid stack overflow
  });

  window.trustedTypes.createPolicy('default', {
    createHTML: (input, type, sink) => {
      let processedInput = input;
      if (/srcdoc\s*=/i.test(processedInput)) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('iframe[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
        processedInput = doc.body.innerHTML;
      }
      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('script').forEach((el) => el.remove());
        processedInput = doc.body.innerHTML;
      }
      return processedInput;
    },
    createScriptURL: (input) => input,
    createScript: (input) => input,
  });
}

/**
 * Brands. Page metadata `theme` selects one (normally set per folder through bulk
 * metadata); without it, or with an unknown value, the page is BSC.
 * - css: loads styles/themes/<theme>.css (token overrides). BSC is the token default.
 * - adobeFonts: loads styles/fonts.css (Adobe Fonts kit wcg8bju).
 * - consent: OneTrust by default; page metadata `consent: on|off` overrides it.
 * - favicon: the brand's icon (head.html links the BSC one); none keeps the BSC icon.
 */
const THEMES = {
  bsc: {
    css: false, adobeFonts: true, consent: true, favicon: '/favicons/bsc.png',
  },
  stellarus: {
    css: true, adobeFonts: false, consent: false, favicon: '/favicons/stellarus.png',
  },
  // Fieldwork is self-hosted in the theme file; OneTrust stays on for the careers domain
  ascendiun: {
    css: true, adobeFonts: false, consent: true, favicon: '/favicons/ascendiun.png',
  },
};
const DEFAULT_THEME = 'bsc';

/**
 * Reads page metadata by name, tolerating authored casing and spacing
 * ("Publication Date" vs "publication-date"). Production pages carry
 * normalised names; local previews of imported content keep the authored ones.
 * @param {string} name metadata name, e.g. 'publication-date'
 * @param {Document} [doc]
 * @returns {string} the value ('' when absent); repeated tags are comma-joined
 */
export function getPageMetadata(name, doc = document) {
  const exact = getMetadata(name, doc);
  if (exact) return exact;
  const key = toClassName(name);
  return [...doc.head.querySelectorAll('meta[name]')]
    .filter((meta) => toClassName(meta.getAttribute('name')) === key)
    .map((meta) => meta.content)
    .join(', ');
}

/**
 * The page's theme name: the first `theme` metadata value if it is a known theme.
 * @returns {string}
 */
function getTheme() {
  const theme = toClassName(getPageMetadata('theme').split(',')[0]);
  return THEMES[theme] ? theme : DEFAULT_THEME;
}

/**
 * Loads the theme's token overrides (aem.live multi-brand sites, option 2).
 * A missing or failing file leaves the BSC defaults in place.
 * @param {string} theme
 */
async function loadTheme(theme) {
  document.body.classList.add(theme);
  const { favicon } = THEMES[theme];
  const icon = document.head.querySelector('link[rel="icon"]');
  if (favicon && icon) icon.href = `${window.hlx.codeBasePath}${favicon}`;
  if (!THEMES[theme].css) return;
  try {
    await loadCSS(`${window.hlx.codeBasePath}/styles/themes/${theme}.css`);
  } catch {
    // eslint-disable-next-line no-console
    console.warn(`Theme "${theme}" could not be loaded; using the default tokens`);
  }
}

/**
 * Whether OneTrust runs on this page: metadata `consent` (on/off) wins over the theme default.
 * @param {string} theme
 * @returns {boolean}
 */
function isConsentEnabled(theme) {
  const value = toClassName(getPageMetadata('consent'));
  if (['off', 'false', 'no'].includes(value)) return false;
  if (['on', 'true', 'yes'].includes(value)) return true;
  return THEMES[theme].consent;
}

/**
 * load fonts.css (brands on the Adobe Fonts kit only) and set a session storage flag
 */
async function loadFonts() {
  if (!THEMES[getTheme()].adobeFonts) return;
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/** Metadata shown in the blog-article header, as [row label, metadata name]. */
const ARTICLE_HEADER_FIELDS = [
  ['Roles', 'roles'],
  ['Topics', 'topics'],
  ['Publication Date', 'publication-date'],
  ['Author', 'author'],
  ['Author Title', 'author-title'],
  ['Author Image', 'author-image'],
];

/**
 * Blog articles: moves the first H1 and the hero that immediately follows it
 * (an image paragraph or an embed block) into an auto-built article-header
 * block, with the article metadata and a share block, in a new first section.
 * @param {Element} main The container element
 */
function buildArticleHeader(main) {
  const h1 = main.querySelector(':scope > div > h1');
  if (!h1 || h1.closest('.article-header')) return;

  const rows = ARTICLE_HEADER_FIELDS
    .map(([label, name]) => [label, getPageMetadata(name)])
    .filter(([, value]) => value.trim());

  const source = h1.parentElement;
  const next = h1.nextElementSibling;
  let hero = null;
  if (next && next.matches('div.embed')) {
    hero = next;
  } else if (
    next && next.tagName === 'P'
    && next.querySelector('picture') && !next.textContent.trim()
  ) {
    hero = next.querySelector('picture');
    next.remove();
  }

  rows.push([h1]);
  if (hero) rows.push([hero]);
  rows.push([buildBlock('share', '')]);

  const section = document.createElement('div');
  section.append(buildBlock('article-header', rows));
  main.prepend(section);
  if (!source.children.length && !source.textContent.trim()) source.remove();
}

/**
 * Turns a paragraph that holds only a bare YouTube or Vimeo link (link text = URL) into an
 * embed block, so authors can paste a video URL on its own line.
 * @param {Element} main The container element
 */
function buildVideoEmbeds(main) {
  main.querySelectorAll('p > a[href]').forEach((a) => {
    const p = a.parentElement;
    if (p.closest('.embed') || p.children.length !== 1) return;
    const text = a.textContent.trim();
    if (p.textContent.trim() !== text || text.replace(/\/$/, '') !== a.href.replace(/\/$/, '')) return;
    if (!/^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//.test(a.href)) return;
    p.replaceWith(buildBlock('embed', [[a]]));
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // only the page's own <main>: fragments (nav, footer) also run decorateMain
    const isPageMain = main === document.querySelector('body > main');
    if (isPageMain && toClassName(getPageMetadata('template')) === 'blog-article') {
      buildArticleHeader(main);
    }
    // "More Stories" is an authored article-list block (no auto-built related cards)
    buildVideoEmbeds(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Blog article auto blocking failed', error);
  }
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Applies Section Metadata tables: `Style` values become section classes,
 * other keys become data attributes. The vendored aem.js does not do this.
 * @param {Element} main The main element
 */
function decorateSectionMetadata(main) {
  main.querySelectorAll(':scope > div.section').forEach((section) => {
    const sectionMeta = section.querySelector('div.section-metadata');
    if (!sectionMeta) return;
    const meta = readBlockConfig(sectionMeta);
    Object.keys(meta).forEach((key) => {
      if (key === 'style') {
        String(meta.style).split(',')
          .map((style) => toClassName(style.trim()))
          .filter((style) => style)
          .forEach((style) => section.classList.add(style));
      } else {
        section.dataset[toCamelCase(key)] = meta[key];
      }
    });
    const wrapper = sectionMeta.parentElement;
    if (wrapper && wrapper !== section && wrapper.children.length === 1) wrapper.remove();
    else sectionMeta.remove();
  });
}

/** Accessible names for links that hold only an icon (`:icon-name:` in Document Authoring). */
const ICON_LABELS = {
  'bsc-logo': 'Blue Shield of California',
  'bsc-logo-white': 'Blue Shield of California',
  'stellarus-logo': 'Stellarus',
  'ascendiun-logo': 'Ascendiun',
  'ascendiun-logo-white': 'Ascendiun',
  facebook: 'Facebook',
  twitter: 'Twitter',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  glassdoor: 'Glassdoor',
  search: 'Search',
};

/**
 * Turns `:icon-name:` icons (span.icon) in a fragment such as the nav or footer into images
 * from /icons. Logos keep their own proportions (no 16x16 default size), and a link that
 * holds only an icon gets an accessible name: its title, a known label, or the icon name.
 * @param {Element} root
 */
export function decorateFragmentIcons(root) {
  decorateIcons(root);
  root.querySelectorAll('span.icon > img[data-icon-name]').forEach((img) => {
    const name = img.dataset.iconName;
    if (name.includes('logo')) {
      img.removeAttribute('width');
      img.removeAttribute('height');
    }
    const link = img.closest('a');
    if (link && !link.textContent.trim() && !link.getAttribute('aria-label')) {
      link.setAttribute('aria-label', link.title || ICON_LABELS[name] || name.replace(/-/g, ' '));
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateSectionMetadata(main);
  decorateBlocks(main);
  decorateButtons(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  // aem.js reads lowercase meta names; local previews keep authored case ("Template"),
  // so add the template class through the case-insensitive lookup as well
  const template = toClassName(getPageMetadata('template'));
  if (template) document.body.classList.add(template);
  // theme tokens load in parallel with decoration and are applied before the first paint
  const themeLoaded = loadTheme(getTheme());
  // consent (OneTrust) and analytics (Adobe Launch for CJA) start now, as on the live site,
  // without blocking rendering; Launch runs only where OneTrust runs (scripts/consent.js)
  const consentEnabled = isConsentEnabled(getTheme());
  import('./consent.js').then(({ default: initConsent }) => initConsent({ enabled: consentEnabled }));
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await themeLoaded;
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('body > header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('body > footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
}

loadPage();
