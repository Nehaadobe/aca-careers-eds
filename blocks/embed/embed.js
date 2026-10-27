import { getYouTubeId } from '../../scripts/video-modal.js';

/**
 * Embed block.
 *
 * Content: an optional poster image row, then a row with the media link.
 *
 * - Option `video` (or any direct .mp4 link): a native, responsive 16:9
 *   <video controls preload="none"> using the image as poster. MP4 files are
 *   served from the site's own media host, so they play without a consent gate.
 * - Otherwise a YouTube or Vimeo link renders a lazy facade (poster + play
 *   button). The third-party iframe (youtube-nocookie / Vimeo dnt) is only
 *   created on click, and only when consent has been granted through the
 *   project's consent check (scripts/consent-check.js sets
 *   `window.consentState` and dispatches `consent.update` with
 *   `detail.consented`). Without consent, a notice with a link to watch the
 *   video on the provider site is shown instead.
 * - Any other link is left as an ordinary link.
 */

let consented = Boolean(window.consentState?.consented);
window.addEventListener('consent.update', (event) => {
  consented = Boolean(event.detail?.consented);
});

function getVimeoId(href) {
  try {
    const url = new URL(href, window.location.href);
    if (!/(^|\.)vimeo\.com$/.test(url.hostname)) return null;
    const match = url.pathname.match(/\/(\d{5,})(?:\/|$)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function isMp4(href) {
  try {
    return /\.mp4$/i.test(new URL(href, window.location.href).pathname);
  } catch {
    return false;
  }
}

function getProvider(href) {
  const youtube = getYouTubeId(href);
  if (youtube) {
    return {
      name: 'YouTube',
      src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtube)}?autoplay=1&rel=0`,
    };
  }
  const vimeo = getVimeoId(href);
  if (vimeo) {
    return { name: 'Vimeo', src: `https://player.vimeo.com/video/${vimeo}?autoplay=1&dnt=1` };
  }
  return null;
}

function frame(...children) {
  const div = document.createElement('div');
  div.className = 'embed-frame';
  div.append(...children);
  return div;
}

function renderVideo(block, href, img, title) {
  const video = document.createElement('video');
  video.controls = true;
  video.preload = 'none';
  video.playsInline = true;
  if (img) video.poster = img.currentSrc || img.src;
  if (title) video.setAttribute('aria-label', title);
  const source = document.createElement('source');
  source.src = href;
  source.type = 'video/mp4';
  const fallback = document.createElement('a');
  fallback.href = href;
  fallback.textContent = 'Download the video';
  video.append(source, fallback);
  block.classList.add('embed-video');
  block.replaceChildren(frame(video));
}

function renderFacade(block, link, picture, provider, title) {
  const label = title || `${provider.name} video`;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'embed-play';
  button.setAttribute('aria-label', `Play video: ${label}`);

  const container = frame(...[picture, button].filter(Boolean));
  container.classList.add('embed-placeholder');
  block.classList.add(`embed-${provider.name.toLowerCase()}`);
  block.replaceChildren(container);

  button.addEventListener('click', () => {
    if (consented) {
      const iframe = document.createElement('iframe');
      iframe.src = provider.src;
      iframe.title = label;
      iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
      iframe.allowFullscreen = true;
      container.classList.remove('embed-placeholder');
      container.replaceChildren(iframe);
      block.querySelector('.embed-consent')?.remove();
      block.classList.add('embed-is-loaded');
      iframe.focus();
      return;
    }
    if (block.querySelector('.embed-consent')) return;
    const notice = document.createElement('p');
    notice.className = 'embed-consent';
    notice.setAttribute('role', 'status');
    const watch = document.createElement('a');
    watch.href = link;
    watch.target = '_blank';
    watch.rel = 'noopener noreferrer';
    watch.textContent = `watch it on ${provider.name}`;
    notice.append(
      `This video is hosted by ${provider.name}. Accept cookies to play it here, or `,
      watch,
      ' (opens in a new tab).',
    );
    block.append(notice);
    watch.focus();
  });
}

export default function decorate(block) {
  const links = [...block.querySelectorAll('a[href]')];
  const picture = block.querySelector('picture');
  const img = picture?.querySelector('img') || block.querySelector('img');
  const title = (img?.alt || '').trim();

  const mp4 = links.find((a) => isMp4(a.href));
  if (mp4 && (block.classList.contains('video') || !links.some((a) => getProvider(a.href)))) {
    renderVideo(block, mp4.href, img, title);
    return;
  }

  const providerLink = links.find((a) => getProvider(a.href));
  if (providerLink) {
    renderFacade(block, providerLink.href, picture, getProvider(providerLink.href), title);
  }
  // otherwise: leave the authored content (a plain link) in place
}
