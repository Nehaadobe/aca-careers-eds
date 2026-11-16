/* eslint-disable */
/* global WebImporter */

/**
 * Story article transformer for careers.blueshieldca.com ("story-article" import template only;
 * pages get Template metadata "blog-article", which the article-header auto-block and CSS use).
 *
 * The article header (categories, title, date, authors, hero) is rebuilt at runtime by the
 * article-header auto-block from page metadata, and the share bar and "More Stories" row are
 * generated at runtime, so this transformer:
 *
 * beforeTransform:
 *   - collects page metadata into payload.extraMetadata: Template, Roles, Topics,
 *     Publication Date (ISO yyyy-mm-dd), Author, Author Title, Author Image
 *   - replaces the article header with default content: H1 + full-size hero image (if any)
 *   - removes the share bar (the "More Stories" row is parsed into an article-list block)
 *   - splits paragraphs that the source joins with <br><br>
 *   - turns floated images (.textImage-left/-right) into Image (left|right) blocks and
 *     other captioned inline images (.textImage) into image + italic caption paragraph
 *   - wraps single-cell callout tables in a "Table" block
 *   - puts highlighted boxes (.simplebox) in a "light-blue" section
 */

const TEMPLATE = 'blog-article'; // page Template metadata
const IMPORT_TEMPLATE = 'story-article'; // page-templates.json name
const ROLES = ['Commercial Markets', 'Consumer Markets', 'Customer Experience', 'Finance', 'Foundation',
  'Health Solutions', 'Information Technology', 'Innovation', 'Law', 'Marketing', 'Medi-Cal', 'Operations',
  'People and Engagement', 'Promise Medical Clinics', 'Transformation'];
const TOPICS = ['Awards and Recognition', 'Blue Shield Foundation', 'Corporate Citizenship', 'Culture of Belonging',
  'Employee Resource Groups', 'Growth and Development', 'Growth and Development Programs', 'Life at Blue Shield'];

const clean = (s) => (s || '').replace(/[\s ​]+/g, ' ').trim();

function isoDate(text) {
  const d = new Date(clean(text));
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Use the rendition the source page displays (1200x630 "_thmb"). The og:image "_hero"
// rendition is a 3:1 crop of the same photo and frames differently in the 1200/630 hero box.
function heroSource(img) {
  return img.getAttribute('src') || '';
}

// Source button-styled links (a.btn, e.g. the closing "Find Your Next Role" pill) become
// bold links, which EDS decorates as primary buttons.
function buttonLinks(article, doc) {
  article.querySelectorAll('a.btn').forEach((a) => {
    if (a.closest('strong, b')) return;
    const strong = doc.createElement('strong');
    a.replaceWith(strong);
    strong.append(a);
    const host = strong.parentElement;
    if (host && !['P', 'LI', 'TD', 'DIV'].includes(host.tagName)) return;
    if (host && host.tagName === 'DIV') {
      const p = doc.createElement('p');
      strong.replaceWith(p);
      p.append(strong);
    }
  });
}

// highlighted boxes (.simplebox) become their own "light-blue" section, like on landing pages
function highlightBoxes(body, doc) {
  body.querySelectorAll('.simplebox').forEach((box) => {
    if (!box.textContent.trim()) return;
    const meta = WebImporter.Blocks.createBlock(doc, { name: 'Section Metadata', cells: { style: 'light-blue' } });
    box.before(doc.createElement('hr'));
    box.after(meta, doc.createElement('hr'));
  });
}

function collectMetadata(article, extra) {
  // page image = the 1200x630 "_thmb" rendition the source story cards and hero use
  // (og:image is a 3:1 "_hero" crop); feeds social sharing and the story cards
  const root = article.closest('#site_content') || article.parentElement || article;
  const heroImg = root.querySelector('figure.article-hero img');
  if (heroImg && heroImg.getAttribute('src')) {
    const img = article.ownerDocument.createElement('img');
    img.setAttribute('src', heroImg.getAttribute('src'));
    img.setAttribute('alt', clean(heroImg.getAttribute('alt')));
    extra.Image = img;
  }
  extra.Template = TEMPLATE;
  const cats = [...article.querySelectorAll('.article-categories a')].map((a) => clean(a.textContent)).filter(Boolean);
  const roles = cats.filter((c) => ROLES.includes(c));
  const topics = cats.filter((c) => TOPICS.includes(c));
  // Roles / Topics match the library options keys and the query-index columns.
  if (roles.length) extra.Roles = roles.join(', ');
  if (topics.length) extra.Topics = topics.join(', ');
  const date = isoDate(article.querySelector('.article-date') && article.querySelector('.article-date').textContent);
  if (date) extra['Publication Date'] = date;
  const authors = [...article.querySelectorAll('.article-authors .author')]
    .map((a) => {
      const photo = a.querySelector('.author-avatar, .author-photo img');
      return {
        name: clean(a.querySelector('.author-title') && a.querySelector('.author-title').textContent),
        title: clean(a.querySelector('.author-position') && a.querySelector('.author-position').textContent),
        photo: photo ? photo.getAttribute('src') : '',
      };
    })
    .filter((a) => a.name);
  if (authors.length) {
    // One entry per author, in order, semicolon-separated (names such as
    // "Jen Brenner, PMP" and titles contain commas).
    extra.Author = authors.map((a) => a.name).join('; ');
    const titles = authors.map((a) => a.title).filter(Boolean);
    if (titles.length) extra['Author Title'] = titles.join('; ');
    const photos = authors.map((a) => a.photo).filter(Boolean);
    if (photos.length) extra['Author Image'] = photos.join('; ');
  }
}

// hero video (figure.article-hero-video): poster image + MP4 link in an "Embed (video)" block
function heroVideoBlock(figure, doc, title) {
  const video = figure.querySelector('video');
  if (!video) return null;
  const source = video.querySelector('source[src]');
  const src = (source && source.getAttribute('src')) || video.getAttribute('src');
  if (!src) return null;
  const cells = [];
  const poster = video.getAttribute('poster');
  if (poster) {
    const img = doc.createElement('img');
    img.setAttribute('src', poster);
    img.setAttribute('alt', title || '');
    cells.push([img]);
  }
  const a = doc.createElement('a');
  a.setAttribute('href', src);
  a.textContent = src;
  cells.push([a]);
  return WebImporter.Blocks.createBlock(doc, { name: 'Embed', variants: ['video'], cells });
}

function rebuildHeader(article, doc) {
  const container = article.querySelector(':scope > .container');
  const titleEl = article.querySelector('.article-title');
  // the hero figure sits inside .article on some stories and beside it (in the page wrapper) on others
  const root = article.closest('#site_content') || article.parentElement || article;
  const heroFigure = article.querySelector(':scope > figure.article-hero') || root.querySelector('figure.article-hero');
  const heroImg = heroFigure && !heroFigure.querySelector('video') && heroFigure.querySelector('img');
  const frag = doc.createDocumentFragment();
  if (titleEl) {
    const h1 = doc.createElement('h1');
    h1.textContent = clean(titleEl.textContent);
    frag.append(h1);
  }
  const videoBlock = heroFigure ? heroVideoBlock(heroFigure, doc, titleEl ? clean(titleEl.textContent) : '') : null;
  if (videoBlock) frag.append(videoBlock);
  if (heroImg) {
    const img = doc.createElement('img');
    img.setAttribute('src', heroSource(heroImg));
    img.setAttribute('alt', clean(heroImg.getAttribute('alt')) || (titleEl ? clean(titleEl.textContent) : ''));
    const p = doc.createElement('p');
    p.append(img);
    frag.append(p);
  }
  if (container) container.replaceWith(frag);
  else article.prepend(frag);
  if (heroFigure) heroFigure.remove();
}

// "<p>a<br><br>b</p>" -> "<p>a</p><p>b</p>"
function splitParagraphs(body, doc) {
  body.querySelectorAll('p').forEach((p) => {
    if (!p.querySelector('br')) return;
    const html = p.innerHTML;
    const parts = html.split(/(?:<br\s*\/?>\s*(?:&nbsp;| |\s)*){2,}/i).map((s) => s.trim()).filter((s) => s.replace(/<[^>]+>|&nbsp;|\s/g, '') !== '' || /<img/i.test(s));
    if (parts.length < 2) return;
    const nodes = parts.map((part) => {
      const np = doc.createElement('p');
      if (p.className) np.className = p.className;
      np.innerHTML = part;
      return np;
    });
    p.replaceWith(...nodes);
  });
}

// floated images (.textImage-left / -right) become an "Image (left|right)" block with the
// caption inside; centered and inline images become default content + italic caption
function captionedImages(body, doc) {
  body.querySelectorAll('.textImage').forEach((box) => {
    const img = box.querySelector('img');
    if (!img) { box.remove(); return; }
    let side = '';
    if (box.classList.contains('textImage-left')) side = 'left';
    else if (box.classList.contains('textImage-right')) side = 'right';
    const out = [];
    const ip = doc.createElement('p');
    const ni = doc.createElement('img');
    ni.setAttribute('src', img.getAttribute('src'));
    ni.setAttribute('alt', clean(img.getAttribute('alt')) || clean(img.getAttribute('title')));
    ip.append(ni);
    out.push(ip);
    const cap = box.querySelector('.textImage-captionBody');
    if (cap && clean(cap.textContent)) {
      const cp = doc.createElement('p');
      const em = doc.createElement('em');
      em.textContent = clean(cap.textContent);
      cp.append(em);
      out.push(cp);
    }
    if (side) {
      const block = WebImporter.Blocks.createBlock(doc, { name: 'Image', variants: [side], cells: [[out]] });
      out.length = 0;
      out.push(block);
    }
    // an inline box inside a paragraph must not nest block content in <p>
    const host = box.closest('p');
    if (host && host !== box) {
      box.remove();
      host.before(...out);
    } else {
      box.replaceWith(...out);
    }
  });
}

function calloutTables(body, doc) {
  body.querySelectorAll('table').forEach((table) => {
    if (table.closest('table') !== table) return;
    const cells = [...table.querySelectorAll(':scope > tbody > tr, :scope > tr')].map((tr) => [...tr.children].map((td) => {
      const div = doc.createElement('div');
      div.innerHTML = td.innerHTML;
      return div;
    }));
    if (!cells.length) return;
    const block = WebImporter.Blocks.createBlock(doc, { name: 'Table', cells });
    table.replaceWith(block);
  });
}

export default function transform(hookName, element, payload) {
  if (!payload || !payload.template || payload.template.name !== IMPORT_TEMPLATE) return;
  const doc = element.ownerDocument || payload.document;
  if (hookName !== 'beforeTransform') return;
  const article = element.querySelector('#site_content .article') || element.querySelector('.article');
  if (!article) return;
  if (payload.extraMetadata) collectMetadata(article, payload.extraMetadata);
  // body first: calloutTables must only see source tables, not block tables created below
  // .article-body is inside .article on most stories and beside it on others
  const root = article.closest('#site_content') || element;
  const body = article.querySelector('.article-body') || root.querySelector('.article-body') || article;
  // protocol-relative embeds (//www.youtube.com/embed/...) would otherwise be dropped
  // video iframes become a plain link (auto-embedded at runtime); untitled iframes would
  // otherwise produce an empty link that the importer drops
  body.querySelectorAll('iframe[src]').forEach((f) => {
    let src = f.getAttribute('src');
    if (src.startsWith('//')) src = `https:${src}`;
    if (!/youtube\.com|youtu\.be|vimeo\.com/.test(src)) return;
    const a = doc.createElement('a');
    a.setAttribute('href', src);
    a.textContent = src;
    const p = doc.createElement('p');
    p.append(a);
    const host = f.closest('p');
    if (host && host !== f) host.after(p); else f.before(p);
    f.remove();
  });
  splitParagraphs(body, doc);
  calloutTables(body, doc); // before captionedImages, which creates Image block tables
  captionedImages(body, doc);
  highlightBoxes(body, doc);
  buttonLinks(root, doc);
  rebuildHeader(article, doc);
  // "More Stories" stays: the article-list parser turns its cards into the block.
  element.querySelectorAll('.article-share, .content-share').forEach((el) => el.remove());
}
