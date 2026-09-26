/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import navAnchorLightParser from './parsers/nav-anchor-light.js';
import columnsWithimgLightParser from './parsers/columns-withimg-light.js';
import columnsParser from './parsers/columns.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/nottingham-cleanup.js';
import sectionsTransformer from './transformers/nottingham-sections.js';

const parsers = {
  'nav-anchor-light': navAnchorLightParser,
  'columns-withimg-light': columnsWithimgLightParser,
  'columns': columnsParser,
};

const PAGE_TEMPLATE = {
  "name": "news-press-release",
  "description": "Central news press release (legacy template): lead image + title, section menu, article with pull quotes, media contact card, notes to editors, press-office box. Reuse-only.",
  "urls": [
    "https://www.nottingham.ac.uk/news/hidden-signs-of-financial-abuse"
  ],
  "blocks": [
    {
      "name": "nav-anchor-light",
      "instances": [
        "#NavDiv > ul.sys_simpleListMenu"
      ]
    },
    {
      "name": "columns-withimg-light",
      "instances": [
        "article.pressReleaseMain > .quoteWithImage",
        "article.pressReleaseMain > .quoteNoImage"
      ]
    },
    {
      "name": "columns",
      "instances": [
        "article.pressReleaseMain > .author"
      ]
    }
  ],
  "sections": [
    {
      "id": "sec-title",
      "name": "title",
      "selector": [
        "#content > .sys_detailImage"
      ],
      "style": "article",
      "blocks": [],
      "defaultContent": [
        "img",
        "h1"
      ]
    },
    {
      "id": "sec-nav",
      "name": "news-menu",
      "selector": [
        "#NavDiv"
      ],
      "style": "article",
      "blocks": [
        "nav-anchor-light"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-article",
      "name": "article",
      "selector": [
        "article.pressReleaseMain"
      ],
      "style": "article",
      "blocks": [
        "columns-withimg-light",
        "columns"
      ],
      "defaultContent": [
        "p",
        "h2",
        ".boilerplate"
      ]
    }
  ]
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
