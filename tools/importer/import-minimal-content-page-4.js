/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS (all reused from the homepage / hero-cards migrations)
import heroMinimalDark2Parser from './parsers/hero-minimal-dark-2.js';
import searchCourseLightParser from './parsers/search-course-light.js';
import cardsMinimalDarkWithimg5Parser from './parsers/cards-minimal-dark-withimg-5.js';
import cardsRankingGoldParser from './parsers/cards-ranking-gold.js';
import cardsPromoDarkParser from './parsers/cards-promo-dark.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/nottingham-cleanup.js';
import sectionsTransformer from './transformers/nottingham-sections.js';

const parsers = {
  'hero-minimal-dark-2': heroMinimalDark2Parser,
  'search-course-light': searchCourseLightParser,
  'cards-minimal-dark-withimg-5': cardsMinimalDarkWithimg5Parser,
  'cards-ranking-gold': cardsRankingGoldParser,
  'cards-promo-dark': cardsPromoDarkParser,
};

const PAGE_TEMPLATE = {
  name: 'minimal-content-page-4',
  description: 'Study-journey landing page: hero + course finder, study-option image tiles, ranking stats + campus tiles, promo cards, and CTA links.',
  urls: ['https://www.nottingham.ac.uk/studywithus/study-with-us.aspx'],
  blocks: [
    { name: 'hero-minimal-dark-2', instances: ['.heroSearch-component .hero-image-background'] },
    { name: 'search-course-light', instances: ['.heroSearch-component .search-block'] },
    { name: 'cards-minimal-dark-withimg-5', instances: ['.ctaTiles-component', '.statsTilesBlock-component .tiles-block'] },
    { name: 'cards-ranking-gold', instances: ['.statsTilesBlock-component .stats-block'] },
    { name: 'cards-promo-dark', instances: ['.largeCards-component'] },
  ],
  sections: [
    { id: 's1', name: 'Hero banner', selector: ['.heroSearch-component .hero-image-background', '.heroSearch-component'], style: null, blocks: ['hero-minimal-dark-2'], defaultContent: [] },
    { id: 's2', name: 'Course finder + intro band', selector: ['.heroSearch-component .search-block'], style: 'dark', blocks: ['search-course-light'], defaultContent: ['.search-block .search-col.mb-5'] },
    { id: 's3', name: 'Study options tile grid', selector: ['.ctaTiles-component'], style: null, blocks: ['cards-minimal-dark-withimg-5'], defaultContent: [] },
    { id: 's4', name: '#WeAreUoN stats + campus tiles', selector: ['.statsTilesBlock-component'], style: 'highlight', blocks: ['cards-ranking-gold', 'cards-minimal-dark-withimg-5'], defaultContent: [] },
    { id: 's5', name: 'Why study / career promo cards', selector: ['.largeCards-component'], style: null, blocks: ['cards-promo-dark'], defaultContent: [] },
    { id: 's6', name: 'Bottom call-to-action links', selector: ['.multiCTAStrip-component'], style: null, blocks: [], defaultContent: ['.multiCTAStrip-component .cta'] },
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
      const elements = document.querySelectorAll(selector);
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
      .replace(/\.(aspx|html?)$/i, '') // drop .aspx / .html extensions
      .replace(/\/index$/i, '') // /foo/index -> /foo
      .replace(/\/$/, ''); // drop trailing slash
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
