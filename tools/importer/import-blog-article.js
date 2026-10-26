/* eslint-disable */
/* global WebImporter */


import blueshieldcaCleanupTransformer from './transformers/blueshieldca-cleanup.js';
import blueshieldcaArticleTransformer from './transformers/blueshieldca-article.js';
import blueshieldcaSectionsTransformer from './transformers/blueshieldca-sections.js';
import blockOptionsTransformer from './transformers/block-options.js';

const PAGE_TEMPLATE = {
  "name": "blog-article",
  "description": "Our People story: article header (Role/Topic categories, title, date, authors, optional hero image), social share, rich-text body with inline captioned images, YouTube embeds and galleries, and a More Stories related-cards row",
  "urls": [
    "https://careers.blueshieldca.com/blog/reflections-from-our-2026-interns",
    "https://careers.blueshieldca.com/blog/perseverance-in-motion",
    "https://careers.blueshieldca.com/blog/the-power-of-giving-back-shayok-dutta-s-inspiring-volunteer-journey",
    "https://careers.blueshieldca.com/blog/my-sabbatical-stories-of-joy-and-inspiration-from-around-the-world",
    "https://careers.blueshieldca.com/blog/reflections-from-our-2025-interns",
    "https://careers.blueshieldca.com/blog/empowered-to-succeed-moises-bandas-leadership-and-development-journey-6910203",
    "https://careers.blueshieldca.com/blog/customer-service-spotlight-mal-madrigal-medicare-advantage",
    "https://careers.blueshieldca.com/blog/blue-shield-of-california-internship-program-2024",
    "https://careers.blueshieldca.com/blog/life-at-blue-shield",
    "https://careers.blueshieldca.com/blog/embracing-sabbatical-bliss-personal-journeys-of-refreshment-and-renewal",
    "https://careers.blueshieldca.com/blog/how-sarah-miller-is-nurturing-her-passion-for-healing-communities",
    "https://careers.blueshieldca.com/blog/advancing-through-leadership-and-beyond-with-apa-co-chairs-sree-iyyanki-and-tony-hsieh",
    "https://careers.blueshieldca.com/blog/jack-zhang-embracing-storytelling-and-belonging-at-blue-shield",
    "https://careers.blueshieldca.com/blog/how-two-bluesky-leaders-are-championing-mental-health-access-awareness-and-advocacy-for-californias-youth",
    "https://careers.blueshieldca.com/blog/beyond-the-bedside-how-two-nurses-thrive-at-blue-shield",
    "https://careers.blueshieldca.com/blog/eva-durazo-championing-health-equity-at-blue-shield-of-california",
    "https://careers.blueshieldca.com/blog/blue-goes-greener-a-conversation-with-baylis-beard-blue-shields-new-director-of-sustainability",
    "https://careers.blueshieldca.com/blog/our-people-our-stories-bridget-cordova",
    "https://careers.blueshieldca.com/blog/empowering-purposeful-change-in-the-workplace-insights-from-our-elevating-women-co-chairs",
    "https://careers.blueshieldca.com/blog/sabbatical-stories-our-people-share-tales-of-family-bonds-new-beginnings-and-safari-thrills",
    "https://careers.blueshieldca.com/blog/a-day-in-the-life-of-a-blue-shield-actuarial-analyst",
    "https://careers.blueshieldca.com/blog/black-employee-network-celebrates-black-history-month-a-conversation-with-employee-resource-group-co-chairs-karena-bradshaw-and-chetera-watson"
  ],
  "representativeUrl": "https://careers.blueshieldca.com/blog/perseverance-in-motion",
  "urlPattern": "/blog/*",
  "blocks": [],
  "sections": [
    {
      "id": "s1",
      "name": "article",
      "selector": [
        "#site_content > div.article",
        "div.article"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "h1",
        ".article-hero img",
        ".article-body p",
        ".article-body ul",
        ".article-body ol",
        ".article-body h2",
        ".article-body h3",
        ".article-body img"
      ]
    },
    {
      "id": "s2",
      "name": "more-stories",
      "selector": [
        "#site_content > section.contentSection.blue_bottom"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    }
  ]
};

const parsers = {

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
