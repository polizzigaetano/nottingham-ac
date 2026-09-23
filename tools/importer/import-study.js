/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroVideoDarkParser from './parsers/hero-video-dark.js';
import searchCourseLightParser from './parsers/search-course-light.js';
import cardsPromoDarkWithimg4Parser from './parsers/cards-promo-dark-withimg-4.js';
import heroCardDarkParser from './parsers/hero-card-dark.js';
import cardsPromoLightWithimg3Parser from './parsers/cards-promo-light-withimg-3.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/nottingham-cleanup.js';
import sectionsTransformer from './transformers/nottingham-sections.js';

const parsers = {
  'hero-video-dark': heroVideoDarkParser,
  'search-course-light': searchCourseLightParser,
  'cards-promo-dark-withimg-4': cardsPromoDarkWithimg4Parser,
  'hero-card-dark': heroCardDarkParser,
  'cards-promo-light-withimg-3': cardsPromoLightWithimg3Parser,
};

const PAGE_TEMPLATE = {
  name: 'study',
  description: 'Study hub landing page: video hero + course search, intro, dark image promo tiles (2x2), Open Days hero-card, light image promo cards (3-up), Our Campuses hero-card.',
  urls: ['https://www.nottingham.ac.uk/study/home.html'],
  blocks: [
    { name: 'hero-video-dark', instances: ['.content-search--withHero .video-fullWidth'] },
    { name: 'search-course-light', instances: ['.content-search__content'] },
    { name: 'cards-promo-dark-withimg-4', instances: ['.featureblock.feature-block--dark-bg'] },
    { name: 'hero-card-dark', instances: ['.promoCard-banner'] },
    { name: 'cards-promo-light-withimg-3', instances: ['.featureblock.feature-block--white-bg'] },
  ],
  sections: [
    { id: 'rc1', name: 'Video hero', selector: ['.content-search--withHero .video-fullWidth'], style: null, blocks: ['hero-video-dark'], defaultContent: [] },
    { id: 'rc2', name: 'Course search', selector: ['.content-search__content'], style: 'dark', blocks: ['search-course-light'], defaultContent: [] },
    { id: 'rc3', name: 'Study options tiles', selector: ['.featureblock.feature-block--dark-bg'], style: null, blocks: ['cards-promo-dark-withimg-4'], defaultContent: ['h1'] },
    { id: 'rc4', name: 'Open days hero-card', selector: ['.promoCard-banner'], style: null, blocks: ['hero-card-dark'], defaultContent: [] },
    { id: 'rc5', name: 'Light promo cards', selector: ['.featureblock.feature-block--white-bg'], style: null, blocks: ['cards-promo-light-withimg-3'], defaultContent: [] },
    { id: 'rc6', name: 'Our campuses hero-card', selector: ['.promoCard-banner'], style: null, blocks: ['hero-card-dark'], defaultContent: [] },
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
