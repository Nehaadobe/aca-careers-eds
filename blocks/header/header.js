/**
 * Header block: builds the site header from the nav fragment (content/nav.plain.html).
 *
 * Fragment sections, in order (all copy, links and images live in the fragment):
 *   1. utility links (list)
 *   2. brand: logo link + site name link
 *   3. main navigation (list; a nested list makes that item a dropdown)
 *   4. tools: call-to-action link
 *
 * Desktop: two rows (utility bar, then brand + nav + CTA); dropdowns open on
 * hover or keyboard focus as a full-width bar. Mobile: a menu button toggles the nav.
 */

const DESKTOP_QUERY = window.matchMedia('(width >= 1200px)');
const SECTION_NAMES = ['utility', 'brand', 'sections', 'tools'];
let dropdownCount = 0;

/**
 * Fetches the nav fragment: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<{html: string, url: string}|null>}
 */
async function fetchNavFragment() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
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
    img.loading = 'eager';
  });
}

/**
 * Opens off-site links in a new tab (source: dropdown and CTA links do; utility links don't).
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
 * Marks a list item with a nested list as a dropdown and wires open/close behavior.
 * @param {Element} item the top-level <li>
 */
function setupDropdown(item) {
  const trigger = item.querySelector(':scope > a, :scope > p > a');
  const panel = item.querySelector(':scope > ul');
  if (!trigger || !panel) return;
  item.classList.add('nav-drop');
  panel.classList.add('nav-dropdown');
  trigger.classList.add('nav-drop-trigger');
  dropdownCount += 1;
  panel.id = `nav-dropdown-${dropdownCount}`;

  const setOpen = (open) => {
    item.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  item.addEventListener('mouseenter', () => { if (DESKTOP_QUERY.matches) setOpen(true); });
  item.addEventListener('mouseleave', () => { if (DESKTOP_QUERY.matches) setOpen(false); });
  item.addEventListener('focusin', () => { if (DESKTOP_QUERY.matches) setOpen(true); });
  item.addEventListener('focusout', (e) => {
    if (DESKTOP_QUERY.matches && !item.contains(e.relatedTarget)) setOpen(false);
  });
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && item.classList.contains('is-open')) {
      setOpen(false);
      trigger.focus();
    }
  });
}

/**
 * Closes every open dropdown. Dropdown triggers only expose expanded state on desktop;
 * in the drawer the sub-links are always visible.
 * @param {Element} nav
 */
function closeDropdowns(nav) {
  nav.querySelectorAll('.nav-drop').forEach((item) => {
    item.classList.remove('is-open');
    const trigger = item.querySelector('.nav-drop-trigger');
    const panel = item.querySelector('.nav-dropdown');
    if (!trigger || !panel) return;
    if (DESKTOP_QUERY.matches) {
      trigger.setAttribute('aria-controls', panel.id);
      trigger.setAttribute('aria-expanded', 'false');
    } else {
      trigger.removeAttribute('aria-controls');
      trigger.removeAttribute('aria-expanded');
    }
  });
}

/**
 * Opens or closes the mobile menu.
 * @param {Element} nav
 * @param {boolean} open
 */
function setMenuOpen(nav, open) {
  const button = nav.querySelector('.nav-hamburger button');
  const drawerOpen = open && !DESKTOP_QUERY.matches;
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  button?.setAttribute('aria-expanded', open ? 'true' : 'false');
  button?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  document.body.classList.toggle('nav-open', drawerOpen);
  // everything behind the dimmed page is unreachable while the drawer is open
  [nav.querySelector('.nav-brand'), nav.querySelector('.nav-row-utility'),
    document.querySelector('main'), document.querySelector('body > footer')]
    .forEach((el) => { if (el) el.inert = drawerOpen; });
}

/**
 * Builds the menu button for small screens.
 * @param {Element} nav
 * @returns {Element}
 */
function buildHamburger(nav) {
  const wrap = document.createElement('div');
  wrap.className = 'nav-hamburger';
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-controls', 'nav-menu');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', 'Open navigation');
  button.innerHTML = '<span class="nav-hamburger-icon" aria-hidden="true"></span>';
  button.addEventListener('click', () => setMenuOpen(nav, nav.getAttribute('aria-expanded') !== 'true'));
  wrap.append(button);
  return wrap;
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNavFragment();
  block.textContent = '';
  if (!fragment) return;

  const source = document.createElement('div');
  source.innerHTML = fragment.html;
  resolveImages(source, fragment.url);
  const sections = [...source.children].filter((el) => el.tagName === 'DIV');

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
  const parts = {};
  sections.forEach((section, i) => {
    const name = SECTION_NAMES[i];
    if (!name) return;
    section.className = `nav-${name}`;
    parts[name] = section;
  });

  // utility row
  const utility = document.createElement('div');
  utility.className = 'nav-row nav-row-utility';
  if (parts.utility) utility.append(parts.utility);

  // brand: logo link + site-name link
  if (parts.brand) {
    const links = [...parts.brand.querySelectorAll('a')];
    links.forEach((a) => {
      a.classList.add(a.querySelector('img') ? 'nav-logo' : 'nav-site-name');
      parts.brand.append(a);
    });
    parts.brand.querySelectorAll('p').forEach((p) => p.remove());
  }

  // main nav list + dropdowns
  const menu = document.createElement('div');
  menu.className = 'nav-menu';
  menu.id = 'nav-menu';
  // drawer title bar (below the desktop breakpoint)
  const menuTitle = document.createElement('p');
  menuTitle.className = 'nav-menu-title';
  menuTitle.textContent = 'Menu';
  menu.append(menuTitle);
  if (parts.sections) {
    const list = parts.sections.querySelector('ul');
    list?.classList.add('nav-list');
    list?.querySelectorAll(':scope > li').forEach((li) => {
      li.classList.add('nav-item');
      setupDropdown(li);
    });
    list?.querySelectorAll('.nav-dropdown').forEach(openExternalInNewTab);
    menu.append(parts.sections);
  }
  if (parts.tools) {
    const cta = parts.tools.querySelector('a');
    if (cta) {
      cta.classList.add('nav-cta');
      parts.tools.replaceChildren(cta);
      openExternalInNewTab(parts.tools);
    }
    menu.append(parts.tools);
  }

  // main row: menu button (left, below desktop), brand, menu
  const main = document.createElement('div');
  main.className = 'nav-row nav-row-main';
  main.append(buildHamburger(nav));
  if (parts.brand) main.append(parts.brand);
  main.append(menu);

  // page dimming behind the open drawer (like the source, a tap on it does not close the menu)
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';

  nav.append(utility, main, overlay);
  nav.setAttribute('aria-expanded', 'false');
  closeDropdowns(nav);

  // close dropdowns / menu when crossing the desktop breakpoint
  DESKTOP_QUERY.addEventListener('change', () => {
    closeDropdowns(nav);
    setMenuOpen(nav, false);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !DESKTOP_QUERY.matches && nav.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(nav, false);
      nav.querySelector('.nav-hamburger button')?.focus();
    }
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';
  wrapper.append(nav);
  block.append(wrapper);
}
