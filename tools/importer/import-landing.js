/* eslint-disable */
/* global WebImporter */

import heroPageParser from './parsers/hero-page.js';
import cardsIconTilesParser from './parsers/cards-icon-tiles.js';
import galleryParser from './parsers/gallery.js';
import bannerStatementParser from './parsers/banner-statement.js';
import columnsAlternatingParser from './parsers/columns-alternating.js';
import cardsStoryGridParser from './parsers/cards-story-grid.js';
import accordionParser from './parsers/accordion.js';
import cardsVideoTilesParser from './parsers/cards-video-tiles.js';
import bannerImageCtaParser from './parsers/banner-image-cta.js';
import blueshieldcaCleanupTransformer from './transformers/blueshieldca-cleanup.js';
import blueshieldcaArticleTransformer from './transformers/blueshieldca-article.js';
import blueshieldcaSectionsTransformer from './transformers/blueshieldca-sections.js';
import blockOptionsTransformer from './transformers/block-options.js';

const PAGE_TEMPLATE = {
  "name": "landing",
  "description": "Section landing page: page header (title, subtitle, hero image) followed by authored sections such as icon tiles, image galleries, text banner, alternating text/image rows, ERG logo cards, video tiles, promo banner and FAQ accordion",
  "urls": [
    "https://careers.blueshieldca.com/a-culture-of-belonging",
    "https://careers.blueshieldca.com/growth-development",
    "https://careers.blueshieldca.com/total-rewards",
    "https://careers.blueshieldca.com/how-to-get-hired",
    "https://careers.blueshieldca.com/life-at-blue-shield",
    "https://careers.blueshieldca.com/life-at-blue-shield/our-workplace-model",
    "https://careers.blueshieldca.com/events"
  ],
  "representativeUrl": "https://careers.blueshieldca.com/total-rewards",
  "urlPattern": "/*",
  "blocks": [
    {
      "name": "hero-page",
      "instances": [
        "#site_content > div.page > div.page-header:not(.no_hero)",
        ".page-header:not(.no_hero)"
      ]
    },
    {
      "name": "cards-icon-tiles",
      "instances": [
        "#site_content .tileIcons",
        ".tileIcons"
      ]
    },
    {
      "name": "gallery",
      "instances": [
        "#site_content .page-body > div.homegallery",
        ".page-body > div.homegallery",
        "#site_content .page-body > div.dei_cards .homegallery",
        ".dei_cards .homegallery"
      ]
    },
    {
      "name": "banner-statement",
      "instances": [
        "#site_content .page-body > section.ipr_textBanner",
        "section.ipr_textBanner"
      ]
    },
    {
      "name": "columns-alternating",
      "instances": [
        "#site_content .white_text .ipr_indexChess",
        ".ipr_indexChess",
        "#site_content .page-body .white_text .ipr_indexChess"
      ]
    },
    {
      "name": "cards-story-grid",
      "instances": [
        "#site_content .page-body section.contentSection .tiles",
        ".contentSection .tiles"
      ]
    },
    {
      "name": "accordion",
      "instances": [
        "#site_content .page-body .faq",
        ".faq"
      ]
    },
    {
      "name": "cards-video-tiles",
      "instances": [
        "#site_content .page-body .ipr_videoTiles",
        ".ipr_videoTiles"
      ]
    },
    {
      "name": "banner-image-cta",
      "instances": [
        "#site_content .page-body section.ipr_banner",
        "section.ipr_banner"
      ]
    }
  ],
  "sections": [
    {
      "id": "s1",
      "name": "page-header",
      "selector": [
        "#site_content > div.page > div.page-header",
        "div.page-header"
      ],
      "style": null,
      "blocks": [
        "hero-page"
      ],
      "defaultContent": []
    },
    {
      "id": "s2",
      "name": "our-promise-to-our-employees",
      "selector": [
        "#site_content > div.page > div.page-body > div.container:nth-of-type(1)"
      ],
      "style": "centered",
      "blocks": [
        "cards-icon-tiles"
      ],
      "defaultContent": [
        ".contentSection-header .contentSection-title"
      ]
    },
    {
      "id": "s3",
      "name": "image-gallery",
      "selector": [
        "#site_content > div.page > div.page-body > div.homegallery:nth-of-type(2)"
      ],
      "style": null,
      "blocks": [
        "gallery"
      ],
      "defaultContent": []
    },
    {
      "id": "s4",
      "name": "health-and-well-being",
      "selector": [
        "#site_content > div.page > div.page-body > div.container:nth-of-type(3)"
      ],
      "style": "centered",
      "blocks": [
        "cards-icon-tiles"
      ],
      "defaultContent": [
        ".contentSection-header .contentSection-title"
      ]
    },
    {
      "id": "s5",
      "name": "image-gallery-2",
      "selector": [
        "#site_content > div.page > div.page-body > div.homegallery:nth-of-type(4)"
      ],
      "style": null,
      "blocks": [
        "gallery"
      ],
      "defaultContent": []
    },
    {
      "id": "s6",
      "name": "career-growth-and-development",
      "selector": [
        "#site_content > div.page > div.page-body > div.container:nth-of-type(5)"
      ],
      "style": "centered",
      "blocks": [
        "cards-icon-tiles"
      ],
      "defaultContent": [
        ".contentSection-header .contentSection-title"
      ]
    },
    {
      "id": "gd-s2",
      "name": "mission-statement-banner",
      "selector": [
        "#site_content > div.page > div.page-body > section.ipr_textBanner"
      ],
      "style": "blue",
      "blocks": [
        "banner-statement"
      ],
      "defaultContent": []
    },
    {
      "id": "gd-s4",
      "name": "our-internship-program",
      "selector": [
        "#site_content > div.page > div.page-body > div.container > div.white_text"
      ],
      "style": "centered",
      "blocks": [
        "columns-alternating"
      ],
      "defaultContent": [
        ".contentSection-header .contentSection-title"
      ]
    },
    {
      "id": "gd-s5",
      "name": "growth-and-development-stories",
      "selector": [
        "#site_content > div.page > div.page-body > div.container > section.contentSection"
      ],
      "style": null,
      "blocks": [
        "cards-story-grid"
      ],
      "defaultContent": [
        ".contentSection-header .contentSection-title",
        ".contentSection-header a"
      ]
    },
    {
      "id": "cb-s2",
      "name": "erg-image-row",
      "selector": [
        "#site_content > div.page > div.page-body > div.dei_cards"
      ],
      "style": null,
      "blocks": [
        "gallery"
      ],
      "defaultContent": []
    },
    {
      "id": "cb-s3",
      "name": "our-employee-resource-groups",
      "selector": [
        "#site_content > div.page > div.page-body > div.container .page-narrowContent"
      ],
      "style": "centered",
      "blocks": [],
      "defaultContent": [
        ".page-narrowContent h2",
        ".page-narrowContent p",
        ".page-narrowContent .textImage img"
      ]
    },
    {
      "id": "hh-s2",
      "name": "we-want-you-to-succeed",
      "selector": [
        "#site_content > div.page > div.page-body section.tileIcons_widget"
      ],
      "style": "centered",
      "blocks": [
        "cards-icon-tiles"
      ],
      "defaultContent": [
        ".contentSection-header .contentSection-title",
        ".contentSection-header p"
      ]
    },
    {
      "id": "hh-s3",
      "name": "frequently-asked-questions",
      "selector": [
        "#site_content > div.page > div.page-body > div.container > div.container"
      ],
      "style": "centered",
      "blocks": [
        "accordion"
      ],
      "defaultContent": [
        ".contentSection-header .contentSection-title"
      ]
    },
    {
      "id": "lb-s2",
      "name": "our-mission-and-values",
      "selector": [
        "#site_content > div.page > div.page-body > div.container > div.simplebox"
      ],
      "style": "light-blue, centered",
      "blocks": [],
      "defaultContent": [
        ".simplebox h2",
        ".simplebox p"
      ]
    },
    {
      "id": "lb-s3",
      "name": "value-video-tiles",
      "selector": [
        "#site_content > div.page > div.page-body > div.container > div.ipr_videoTiles"
      ],
      "style": null,
      "blocks": [
        "cards-video-tiles"
      ],
      "defaultContent": []
    },
    {
      "id": "lb-s4",
      "name": "view-our-job-opportunities",
      "selector": [
        "#site_content > div.page > div.page-body > div.container > section.ipr_banner"
      ],
      "style": null,
      "blocks": [
        "banner-image-cta"
      ],
      "defaultContent": []
    },
    {
      "id": "wm-s2",
      "name": "connecting-with-purpose",
      "selector": [
        "#site_content > div.page > div.page-body > div.container:nth-of-type(2)"
      ],
      "style": null,
      "blocks": [
        "columns-alternating"
      ],
      "defaultContent": []
    }
  ]
};

const parsers = {
  'hero-page': heroPageParser,
  'cards-icon-tiles': cardsIconTilesParser,
  'gallery': galleryParser,
  'banner-statement': bannerStatementParser,
  'columns-alternating': columnsAlternatingParser,
  'cards-story-grid': cardsStoryGridParser,
  'accordion': accordionParser,
  'cards-video-tiles': cardsVideoTilesParser,
  'banner-image-cta': bannerImageCtaParser,
};

// Order matters: cleanup first; sections adds section breaks + Section Metadata;
// block-options renames variant tables to "Base (option)" after parsing.
const transformers = [blueshieldcaCleanupTransformer, blueshieldcaArticleTransformer, blueshieldcaSectionsTransformer, blockOptionsTransformer];

// Shared across hooks so transformers can contribute page metadata (e.g. Role, Topic, Author).
let extraMetadata = {};

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE, extraMetadata };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (seen.has(element)) return; // instances[] lists fallback selectors for the same element
        seen.add(element);
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    extraMetadata = {};
    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    // Same as WebImporter.rules.createMetadata, plus fields collected by transformers.
    const meta = { ...WebImporter.Blocks.getMetadata(document), ...extraMetadata };
    if (Object.keys(meta).length > 0) main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
