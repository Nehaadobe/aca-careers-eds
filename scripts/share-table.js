/**
 * The authorable Share table, shared by the share block and the article header.
 *
 *   | Share                                              |
 *   | :facebook:     | https://www.facebook.com/...      |   one row per icon, in order
 *   | :linkedin:     | linkedin.com                      |   (an icon or an image, then a link)
 *   | shareShow      | on / off                          |
 *   | sharePosition  | left / right / center             |
 *
 * A one-cell row is the title. Links open as typed (`facebook.com` gets https://); `{url}` and
 * `{title}` in a link are filled with the page's address and title. Every row is optional.
 *
 * The site default is the Share table on the page `/fragments/share`; a table on the page itself
 * wins over it, row by row.
 */
import { decorateIcons } from './aem.js';
import { loadShareFragment, SHARE_FRAGMENT_PATH } from './scripts.js';

const SHOW_OFF = ['off', 'no', 'false', 'hide', 'hidden', 'none'];
const SHOW_ON = ['on', 'yes', 'true', 'show', 'visible'];
const POSITIONS = ['left', 'right', 'center'];
const SHOW_KEYS = ['shareshow', 'show', 'share'];
const POSITION_KEYS = ['shareposition', 'position'];
const TITLE_KEYS = ['sharetitle', 'title', 'sharelabel', 'label'];

const toKey = (text) => String(text ?? '').toLowerCase().replace(/[^a-z]/g, '');

/** `on` -> true, `off` -> false, anything else -> undefined (not set). */
export function parseShow(value) {
  const text = String(value ?? '').trim().toLowerCase();
  if (SHOW_OFF.includes(text)) return false;
  if (SHOW_ON.includes(text)) return true;
  return undefined;
}

/** `left` | `right` | `center`, or undefined (not set). */
export function parsePosition(value) {
  const text = String(value ?? '').trim().toLowerCase();
  return POSITIONS.includes(text) ? text : undefined;
}

/** The link in a cell: an authored link, or the typed text (`facebook.com` -> https://facebook.com). */
function readLink(cell) {
  const href = cell.querySelector('a[href]')?.getAttribute('href') || cell.textContent.trim();
  if (!href) return null;
  if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('/') || href.startsWith('#')) return href;
  return `https://${href}`;
}

/** The icon name of a cell: a decorated or raw `:name:` icon. */
function readIconName(cell) {
  const span = cell.querySelector('span.icon');
  const fromClass = span && [...span.classList].find((c) => c.startsWith('icon-') && c !== 'icon-line');
  if (fromClass) return fromClass.substring(5);
  const match = cell.textContent.trim().match(/^:([\w-]+):$/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Reads a Share table (an undecorated share block).
 * @param {Element} block
 * @returns {{title?: string, items: Array<object>, show?: boolean, position?: string}}
 */
export function readShareTable(block) {
  const table = { items: [] };
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    const [first, second] = cells;
    const picture = first.querySelector('picture, img');
    const name = readIconName(first);
    if (cells.length === 1 || !second) {
      const text = first.textContent.trim();
      if (text && !name && table.title === undefined) table.title = text;
      return;
    }
    const key = toKey(first.textContent);
    if (!name && !picture) {
      if (SHOW_KEYS.includes(key)) table.show = parseShow(second.textContent);
      else if (POSITION_KEYS.includes(key)) table.position = parsePosition(second.textContent);
      else if (TITLE_KEYS.includes(key) && second.textContent.trim()) {
        table.title = second.textContent.trim();
      }
      return;
    }
    const href = readLink(second);
    if (!href) return;
    table.items.push({
      name,
      href,
      icon: name ? first.querySelector('span.icon') : null,
      picture: name ? null : first.querySelector('picture') || first.querySelector('img'),
      label: first.querySelector('img')?.getAttribute('alt')?.trim() || '',
    });
  });
  return table;
}

/** True when the table sets anything (an empty, auto-built share block sets nothing). */
export function hasShareSettings(table) {
  return Boolean(table && (table.title !== undefined || table.items.length
    || table.show !== undefined || table.position !== undefined));
}

let siteTable;

/**
 * The site default: the Share table on `/fragments/share` (null when there is none).
 * @returns {Promise<object|null>}
 */
export function loadSiteShareTable() {
  if (!siteTable) {
    siteTable = loadShareFragment().then((html) => {
      if (!html) return null;
      const root = document.createElement('div');
      root.innerHTML = html;
      const block = root.querySelector('div.share');
      if (!block) return null;
      // pictures pasted in the fragment are relative to the fragment page
      const base = new URL(SHARE_FRAGMENT_PATH, window.location.href);
      block.querySelectorAll('img[src^="./media_"]').forEach((img) => {
        img.src = new URL(img.getAttribute('src'), base).href;
      });
      block.querySelectorAll('source[srcset^="./media_"]').forEach((source) => {
        source.srcset = new URL(source.getAttribute('srcset'), base).href;
      });
      decorateIcons(block);
      return readShareTable(block);
    }).catch(() => null);
  }
  return siteTable;
}
