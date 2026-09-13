/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-hero-cards-landing-2.js
  var import_hero_cards_landing_2_exports = {};
  __export(import_hero_cards_landing_2_exports, {
    default: () => import_hero_cards_landing_2_default
  });

  // tools/importer/parsers/hero-minimal-dark-2.js
  function parse(element, { document: document2 }) {
    const bgImage = element.querySelector(
      ".desktop-banner-image, img.mobile-banner-image, .banner-background img, img"
    );
    const heading = element.querySelector(".banner-title, h1, h2");
    const text = element.querySelector(".banner-text, p");
    const cta = element.querySelector(".banner-content a, a.stripe-white-cta, a");
    if (!heading && !text && !cta && !bgImage) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) {
      cells.push([[document2.createComment(" field:image "), bgImage]]);
    } else {
      cells.push([""]);
    }
    const contentCell = [document2.createComment(" field:text ")];
    if (heading) contentCell.push(heading);
    if (text) contentCell.push(text);
    if (cta) contentCell.push(cta);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-minimal-dark-2", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-minimal-dark-withimg-5.js
  function parse2(element, { document: document2 }) {
    let tiles = element.querySelectorAll(".imageWhiteCTA-card");
    let mode = "homepage";
    if (!tiles.length) {
      tiles = element.querySelectorAll(".cmp-tile");
      mode = "cmp-tile";
    }
    const cells = [];
    tiles.forEach((tile) => {
      let image;
      let ctaHref;
      let ctaLabel;
      if (mode === "cmp-tile") {
        image = tile.querySelector(".cmp-tile__image img, img");
        const link = tile.matches("a") ? tile : tile.querySelector("a");
        const title = tile.querySelector(".cmp-tile__title, h1, h2, h3, h4, h5, h6");
        ctaHref = link ? link.getAttribute("href") : null;
        ctaLabel = title ? title.textContent.trim() : link ? link.textContent.trim() : "";
      } else {
        image = tile.querySelector("img.background-image, img");
        const cta = tile.querySelector("a.stripe-white-cta, a");
        ctaHref = cta ? cta.getAttribute("href") : null;
        ctaLabel = cta ? cta.textContent.trim() : "";
      }
      const imageCell = [];
      if (image) {
        imageCell.push(document2.createComment(" field:image "));
        imageCell.push(image);
      }
      const textCell = [document2.createComment(" field:text ")];
      if (ctaHref) {
        const a = document2.createElement("a");
        a.href = ctaHref;
        a.textContent = ctaLabel || ctaHref;
        textCell.push(a);
      } else if (ctaLabel) {
        textCell.push(document2.createTextNode(ctaLabel));
      }
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-minimal-dark-withimg-5", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-minimal-dark-withimg-2.js
  function parse3(element, { document: document2 }) {
    const textContent = element.querySelector(".text-content");
    const cta = element.querySelector(".block-content a, a.stripe-white-cta");
    const heading = (textContent == null ? void 0 : textContent.querySelector("h1, h2, h3, h4")) || element.querySelector("h1, h2, h3, h4");
    const para = (textContent == null ? void 0 : textContent.querySelector("p")) || element.querySelector(".block-content p");
    const image = element.querySelector(".image-container img, img");
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (para) contentCell.push(para);
    if (cta) contentCell.push(cta);
    const imageCell = [];
    if (image) imageCell.push(image);
    if (!contentCell.length && !imageCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[contentCell, imageCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-minimal-dark-withimg-2", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/nottingham-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#ot-sdk-btn",
        ".ot-sdk-container",
        ".ot-fade-in",
        "iframe.ot-text-resize"
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        ".headerv2-component",
        "header.headerv2",
        "#footer",
        "footer",
        "#flyout-status",
        ".headerv2-skip-content-link",
        ".aspNetHidden",
        "iframe",
        "link",
        "noscript",
        "style",
        "script"
      ]);
    }
  }

  // tools/importer/transformers/nottingham-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-hero-cards-landing-2.js
  var parsers = {
    "hero-minimal-dark-2": parse,
    "cards-minimal-dark-withimg-5": parse2,
    "columns-minimal-dark-withimg-2": parse3
  };
  var PAGE_TEMPLATE = {
    name: "hero-cards-landing-2",
    description: "Hero banner + intro + card grid + feature promo landing page",
    urls: ["https://www.nottingham.ac.uk/ugstudy/visitingus/"],
    blocks: [
      { name: "hero-minimal-dark-2", instances: [".herobanner"] },
      { name: "cards-minimal-dark-withimg-5", instances: [".tileblock", ".tile-block"] },
      { name: "columns-minimal-dark-withimg-2", instances: [".promocard"] }
    ],
    sections: [
      { id: "s1", name: "hero", selector: [".herobanner"], style: null, blocks: ["hero-minimal-dark-2"], defaultContent: [] },
      { id: "s2", name: "intro-and-tiles", selector: [".tileblock", ".tile-block"], style: null, blocks: ["cards-minimal-dark-withimg-5"], defaultContent: [".container.responsivegrid"] },
      { id: "s3", name: "discover-city", selector: [".promocard"], style: null, blocks: ["columns-minimal-dark-withimg-2"], defaultContent: [] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
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
  var import_hero_cards_landing_2_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      let rawPath = new URL(params.originalURL).pathname.replace(/\.(aspx|html?)$/i, "").replace(/\/index$/i, "").replace(/\/$/, "");
      if (rawPath === "") rawPath = "/index";
      const path = WebImporter.FileUtils.sanitizePath(rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_hero_cards_landing_2_exports);
})();
