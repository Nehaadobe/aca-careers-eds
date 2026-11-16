/* eslint-disable */
/* global WebImporter */

import heroCenteredParser from './parsers/hero-centered.js';
import blueshieldcaCleanupTransformer from './transformers/blueshieldca-cleanup.js';
import blueshieldcaArticleTransformer from './transformers/blueshieldca-article.js';
import stellarusPageTransformer from './transformers/stellarus-page.js';
import blueshieldcaSectionsTransformer from './transformers/blueshieldca-sections.js';
import blockOptionsTransformer from './transformers/block-options.js';

const PAGE_TEMPLATE = {
  "name": "stellarus-landing",
  "description": "Stellarus careers landing: dark space backdrop with a centered hero (eyebrow, H1, two paragraphs, primary and secondary CTAs)",
  "urls": [
    "https://www.stellarus.com/careers"
  ],
  "representativeUrl": "https://www.stellarus.com/careers",
  "urlPattern": "/careers",
  "targetPath": "/stellarus/careers",
  "blocks": [
    {
      "name": "hero-centered",
      "instances": [
        "main #careers",
        "#careers"
      ]
    }
  ],
  "sections": [
    {
      "id": "s1",
      "name": "careers-hero",
      "selector": [
        "main #careers",
        "#careers"
      ],
      "style": null,
      "blocks": [
        "hero-centered"
      ],
      "defaultContent": []
    }
  ]
};

const parsers = {
  'hero-centered': heroCenteredParser,
};

// Order matters: cleanup first; sections adds section breaks + Section Metadata;
// block-options renames variant tables to "Base (option)" after parsing.
const transformers = [blueshieldcaCleanupTransformer, blueshieldcaArticleTransformer, stellarusPageTransformer, blueshieldcaSectionsTransformer, blockOptionsTransformer];
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
    // targetPath (e.g. /stellarus/careers) places a page from another site in its brand folder
    const path = PAGE_TEMPLATE.targetPath || WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
