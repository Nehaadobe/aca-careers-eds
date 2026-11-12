/**
 * Header block: builds the site header from the nav fragment (page metadata `nav`, default /nav).
 *
 * Fragment sections, in order (all copy, links and images live in the fragment):
 *   1. utility links (list) - optional: with 3 sections the fragment has no utility row
 *   2. brand: logo link + site name link
 *   3. main navigation (list; a nested list makes that item a dropdown)
 *   4. tools: call-to-action link
 *
 * Desktop: two rows (utility bar, then brand + nav + CTA); dropdowns open on
 * hover or keyboard focus as a full-width bar. Mobile: a menu button toggles the nav.
 */

import {
  decorateFragmentIcons,
  fetchLayoutFragment,
  openExternalLinksInNewTab,
  resolveFragmentMedia,
} from '../../scripts/scripts.js';

// desktop navigation breakpoint: theme token --nav-desktop-min-width (default 1200px)
let DESKTOP_QUERY = window.matchMedia('(width >= 1200px)');

function desktopQuery() {
  const min = getComputedStyle(document.body).getPropertyValue('--nav-desktop-min-width').trim();
  return /^\d+(\.\d+)?px$/.test(min) ? window.matchMedia(`(width >= ${min})`) : DESKTOP_QUERY;
}

/** Marks the link to the current page (e.g. the active "Careers" pill). */
function markCurrentPage(root) {
  const clean = (p) => p.replace(/(\.plain)?\.html$/, '').replace(/\/$/, '');
  const here = clean(window.location.pathname);
  root.querySelectorAll('a[href]').forEach((a) => {
    const url = new URL(a.href, window.location.href);
    const path = clean(url.pathname);
    if (url.origin === window.location.origin && path && path === here) a.setAttribute('aria-current', 'page');
  });
}
const SECTION_NAMES = ['utility', 'brand', 'sections', 'tools'];
let dropdownCount = 0;

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
  // Esc returns focus to the trigger; that focus must not reopen the dropdown
  let closingByKey = false;
  item.addEventListener('focusin', () => {
    if (DESKTOP_QUERY.matches && !closingByKey) setOpen(true);
  });
  item.addEventListener('focusout', (e) => {
    if (DESKTOP_QUERY.matches && !item.contains(e.relatedTarget)) setOpen(false);
  });
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && item.classList.contains('is-open')) {
      setOpen(false);
      closingByKey = true;
      trigger.focus();
      closingByKey = false;
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
/** Scroll distance after which the header shows its scrolled state (stellarus.com: 25px). */
const SCROLLED_AFTER = 24;

/**
 * Marks the page header as scrolled (.is-scrolled) once the page is scrolled past
 * SCROLLED_AFTER; themes with a sticky header style that state (header.css).
 * @param {Element} header the page <header>
 */
function trackScroll(header) {
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > SCROLLED_AFTER);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

export default async function decorate(block) {
  DESKTOP_QUERY = desktopQuery();
  const pageHeader = block.closest('header');
  if (pageHeader) trackScroll(pageHeader);
  const fragment = await fetchLayoutFragment('nav', '/nav');
  block.textContent = '';
  if (!fragment) return;

  const source = document.createElement('div');
  source.innerHTML = fragment.html;
  decorateFragmentIcons(source); // :icon-name: logos and icons
  resolveFragmentMedia(source, fragment.url, 'eager');
  const sections = [...source.children].filter((el) => el.tagName === 'DIV');

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
  const parts = {};
  // 4 sections: utility, brand, sections, tools; 3 sections (no utility row, e.g. Stellarus):
  // brand, sections, tools
  const names = sections.length === 3 ? SECTION_NAMES.slice(1) : SECTION_NAMES;
  sections.forEach((section, i) => {
    const name = names[i];
    if (!name) return;
    section.className = `nav-${name}`;
    parts[name] = section;
  });

  // the brand's own website (the logo link, e.g. stellarus.com) counts as the same site: its links
  // keep the tab, other sites open a new one (BSC: the logo links to this site)
  const brandLink = parts.brand?.querySelector('a[href]');
  const brandHost = new URL(brandLink?.href || window.location.href, window.location.href).host;

  // utility row
  const utility = document.createElement('div');
  utility.className = 'nav-row nav-row-utility';
  if (parts.utility) utility.append(parts.utility);

  // brand: logo link + site-name link
  if (parts.brand) {
    // a logo authored without a link links to the home page (as on the source site)
    const loosePicture = [...parts.brand.querySelectorAll('picture, span.icon')].find((pic) => !pic.closest('a'));
    if (loosePicture) {
      const home = document.createElement('a');
      home.href = parts.brand.querySelector('a[href]')?.getAttribute('href') || '/';
      const alt = loosePicture.querySelector('img')?.alt;
      if (alt) home.setAttribute('aria-label', alt);
      loosePicture.replaceWith(home);
      home.append(loosePicture);
      parts.brand.prepend(home);
      if (!home.getAttribute('aria-label')) decorateFragmentIcons(parts.brand);
      if (!home.getAttribute('aria-label')) home.setAttribute('aria-label', 'Home');
    }
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
      // Document Authoring wraps list item text in a paragraph; unwrap it so items style alike
      const para = li.querySelector(':scope > p:has(> a)');
      if (para) para.replaceWith(...para.childNodes);
      setupDropdown(li);
    });
    list?.querySelectorAll('.nav-dropdown')
      .forEach((dropdown) => openExternalLinksInNewTab(dropdown, [brandHost]));
    menu.append(parts.sections);
  }
  if (parts.tools) {
    const cta = parts.tools.querySelector('a');
    if (cta) {
      cta.classList.add('nav-cta');
      parts.tools.replaceChildren(cta);
      openExternalLinksInNewTab(parts.tools, [brandHost]);
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
  markCurrentPage(nav);
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
