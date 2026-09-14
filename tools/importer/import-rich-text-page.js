/* eslint-disable */
/* global WebImporter */

// No block parsers: this template is entirely default content (headings,
// paragraphs, lists, links, tables). Only site-wide cleanup applies.

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/nottingham-cleanup.js';
import sectionsTransformer from './transformers/nottingham-sections.js';

const PAGE_TEMPLATE = {
  name: 'rich-text-page',
  description: 'Generic rich-text content page: heading, paragraphs, lists, links and related items — all default content, no interactive blocks.',
  urls: ['https://www.nottingham.ac.uk/studywithus/what-next/fees-and-funding.aspx'],
  blocks: [],
  sections: [
    { id: 's1', name: 'Detail content', selector: ['#serviceDetail'], style: null, blocks: [], defaultContent: ['#serviceDetail'] },
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

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    executeTransformers('beforeTransform', main, payload);
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
        blocks: [],
      },
    }];
  },
};
