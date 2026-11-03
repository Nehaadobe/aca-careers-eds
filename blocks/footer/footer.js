/**
 * Footer block: builds the site footer from the footer fragment
 * (page metadata `footer`, default /footer).
 *
 * Fragment sections, in order (all copy, links and images live in the fragment):
 *   1. brand: logo link
 *   2. notice: heading + paragraphs (e.g. fair hiring practices)
 *   3. links: groups of "label paragraph + list"
 *   4. social: list of icon links
 *   5. utility: list of links (bottom bar)
 *   6. legal: copyright / disclaimer text
 */

import { getMetadata } from '../../scripts/aem.js';
import { decorateFragmentIcons } from '../../scripts/scripts.js';

const SECTION_NAMES = ['brand', 'notice', 'links', 'social', 'utility', 'legal'];
// sections whose off-site links open in a new tab (as on the source site)
const NEW_TAB_SECTIONS = ['notice', 'social'];

/**
 * Fetches the footer fragment named by the page's `footer` metadata (default /footer),
 * so each brand folder can use its own (e.g. /stellarus/footer).
 * @returns {Promise<{html: string, url: string}|null>}
 */
async function fetchFooterFragment() {
  const metaPath = getMetadata('footer');
  const path = metaPath ? new URL(metaPath, window.location.href).pathname : '/footer';
  const resp = await fetch(`${path.replace(/(\.plain)?\.html$/, '')}.plain.html`);
  if (!resp.ok) return null;
  return { html: await resp.text(), url: resp.url };
}

/**
 * Resolves relative image sources against the fragment URL, so they work on any page depth.
 * @param {Element} root
 * @param {string} baseUrl
 */
function resolveImages(root, baseUrl) {
  root.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), baseUrl).href;
    img.loading = 'lazy';
  });
}

/**
 * Opens off-site links in a new tab.
 * @param {Element} root
 */
function openExternalInNewTab(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    if (new URL(a.href, window.location.href).origin === window.location.origin) return;
    a.target = '_blank';
    a.rel = 'noopener';
  });
}

/**
 * Groups each "label paragraph + following list" pair into its own column.
 * @param {Element} section
 */
function groupLinkLists(section) {
  const groups = [];
  let current = null;
  [...section.children].forEach((el) => {
    if (el.tagName === 'P' || !current) {
      current = document.createElement('div');
      current.className = 'footer-link-group';
      groups.push(current);
    }
    current.append(el);
  });
  section.replaceChildren(...groups);
}

/**
 * Is this the "Cookie preferences" link? Authored as `#cookie-preferences`; the source
 * uses `javascript:void(0)` with that text.
 * @param {HTMLAnchorElement} a
 * @returns {boolean}
 */
function isConsentLink(a) {
  const href = a.getAttribute('href') || '';
  return href.endsWith('#cookie-preferences')
    || (/^javascript:/i.test(href) && /cookie preferences/i.test(a.textContent));
}

/**
 * Wires "Cookie preferences" links to the OneTrust preference center (loaded in the
 * delayed phase by scripts/consent.js). Does nothing while OneTrust is absent.
 * @param {Element} root
 */
function wireConsentLinks(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    if (!isConsentLink(a)) return;
    a.setAttribute('href', '#cookie-preferences'); // never navigate to a javascript: URL
    a.setAttribute('role', 'button');
    a.addEventListener('click', (e) => {
      e.preventDefault();
      window.OneTrust?.ToggleInfoDisplay?.();
    });
  });
}

/**
 * Wraps sections in a band (full-width background) + inner container.
 * @param {string} name band name
 * @param {Element[]} children
 * @param {string} [tag]
 * @returns {Element}
 */
function buildBand(name, children, tag = 'div') {
  const band = document.createElement(tag);
  band.className = `footer-band footer-band-${name}`;
  const inner = document.createElement('div');
  inner.className = 'footer-band-inner';
  inner.append(...children.filter(Boolean));
  band.append(inner);
  return band;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooterFragment();
  block.textContent = '';
  if (!fragment) return;

  const source = document.createElement('div');
  source.innerHTML = fragment.html;
  decorateFragmentIcons(source); // :icon-name: logos and icons
  resolveImages(source, fragment.url);

  const parts = {};
  const sections = [...source.children].filter((el) => el.tagName === 'DIV');
  // 6 sections (BSC) or 3 sections (brand + blurb, link columns, legal line; e.g. Stellarus)
  const names = sections.length === 3 ? ['brand', 'links', 'legal'] : SECTION_NAMES;
  sections.forEach((section, i) => {
    const name = names[i];
    if (!name) return;
    section.className = `footer-${name}`;
    parts[name] = section;
  });

  NEW_TAB_SECTIONS.forEach((name) => { if (parts[name]) openExternalInNewTab(parts[name]); });
  if (parts.links) groupLinkLists(parts.links);
  parts.social?.querySelector('ul')?.setAttribute('aria-label', 'Social media');

  let utility = null;
  if (parts.utility) {
    utility = document.createElement('nav');
    utility.className = 'footer-utility';
    utility.setAttribute('aria-label', 'Blue Shield of California');
    utility.append(...parts.utility.childNodes);
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'footer-wrapper-inner';
  wrapper.append(
    buildBand('main', [parts.brand, parts.notice, parts.links, parts.social]),
    buildBand('utility', [utility]),
    buildBand('legal', [parts.legal]),
  );
  wireConsentLinks(wrapper);
  block.append(wrapper);
}
