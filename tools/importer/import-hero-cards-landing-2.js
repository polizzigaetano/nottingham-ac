/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS (reused from the homepage migration)
import heroMinimalDark2Parser from './parsers/hero-minimal-dark-2.js';
import cardsMinimalDarkWithimg5Parser from './parsers/cards-minimal-dark-withimg-5.js';
import columnsMinimalDarkWithimg2Parser from './parsers/columns-minimal-dark-withimg-2.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/nottingham-cleanup.js';
import sectionsTransformer from './transformers/nottingham-sections.js';

const parsers = {
  'hero-minimal-dark-2': heroMinimalDark2Parser,
  'cards-minimal-dark-withimg-5': cardsMinimalDarkWithimg5Parser,
  'columns-minimal-dark-withimg-2': columnsMinimalDarkWithimg2Parser,
};

const PAGE_TEMPLATE = {
  name: 'hero-cards-landing-2',
  description: 'Hero banner + intro + card grid + feature promo landing page',
  urls: ['https://www.nottingham.ac.uk/ugstudy/visitingus/'],
  blocks: [
    { name: 'hero-minimal-dark-2', instances: ['.herobanner'] },
    { name: 'cards-minimal-dark-withimg-5', instances: ['.tileblock', '.tile-block'] },
    { name: 'columns-minimal-dark-withimg-2', instances: ['.promocard'] },
  ],
  sections: [
    { id: 's1', name: 'hero', selector: ['.herobanner'], style: null, blocks: ['hero-minimal-dark-2'], defaultContent: [] },
    { id: 's2', name: 'intro-and-tiles', selector: ['.tileblock', '.tile-block'], style: null, blocks: ['cards-minimal-dark-withimg-5'], defaultContent: ['.container.responsivegrid'] },
    { id: 's3', name: 'discover-city', selector: ['.promocard'], style: null, blocks: ['columns-minimal-dark-withimg-2'], defaultContent: [] },
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
