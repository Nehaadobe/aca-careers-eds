/**
 * Share block: a "Share" label and LinkedIn, Facebook and X share links for
 * the current page. Auto-built inside the article-header on blog articles;
 * it can also be authored (an optional single cell overrides the label).
 *
 * The shared URL is the canonical URL (falling back to the page URL without
 * query or hash); the title is og:title, then the H1, then document.title.
 */

const NETWORKS = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    href: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    // source glyph: Font Awesome "linkedin" (square), 448 x 512 units
    width: 448,
    icon: '<path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/>',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    // source glyph: Font Awesome "facebook-f", 320 x 512 units
    width: 320,
    icon: '<path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 13.89-50.06 58.44-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 112.23v70.62H22.89V288h81.39v224h100.17V288z"/>',
  },
  {
    id: 'x',
    name: 'X',
    href: (url, title) => `https://x.com/intent/tweet?${new URLSearchParams({ url, text: title })}`,
    // source glyph: Font Awesome "twitter" bird, 512 x 512 units
    width: 512,
    icon: '<path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/>',
  },
];

function shareUrl() {
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  if (canonical) return canonical;
  const { origin, pathname } = window.location;
  return `${origin}${pathname}`;
}

function shareTitle() {
  const og = document.querySelector('meta[property="og:title"], meta[name="og:title"]')?.content;
  return (og || document.querySelector('main h1')?.textContent || document.title || '').trim();
}

export default function decorate(block) {
  const authored = block.textContent.trim();
  const url = shareUrl();
  const title = shareTitle();

  const label = document.createElement('p');
  label.className = 'share-label';
  label.id = `share-label-${Math.random().toString(36).slice(2, 8)}`;
  label.textContent = authored || 'Share';

  const list = document.createElement('ul');
  list.className = 'share-links';
  list.setAttribute('aria-labelledby', label.id);

  NETWORKS.forEach((network) => {
    const link = document.createElement('a');
    link.className = `share-link share-${network.id}`;
    link.href = network.href(url, title);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `Share on ${network.name} (opens in a new tab)`);
    // glyphs share a 512-unit em box, drawn at 1em (16px) like the source icon font
    link.innerHTML = `<svg class="share-icon" viewBox="0 0 ${network.width} 512" width="${network.width / 32}" height="16" aria-hidden="true" focusable="false" fill="currentColor">${network.icon}</svg>`;
    const li = document.createElement('li');
    li.append(link);
    list.append(li);
  });

  block.replaceChildren(label, list);
}
