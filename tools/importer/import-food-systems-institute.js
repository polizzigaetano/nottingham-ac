/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroMinimalDark2Parser from './parsers/hero-minimal-dark-2.js';
import navAnchorLightParser from './parsers/nav-anchor-light.js';
import columnsWithimgLightParser from './parsers/columns-withimg-light.js';
import cardsPromoLightWithimg3Parser from './parsers/cards-promo-light-withimg-3.js';
import cardsMinimalDarkWithimg5Parser from './parsers/cards-minimal-dark-withimg-5.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/nottingham-cleanup.js';
import sectionsTransformer from './transformers/nottingham-sections.js';

const parsers = {
  'hero-minimal-dark-2': heroMinimalDark2Parser,
  'nav-anchor-light': navAnchorLightParser,
  'columns-withimg-light': columnsWithimgLightParser,
  'cards-promo-light-withimg-3': cardsPromoLightWithimg3Parser,
  'cards-minimal-dark-withimg-5': cardsMinimalDarkWithimg5Parser,
};

const PAGE_TEMPLATE = {
  "name": "food-systems-institute",
  "description": "Food Systems Institute landing page (legacy Contensis science institute template) — reuse-only migration.",
  "urls": [
    "https://www.nottingham.ac.uk/science/schools-centres-and-institutes/food-systems-institute/index.aspx"
  ],
  "blocks": [
    {
      "name": "hero-minimal-dark-2",
      "instances": [
        "#container > .sys_standard-banner",
        "#container > .container.my-4 .sys_standard-banner",
        "#container > .sys_fullWidthImage-TextWithCTA"
      ]
    },
    {
      "name": "nav-anchor-light",
      "instances": [
        "#container > .standard-nav-with-dropdown"
      ]
    },
    {
      "name": "columns-withimg-light",
      "instances": [
        "#container > .container.my-4 > .generalFullWidth-content > .sys_twoColumns5050"
      ]
    },
    {
      "name": "cards-promo-light-withimg-3",
      "instances": [
        "#container > .container-grey-bg .sys_imageTitleContentCTA-card",
        "#container > .container-grey-bg .imageTextContentCTA-card",
        "#container > .container.my-4 .sys_fourColumns .sys_imageTitleContentCTA-card"
      ]
    },
    {
      "name": "cards-minimal-dark-withimg-5",
      "instances": [
        "#container > .container-yellow-bg .imageWhiteCTA-card"
      ]
    }
  ],
  "sections": [
    {
      "id": "sec-breadcrumb",
      "name": "breadcrumb",
      "selector": [
        "#L1_Breadcrumbs"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "#L1_Breadcrumbs"
      ]
    },
    {
      "id": "sec-hero",
      "name": "hero",
      "selector": [
        "#container > .sys_standard-banner"
      ],
      "style": null,
      "blocks": [
        "hero-minimal-dark-2"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-subnav",
      "name": "sub-nav",
      "selector": [
        "#container > .standard-nav-with-dropdown"
      ],
      "style": null,
      "blocks": [
        "nav-anchor-light"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-mission",
      "name": "our-mission",
      "selector": [
        "#container > .container.my-4:has(.generalFullWidth-content > .sys_twoColumns5050)"
      ],
      "style": null,
      "blocks": [
        "columns-withimg-light"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-focus",
      "name": "our-focus",
      "selector": [
        "#container > .container-grey-bg:has(.sys_imageTitleContentCTA-card)"
      ],
      "style": "light",
      "blocks": [
        "cards-promo-light-withimg-3"
      ],
      "defaultContent": [
        "h2",
        "h3",
        "p"
      ]
    },
    {
      "id": "sec-annual-report",
      "name": "annual-report",
      "selector": [
        "#container > .container.my-4:has(.sys_standard-banner)"
      ],
      "style": null,
      "blocks": [
        "hero-minimal-dark-2"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-centres",
      "name": "translational-centres",
      "selector": [
        "#container > .container-grey-bg:has(.imageTextContentCTA-card)"
      ],
      "style": "light",
      "blocks": [
        "cards-promo-light-withimg-3"
      ],
      "defaultContent": [
        "h2",
        "h3",
        "p"
      ]
    },
    {
      "id": "sec-case-studies",
      "name": "case-studies",
      "selector": [
        "#container > .container.my-4:has(.sys_fourColumns)"
      ],
      "style": null,
      "blocks": [
        "cards-promo-light-withimg-3"
      ],
      "defaultContent": [
        "h3",
        ".sys_four"
      ]
    },
    {
      "id": "sec-engage",
      "name": "engage",
      "selector": [
        "#container > .container-yellow-bg"
      ],
      "style": "light",
      "blocks": [
        "cards-minimal-dark-withimg-5"
      ],
      "defaultContent": [
        "h2",
        "h3",
        "p"
      ]
    },
    {
      "id": "sec-signup",
      "name": "sign-up",
      "selector": [
        "#container > .sys_fullWidthImage-TextWithCTA"
      ],
      "style": null,
      "blocks": [
        "hero-minimal-dark-2"
      ],
      "defaultContent": []
    },
    {
      "id": "sec-social",
      "name": "social",
      "selector": [
        "#container > .container.my-4:has(.CTA-X)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "a"
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
