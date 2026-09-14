/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroDarkParser from './parsers/carousel-hero-dark.js';
import cardsNavLightParser from './parsers/cards-nav-light.js';
import cardsIconLightParser from './parsers/cards-icon-light.js';
import columnsVideoLightParser from './parsers/columns-video-light.js';
import cardsPromoDarkParser from './parsers/cards-promo-dark.js';
import cardsMinimalDarkWithimg5Parser from './parsers/cards-minimal-dark-withimg-5.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/nottingham-cleanup.js';
import sectionsTransformer from './transformers/nottingham-sections.js';

const parsers = {
  'carousel-hero-dark': carouselHeroDarkParser,
  'cards-nav-light': cardsNavLightParser,
  'cards-icon-light': cardsIconLightParser,
  'columns-video-light': columnsVideoLightParser,
  'cards-promo-dark': cardsPromoDarkParser,
  'cards-minimal-dark-withimg-5': cardsMinimalDarkWithimg5Parser,
};

const PAGE_TEMPLATE = {
  name: 'degree-apprenticeships',
  description: 'Degree Apprenticeships landing page: hero carousel, intro, employer/apprentice nav cards, credibility icon strip, programme overview + video, vacancies promo, news/events tiles, question-zone promo, and connect CTAs.',
  urls: ['https://www.nottingham.ac.uk/workingwithbusiness/degree-apprenticeships/degree-apprenticeships.aspx'],
  blocks: [
    { name: 'carousel-hero-dark', instances: ['.banner.cycle'] },
    { name: 'cards-nav-light', instances: ['.sys_twoColumns5050:has(.card)'] },
    { name: 'cards-icon-light', instances: ['.sys_fourColumns'] },
    { name: 'columns-video-light', instances: ['.sys_twoColumns5050:has(.kalturaEmbed)'] },
    { name: 'cards-promo-dark', instances: ['.sys_twoColumns5050:not(:has(.card)):not(:has(.kalturaEmbed))', '.sys_twoColumns_3070'] },
    { name: 'cards-minimal-dark-withimg-5', instances: ['.sys_threeColumns:has(.sys_CTA-ImageAndTextBlock)'] },
  ],
  sections: [
    { id: 's1', name: 'Page title', selector: ['.breadcrumbs + *', 'h1'], style: null, blocks: [], defaultContent: ['h1'] },
    { id: 's2', name: 'Hero banner carousel', selector: ['.banner.cycle'], style: null, blocks: ['carousel-hero-dark'], defaultContent: [] },
    { id: 's3', name: 'Intro lead paragraph', selector: ['.sys_twoColumns5050:has(.card)'], style: null, blocks: [], defaultContent: [] },
    { id: 's4', name: 'For employers / apprentices tiles', selector: ['.sys_twoColumns5050:has(.card)'], style: null, blocks: ['cards-nav-light'], defaultContent: [] },
    { id: 's5', name: 'Ranking / credibility strip', selector: ['.sys_fourColumns'], style: null, blocks: ['cards-icon-light'], defaultContent: [] },
    { id: 's6', name: 'Programme overview + video', selector: ['.sys_twoColumns5050:has(.kalturaEmbed)'], style: null, blocks: ['columns-video-light'], defaultContent: [] },
    { id: 's7', name: 'Vacancies promo', selector: ['.sys_twoColumns5050:not(:has(.card)):not(:has(.kalturaEmbed))'], style: null, blocks: ['cards-promo-dark'], defaultContent: [] },
    { id: 's8', name: 'Latest news and events tiles', selector: ['.sys_threeColumns:has(.sys_CTA-ImageAndTextBlock)'], style: null, blocks: ['cards-minimal-dark-withimg-5'], defaultContent: [] },
    { id: 's9', name: 'Question zone promo', selector: ['.sys_twoColumns_3070'], style: null, blocks: ['cards-promo-dark'], defaultContent: [] },
    { id: 's10', name: 'Connect CTA row', selector: ['.sys_threeColumns:has(.CTA-LinkedIn)'], style: null, blocks: [], defaultContent: ['.CTA-LinkedIn', '.CTA-Twitter', '.CTA-ArrowRoundRight'] },
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
