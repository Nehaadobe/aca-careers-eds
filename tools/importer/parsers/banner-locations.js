/* eslint-disable */
/* global WebImporter */

/**
 * Parser for banner-locations (renamed to "Banner (locations)" by block-options transformer).
 * Source: section.locations on careers.blueshieldca.com homepage.
 * Block structure (blocks/banner/README.md):
 *   row 1: background image (California map - CSS background-image on section.locations)
 *   row 2: heading (H2), paragraphs, CTA link in its own paragraph
 */

// Last-resort fallback when the style attribute was stripped from the captured DOM.
const FALLBACK_MAP_URL = 'https://iprsoftwaremedia.com/399/files/20222/6232101eb3aed3445d5b7307_ca-map-locations/ca-map-locations_mid.png?v=f08cb4f4-e6a5-4c63-8300-a5d3c0aa5c19';

function extractUrl(value) {
  if (!value) return '';
  const m = value.match(/url\(\s*(['"]?)(.*?)\1\s*\)/i);
  const url = m && m[2] ? m[2].replace(/&quot;|['"]/g, '').trim() : '';
  return url && url !== 'none' ? url : '';
}

function findBackgroundUrl(element, document) {
  const candidates = [element, ...element.querySelectorAll('[style*="background"]')];
  for (const el of candidates) {
    const url = extractUrl(el.getAttribute('style')) || extractUrl(el.style && el.style.backgroundImage);
    if (url) return url;
  }
  try {
    const view = document.defaultView;
    if (view && view.getComputedStyle) {
      const url = extractUrl(view.getComputedStyle(element).backgroundImage);
      if (url) return url;
    }
  } catch (e) { /* ignore */ }
  return FALLBACK_MAP_URL;
}

export default function parse(element, { document }) {
  const cells = [];

  // Row 1: map image from the section's CSS background.
  const bgUrl = findBackgroundUrl(element, document);
  if (bgUrl) {
    const img = document.createElement('img');
    img.src = bgUrl.trim();
    img.alt = 'Map of Blue Shield of California office locations';
    cells.push([img]);
  }

  // Row 2: heading, paragraphs, CTA.
  const content = [];
  const title = element.querySelector('.locations-title, h1, h2, h3');
  if (title) {
    const h2 = document.createElement('h2');
    h2.textContent = title.textContent.replace(/\s+/g, ' ').trim();
    content.push(h2);
  }

  const body = element.querySelector('.locations-body');
  if (body) {
    // Source copy is one span separated by <br><br>; rebuild as paragraphs.
    const html = body.innerHTML.replace(/<\/?span[^>]*>/gi, '');
    html.split(/(?:\s*<br\s*\/?>\s*){2,}/i).forEach((chunk) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = chunk;
      const link = tmp.querySelector('a[href]');
      const text = tmp.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
      if (!text) return;
      const p = document.createElement('p');
      if (link && link.textContent.replace(/\s+/g, ' ').trim() === text) {
        const a = document.createElement('a');
        a.href = link.getAttribute('href');
        a.textContent = text;
        p.append(a);
      } else {
        tmp.querySelectorAll('br').forEach((br) => br.remove());
        tmp.querySelectorAll('a').forEach((a) => a.removeAttribute('class'));
        p.innerHTML = tmp.innerHTML.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      }
      content.push(p);
    });
  }

  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'banner-locations', cells });
  element.replaceWith(block);
}
