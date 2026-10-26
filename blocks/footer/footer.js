/**
 * Footer block: builds the site footer from the footer fragment (content/footer.plain.html).
 *
 * Fragment sections, in order (all copy, links and images live in the fragment):
 *   1. brand: logo link
 *   2. notice: heading + paragraphs (e.g. fair hiring practices)
 *   3. links: groups of "label paragraph + list"
 *   4. social: list of icon links
 *   5. utility: list of links (bottom bar)
 *   6. legal: copyright / disclaimer text
 */

const SECTION_NAMES = ['brand', 'notice', 'links', 'social', 'utility', 'legal'];
// sections whose off-site links open in a new tab (as on the source site)
const NEW_TAB_SECTIONS = ['notice', 'social'];
const CONSENT_HASH = '#cookie-preferences';

/**
 * Fetches the footer fragment: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<{html: string, url: string}|null>}
 */
async function fetchFooterFragment() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
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
 * Wires "Cookie preferences" links to the consent manager's preference center.
 * Uses OneTrust when present; otherwise announces a `consent.preferences` event
 * for whichever consent integration the site adds.
 * @param {Element} root
 */
function wireConsentLinks(root) {
  root.querySelectorAll(`a[href$="${CONSENT_HASH}"]`).forEach((a) => {
    a.setAttribute('role', 'button');
    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.OneTrust && typeof window.OneTrust.ToggleInfoDisplay === 'function') {
        window.OneTrust.ToggleInfoDisplay();
      } else {
        window.dispatchEvent(new CustomEvent('consent.preferences'));
      }
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
  resolveImages(source, fragment.url);

  const parts = {};
  [...source.children].filter((el) => el.tagName === 'DIV').forEach((section, i) => {
    const name = SECTION_NAMES[i];
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
