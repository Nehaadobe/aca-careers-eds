/**
 * Shared YouTube video modal, used by the cards (video-tiles) and columns
 * (alternating) blocks.
 *
 * - One native <dialog> is created lazily and reused across the page.
 * - The YouTube iframe is only created when a video is opened, and is removed
 *   when the dialog closes (this also stops playback).
 * - Esc, the close button and a click on the backdrop close the dialog; focus
 *   returns to the element that opened it.
 * - Links keep their real href, so they still work without JS, with
 *   modifier keys (new tab) or middle click.
 */
import { loadCSS } from './aem.js';

let dialog;
let opener;
let cssLoaded;

function loadStyles() {
  if (!cssLoaded) cssLoaded = loadCSS(`${window.hlx?.codeBasePath || ''}/styles/video-modal.css`);
  return cssLoaded;
}

/**
 * Returns the YouTube video id for a youtube.com/watch, youtu.be, /embed/ or
 * /shorts/ URL, or null when the URL is not a YouTube video.
 * @param {string} href
 * @returns {string|null}
 */
export function getYouTubeId(href) {
  let url;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www\.|m\.)/, '');
  let id = null;
  if (host === 'youtu.be') {
    [, id] = url.pathname.split('/');
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') id = url.searchParams.get('v');
    else {
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/);
      if (match) [, id] = match;
    }
  }
  return id && /^[\w-]{6,}$/.test(id) ? id : null;
}

/**
 * Returns the start offset in seconds from a `t` or `start` parameter.
 * @param {string} href
 * @returns {number}
 */
function getStart(href) {
  try {
    const url = new URL(href, window.location.href);
    const t = url.searchParams.get('t') || url.searchParams.get('start') || '';
    const match = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
    if (!match) return 0;
    const [, h = 0, m = 0, s = 0] = match;
    return (Number(h) * 3600) + (Number(m) * 60) + Number(s);
  } catch {
    return 0;
  }
}

function getDialog() {
  if (dialog) return dialog;
  loadStyles();

  dialog = document.createElement('dialog');
  dialog.className = 'video-modal';
  dialog.setAttribute('aria-label', 'Video player');

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'video-modal-close';
  close.setAttribute('aria-label', 'Close video');
  close.addEventListener('click', () => dialog.close());

  const frame = document.createElement('div');
  frame.className = 'video-modal-frame';

  dialog.append(close, frame);

  // A click on the backdrop lands on the dialog element itself.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    frame.replaceChildren();
    if (opener && opener.isConnected) opener.focus();
    opener = null;
  });

  document.body.append(dialog);
  return dialog;
}

/**
 * Opens the video modal for a YouTube URL.
 * @param {string} href YouTube URL
 * @param {object} [options]
 * @param {string} [options.title] Accessible title for the player
 * @param {Element} [options.trigger] Element to return focus to on close
 * @returns {boolean} false when the URL is not a YouTube video
 */
export function openVideoModal(href, { title = 'Video', trigger } = {}) {
  const id = getYouTubeId(href);
  if (!id) return false;

  const modal = getDialog();
  const frame = modal.querySelector('.video-modal-frame');

  const params = new URLSearchParams({ autoplay: '1', rel: '0', playsinline: '1' });
  const start = getStart(href);
  if (start) params.set('start', String(start));

  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${params}`;
  iframe.title = title;
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';

  frame.replaceChildren(iframe);
  modal.setAttribute('aria-label', title);
  opener = trigger || document.activeElement;
  if (!modal.open) modal.showModal();
  modal.querySelector('.video-modal-close').focus();
  return true;
}

/**
 * Makes a link to a YouTube video open in the modal instead of navigating.
 * The link keeps its href for no-JS, new-tab and middle-click use.
 * @param {HTMLAnchorElement} link
 * @param {string} [title] Accessible title for the player
 * @returns {boolean} true when the link is a YouTube video and was bound
 */
export function bindVideoLink(link, title) {
  if (!link || !getYouTubeId(link.href)) return false;
  loadStyles();
  const label = (title || link.getAttribute('aria-label') || link.textContent || '').trim() || 'Video';
  link.setAttribute('aria-haspopup', 'dialog');
  link.addEventListener('click', (e) => {
    const modified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
    if (e.defaultPrevented || e.button !== 0 || modified) return;
    if (openVideoModal(link.href, { title: label, trigger: link })) e.preventDefault();
  });
  return true;
}
