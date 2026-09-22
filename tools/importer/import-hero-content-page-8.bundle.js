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

  // tools/importer/import-hero-content-page-8.js
  var import_hero_content_page_8_exports = {};
  __export(import_hero_content_page_8_exports, {
    default: () => import_hero_content_page_8_default
  });

  // tools/importer/parsers/hero-minimal-dark-2.js
  function parse(element, { document: document2 }) {
    const fbText = element.querySelector(".feature-block__text");
    const fbMedia = element.querySelector(".feature-block__media");
    if (fbText || fbMedia) {
      const fbImage = (fbMedia || element).querySelector(
        ".video-fullWidth__img, .image-container img, img"
      );
      const contentCell2 = [document2.createComment(" field:text ")];
      const eyebrow = fbText && fbText.querySelector(".text-container__title, h1, h2, h3");
      if (eyebrow && eyebrow.textContent.trim()) contentCell2.push(eyebrow);
      const fbParas = fbText ? Array.from(fbText.querySelectorAll(".text-container__text p, .feature-block__text-content p")).filter((p) => p.textContent.trim()) : [];
      fbParas.forEach((p) => contentCell2.push(p));
      const fbCta = fbText && fbText.querySelector(
        ".text-container__button-component a[href], .button-component a[href], a.button[href]"
      );
      if (fbCta) {
        const a = document2.createElement("a");
        a.setAttribute("href", fbCta.getAttribute("href"));
        a.textContent = (fbCta.textContent || "").replace(/\s+/g, " ").trim();
        contentCell2.push(a);
      }
      if (contentCell2.length === 1 && !fbImage) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const fbCells = [];
      if (fbImage) {
        fbCells.push([[document2.createComment(" field:image "), fbImage]]);
      } else {
        fbCells.push([""]);
      }
      fbCells.push([contentCell2]);
      const fbBlock = WebImporter.Blocks.createBlock(document2, { name: "hero-minimal-dark-2", cells: fbCells });
      element.replaceWith(fbBlock);
      return;
    }
    const bgImage = element.querySelector(
      ".desktop-banner-image, img.mobile-banner-image, .banner-background img, .hero-background-image img, img"
    );
    const heading = element.querySelector(".banner-title, .hero-background-image h1, h1, h2");
    const text = element.querySelector(".banner-text, p");
    const cta = element.querySelector(".banner-content a, a.stripe-white-cta, .hero-background-image a.cta, a.cta, a");
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

  // tools/importer/parsers/nav-anchor-light.js
  function parse2(element, { document: document2 }) {
    const links = Array.from(element.querySelectorAll("a.sub-nav__link"));
    const cells = [];
    links.forEach((source) => {
      const href = source.getAttribute("href");
      if (!href) return;
      const a = document2.createElement("a");
      a.setAttribute("href", href);
      let label = (source.textContent || "").replace(/\s+/g, " ").trim();
      if (!label) {
        label = source.classList.contains("sub-nav__home-btn") ? "Home" : href;
      }
      a.textContent = label;
      cells.push([[document2.createComment(" field:link "), a]]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "nav-anchor-light", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-withimg-light.js
  function parse3(element, { document: document2 }) {
    const textCol = element.querySelector(".feature-block__text");
    const mediaCol = element.querySelector(".feature-block__media");
    const contentCell = [];
    const heading = (textCol || element).querySelector("h1, h2, h3, .text-container__title");
    if (heading) contentCell.push(heading);
    const paras = Array.from(
      (textCol || element).querySelectorAll(".text-container__text p, .feature-block__text-content p")
    ).filter((p) => p.textContent.trim());
    paras.forEach((p) => contentCell.push(p));
    const cta = (textCol || element).querySelector(".text-container__button-component a[href], .button-component a[href], a.button[href]");
    if (cta) contentCell.push(cta);
    const imageCell = [];
    const image = (mediaCol || element).querySelector(".image-container img, img");
    if (image) imageCell.push(image);
    if (!contentCell.length && !imageCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[contentCell, imageCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-withimg-light", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-minimal-dark-withimg-2.js
  function parse4(element, { document: document2 }) {
    const fbText = element.querySelector(".feature-block__text");
    const fbMedia = element.querySelector(".feature-block__media");
    if (fbText || fbMedia) {
      const contentCell2 = [];
      const heading2 = (fbText || element).querySelector("h1, h2, h3, h4, .text-container__title");
      if (heading2) contentCell2.push(heading2);
      Array.from((fbText || element).querySelectorAll(".text-container__text p, .feature-block__text-content p")).filter((p) => p.textContent.trim()).forEach((p) => contentCell2.push(p));
      const cta2 = (fbText || element).querySelector(
        ".text-container__button-component a[href], .button-component a[href], a.button[href]"
      );
      if (cta2) contentCell2.push(cta2);
      const imageCell2 = [];
      const image2 = (fbMedia || element).querySelector(".image-container img, img");
      if (image2) imageCell2.push(image2);
      if (contentCell2.length || imageCell2.length) {
        const cells2 = [[contentCell2, imageCell2]];
        const block2 = WebImporter.Blocks.createBlock(document2, { name: "columns-minimal-dark-withimg-2", cells: cells2 });
        element.replaceWith(block2);
        return;
      }
    }
    const qr = element.querySelector(".qr-code");
    if (qr || element.classList.contains("cmp-container--blue")) {
      const textBlock = element.querySelector(".cmp-text .text-container__text, .text-container__text, .cmp-text");
      const contentCell2 = [];
      if (textBlock) {
        Array.from(textBlock.children).filter((c) => c.textContent.trim() || c.querySelector("img, a")).forEach((c) => contentCell2.push(c));
      }
      Array.from(element.querySelectorAll(".qr-code__mobile a[href]")).forEach((a) => contentCell2.push(a));
      const qrImg = element.querySelector(".qr-code__desktop-img");
      if (qrImg) contentCell2.push(qrImg);
      const imageCell2 = [];
      const photo = element.querySelector(".cmp-image img, .image img");
      if (photo) imageCell2.push(photo);
      if (contentCell2.length || imageCell2.length) {
        const cells2 = [[contentCell2, imageCell2]];
        const block2 = WebImporter.Blocks.createBlock(document2, { name: "columns-minimal-dark-withimg-2", cells: cells2 });
        element.replaceWith(block2);
        return;
      }
    }
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

  // tools/importer/parsers/cards-steps-light.js
  function parse5(element, { document: document2 }) {
    const steps = Array.from(element.querySelectorAll(":scope > .card-list__content"));
    const cells = [];
    steps.forEach((step) => {
      const cell = [document2.createComment(" field:text ")];
      const titleEl = step.querySelector(".card-list__text .card-title, .card-list__text h1, .card-list__text h2, .card-list__text h3");
      if (titleEl && titleEl.textContent.trim()) {
        const h3 = document2.createElement("h3");
        h3.textContent = titleEl.textContent.trim();
        cell.push(h3);
      }
      const descEl = step.querySelector(".card-list__text .body-medium, .card-list__text p");
      if (descEl && descEl.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = descEl.textContent.replace(/\s+/g, " ").trim();
        cell.push(p);
      }
      const source = step.querySelector(".card-list__link a[href], a.button[href]");
      if (source) {
        const a = document2.createElement("a");
        a.setAttribute("href", source.getAttribute("href"));
        a.textContent = (source.textContent || "").replace(/\s+/g, " ").trim();
        cell.push(a);
      }
      if (cell.length === 1) return;
      cells.push([cell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-steps-light", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo-light.js
  function parse6(element, { document: document2 }) {
    let units = Array.from(element.querySelectorAll(".feature-block__text"));
    if (!units.length) units = [element];
    const cells = [];
    units.forEach((unit) => {
      const cell = [document2.createComment(" field:text ")];
      const titleEl = unit.querySelector(".text-container__title, h1, h2, h3");
      if (titleEl && titleEl.textContent.trim()) {
        const h3 = document2.createElement("h3");
        h3.textContent = titleEl.textContent.trim();
        cell.push(h3);
      }
      const paras = Array.from(
        unit.querySelectorAll(".text-container__text p, .feature-block__text-content p")
      ).filter((p) => p.textContent.trim());
      paras.forEach((p) => cell.push(p));
      const source = unit.querySelector(".text-container__button-component a[href], .button-component a[href], a.button[href]");
      if (source) {
        const a = document2.createElement("a");
        a.setAttribute("href", source.getAttribute("href"));
        a.textContent = (source.textContent || "").replace(/\s+/g, " ").trim();
        cell.push(a);
      }
      if (cell.length === 1) return;
      cells.push([cell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-promo-light", cells });
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
      WebImporter.DOMUtils.remove(element, [
        ".heroSearch-component .d-block.d-lg-none"
      ]);
      element.querySelectorAll('a[href^="javascript:"]').forEach((a) => a.remove());
      element.querySelectorAll("#serviceDetail .hidden").forEach((n) => n.remove());
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        ".headerv2-component",
        "header.headerv2",
        "#footer",
        "footer",
        "#flyout-status",
        ".headerv2-skip-content-link",
        // Older Nottingham template chrome (e.g. studywithus/what-next pages):
        //   #nav / .slicknav_menu -> the top "Main Menu" primary nav + mobile menu
        //   .sys_simpleListMenu   -> in-page left sidebar section menu
        //   #breadcrumbs / .sys_breadcrumbs -> "You are here" breadcrumb trail
        //   #bottom, .sys_corners -> legacy footer address + corner chrome
        "#nav",
        ".slicknav_menu",
        ".sys_simpleListMenu",
        "#breadcrumb",
        "#breadcrumbs",
        ".sys_breadcrumbs",
        ".sys_youAreHere",
        ".campuslinks",
        "#SocialButtons",
        "#bottom",
        ".sys_corners",
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

  // tools/importer/import-hero-content-page-8.js
  var parsers = {
    "hero-minimal-dark-2": parse,
    "nav-anchor-light": parse2,
    "columns-withimg-light": parse3,
    "columns-minimal-dark-withimg-2": parse4,
    "cards-steps-light": parse5,
    "cards-promo-light": parse6
  };
  var PAGE_TEMPLATE = {
    name: "hero-content-page-8",
    description: "Open Days landing page: hero + section-nav bar, breadcrumb, What-to-expect (light img+text), Accessibility (dark img+text), On-the-day numbered steps, Download-the-app (dark), 3-up light promo cards, and a ready-to-experience banner.",
    urls: ["https://www.nottingham.ac.uk/study/campus-visit/open-days.html"],
    blocks: [
      { name: "hero-minimal-dark-2", instances: [".featureblock.feature-block--dark-bg.feature-block--standard"] },
      { name: "nav-anchor-light", instances: [".sub-nav"] },
      { name: "columns-withimg-light", instances: [".featureblock.feature-block--reverse"] },
      { name: "columns-minimal-dark-withimg-2", instances: [".featureblock.feature-block--dark-bg:not(.feature-block--standard)", '.cmp-container--blue.cmp-internal:has(a[href*="apps.apple"])'] },
      { name: "cards-steps-light", instances: [".card-list"] },
      { name: "cards-promo-light", instances: [".featureblock.feature-block--white-bg"] }
    ],
    sections: [
      { id: "s2", name: "Hero", selector: [".featureblock.feature-block--dark-bg.feature-block--standard"], style: null, blocks: ["hero-minimal-dark-2"], defaultContent: [] },
      { id: "s3", name: "Section nav bar", selector: [".sub-nav"], style: null, blocks: ["nav-anchor-light"], defaultContent: [] },
      { id: "s4", name: "Breadcrumb", selector: [".breadcrumbs"], style: null, blocks: [], defaultContent: [".cmp-breadcrumbs__list"] },
      { id: "s5", name: "What to expect", selector: [".featureblock.feature-block--reverse"], style: null, blocks: ["columns-withimg-light"], defaultContent: [] },
      { id: "s6", name: "Accessibility", selector: [".featureblock.feature-block--dark-bg:not(.feature-block--standard)"], style: "dark", blocks: ["columns-minimal-dark-withimg-2"], defaultContent: [] },
      { id: "s7", name: "On the day (steps)", selector: [".card-list"], style: null, blocks: ["cards-steps-light"], defaultContent: [] },
      { id: "s8", name: "Download the app", selector: ['.cmp-container--blue.cmp-internal:has(a[href*="apps.apple"])'], style: "dark", blocks: ["columns-minimal-dark-withimg-2"], defaultContent: [] },
      { id: "s9", name: "Promo cards", selector: [".featureblock.feature-block--white-bg"], style: null, blocks: ["cards-promo-light"], defaultContent: [] },
      { id: "s10", name: "Ready-to-experience banner", selector: [".promoCard-banner"], style: null, blocks: [], defaultContent: [".promoCard-content"] }
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
        let elements = [];
        try {
          elements = [...document2.querySelectorAll(selector)];
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
  var import_hero_content_page_8_default = {
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
  return __toCommonJS(import_hero_content_page_8_exports);
})();
