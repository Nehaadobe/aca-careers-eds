/* eslint-disable */
/* global WebImporter */

import articleListParser from './parsers/article-list.js';
import blueshieldcaCleanupTransformer from './transformers/blueshieldca-cleanup.js';
import blueshieldcaArticleTransformer from './transformers/blueshieldca-article.js';
import stellarusPageTransformer from './transformers/stellarus-page.js';
import blueshieldcaSectionsTransformer from './transformers/blueshieldca-sections.js';
import blockOptionsTransformer from './transformers/block-options.js';

const PAGE_TEMPLATE = {
  "name": "story-article",
  "description": "Our People story: article header (Role/Topic categories, title, date, authors, hero image or MP4 video), rich-text body with floated or centered captioned images, callout boxes, YouTube embeds, CTA, and a curated More Stories row (article-list)",
  "urls": [
    "https://careers.blueshieldca.com/blog/a-day-in-the-life-of-a-blue-shield-actuarial-analyst",
    "https://careers.blueshieldca.com/blog/a-great-place-to-do-meaningful-work",
    "https://careers.blueshieldca.com/blog/a-tribute-to-our-black-employee-network",
    "https://careers.blueshieldca.com/blog/a-tribute-to-our-employees-of-asian-and-pacific-islander-american-heritage",
    "https://careers.blueshieldca.com/blog/advancing-through-leadership-and-beyond-with-apa-co-chairs-sree-iyyanki-and-tony-hsieh",
    "https://careers.blueshieldca.com/blog/alvins-story-making-an-impact-while-helping-your-friends-and-family",
    "https://careers.blueshieldca.com/blog/an-inside-look-into-the-role-of-a-blue-shield-of-california-pharmacist",
    "https://careers.blueshieldca.com/blog/asian-american-and-pacific-islander-heritage-month",
    "https://careers.blueshieldca.com/blog/being-your-authentic-self-in-a-hybrid-work-environment-and-more-with-pride-co-chair-theo-retos",
    "https://careers.blueshieldca.com/blog/beyond-the-bedside-how-two-nurses-thrive-at-blue-shield",
    "https://careers.blueshieldca.com/blog/black-employee-network-celebrates-black-history-month-a-conversation-with-employee-resource-group-co-chairs-karena-bradshaw-and-chetera-watson",
    "https://careers.blueshieldca.com/blog/blue-goes-greener-a-conversation-with-baylis-beard-blue-shields-new-director-of-sustainability",
    "https://careers.blueshieldca.com/blog/blue-shield-of-california-internship-program-2024",
    "https://careers.blueshieldca.com/blog/blue-shield-of-california-internship-program-and-early-career-opportunities",
    "https://careers.blueshieldca.com/blog/celebrating-a-record-breaking-year-of-giving-back-in-2023",
    "https://careers.blueshieldca.com/blog/connecting-values-to-my-work",
    "https://careers.blueshieldca.com/blog/corporate-citizenship-award-recipient-mari-corbin",
    "https://careers.blueshieldca.com/blog/creating-more-breathing-space-for-our-people-to-rejuvenate",
    "https://careers.blueshieldca.com/blog/customer-service-spotlight-mal-madrigal-medicare-advantage",
    "https://careers.blueshieldca.com/blog/developing-future-leaders-from-high-school-on-up-blue-shield-partners-with-cristo-rey",
    "https://careers.blueshieldca.com/blog/dont-speak-for-me-speak-with-me",
    "https://careers.blueshieldca.com/blog/embracing-sabbatical-bliss-personal-journeys-of-refreshment-and-renewal",
    "https://careers.blueshieldca.com/blog/empowered-to-succeed-moises-bandas-leadership-and-development-journey-6910203",
    "https://careers.blueshieldca.com/blog/empowering-purposeful-change-in-the-workplace-insights-from-our-elevating-women-co-chairs",
    "https://careers.blueshieldca.com/blog/equal-pay-a-goal-were-committed-to-at-blue-shield",
    "https://careers.blueshieldca.com/blog/eva-durazo-championing-health-equity-at-blue-shield-of-california",
    "https://careers.blueshieldca.com/blog/find-your-passion-and-it-will-grow",
    "https://careers.blueshieldca.com/blog/finding-purpose-and-passion-at-work",
    "https://careers.blueshieldca.com/blog/from-kangaroo-encounters-to-lifesaving-endeavors-three-blue-shield-employees-share-their-sabbatical-adventures",
    "https://careers.blueshieldca.com/blog/from-linkedin-live-let-s-talk-career-opportunities-in-health-care",
    "https://careers.blueshieldca.com/blog/giving-back-to-our-community-ricquels-volunteer-story",
    "https://careers.blueshieldca.com/blog/health-and-environmental-sustainability",
    "https://careers.blueshieldca.com/blog/how-blue-shield-celebrated-employee-appreciation-week",
    "https://careers.blueshieldca.com/blog/how-blue-shield-elevates-and-supports-our-women-year-round",
    "https://careers.blueshieldca.com/blog/how-blue-shield-is-cultivating-a-mindset-of-gratitude",
    "https://careers.blueshieldca.com/blog/how-blue-shield-of-californias-mentorship-program-fosters-career-growth-and-development",
    "https://careers.blueshieldca.com/blog/how-kelly-aaron-uses-her-free-time-to-make-meaningful-change-for-others",
    "https://careers.blueshieldca.com/blog/how-one-nurse-is-transforming-health-care-without-wearing-scrubs-to-work",
    "https://careers.blueshieldca.com/blog/how-our-people-gave-back-to-their-beloved-communities-this-martin-luther-king-day",
    "https://careers.blueshieldca.com/blog/how-salina-wong-is-helping-reimagine-pharmacy-care-at-blue-shield-of-california",
    "https://careers.blueshieldca.com/blog/how-sarah-miller-is-nurturing-her-passion-for-healing-communities",
    "https://careers.blueshieldca.com/blog/how-three-blue-shield-employees-recharged-and-reconnected-on-sabbatical",
    "https://careers.blueshieldca.com/blog/how-two-bluesky-leaders-are-championing-mental-health-access-awareness-and-advocacy-for-californias-youth",
    "https://careers.blueshieldca.com/blog/how-working-at-blue-shield-improved-sheridans-health-and-wellbeing",
    "https://careers.blueshieldca.com/blog/inaugural-ready-to-lead-rosemarie-pham-leadership-excellence-award-presented-to-andre-mayberry",
    "https://careers.blueshieldca.com/blog/jack-zhang-embracing-storytelling-and-belonging-at-blue-shield",
    "https://careers.blueshieldca.com/blog/joining-the-it-organization-at-blue-shield-of-california-with-lisa-davis-senior-vice-president-chief-information-officer",
    "https://careers.blueshieldca.com/blog/jumpstart-your-health-care-career",
    "https://careers.blueshieldca.com/blog/lessons-and-advice-from-mentors-and-proteges-at-blue-shield-of-california",
    "https://careers.blueshieldca.com/blog/life-at-blue-shield",
    "https://careers.blueshieldca.com/blog/looking-back-on-a-year-of-giving-at-blue-shield",
    "https://careers.blueshieldca.com/blog/looking-for-your-next-tech-job",
    "https://careers.blueshieldca.com/blog/marias-story-aligning-values-working-with-blue-shield-of-california",
    "https://careers.blueshieldca.com/blog/mission-report-our-engaged-employees",
    "https://careers.blueshieldca.com/blog/mission-values-in-action-awards-our-highest-honor-6893914",
    "https://careers.blueshieldca.com/blog/my-perfect-destination-the-intersection-of-passion-and-profession",
    "https://careers.blueshieldca.com/blog/my-sabbatical-stories-of-joy-and-inspiration-from-around-the-world",
    "https://careers.blueshieldca.com/blog/our-people-our-stories-bridget-cordova",
    "https://careers.blueshieldca.com/blog/passion-respect-and-pride-honoring-our-people-of-hispanic-heritage-through-a-culture-of-celebrating-cultures",
    "https://careers.blueshieldca.com/blog/perseverance-in-motion",
    "https://careers.blueshieldca.com/blog/recruiting-and-mentoring-future-talent-actuarial-manager-joe-sabo-shares-advice-for-landing-a-role-at-blue-shield",
    "https://careers.blueshieldca.com/blog/reflections-from-our-2025-interns",
    "https://careers.blueshieldca.com/blog/reflections-from-our-2026-interns",
    "https://careers.blueshieldca.com/blog/releases-20221130-6884118",
    "https://careers.blueshieldca.com/blog/responding-to-covid-fatigue-our-people-need-more-support",
    "https://careers.blueshieldca.com/blog/sabbatical-stories-our-people-share-tales-of-family-bonds-new-beginnings-and-safari-thrills",
    "https://careers.blueshieldca.com/blog/supporting-our-future-leaders-blue-shields-internship-program",
    "https://careers.blueshieldca.com/blog/the-actuarial-study-program-supporting-the-career-growth-of-our-actuaries",
    "https://careers.blueshieldca.com/blog/the-best-leaders-make-themselves-available",
    "https://careers.blueshieldca.com/blog/the-power-of-giving-back-shayok-dutta-s-inspiring-volunteer-journey",
    "https://careers.blueshieldca.com/blog/to-the-call-and-beyond-a-blue-shield-salute-to-customer-experience",
    "https://careers.blueshieldca.com/blog/uplifting-communities-is-part-of-my-culture",
    "https://careers.blueshieldca.com/blog/veterans-bring-talent-and-loyalty-to-the-table",
    "https://careers.blueshieldca.com/blog/we-see-and-celebrate-y-for-you",
    "https://careers.blueshieldca.com/blog/what-we-stand-for-our-core-values-in-action",
    "https://careers.blueshieldca.com/blog/when-a-corporate-mission-becomes-deeply-personal"
  ],
  "representativeUrl": "https://careers.blueshieldca.com/blog/perseverance-in-motion",
  "urlPattern": "/blog/*",
  "blocks": [
    {
      "name": "article-list",
      "instances": [
        "#site_content > section.contentSection.blue_bottom .tiles",
        "section.contentSection.blue_bottom .tiles"
      ]
    }
  ],
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
        "#site_content > section.contentSection.blue_bottom",
        "section.contentSection.blue_bottom"
      ],
      "style": null,
      "blocks": [
        "article-list"
      ],
      "defaultContent": [
        ".contentSection-header .contentSection-title"
      ]
    }
  ]
};

const parsers = {
  'article-list': articleListParser,
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
