/**
 * Block and state inventory: isolated screenshots of important components.
 * LIVE (iPR theme) and the migrated EDS site use different markup, so every case maps
 * selectors per side. All interactions are read-only (hover/click to open UI); nothing is
 * submitted.
 *
 * Case fields
 *   id, tags, path, viewports      as in pages.js
 *   capture   "element" (target box, padding included), "union" (box enclosing several
 *             elements, e.g. header + open dropdown) or "viewport"
 *   reference / actual  per side:
 *     target  { selector, hasText?, count? }    element capture (count defaults to 1)
 *     union   [selector, ...]                   union capture; each must match exactly 1
 *     steps   [{ action: 'hover'|'click', selector, hasText?, count? }]
 *     assert  [{ selector, count?, visible? }]  must hold after steps, before capture
 *     masks   [{ selector, reason, optional? }]
 *   pointer   "park" (default: move the pointer away before capture) or "keep" (hover under test)
 */

export const BLOCKS = [
  {
    id: 'header',
    tags: ['@header', '@nav'],
    path: '/',
    capture: 'element',
    reference: { target: { selector: '#site_header' } },
    actual: { target: { selector: 'body > header' } },
  },
  {
    id: 'header-dropdown-open',
    tags: ['@header-dropdown', '@nav'],
    path: '/',
    viewports: { minWidth: 1200 },
    capture: 'union',
    pointer: 'keep',
    reference: {
      steps: [{ action: 'hover', selector: '.header-nav_item.subitems > a' }],
      assert: [{ selector: '.header-nav_item.subitems > .header-nav_dropdown', visible: true }],
      union: ['#site_header', '.header-nav_item.subitems > .header-nav_dropdown'],
    },
    actual: {
      steps: [{ action: 'hover', selector: '.nav-drop > a' }],
      assert: [{ selector: '.nav-drop.is-open > .nav-dropdown', visible: true }],
      union: ['body > header', '.nav-drop > .nav-dropdown'],
    },
  },
  {
    id: 'mobile-menu-open',
    tags: ['@mobile-menu', '@nav'],
    path: '/',
    viewports: { maxWidth: 1199 },
    capture: 'viewport',
    reference: {
      steps: [{ action: 'click', selector: 'button.header-navCaller' }],
      assert: [{ selector: 'body.mobileNavOpened' }, { selector: '.header-menu', visible: true }],
    },
    actual: {
      steps: [{ action: 'click', selector: '.nav-hamburger button' }],
      assert: [{ selector: '#nav[aria-expanded="true"]' }, { selector: '#nav-menu', visible: true }],
    },
  },
  {
    id: 'footer',
    tags: ['@footer'],
    path: '/',
    capture: 'element',
    reference: {
      target: { selector: '#site_footer' },
    },
    actual: { target: { selector: 'footer .footer' } },
  },
  {
    id: 'home-hero',
    tags: ['@hero', '@home'],
    path: '/',
    capture: 'element',
    reference: { target: { selector: '#site_content > .hero' } },
    actual: { target: { selector: 'main .hero.home' } },
  },
  {
    id: 'icon-tiles',
    tags: ['@cards', '@total-rewards'],
    path: '/total-rewards',
    capture: 'element',
    reference: { target: { selector: '.tileIcons', hasText: 'Compensation' } },
    actual: { target: { selector: '.cards.icon-tiles', hasText: 'Compensation' } },
  },
  {
    id: 'faq-first-open',
    tags: ['@faq', '@accordion', '@hiring'],
    path: '/how-to-get-hired',
    capture: 'element',
    reference: {
      steps: [{ action: 'click', selector: '.faq-item .faq-caller', hasText: 'best way to apply' }],
      assert: [{ selector: '.faq-item.opened', count: 1 }],
      target: { selector: '.faq' },
    },
    actual: {
      steps: [{ action: 'click', selector: '.accordion summary', hasText: 'best way to apply' }],
      assert: [{ selector: '.accordion details[open]', count: 1 }],
      target: { selector: 'main .accordion' },
    },
  },
];
