/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroMinimalDark2Parser from './parsers/hero-minimal-dark-2.js';
import navAnchorLightParser from './parsers/nav-anchor-light.js';
import columnsWithimgLightParser from './parsers/columns-withimg-light.js';
import columnsMinimalDarkWithimg2Parser from './parsers/columns-minimal-dark-withimg-2.js';
import cardsStepsLightParser from './parsers/cards-steps-light.js';
import cardsPromoLightParser from './parsers/cards-promo-light.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/nottingham-cleanup.js';
import sectionsTransformer from './transformers/nottingham-sections.js';

const parsers = {
  'hero-minimal-dark-2': heroMinimalDark2Parser,
  'nav-anchor-light': navAnchorLightParser,
  'columns-withimg-light': columnsWithimgLightParser,
  'columns-minimal-dark-withimg-2': columnsMinimalDarkWithimg2Parser,
  'cards-steps-light': cardsStepsLightParser,
  'cards-promo-light': cardsPromoLightParser,
};

const PAGE_TEMPLATE = {
  name: 'hero-content-page-8',
  description: 'Open Days landing page: hero + section-nav bar, breadcrumb, What-to-expect (light img+text), Accessibility (dark img+text), On-the-day numbered steps, Download-the-app (dark), 3-up light promo cards, and a ready-to-experience banner.',
  urls: ['https://www.nottingham.ac.uk/study/campus-visit/open-days.html'],
  blocks: [
    { name: 'hero-minimal-dark-2', instances: ['.featureblock.feature-block--dark-bg.feature-block--standard'] },
    { name: 'nav-anchor-light', instances: ['.sub-nav'] },
    { name: 'columns-withimg-light', instances: ['.featureblock.feature-block--reverse'] },
    { name: 'columns-minimal-dark-withimg-2', instances: ['.featureblock.feature-block--dark-bg:not(.feature-block--standard)', '.cmp-container--blue.cmp-internal:has(a[href*="apps.apple"])'] },
    { name: 'cards-steps-light', instances: ['.card-list'] },
    { name: 'cards-promo-light', instances: ['.featureblock.feature-block--white-bg'] },
  ],
  sections: [
    { id: 's2', name: 'Hero', selector: ['.featureblock.feature-block--dark-bg.feature-block--standard'], style: null, blocks: ['hero-minimal-dark-2'], defaultContent: [] },
    { id: 's3', name: 'Section nav bar', selector: ['.sub-nav'], style: null, blocks: ['nav-anchor-light'], defaultContent: [] },
    { id: 's4', name: 'Breadcrumb', selector: ['.breadcrumbs'], style: null, blocks: [], defaultContent: ['.cmp-breadcrumbs__list'] },
    { id: 's5', name: 'What to expect', selector: ['.featureblock.feature-block--reverse'], style: null, blocks: ['columns-withimg-light'], defaultContent: [] },
    { id: 's6', name: 'Accessibility', selector: ['.featureblock.feature-block--dark-bg:not(.feature-block--standard)'], style: 'dark', blocks: ['columns-minimal-dark-withimg-2'], defaultContent: [] },
    { id: 's7', name: 'On the day (steps)', selector: ['.card-list'], style: null, blocks: ['cards-steps-light'], defaultContent: [] },
    { id: 's8', name: 'Download the app', selector: ['.cmp-container--blue.cmp-internal:has(a[href*="apps.apple"])'], style: 'dark', blocks: ['columns-minimal-dark-withimg-2'], defaultContent: [] },
    { id: 's9', name: 'Promo cards', selector: ['.featureblock.feature-block--white-bg'], style: null, blocks: ['cards-promo-light'], defaultContent: [] },
    { id: 's10', name: 'Ready-to-experience banner', selector: ['.promoCard-banner'], style: null, blocks: [], defaultContent: ['.promoCard-content'] },
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
