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

  // tools/importer/import-text-page.js
  var import_text_page_exports = {};
  __export(import_text_page_exports, {
    default: () => import_text_page_default
  });

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
  var LEGACY_CATEGORIES = {
    28778: ["role", "Commercial Markets"],
    28786: ["role", "Consumer Markets"],
    28779: ["role", "Customer Experience"],
    28787: ["role", "Finance"],
    28780: ["role", "Foundation"],
    28788: ["role", "Health Solutions"],
    28781: ["role", "Information Technology"],
    28789: ["role", "Innovation"],
    28782: ["role", "Law"],
    28790: ["role", "Marketing"],
    28783: ["role", "Medi-Cal"],
    28784: ["role", "Operations"],
    28791: ["role", "People and Engagement"],
    28785: ["role", "Promise Medical Clinics"],
    28792: ["role", "Transformation"],
    29654: ["topic", "Awards and Recognition"],
    28798: ["topic", "Blue Shield Foundation"],
    29652: ["topic", "Corporate Citizenship"],
    28775: ["topic", "Culture of Belonging"],
    30058: ["topic", "Employee Resource Groups"],
    29653: ["topic", "Growth and Development"],
    28776: ["topic", "Growth and Development Programs"],
    28777: ["topic", "Life at Blue Shield"]
  };
  function rewriteCategoryLinks(root) {
    root.querySelectorAll('a[href*="?c="]').forEach((a) => {
      const href = a.getAttribute("href") || "";
      const m = href.match(/^(?:https?:\/\/careers\.blueshieldca\.com)?\/blog\/?\?(.*)$/);
      if (!m) return;
      const params = new URLSearchParams(m[1]);
      const out = new URLSearchParams();
      params.getAll("c").forEach((id) => {
        const cat = LEGACY_CATEGORIES[id];
        if (cat) out.set(cat[0], cat[1]);
      });
      if (params.get("q")) out.set("q", params.get("q"));
      const qs = out.toString();
      a.setAttribute("href", qs ? `/blog?${qs}` : "/blog");
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
      rewriteCategoryLinks(element);
      removeEmptyWrappers(element);
    }
  }

  // tools/importer/transformers/blueshieldca-article.js
  var TEMPLATE = "blog-article";
  var IMPORT_TEMPLATE = "story-article";
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
  function heroSource(img) {
    return img.getAttribute("src") || "";
  }
  function buttonLinks(article, doc) {
    article.querySelectorAll("a.btn").forEach((a) => {
      if (a.closest("strong, b")) return;
      const strong = doc.createElement("strong");
      a.replaceWith(strong);
      strong.append(a);
      const host = strong.parentElement;
      if (host && !["P", "LI", "TD", "DIV"].includes(host.tagName)) return;
      if (host && host.tagName === "DIV") {
        const p = doc.createElement("p");
        strong.replaceWith(p);
        p.append(strong);
      }
    });
  }
  function highlightBoxes(body, doc) {
    body.querySelectorAll(".simplebox").forEach((box) => {
      if (!box.textContent.trim()) return;
      const meta = WebImporter.Blocks.createBlock(doc, { name: "Section Metadata", cells: { style: "light-blue" } });
      box.before(doc.createElement("hr"));
      box.after(meta, doc.createElement("hr"));
    });
  }
  function collectMetadata(article, extra) {
    const root = article.closest("#site_content") || article.parentElement || article;
    const heroImg = root.querySelector("figure.article-hero img");
    if (heroImg && heroImg.getAttribute("src")) {
      const img = article.ownerDocument.createElement("img");
      img.setAttribute("src", heroImg.getAttribute("src"));
      img.setAttribute("alt", clean(heroImg.getAttribute("alt")));
      extra.Image = img;
    }
    extra.Template = TEMPLATE;
    const cats = [...article.querySelectorAll(".article-categories a")].map((a) => clean(a.textContent)).filter(Boolean);
    const roles = cats.filter((c) => ROLES.includes(c));
    const topics = cats.filter((c) => TOPICS.includes(c));
    if (roles.length) extra.Roles = roles.join(", ");
    if (topics.length) extra.Topics = topics.join(", ");
    const date = isoDate(article.querySelector(".article-date") && article.querySelector(".article-date").textContent);
    if (date) extra["Publication Date"] = date;
    const authors = [...article.querySelectorAll(".article-authors .author")].map((a) => {
      const photo = a.querySelector(".author-avatar, .author-photo img");
      return {
        name: clean(a.querySelector(".author-title") && a.querySelector(".author-title").textContent),
        title: clean(a.querySelector(".author-position") && a.querySelector(".author-position").textContent),
        photo: photo ? photo.getAttribute("src") : ""
      };
    }).filter((a) => a.name);
    if (authors.length) {
      extra.Author = authors.map((a) => a.name).join("; ");
      const titles = authors.map((a) => a.title).filter(Boolean);
      if (titles.length) extra["Author Title"] = titles.join("; ");
      const photos = authors.map((a) => a.photo).filter(Boolean);
      if (photos.length) extra["Author Image"] = photos.join("; ");
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
      img.setAttribute("src", heroSource(heroImg));
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
      let side = "";
      if (box.classList.contains("textImage-left")) side = "left";
      else if (box.classList.contains("textImage-right")) side = "right";
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
      if (side) {
        const block = WebImporter.Blocks.createBlock(doc, { name: "Image", variants: [side], cells: [[out]] });
        out.length = 0;
        out.push(block);
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
    if (!payload || !payload.template || payload.template.name !== IMPORT_TEMPLATE) return;
    const doc = element.ownerDocument || payload.document;
    if (hookName !== "beforeTransform") return;
    const article = element.querySelector("#site_content .article") || element.querySelector(".article");
    if (!article) return;
    if (payload.extraMetadata) collectMetadata(article, payload.extraMetadata);
    const root = article.closest("#site_content") || element;
    const body = article.querySelector(".article-body") || root.querySelector(".article-body") || article;
    body.querySelectorAll("iframe[src]").forEach((f) => {
      let src = f.getAttribute("src");
      if (src.startsWith("//")) src = `https:${src}`;
      if (!/youtube\.com|youtu\.be|vimeo\.com/.test(src)) return;
      const a = doc.createElement("a");
      a.setAttribute("href", src);
      a.textContent = src;
      const p = doc.createElement("p");
      p.append(a);
      const host = f.closest("p");
      if (host && host !== f) host.after(p);
      else f.before(p);
      f.remove();
    });
    splitParagraphs(body, doc);
    calloutTables(body, doc);
    captionedImages(body, doc);
    highlightBoxes(body, doc);
    buttonLinks(root, doc);
    rebuildHeader(article, doc);
    element.querySelectorAll(".article-share, .content-share").forEach((el) => el.remove());
  }

  // tools/importer/transformers/stellarus-page.js
  var IMPORT_TEMPLATE2 = "stellarus-landing";
  function transform3(hookName, element, payload) {
    if (!payload || !payload.template || payload.template.name !== IMPORT_TEMPLATE2) return;
    if (hookName !== "beforeTransform") return;
    element.querySelectorAll("nav, footer, #stl-mobile-drawer, .stl-orb, .stl-grain, script, noscript, style").forEach((el) => el.remove());
    const careers = element.querySelector("#careers");
    if (careers) {
      const main = careers.closest("main") || careers.parentElement;
      [...element.querySelectorAll("#root > div")].forEach((layer) => {
        if (!layer.contains(main)) layer.remove();
      });
      careers.querySelectorAll("svg").forEach((svg) => svg.remove());
    }
    if (payload.extraMetadata) {
      payload.extraMetadata.Theme = "stellarus";
    }
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
  var AUTO_TEMPLATES = ["section-landing", "text-page", "story-listing"];
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
  function transform4(hookName, element, payload) {
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
    "columns-curve": "Columns (curve)",
    // page header (formerly Hero (page))
    "cards-icon-tiles": "Cards (icon-tiles)",
    "cards-story-grid": "Cards (story-grid)",
    "cards-video-tiles": "Cards (video-tiles)",
    "banner-statement": "Banner (statement)",
    "banner-image-cta": "Banner (image-cta)",
    "columns-alternating": "Columns (alternating)",
    accordion: "Accordion",
    // content-page template
    "story-listing": "Story Listing",
    // stellarus-landing template
    "hero-centered": "Hero (centered)",
    "article-list": "Article List"
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
  function transform5(hookName, element, payload) {
    if (!transform5.BLOCK_OPTIONS_MAP) transform5.BLOCK_OPTIONS_MAP = BLOCK_OPTIONS_MAP;
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

  // tools/importer/import-text-page.js
  var PAGE_TEMPLATE = {
    "name": "text-page",
    "description": "Text page: title-only page header (no hero image) and rich-text body",
    "urls": [
      "https://careers.blueshieldca.com/why-relocate"
    ],
    "representativeUrl": "https://careers.blueshieldca.com/why-relocate",
    "urlPattern": "/why-relocate",
    "blocks": [],
    "sections": [
      {
        "id": "wr-s2",
        "name": "body-text",
        "selector": [
          "#site_content > div.page > div.page-body"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          ".page-body p",
          ".page-body ol",
          ".page-body ul"
        ]
      }
    ]
  };
  var parsers = {};
  var transformers = [transform, transform2, transform3, transform4, transform5];
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
  var import_text_page_default = {
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
      const path = PAGE_TEMPLATE.targetPath || WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_text_page_exports);
})();
