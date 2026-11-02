/* eslint-disable */
/* global WebImporter */

/**
 * Parser for article-list.
 * Source: curated story cards (.tiles .tiles-item a.tiles-wrapper) in
 *   - the "More Stories" row of every story (section.contentSection.blue_bottom), and
 *   - "Growth & development stories" on /growth-development (section.contentSection).
 * Block structure (blocks/article-list/README.md): one single-cell row per story link
 * (same-site links made relative, external links kept absolute), then option rows:
 *   Columns | 3, Ground | Tinted (blue_bottom band) or Light,
 *   Display Article date | Yes/No (whether the source cards show a date),
 *   Display Short description | Yes/No (whether the source cards show a description).
 * The section heading and any "View More Stories" link stay default content.
 * Pages without story cards produce no block.
 */
const SITE_HOSTS = ['careers.blueshieldca.com'];

function storyHref(href, document) {
  const value = (href || '').trim();
  if (!value) return '';
  try {
    const base = document.baseURI && document.baseURI !== 'about:blank' ? document.baseURI : 'https://careers.blueshieldca.com/';
    const url = new URL(value, base);
    if (SITE_HOSTS.includes(url.hostname)) return url.pathname.replace(/\/$/, '') || '/';
    return url.href;
  } catch (e) {
    return value;
  }
}

export default function parse(element, { document }) {
  const cards = [...element.querySelectorAll('.tiles-item')];
  const links = cards
    .map((card) => {
      const a = card.querySelector('a.tiles-wrapper[href], a[href]');
      return a ? storyHref(a.getAttribute('href'), document) : '';
    })
    .filter(Boolean);

  if (!links.length) {
    element.remove();
    return;
  }

  const cells = links.map((href) => {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = href;
    return [a];
  });

  const showDate = cards.some((card) => {
    const meta = card.querySelector('.tiles-meta');
    return meta && meta.textContent.trim();
  });
  const showDescription = cards.some((card) => {
    const desc = card.querySelector('.tiles-description');
    return desc && desc.textContent.trim();
  });
  const tinted = !!element.closest('.blue_bottom');

  cells.push(['Columns', '3']);
  cells.push(['Ground', tinted ? 'Tinted' : 'Light']);
  cells.push(['Display Article date', showDate ? 'Yes' : 'No']);
  cells.push(['Display Short description', showDescription ? 'Yes' : 'No']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'article-list', cells });
  element.replaceWith(block);
}
