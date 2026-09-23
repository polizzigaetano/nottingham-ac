/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroCardDarkParser from './parsers/hero-card-dark.js';
import navAnchorLightParser from './parsers/nav-anchor-light.js';
import cardsPromoLightWithimg3Parser from './parsers/cards-promo-light-withimg-3.js';
import cardsNavLightParser from './parsers/cards-nav-light.js';
import cardsPromoLightParser from './parsers/cards-promo-light.js';
import columnsWithimgLightParser from './parsers/columns-withimg-light.js';
import cardsRankingGoldParser from './parsers/cards-ranking-gold.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/nottingham-cleanup.js';
import sectionsTransformer from './transformers/nottingham-sections.js';

const parsers = {
  'hero-card-dark': heroCardDarkParser,
  'nav-anchor-light': navAnchorLightParser,
  'cards-promo-light-withimg-3': cardsPromoLightWithimg3Parser,
  'cards-nav-light': cardsNavLightParser,
  'cards-promo-light': cardsPromoLightParser,
  'columns-withimg-light': columnsWithimgLightParser,
  'cards-ranking-gold': cardsRankingGoldParser,
};

const PAGE_TEMPLATE = {
  name: 'international-applicants',
  description: 'International applicants landing page (Study With Us family): full-bleed hero, in-page anchor nav, 2 promo tiles, 6 nav cards, feature panels, testimonial, 5 ranking stats, closing panel. Reuse-only migration.',
  urls: ['https://www.nottingham.ac.uk/studywithus/international-applicants/index.aspx'],
  blocks: [
    { name: 'hero-card-dark', instances: ['.sys_standard-banner'] },
    { name: 'nav-anchor-light', instances: ['.standard-nav-with-dropdown-desktop'] },
    { name: 'cards-promo-light-withimg-3', instances: ['.imageTextContentCTA-card'] },
    { name: 'cards-nav-light', instances: ['.card-section'] },
    { name: 'cards-promo-light', instances: ['.sys_solid-blue-background-box', 'blockquote.sys_blockquoteAlt:nth-of-type(2)'] },
    { name: 'columns-withimg-light', instances: ['.sys_vertically-centred-content'] },
    { name: 'cards-ranking-gold', instances: ['.sys_drop-shadow-background-box'] },
  ],
  sections: [
    { id: 'sec-breadcrumb', name: 'breadcrumb', selector: ['#L1_Breadcrumbs', '.global-breadcrumbs'], style: null, blocks: [], defaultContent: ['#L1_Breadcrumbs'] },
    { id: 'sec-hero', name: 'hero', selector: ['.sys_standard-banner'], style: null, blocks: ['hero-card-dark'], defaultContent: [] },
    { id: 'sec-anchornav', name: 'anchor-nav', selector: ['.standard-nav-with-dropdown-desktop'], style: null, blocks: ['nav-anchor-light'], defaultContent: [] },
    { id: 'sec-intro-cta', name: 'intro-cta', selector: ['.introParagraph'], style: null, blocks: [], defaultContent: ['.introParagraph'] },
    { id: 'sec-promo-tiles', name: 'promo-tiles', selector: ['.text-content', '.imageTextContentCTA-card'], style: 'grey', blocks: ['cards-promo-light-withimg-3'], defaultContent: [] },
    { id: 'sec-nav-cards', name: 'nav-cards', selector: ['.card-section'], style: null, blocks: ['cards-nav-light'], defaultContent: [] },
    { id: 'sec-feature-panels-1', name: 'feature-panels', selector: ['.sys_solid-blue-background-box'], style: 'navy-blue', blocks: ['cards-promo-light'], defaultContent: [] },
    { id: 'sec-testimonial', name: 'testimonial', selector: ['.sys_vertically-centred-content'], style: null, blocks: ['columns-withimg-light'], defaultContent: [] },
    { id: 'sec-rankings', name: 'rankings', selector: ['.sys_fiveColumns', '.sys_drop-shadow-background-box'], style: null, blocks: ['cards-ranking-gold'], defaultContent: [] },
    { id: 'sec-intro-cta-2', name: 'intro-cta-2', selector: ['.introParagraph'], style: null, blocks: [], defaultContent: ['.introParagraph'] },
    { id: 'sec-preparing', name: 'preparing', selector: ['blockquote.sys_blockquoteAlt:nth-of-type(2)'], style: 'navy-blue', blocks: ['cards-promo-light'], defaultContent: [] },
  ],
};

const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      let elements = [];
      try {
        elements = [...document.querySelectorAll(selector)];
      } catch (e) {
        console.warn(`Selector failed: ${selector}`, e.message);
      }
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    let rawPath = new URL(params.originalURL).pathname
      .replace(/\.(aspx|html?)$/i, '')
      .replace(/\/index$/i, '')
      .replace(/\/$/, '');
    if (rawPath === '') rawPath = '/index';
    const path = WebImporter.FileUtils.sanitizePath(rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
