/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for careers.blueshieldca.com (iPR Software newsroom CMS).
 *
 * beforeTransform: removes site chrome and non-authorable widgets so they cannot
 *   be matched by block parsers, and strips stray verification text from quotes.
 * afterTransform: final cleanup - tracking query params, absolute image/gallery
 *   URLs, tracking attributes, leftover empty wrappers.
 *
 * Note: HTML comments are intentionally NOT removed in afterTransform.
 */

const SOURCE_ORIGIN = 'https://careers.blueshieldca.com';
const ORACLE_HOST = 'ecge.fa.us2.oraclecloud.com';

// Non-authorable chrome / widgets found in the captured DOM.
const CHROME_SELECTORS = [
  '#site_header',
  '#site_footer',
  '.footer-feedback',
  '#poll',
  '#onetrust-consent-sdk',
  '#onetrust-banner-sdk',
  '#onetrust-pc-sdk',
  '#skip_link',
  'a#top',
  '#site > .overlay',
  'body > .overlay',
  '.alert-browser',
  'noscript',
  'script',
  'style',
  'link',
  'iframe.ot-text-resize',
];

// Attributes used only for tracking/analytics.
const TRACKING_ATTRS = /^(data-(ga|gtm|track|tracking|analytics|event|omniture|ot)|onclick|onload|onmouseover)/i;

function getOrigin(payload) {
  try {
    if (payload && payload.url) return new URL(payload.url).origin;
  } catch (e) { /* ignore */ }
  return SOURCE_ORIGIN;
}

function removeAll(root, selectors) {
  selectors.forEach((sel) => {
    root.querySelectorAll(sel).forEach((el) => el.remove());
  });
}

function removeTextNotices(root) {
  // "enable javascript" / "outdated browser" notices that are not wrapped in a known class.
  const pattern = /(please enable javascript|enable javascript|you are using an outdated browser)/i;
  root.querySelectorAll('p, div, span').forEach((el) => {
    if (el.children.length === 0 && pattern.test(el.textContent || '')) {
      const wrapper = el.closest('.alert') || el;
      wrapper.remove();
    }
  });
}

function removeSiteVerification(root) {
  // Stray "google-site-verification: ..." text inside employee quotes.
  root.querySelectorAll('.bioTiles-quote span, .bioTiles-quote font').forEach((el) => {
    if (!el.isConnected) return;
    const txt = (el.textContent || '').trim();
    if (/^google-site-verification:/i.test(txt)) {
      const font = el.closest('font');
      (font && font.closest('.bioTiles-quote') ? font : el).remove();
    }
  });
  // Any remaining bare text node fragments.
  root.querySelectorAll('.bioTiles-quote').forEach((quote) => {
    const doc = quote.ownerDocument;
    const walker = doc.createTreeWalker(quote, 4 /* NodeFilter.SHOW_TEXT */);
    const hits = [];
    let n = walker.nextNode();
    while (n) {
      if (/google-site-verification:\s*\S+/i.test(n.nodeValue)) hits.push(n);
      n = walker.nextNode();
    }
    hits.forEach((t) => {
      t.nodeValue = t.nodeValue.replace(/google-site-verification:\s*\S+/gi, '').trimEnd();
    });
  });
}

function cleanTrackingParams(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || !/[?&](utm_[^=]+|gclid|fbclid|mc_cid|mc_eid|_ga)=/i.test(href)) return;
    let url;
    try {
      url = new URL(href, SOURCE_ORIGIN);
    } catch (e) {
      return;
    }
    const isOracle = url.hostname === ORACLE_HOST;
    [...url.searchParams.keys()].forEach((key) => {
      const k = key.toLowerCase();
      if (isOracle && k === 'utm_medium' && url.searchParams.get(key) === 'jobshare') return;
      if (k.startsWith('utm_') || ['gclid', 'fbclid', 'mc_cid', 'mc_eid', '_ga'].includes(k)) {
        url.searchParams.delete(key);
      }
    });
    const isAbsolute = /^[a-z][a-z0-9+.-]*:\/\//i.test(href) || href.startsWith('//');
    let out = isAbsolute ? url.href : `${url.pathname}${url.search}${url.hash}`;
    if (!url.search && out.endsWith('?')) out = out.slice(0, -1);
    a.setAttribute('href', out);
  });
}

function absolutizeMedia(root, origin) {
  // Keep absolute URLs for source images (iprsoftwaremedia.com, /media/...) so they can be re-hosted.
  root.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!src || /^(data:|[a-z][a-z0-9+.-]*:\/\/)/i.test(src) || src.startsWith('./') || src.startsWith('../')) return;
    try {
      img.setAttribute('src', new URL(src, origin).href);
    } catch (e) { /* ignore */ }
  });
  // Gallery full-size links (/_gallery/get_file/?file_id=...).
  root.querySelectorAll('a[href*="/_gallery/get_file"]').forEach((a) => {
    try {
      a.setAttribute('href', new URL(a.getAttribute('href'), origin).href);
    } catch (e) { /* ignore */ }
  });
}

// /_gallery/get_file/?file_id=... image URLs 302-redirect to the real file on iprsoftwaremedia.com.
// EDS image optimization rebuilds URLs from the path only (dropping file_id), so images must point
// at the final file. Resolved ahead of import for every in-scope page; unknown ids are left as-is.
const GET_FILE_IMAGES = {
  "622fb1acb3aed30a8db13c71": "https://iprsoftwaremedia.com/399/files/20222/icon-laptop.png",
  "6287c84bb3aed3559dde941c": "https://iprsoftwaremedia.com/399/files/20224/icon-youtube.png",
  "6287c699b3aed3559ade93eb": "https://iprsoftwaremedia.com/399/files/20224/icon-video.png",
  "622fb1aeb3aed30a8eb1442c": "https://iprsoftwaremedia.com/399/files/20222/icon-people.png",
  "622fb1b1b3aed30a89b12b6b": "https://iprsoftwaremedia.com/399/files/20234/Size48%204.png",
  "6287c7cab3aed3559bde93eb": "https://iprsoftwaremedia.com/399/files/20224/icon-id-card.png",
  "622fb1a0b3aed30a8eb14421": "https://iprsoftwaremedia.com/399/files/20222/icon-dollar.png",
  "622fb19db3aed30a7eb124a3": "https://iprsoftwaremedia.com/399/files/20222/icon-doctor.png",
  "622fb198b3aed30a8eb1441b": "https://iprsoftwaremedia.com/399/files/20222/icon-calendar.png",
  "6463fc69b3aed32850688ef6": "https://iprsoftwaremedia.com/399/files/20234/Size48%202.png",
  "622fb1a9b3aed30a8db13c6c": "https://iprsoftwaremedia.com/399/files/20222/icon-insurance-multiple.png",
  "622fb1b3b3aed30a8cb130d2": "https://iprsoftwaremedia.com/399/files/20234/Size48.png",
  "622fb19bb3aed30a83b12306": "https://iprsoftwaremedia.com/399/files/20234/Size48%205.png",
  "622fb1bbb3aed30a8eb14432": "https://iprsoftwaremedia.com/399/files/20222/icon-wellvolution.png",
  "622fb1b9b3aed30a89b12b70": "https://iprsoftwaremedia.com/399/files/20232/202303241543/icon-lotus.png",
  "622fb1a6b3aed30a84b12413": "https://iprsoftwaremedia.com/399/files/20222/icon-graduate.png",
  "622fb1a4b3aed30a8eb14426": "https://iprsoftwaremedia.com/399/files/20222/icon-flex-money.png",
  "622fb1b6b3aed30a8db13c77": "https://iprsoftwaremedia.com/399/files/20222/icon-trophy.png",
  "6463fe13b3aed329e768a548": "https://iprsoftwaremedia.com/399/files/20234/Size48%203.png"
};

function resolveGetFileImages(root, origin) {
  root.querySelectorAll("img[src*=\"get_file\"]").forEach((img) => {
    try {
      const u = new URL(img.getAttribute("src"), origin);
      const target = GET_FILE_IMAGES[u.searchParams.get("file_id")];
      if (target) img.setAttribute("src", target);
    } catch (e) { /* ignore */ }
  });
}

// Word review-comment anchors left in published copy, e.g. "Family of Companies[KB1] ,"
const COMMENT_MARKER = /\s*\[[A-Z]{1,3}\d{1,3}\]\s*(?=[,.;:!?])|\[[A-Z]{1,3}\d{1,3}\]/g;

function removeCommentMarkers(root) {
  const doc = root.ownerDocument;
  const walker = doc.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((n) => {
    if (COMMENT_MARKER.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(COMMENT_MARKER, '');
    COMMENT_MARKER.lastIndex = 0;
  });
  // the same marker can sit in the page description used for metadata
  doc.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"], meta[property="twitter:description"]').forEach((m) => {
    const v = m.getAttribute('content');
    if (v && /\[[A-Z]{1,3}\d{1,3}\]/.test(v)) m.setAttribute('content', v.replace(COMMENT_MARKER, ''));
  });
}

function stripTrackingAttrs(root) {
  root.querySelectorAll('*').forEach((el) => {
    [...el.attributes].forEach((attr) => {
      if (TRACKING_ATTRS.test(attr.name)) el.removeAttribute(attr.name);
    });
  });
}

function removeEmptyWrappers(root) {
  // Wrappers left empty after removing chrome (e.g. the anonymous div around #poll).
  root.querySelectorAll('div, span, font').forEach((el) => {
    if (!el.isConnected) return;
    if (el.closest('table')) return;
    if (el.querySelector('img, picture, video, iframe, table, hr, a, input, svg')) return;
    if ((el.textContent || '').trim() !== '') return;
    el.remove();
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    removeAll(element, CHROME_SELECTORS);
    removeTextNotices(element);
    removeSiteVerification(element);
    removeCommentMarkers(element);
  }

  if (hookName === 'afterTransform') {
    // Safety net in case any chrome survived parsing.
    removeAll(element, CHROME_SELECTORS);
    cleanTrackingParams(element);
    absolutizeMedia(element, getOrigin(payload));
    resolveGetFileImages(element, getOrigin(payload));
    stripTrackingAttrs(element);
    removeEmptyWrappers(element);
  }
}
