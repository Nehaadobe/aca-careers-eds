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

import {
  decorateFragmentIcons,
  fetchLayoutFragment,
  openExternalLinksInNewTab,
  resolveFragmentMedia,
} from '../../scripts/scripts.js';

const SECTION_NAMES = ['brand', 'notice', 'links', 'social', 'utility', 'legal'];
// sections whose off-site links open in a new tab (as on the source site)
const NEW_TAB_SECTIONS = ['notice', 'social'];

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

/** Text of the "Cookie preferences" footer item (client cookieprefs.js). */
const CONSENT_LABEL = 'cookie preferences';

/**
 * Is this the "Cookie preferences" link? Authored as `#cookie-preferences` or with that text;
 * the source uses `javascript:void(0)`.
 * @param {HTMLAnchorElement} a
 * @returns {boolean}
 */
function isConsentLink(a) {
  const href = a.getAttribute('href') || '';
  return href.endsWith('#cookie-preferences')
    || a.textContent.trim().toLowerCase() === CONSENT_LABEL;
}

/** Opens the OneTrust preference center (any of the SDK globals, as in cookieprefs.js). */
function openConsentPreferences() {
  const sdk = [window.Optanon, window.OneTrust, window.Onetrust]
    .find((candidate) => typeof candidate?.ToggleInfoDisplay === 'function');
  sdk?.ToggleInfoDisplay();
}

/**
 * Wires "Cookie preferences" to the OneTrust preference center, as the client cookieprefs.js
 * does: a list item with that text and no link gets one; the link gets the OneTrust id,
 * classes and data-text. The click is handled here only (stopImmediatePropagation), so the
 * SDK's own `.ot-sdk-show-settings` handler cannot toggle the center closed again.
 * Pages without OneTrust (Stellarus) hide the item: there is no preference center to open.
 * @param {Element} root
 */
function wireConsentLinks(root) {
  root.querySelectorAll('li').forEach((li) => {
    if (li.querySelector('a') || li.textContent.trim().toLowerCase() !== CONSENT_LABEL) return;
    const a = document.createElement('a');
    a.textContent = li.textContent.trim();
    li.replaceChildren(a);
  });
  root.querySelectorAll('a').forEach((a) => {
    if (!isConsentLink(a)) return;
    a.setAttribute('href', '#cookie-preferences'); // never navigate to a javascript: URL
    a.setAttribute('role', 'button');
    a.id = 'ot-cookie-pref';
    a.classList.add('ot-link', 'ot-sdk-show-settings');
    a.dataset.text = 'cookie-preferences';
    a.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      openConsentPreferences();
    });
    const item = a.closest('li') || a;
    const update = (state) => { item.hidden = state?.managed === false; };
    update(window.consentState);
    window.addEventListener('consent.update', (e) => update(e.detail));
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
  const fragment = await fetchLayoutFragment('footer', '/footer');
  block.textContent = '';
  if (!fragment) return;

  const source = document.createElement('div');
  source.innerHTML = fragment.html;
  decorateFragmentIcons(source); // :icon-name: logos and icons
  resolveFragmentMedia(source, fragment.url, 'lazy');

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

  if (sections.length === 3) {
    // brand footer (stellarus.com): links to other sites than the brand's own open in a new tab
    const brandLink = parts.brand?.querySelector('a[href]');
    const brandHost = brandLink ? new URL(brandLink.href, window.location.href).host : '';
    Object.values(parts).forEach((part) => openExternalLinksInNewTab(part, [brandHost]));
  } else {
    NEW_TAB_SECTIONS.filter((name) => parts[name])
      .forEach((name) => openExternalLinksInNewTab(parts[name]));
  }
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
