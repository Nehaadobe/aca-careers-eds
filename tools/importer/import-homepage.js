/* eslint-disable */
/* global WebImporter */

import heroHomeParser from './parsers/hero-home.js';
import galleryParser from './parsers/gallery.js';
import cardsFeatureLinksParser from './parsers/cards-feature-links.js';
import quoteParser from './parsers/quote.js';
import bannerLocationsParser from './parsers/banner-locations.js';
import blueshieldcaCleanupTransformer from './transformers/blueshieldca-cleanup.js';
import blueshieldcaArticleTransformer from './transformers/blueshieldca-article.js';
import blueshieldcaSectionsTransformer from './transformers/blueshieldca-sections.js';
import blockOptionsTransformer from './transformers/block-options.js';

const PAGE_TEMPLATE = {
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

const parsers = {
  'hero-home': heroHomeParser,
  'gallery': galleryParser,
  'cards-feature-links': cardsFeatureLinksParser,
  'quote': quoteParser,
  'banner-locations': bannerLocationsParser,
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
