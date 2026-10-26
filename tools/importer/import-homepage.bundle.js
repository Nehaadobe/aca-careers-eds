/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-home.js
  function parse(element, { document }) {
    const cells = [];
    const img = element.querySelector(".hero-media img, .hero-media_item img, img");
    if (img) cells.push([img]);
    const content = [];
    const heading = element.querySelector(".hero-title, .hero-text h1, .hero-text h2, h1, h2");
    if (heading) {
      if (/^H[1-6]$/.test(heading.tagName)) {
        content.push(heading);
      } else {
        const h2 = document.createElement("h2");
        h2.textContent = heading.textContent.trim();
        content.push(h2);
      }
    }
    const ctas = element.querySelectorAll(".hero-action a[href]");
    ctas.forEach((a) => {
      const p = document.createElement("p");
      const link = document.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = a.textContent.replace(/\s+/g, " ").trim();
      p.append(link);
      content.push(p);
    });
    if (content.length) cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-home", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/gallery.js
  function isRealLink(href, document) {
    const value = (href || "").trim();
    if (!value || value.startsWith("#") || /^javascript:/i.test(value)) return false;
    try {
      const base = document.baseURI || document.location && document.location.href;
      if (!base || base === "about:blank") return true;
      const target = new URL(value, base);
      const page = new URL(base);
      const samePage = target.origin === page.origin && target.pathname.replace(/\/$/, "") === page.pathname.replace(/\/$/, "") && target.search === page.search;
      return !samePage;
    } catch (e) {
      return true;
    }
  }
  function parse2(element, { document }) {
    const cells = [];
    const items = element.querySelectorAll(".homegallery-item");
    items.forEach((item) => {
      const img = item.querySelector("img");
      if (!img) return;
      const cell = [img];
      const link = item.querySelector("a[href]");
      const href = link && link.getAttribute("href");
      if (isRealLink(href, document)) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = img.getAttribute("alt") || "View full size";
        p.append(a);
        cell.push(p);
      }
      cells.push([cell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "gallery", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature-links.js
  function parse3(element, { document }) {
    const cells = [];
    const items = element.querySelectorAll("article.homegallery_tiles-item");
    items.forEach((item) => {
      const body = [];
      const title = item.querySelector(".homegallery_tiles-title");
      if (title && title.textContent.trim()) {
        const h3 = document.createElement("h3");
        h3.textContent = title.textContent.replace(/\s+/g, " ").trim();
        body.push(h3);
      }
      const desc = item.querySelector(".homegallery_tiles-description");
      if (desc) {
        const text = desc.textContent.replace(/ /g, " ").replace(/\s+/g, " ").trim();
        if (text) {
          const p = document.createElement("p");
          p.textContent = text;
          body.push(p);
        }
      }
      const link = item.querySelector(".homegallery_tiles-link a[href]");
      if (link) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = link.textContent.replace(/\s+/g, " ").trim();
        p.append(a);
        body.push(p);
      }
      if (body.length) cells.push([body]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-feature-links", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote.js
  var VERIFICATION = /google-site-verification:\s*\S+/gi;
  function cleanText(text) {
    return (text || "").replace(VERIFICATION, "").replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }
  function parse4(element, { document }) {
    const cells = [];
    const img = element.querySelector(".bioTiles-photo img, figure img, img");
    if (img) {
      const alt = (img.getAttribute("alt") || "").replace(/<br\s*\/?>/gi, " ").replace(/^[\s—–-]+/, "").replace(/\s+/g, " ").trim();
      img.setAttribute("alt", alt);
      cells.push([img]);
    }
    const quote = element.querySelector(".bioTiles-quote");
    if (quote) {
      const clone = quote.cloneNode(true);
      clone.querySelectorAll("font, span").forEach((el) => {
        if (el.isConnected && /^google-site-verification:/i.test((el.textContent || "").trim())) {
          const font = el.closest("font");
          (font && clone.contains(font) ? font : el).remove();
        }
      });
      const text = cleanText(clone.textContent);
      if (text) {
        const p = document.createElement("p");
        p.textContent = text;
        cells.push([p]);
      }
    }
    const author = element.querySelector(".bioTiles-author");
    if (author) {
      const parts = author.innerHTML.split(/<br\s*\/?>/i).map((part) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = part;
        return cleanText(tmp.textContent);
      }).filter(Boolean);
      if (parts.length) {
        const p = document.createElement("p");
        parts.forEach((part, i) => {
          if (i) p.append(document.createElement("br"));
          p.append(document.createTextNode(part));
        });
        cells.push([p]);
      }
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "quote", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/banner-locations.js
  var FALLBACK_MAP_URL = "https://iprsoftwaremedia.com/399/files/20222/6232101eb3aed3445d5b7307_ca-map-locations/ca-map-locations_mid.png?v=f08cb4f4-e6a5-4c63-8300-a5d3c0aa5c19";
  function extractUrl(value) {
    if (!value) return "";
    const m = value.match(/url\(\s*(['"]?)(.*?)\1\s*\)/i);
    const url = m && m[2] ? m[2].replace(/&quot;|['"]/g, "").trim() : "";
    return url && url !== "none" ? url : "";
  }
  function findBackgroundUrl(element, document) {
    const candidates = [element, ...element.querySelectorAll('[style*="background"]')];
    for (const el of candidates) {
      const url = extractUrl(el.getAttribute("style")) || extractUrl(el.style && el.style.backgroundImage);
      if (url) return url;
    }
    try {
      const view = document.defaultView;
      if (view && view.getComputedStyle) {
        const url = extractUrl(view.getComputedStyle(element).backgroundImage);
        if (url) return url;
      }
    } catch (e) {
    }
    return FALLBACK_MAP_URL;
  }
  function parse5(element, { document }) {
    const cells = [];
    const bgUrl = findBackgroundUrl(element, document);
    if (bgUrl) {
      const img = document.createElement("img");
      img.src = bgUrl.trim();
      img.alt = "Map of Blue Shield of California office locations";
      cells.push([img]);
    }
    const content = [];
    const title = element.querySelector(".locations-title, h1, h2, h3");
    if (title) {
      const h2 = document.createElement("h2");
      h2.textContent = title.textContent.replace(/\s+/g, " ").trim();
      content.push(h2);
    }
    const body = element.querySelector(".locations-body");
    if (body) {
      const html = body.innerHTML.replace(/<\/?span[^>]*>/gi, "");
      html.split(/(?:\s*<br\s*\/?>\s*){2,}/i).forEach((chunk) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = chunk;
        const link = tmp.querySelector("a[href]");
        const text = tmp.textContent.replace(/ /g, " ").replace(/\s+/g, " ").trim();
        if (!text) return;
        const p = document.createElement("p");
        if (link && link.textContent.replace(/\s+/g, " ").trim() === text) {
          const a = document.createElement("a");
          a.href = link.getAttribute("href");
          a.textContent = text;
          p.append(a);
        } else {
          tmp.querySelectorAll("br").forEach((br) => br.remove());
          tmp.querySelectorAll("a").forEach((a) => a.removeAttribute("class"));
          p.innerHTML = tmp.innerHTML.replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
        }
        content.push(p);
      });
    }
    if (content.length) cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document, { name: "banner-locations", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/blueshieldca-cleanup.js
  var SOURCE_ORIGIN = "https://careers.blueshieldca.com";
  var ORACLE_HOST = "ecge.fa.us2.oraclecloud.com";
  var CHROME_SELECTORS = [
    "#site_header",
    "#site_footer",
    ".footer-feedback",
    "#poll",
    "#onetrust-consent-sdk",
    "#onetrust-banner-sdk",
    "#onetrust-pc-sdk",
    "#skip_link",
    "a#top",
    "#site > .overlay",
    "body > .overlay",
    ".alert-browser",
    "noscript",
    "script",
    "style",
    "link",
    "iframe.ot-text-resize"
  ];
  var TRACKING_ATTRS = /^(data-(ga|gtm|track|tracking|analytics|event|omniture|ot)|onclick|onload|onmouseover)/i;
  function getOrigin(payload) {
    try {
      if (payload && payload.url) return new URL(payload.url).origin;
    } catch (e) {
    }
    return SOURCE_ORIGIN;
  }
  function removeAll(root, selectors) {
    selectors.forEach((sel) => {
      root.querySelectorAll(sel).forEach((el) => el.remove());
    });
  }
  function removeTextNotices(root) {
    const pattern = /(please enable javascript|enable javascript|you are using an outdated browser)/i;
    root.querySelectorAll("p, div, span").forEach((el) => {
      if (el.children.length === 0 && pattern.test(el.textContent || "")) {
        const wrapper = el.closest(".alert") || el;
        wrapper.remove();
      }
    });
  }
  function removeSiteVerification(root) {
    root.querySelectorAll(".bioTiles-quote span, .bioTiles-quote font").forEach((el) => {
      if (!el.isConnected) return;
      const txt = (el.textContent || "").trim();
      if (/^google-site-verification:/i.test(txt)) {
        const font = el.closest("font");
        (font && font.closest(".bioTiles-quote") ? font : el).remove();
      }
    });
    root.querySelectorAll(".bioTiles-quote").forEach((quote) => {
      const doc = quote.ownerDocument;
      const walker = doc.createTreeWalker(
        quote,
        4
        /* NodeFilter.SHOW_TEXT */
      );
      const hits = [];
      let n = walker.nextNode();
      while (n) {
        if (/google-site-verification:\s*\S+/i.test(n.nodeValue)) hits.push(n);
        n = walker.nextNode();
      }
      hits.forEach((t) => {
        t.nodeValue = t.nodeValue.replace(/google-site-verification:\s*\S+/gi, "").trimEnd();
      });
    });
  }
  function cleanTrackingParams(root) {
    root.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
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
        if (isOracle && k === "utm_medium" && url.searchParams.get(key) === "jobshare") return;
        if (k.startsWith("utm_") || ["gclid", "fbclid", "mc_cid", "mc_eid", "_ga"].includes(k)) {
          url.searchParams.delete(key);
        }
      });
      const isAbsolute = /^[a-z][a-z0-9+.-]*:\/\//i.test(href) || href.startsWith("//");
      let out = isAbsolute ? url.href : `${url.pathname}${url.search}${url.hash}`;
      if (!url.search && out.endsWith("?")) out = out.slice(0, -1);
      a.setAttribute("href", out);
    });
  }
  function absolutizeMedia(root, origin) {
    root.querySelectorAll("img[src]").forEach((img) => {
      const src = img.getAttribute("src");
      if (!src || /^(data:|[a-z][a-z0-9+.-]*:\/\/)/i.test(src) || src.startsWith("./") || src.startsWith("../")) return;
      try {
        img.setAttribute("src", new URL(src, origin).href);
      } catch (e) {
      }
    });
    root.querySelectorAll('a[href*="/_gallery/get_file"]').forEach((a) => {
      try {
        a.setAttribute("href", new URL(a.getAttribute("href"), origin).href);
      } catch (e) {
      }
    });
  }
  var GET_FILE_IMAGES = {
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
    root.querySelectorAll('img[src*="get_file"]').forEach((img) => {
      try {
        const u = new URL(img.getAttribute("src"), origin);
        const target = GET_FILE_IMAGES[u.searchParams.get("file_id")];
        if (target) img.setAttribute("src", target);
      } catch (e) {
      }
    });
  }
  var COMMENT_MARKER = /\s*\[[A-Z]{1,3}\d{1,3}\]\s*(?=[,.;:!?])|\[[A-Z]{1,3}\d{1,3}\]/g;
  function removeCommentMarkers(root) {
    const doc = root.ownerDocument;
    const walker = doc.createTreeWalker(
      root,
      4
      /* NodeFilter.SHOW_TEXT */
    );
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      if (COMMENT_MARKER.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(COMMENT_MARKER, "");
      COMMENT_MARKER.lastIndex = 0;
    });
    doc.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"], meta[property="twitter:description"]').forEach((m) => {
      const v = m.getAttribute("content");
      if (v && /\[[A-Z]{1,3}\d{1,3}\]/.test(v)) m.setAttribute("content", v.replace(COMMENT_MARKER, ""));
    });
  }
  function stripTrackingAttrs(root) {
    root.querySelectorAll("*").forEach((el) => {
      [...el.attributes].forEach((attr) => {
        if (TRACKING_ATTRS.test(attr.name)) el.removeAttribute(attr.name);
      });
    });
  }
  function removeEmptyWrappers(root) {
    root.querySelectorAll("div, span, font").forEach((el) => {
      if (!el.isConnected) return;
      if (el.closest("table")) return;
      if (el.querySelector("img, picture, video, iframe, table, hr, a, input, svg")) return;
      if ((el.textContent || "").trim() !== "") return;
      el.remove();
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      removeAll(element, CHROME_SELECTORS);
      removeTextNotices(element);
      removeSiteVerification(element);
      removeCommentMarkers(element);
    }
    if (hookName === "afterTransform") {
      removeAll(element, CHROME_SELECTORS);
      cleanTrackingParams(element);
      absolutizeMedia(element, getOrigin(payload));
      resolveGetFileImages(element, getOrigin(payload));
      stripTrackingAttrs(element);
      removeEmptyWrappers(element);
    }
  }

  // tools/importer/transformers/blueshieldca-article.js
  var TEMPLATE = "blog-article";
  var ROLES = [
    "Commercial Markets",
    "Consumer Markets",
    "Customer Experience",
    "Finance",
    "Foundation",
    "Health Solutions",
    "Information Technology",
    "Innovation",
    "Law",
    "Marketing",
    "Medi-Cal",
    "Operations",
    "People and Engagement",
    "Promise Medical Clinics",
    "Transformation"
  ];
  var TOPICS = [
    "Awards and Recognition",
    "Blue Shield Foundation",
    "Corporate Citizenship",
    "Culture of Belonging",
    "Employee Resource Groups",
    "Growth and Development",
    "Growth and Development Programs",
    "Life at Blue Shield"
  ];
  var clean = (s) => (s || "").replace(/[\s ​]+/g, " ").trim();
  function isoDate(text) {
    const d = new Date(clean(text));
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  function heroSource(img, doc) {
    const src = img.getAttribute("src") || "";
    const og = doc.querySelector('meta[property="og:image"]');
    const ogSrc = og && og.getAttribute("content");
    if (!ogSrc) return src;
    const stem = (u) => {
      try {
        const p = new URL(u, "https://careers.blueshieldca.com").pathname;
        return p.slice(0, p.lastIndexOf("/"));
      } catch (e) {
        return "";
      }
    };
    return stem(src) && stem(src) === stem(ogSrc) ? ogSrc : src;
  }
  function collectMetadata(article, extra) {
    extra.Template = TEMPLATE;
    const cats = [...article.querySelectorAll(".article-categories a")].map((a) => clean(a.textContent)).filter(Boolean);
    const roles = cats.filter((c) => ROLES.includes(c));
    const topics = cats.filter((c) => TOPICS.includes(c));
    if (roles.length) extra.Role = roles.join(", ");
    if (topics.length) extra.Topic = topics.join(", ");
    const date = isoDate(article.querySelector(".article-date") && article.querySelector(".article-date").textContent);
    if (date) extra["Publication Date"] = date;
    const authors = [...article.querySelectorAll(".article-authors .author")].map((a) => ({ name: clean(a.querySelector(".author-title") && a.querySelector(".author-title").textContent), title: clean(a.querySelector(".author-position") && a.querySelector(".author-position").textContent) })).filter((a) => a.name);
    if (authors.length) {
      extra.Author = authors.map((a) => a.name).join(", ");
      const titles = authors.map((a) => a.title).filter(Boolean);
      if (titles.length) extra["Author Title"] = titles.join("; ");
    }
  }
  function heroVideoBlock(figure, doc, title) {
    const video = figure.querySelector("video");
    if (!video) return null;
    const source = video.querySelector("source[src]");
    const src = source && source.getAttribute("src") || video.getAttribute("src");
    if (!src) return null;
    const cells = [];
    const poster = video.getAttribute("poster");
    if (poster) {
      const img = doc.createElement("img");
      img.setAttribute("src", poster);
      img.setAttribute("alt", title || "");
      cells.push([img]);
    }
    const a = doc.createElement("a");
    a.setAttribute("href", src);
    a.textContent = src;
    cells.push([a]);
    return WebImporter.Blocks.createBlock(doc, { name: "Embed", variants: ["video"], cells });
  }
  function rebuildHeader(article, doc) {
    const container = article.querySelector(":scope > .container");
    const titleEl = article.querySelector(".article-title");
    const root = article.closest("#site_content") || article.parentElement || article;
    const heroFigure = article.querySelector(":scope > figure.article-hero") || root.querySelector("figure.article-hero");
    const heroImg = heroFigure && !heroFigure.querySelector("video") && heroFigure.querySelector("img");
    const frag = doc.createDocumentFragment();
    if (titleEl) {
      const h1 = doc.createElement("h1");
      h1.textContent = clean(titleEl.textContent);
      frag.append(h1);
    }
    const videoBlock = heroFigure ? heroVideoBlock(heroFigure, doc, titleEl ? clean(titleEl.textContent) : "") : null;
    if (videoBlock) frag.append(videoBlock);
    if (heroImg) {
      const img = doc.createElement("img");
      img.setAttribute("src", heroSource(heroImg, doc));
      img.setAttribute("alt", clean(heroImg.getAttribute("alt")) || (titleEl ? clean(titleEl.textContent) : ""));
      const p = doc.createElement("p");
      p.append(img);
      frag.append(p);
    }
    if (container) container.replaceWith(frag);
    else article.prepend(frag);
    if (heroFigure) heroFigure.remove();
  }
  function splitParagraphs(body, doc) {
    body.querySelectorAll("p").forEach((p) => {
      if (!p.querySelector("br")) return;
      const html = p.innerHTML;
      const parts = html.split(/(?:<br\s*\/?>\s*(?:&nbsp;| |\s)*){2,}/i).map((s) => s.trim()).filter((s) => s.replace(/<[^>]+>|&nbsp;|\s/g, "") !== "" || /<img/i.test(s));
      if (parts.length < 2) return;
      const nodes = parts.map((part) => {
        const np = doc.createElement("p");
        if (p.className) np.className = p.className;
        np.innerHTML = part;
        return np;
      });
      p.replaceWith(...nodes);
    });
  }
  function captionedImages(body, doc) {
    body.querySelectorAll(".textImage").forEach((box) => {
      const img = box.querySelector("img");
      if (!img) {
        box.remove();
        return;
      }
      const out = [];
      const ip = doc.createElement("p");
      const ni = doc.createElement("img");
      ni.setAttribute("src", img.getAttribute("src"));
      ni.setAttribute("alt", clean(img.getAttribute("alt")) || clean(img.getAttribute("title")));
      ip.append(ni);
      out.push(ip);
      const cap = box.querySelector(".textImage-captionBody");
      if (cap && clean(cap.textContent)) {
        const cp = doc.createElement("p");
        const em = doc.createElement("em");
        em.textContent = clean(cap.textContent);
        cp.append(em);
        out.push(cp);
      }
      const host = box.closest("p");
      if (host && host !== box) {
        box.remove();
        host.before(...out);
      } else {
        box.replaceWith(...out);
      }
    });
  }
  function calloutTables(body, doc) {
    body.querySelectorAll("table").forEach((table) => {
      if (table.closest("table") !== table) return;
      const cells = [...table.querySelectorAll(":scope > tbody > tr, :scope > tr")].map((tr) => [...tr.children].map((td) => {
        const div = doc.createElement("div");
        div.innerHTML = td.innerHTML;
        return div;
      }));
      if (!cells.length) return;
      const block = WebImporter.Blocks.createBlock(doc, { name: "Table", cells });
      table.replaceWith(block);
    });
  }
  function transform2(hookName, element, payload) {
    if (!payload || !payload.template || payload.template.name !== TEMPLATE) return;
    const doc = element.ownerDocument || payload.document;
    if (hookName !== "beforeTransform") return;
    const article = element.querySelector("#site_content .article") || element.querySelector(".article");
    if (!article) return;
    if (payload.extraMetadata) collectMetadata(article, payload.extraMetadata);
    const body = article.querySelector(".article-body") || article;
    splitParagraphs(body, doc);
    captionedImages(body, doc);
    calloutTables(body, doc);
    rebuildHeader(article, doc);
    element.querySelectorAll(".article-share, .content-share, section.contentSection.blue_bottom").forEach((el) => el.remove());
  }

  // tools/importer/transformers/blueshieldca-sections.js
  var MARKER = "data-excat-section-id";
  function findSectionElement(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (let i = 0; i < selectors.length; i += 1) {
      const sel = selectors[i];
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function findMarker(root, id) {
    return root.querySelector(`hr[${MARKER}="${id}"]`);
  }
  var AUTO_TEMPLATES = ["landing", "content-page"];
  var AUTO_STYLE_RULES = [
    { style: "light-blue", match: ".simplebox" },
    // only a centered contentSection that actually has a title is centered (the class alone is not enough)
    { style: "centered", match: ".contentSection__centerTitle .contentSection-title, .simplebox.align-center, .page-narrowContent" },
    { style: "blue", match: ".contentSection_blue, .ipr_textBanner" }
  ];
  function hasContent(el) {
    return el.textContent.trim().length > 0 || !!el.querySelector("img, picture, iframe, video, a[href]");
  }
  function isBlockInstance(el, template) {
    const sels = (template && template.blocks || []).flatMap((b) => b.instances || []);
    return sels.some((sel) => {
      try {
        return el.matches(sel);
      } catch (e) {
        return false;
      }
    });
  }
  function autoSections(root, template) {
    const page = root.querySelector("#site_content > div.page") || root.querySelector("div.page");
    if (!page) return [];
    const list = [];
    const header = page.querySelector(":scope > div.page-header");
    if (header) list.push({ el: header, style: null });
    const body = page.querySelector(":scope > div.page-body");
    if (body) {
      const bands = [];
      [...body.children].filter(hasContent).forEach((el) => {
        const kids = [...el.children].filter(hasContent);
        if (el.matches("div.container") && kids.length > 1 && !isBlockInstance(el, template)) bands.push(...kids);
        else bands.push(el);
      });
      bands.forEach((el) => {
        const styles = AUTO_STYLE_RULES.filter((r) => el.matches(r.match) || el.querySelector(r.match)).map((r) => r.style);
        list.push({ el, style: styles.length ? styles.join(", ") : null });
      });
    }
    return list;
  }
  function transformAuto(hookName, element, doc, template) {
    if (hookName === "beforeTransform") {
      const list = autoSections(element, template);
      list.forEach(({ el, style }, i) => {
        if (i === 0 && !style) return;
        const hr = doc.createElement("hr");
        if (style) {
          hr.setAttribute(MARKER, `auto-${i}`);
          hr.setAttribute("data-excat-style", style);
        }
        if (i === 0) hr.setAttribute("data-excat-first-section", "true");
        el.before(hr);
      });
    }
    if (hookName === "afterTransform") {
      element.querySelectorAll(`hr[${MARKER}^="auto-"]`).forEach((marker) => {
        const meta = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: marker.getAttribute("data-excat-style") }
        });
        let cursor = marker.nextElementSibling;
        let last = marker;
        while (cursor && cursor.tagName !== "HR") {
          last = cursor;
          cursor = cursor.nextElementSibling;
        }
        last.after(meta);
        marker.removeAttribute(MARKER);
        marker.removeAttribute("data-excat-style");
      });
      element.querySelectorAll("hr[data-excat-first-section]").forEach((hr) => hr.remove());
    }
  }
  function transform3(hookName, element, payload) {
    const doc = element.ownerDocument || payload.document;
    const templateName = payload && payload.template && payload.template.name;
    if (AUTO_TEMPLATES.includes(templateName)) {
      transformAuto(hookName, element, doc, payload.template);
      return;
    }
    const sections = payload && payload.template && payload.template.sections;
    if (!Array.isArray(sections) || sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSectionElement(element, section);
        if (!el) continue;
        const styled = !!section.style;
        if (i === 0 && !styled) continue;
        const hr = doc.createElement("hr");
        if (styled) hr.setAttribute(MARKER, section.id);
        if (i === 0) hr.setAttribute("data-excat-first-section", "true");
        el.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const meta = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        const el = findSectionElement(element, section);
        const marker = findMarker(element, section.id);
        if (el) {
          el.after(meta);
        } else if (marker) {
          let cursor = marker.nextElementSibling;
          let last = marker;
          while (cursor && cursor.tagName !== "HR") {
            last = cursor;
            cursor = cursor.nextElementSibling;
          }
          last.after(meta);
        }
        if (marker) marker.removeAttribute(MARKER);
      }
      element.querySelectorAll("hr[data-excat-first-section]").forEach((hr) => hr.remove());
      element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => hr.removeAttribute(MARKER));
    }
  }

  // tools/importer/transformers/block-options.js
  var BLOCK_OPTIONS_MAP = {
    "hero-home": "Hero (home)",
    "cards-feature-links": "Cards (feature-links)",
    "banner-locations": "Banner (locations)",
    gallery: "Gallery",
    quote: "Quote",
    // landing template
    "hero-page": "Hero (page)",
    "cards-icon-tiles": "Cards (icon-tiles)",
    "cards-story-grid": "Cards (story-grid)",
    "cards-video-tiles": "Cards (video-tiles)",
    "banner-statement": "Banner (statement)",
    "banner-image-cta": "Banner (image-cta)",
    "columns-alternating": "Columns (alternating)",
    accordion: "Accordion",
    // content-page template
    "story-listing": "Story Listing"
  };
  function normalize(name) {
    return (name || "").toLowerCase().trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-");
  }
  function buildLookup(map) {
    return Object.keys(map).reduce((acc, key) => {
      if (key.startsWith("_")) return acc;
      acc[normalize(key)] = map[key];
      return acc;
    }, {});
  }
  function headerCell(table) {
    const firstRow = table.querySelector(":scope > thead > tr, :scope > tbody > tr, :scope > tr");
    if (!firstRow) return null;
    const cells = firstRow.querySelectorAll(":scope > th, :scope > td");
    return cells.length === 1 ? cells[0] : null;
  }
  function transform4(hookName, element, payload) {
    if (!transform4.BLOCK_OPTIONS_MAP) transform4.BLOCK_OPTIONS_MAP = BLOCK_OPTIONS_MAP;
    if (hookName === "afterTransform") {
      const lookup = buildLookup(__spreadValues(__spreadValues({}, BLOCK_OPTIONS_MAP), payload && payload.blockOptionsMap || {}));
      element.querySelectorAll("table").forEach((table) => {
        const cell = headerCell(table);
        if (!cell) return;
        const current = (cell.textContent || "").trim();
        const target = lookup[normalize(current)];
        if (!target || target === current) return;
        cell.textContent = target;
      });
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    "name": "homepage",
    "description": "Careers homepage: image hero with Find Your Next Role CTA, intro text, 3-up image gallery with feature link tiles, employee quote tiles, locations CTA band over a California map",
    "urls": [
      "https://careers.blueshieldca.com/"
    ],
    "representativeUrl": "https://careers.blueshieldca.com/",
    "urlPattern": "/",
    "blocks": [
      {
        "name": "hero-home",
        "instances": [
          "#site_content > div.hero",
          "div.hero"
        ]
      },
      {
        "name": "gallery",
        "instances": [
          "#site_content .homegallery",
          ".homegallery"
        ]
      },
      {
        "name": "cards-feature-links",
        "instances": [
          "#site_content .homegallery_tiles",
          ".homegallery_tiles"
        ]
      },
      {
        "name": "quote",
        "instances": [
          ".bioTiles .bioTiles-item",
          ".bioTiles-item"
        ]
      },
      {
        "name": "banner-locations",
        "instances": [
          "#site_content > section.locations",
          "section.locations"
        ]
      }
    ],
    "sections": [
      {
        "id": "rc1",
        "name": "hero",
        "selector": [
          "#site_content > div.hero",
          "div.hero"
        ],
        "style": null,
        "blocks": [
          "hero-home"
        ],
        "defaultContent": []
      },
      {
        "id": "rc2",
        "name": "intro-text",
        "selector": [
          "#site_content > div.page-body",
          "div.page-body"
        ],
        "style": "centered",
        "blocks": [],
        "defaultContent": [
          ".home-textSection h2",
          ".home-textSection p"
        ]
      },
      {
        "id": "rc3",
        "name": "gallery-with-feature-tiles",
        "selector": [
          "#site_content > div.homegallery_wrapper",
          "div.homegallery_wrapper"
        ],
        "style": null,
        "blocks": [
          "gallery",
          "cards-feature-links"
        ],
        "defaultContent": []
      },
      {
        "id": "rc4",
        "name": "why-work-with-us",
        "selector": [
          "#site_content > section.contentSection.contentSection__centerTitle",
          "section.contentSection__centerTitle"
        ],
        "style": "centered, two-up",
        "blocks": [
          "quote"
        ],
        "defaultContent": [
          ".contentSection-header .contentSection-title"
        ]
      },
      {
        "id": "rc5",
        "name": "locations-band",
        "selector": [
          "#site_content > section.locations",
          "section.locations"
        ],
        "style": null,
        "blocks": [
          "banner-locations"
        ],
        "defaultContent": []
      }
    ]
  };
  var parsers = {
    "hero-home": parse,
    "gallery": parse2,
    "cards-feature-links": parse3,
    "quote": parse4,
    "banner-locations": parse5
  };
  var transformers = [transform, transform2, transform3, transform4];
  var extraMetadata = {};
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE, extraMetadata });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      extraMetadata = {};
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      const meta = __spreadValues(__spreadValues({}, WebImporter.Blocks.getMetadata(document)), extraMetadata);
      if (Object.keys(meta).length > 0) main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
