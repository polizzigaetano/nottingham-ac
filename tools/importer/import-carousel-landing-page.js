/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroMinimalDark2Parser from './parsers/hero-minimal-dark-2.js';
import searchCourseLightParser from './parsers/search-course-light.js';
import cardsPromoDarkParser from './parsers/cards-promo-dark.js';
import cardsRankingGoldParser from './parsers/cards-ranking-gold.js';
import columnsMinimalDarkWithimg2Parser from './parsers/columns-minimal-dark-withimg-2.js';
import cardsMinimalDarkWithimg5Parser from './parsers/cards-minimal-dark-withimg-5.js';
import carouselMinimalDarkWithimg5Parser from './parsers/carousel-minimal-dark-withimg-5.js';
import carouselEventsLightParser from './parsers/carousel-events-light.js';
import cardsLogosLightParser from './parsers/cards-logos-light.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/nottingham-cleanup.js';
import sectionsTransformer from './transformers/nottingham-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-minimal-dark-2': heroMinimalDark2Parser,
  'search-course-light': searchCourseLightParser,
  'cards-promo-dark': cardsPromoDarkParser,
  'cards-ranking-gold': cardsRankingGoldParser,
  'columns-minimal-dark-withimg-2': columnsMinimalDarkWithimg2Parser,
  'cards-minimal-dark-withimg-5': cardsMinimalDarkWithimg5Parser,
  'carousel-minimal-dark-withimg-5': carouselMinimalDarkWithimg5Parser,
  'carousel-events-light': carouselEventsLightParser,
  'cards-logos-light': cardsLogosLightParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'carousel-landing-page',
  description: 'Landing layout with a top carousel/feature banner, mixed content, and a form region',
  urls: [
    'https://www.nottingham.ac.uk/',
  ],
  blocks: [
    { name: 'hero-minimal-dark-2', instances: ['.homepage-hero-banner'] },
    { name: 'search-course-light', instances: ['.search-container', '.course-finder-label'] },
    { name: 'cards-promo-dark', instances: ['.homepage-campaign-tiles'] },
    { name: 'cards-ranking-gold', instances: ['.homepage-rankings', '.ranking-tile-container'] },
    { name: 'columns-minimal-dark-withimg-2', instances: ['.homepage-image-cta-block'] },
    { name: 'cards-minimal-dark-withimg-5', instances: ['.homepage-image-cta-row'] },
    { name: 'carousel-minimal-dark-withimg-5', instances: ['.news-section .news-carousel', '.news-section'] },
    { name: 'carousel-events-light', instances: ['.events-section'] },
    { name: 'cards-logos-light', instances: ['.homepage-partnerships', '.partnerships-container'] },
  ],
  sections: [
    { id: 's1', name: 'hero', selector: ['.homepage-hero-banner'], style: null, blocks: ['hero-minimal-dark-2', 'search-course-light'], defaultContent: [] },
    { id: 's2', name: 'campaign-tiles', selector: ['.homepage-campaign-tiles'], style: null, blocks: ['cards-promo-dark'], defaultContent: [] },
    { id: 's3', name: 'ranking-tiles', selector: ['.homepage-rankings', '.ranking-tile-container'], style: null, blocks: ['cards-ranking-gold'], defaultContent: [] },
    { id: 's4', name: 'research', selector: ['.homepage-image-cta-block', '.container-max-width'], style: 'highlight', blocks: ['columns-minimal-dark-withimg-2', 'cards-minimal-dark-withimg-5'], defaultContent: [] },
    { id: 's5', name: 'university-news', selector: ['.news-section'], style: null, blocks: ['carousel-minimal-dark-withimg-5'], defaultContent: [] },
    { id: 's6', name: 'featured-events', selector: ['.events-section'], style: 'highlight', blocks: ['carousel-events-light'], defaultContent: [] },
    { id: 's7', name: 'partnerships', selector: ['.homepage-partnerships', '.partnerships-container'], style: null, blocks: ['cards-logos-light'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
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

/**
 * Find all blocks on the page based on the embedded template configuration.
 * De-duplicates elements matched by multiple selectors (first match wins).
 */
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

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block; skip elements already replaced by an earlier parser
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

    // 4. afterTransform cleanup + section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path — map homepage/root URL to /index
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

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
