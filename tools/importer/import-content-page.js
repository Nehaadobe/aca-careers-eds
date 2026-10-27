/* eslint-disable */
/* global WebImporter */

import heroPageParser from './parsers/hero-page.js';
import storyListingParser from './parsers/story-listing.js';
import blueshieldcaCleanupTransformer from './transformers/blueshieldca-cleanup.js';
import blueshieldcaArticleTransformer from './transformers/blueshieldca-article.js';
import blueshieldcaSectionsTransformer from './transformers/blueshieldca-sections.js';
import blockOptionsTransformer from './transformers/block-options.js';

const PAGE_TEMPLATE = {
  "name": "content-page",
  "description": "Content page: page header (with or without hero image) and body — the Our People story listing with search, Role/Topic filters, sort and pagination, the authors index, and text-only pages",
  "urls": [
    "https://careers.blueshieldca.com/blog",
    "https://careers.blueshieldca.com/blog/authors",
    "https://careers.blueshieldca.com/why-relocate"
  ],
  "representativeUrl": "https://careers.blueshieldca.com/blog",
  "urlPattern": "/*",
  "blocks": [
    {
      "name": "hero-page",
      "instances": [
        "#site_content > div.page > div.page-header",
        "div.page-header"
      ]
    },
    {
      "name": "story-listing",
      "instances": [
        "#site_content .page-body > div.container:has(form.indexFilter)",
        ".page-body > div.container:has(form.indexFilter)"
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
      "name": "our-people-story-listing",
      "selector": [
        "#site_content > div.page > div.page-body > div.container"
      ],
      "style": null,
      "blocks": [
        "story-listing"
      ],
      "defaultContent": []
    },
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

const parsers = {
  'hero-page': heroPageParser,
  'story-listing': storyListingParser,
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
