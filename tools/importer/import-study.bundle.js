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

  // tools/importer/import-study.js
  var import_study_exports = {};
  __export(import_study_exports, {
    default: () => import_study_default
  });

  // tools/importer/parsers/hero-video-dark.js
  function parse(element, { document: document2 }) {
    const image = element.querySelector(".video-fullWidth__img-container img, .video-fullWidth__img, img");
    const candidates = [];
    const video = element.querySelector("video");
    if (video) {
      candidates.push(video.getAttribute("data-hls-url"));
      candidates.push(video.getAttribute("data-src"));
      candidates.push(video.getAttribute("data-video"));
      candidates.push(video.getAttribute("src"));
    }
    element.querySelectorAll("[data-src], [data-video], [data-video-src]").forEach((el) => {
      candidates.push(el.getAttribute("data-src"));
      candidates.push(el.getAttribute("data-video"));
      candidates.push(el.getAttribute("data-video-src"));
    });
    const playerLink = element.querySelector(".video-fullWidth__player a[href], a[href]");
    if (playerLink) candidates.push(playerLink.getAttribute("href"));
    const videoUrl = candidates.find((u) => u && /^https?:\/\//i.test(u) && !/^blob:/i.test(u));
    const heading = element.querySelector(".video-fullWidth h1, .video-fullWidth h2, .video-fullWidth h3");
    const descr = element.querySelector(".video-fullWidth__description, .video-fullWidth p");
    const cells = [];
    if (image) {
      cells.push([[document2.createComment(" field:image "), image]]);
    }
    if (videoUrl) {
      const a = document2.createElement("a");
      a.href = videoUrl;
      a.textContent = videoUrl;
      cells.push([[document2.createComment(" field:video "), a]]);
    }
    const textParts = [];
    if (heading) textParts.push(heading);
    if (descr && descr.textContent.trim()) textParts.push(descr);
    if (textParts.length) {
      cells.push([[document2.createComment(" field:text "), ...textParts]]);
    }
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-video-dark", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/search-course-light.js
  function parse2(element, { document: document2 }) {
    var _a;
    const contentSearch = element.matches(".content-search__content") ? element : element.querySelector(".content-search__content");
    if (contentSearch) {
      const heading2 = contentSearch.querySelector(".content-search__title h1, .content-search__title h2, .content-search__title h3, h1, h2, h3");
      const actionLink2 = contentSearch.querySelector(".content-search__links--secondary[href], .content-search__links a[href], a[href]");
      const cells2 = [];
      const headingCell2 = [document2.createComment(" field:text ")];
      if (heading2) {
        const h = document2.createElement("h2");
        h.textContent = heading2.textContent.replace(/\s+/g, " ").trim();
        headingCell2.push(h);
      } else {
        headingCell2.push(document2.createTextNode("Find your ideal course"));
      }
      cells2.push([headingCell2]);
      if (actionLink2 && actionLink2.getAttribute("href")) {
        const a = document2.createElement("a");
        a.href = actionLink2.getAttribute("href");
        a.textContent = actionLink2.getAttribute("href");
        cells2.push([[document2.createComment(" field:action "), a]]);
      }
      const block2 = WebImporter.Blocks.createBlock(document2, { name: "search-course-light", cells: cells2 });
      element.replaceWith(block2);
      return;
    }
    const panel = element.querySelector(".search-content") || (element.matches(".search-block") ? element : null) || element.querySelector(".search-block .search-box, .search-box") || ((_a = element.closest(".search-section")) == null ? void 0 : _a.querySelector(".search-content")) || document2.querySelector(".search-section .search-content") || element;
    const heading = panel.querySelector(".search-section-title, .search-box h2, h1, h2, h3") || document2.querySelector(".search-section-title");
    const actionLink = panel.querySelector("a[href]");
    const cells = [];
    const headingCell = [document2.createComment(" field:text ")];
    if (heading) {
      headingCell.push(heading);
    } else {
      headingCell.push(document2.createTextNode("Find your dream course"));
    }
    cells.push([headingCell]);
    if (actionLink) {
      cells.push([[document2.createComment(" field:action "), actionLink]]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "search-course-light", cells });
    const introNodes = [];
    if (element.matches(".search-block") || element.querySelector(".search-block")) {
      const scope = element.matches(".search-block") ? element : element.querySelector(".search-block");
      const introCol = [...scope.querySelectorAll(".search-col")].find((col) => !col.querySelector(".search-box") && !col.matches(".search-box"));
      if (introCol) {
        const introSource = introCol.querySelector(".extra-content") || introCol;
        introSource.querySelectorAll("h1, h2, h3, h4, h5, h6, p").forEach((node) => {
          introNodes.push(node);
        });
      }
    }
    if (introNodes.length) {
      element.replaceWith(block, ...introNodes);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/cards-promo-dark-withimg-4.js
  function parse3(element, { document: document2 }) {
    let tiles = Array.from(element.querySelectorAll(".feature-block--v2"));
    if (!tiles.length) tiles = [element];
    const seen = /* @__PURE__ */ new Set();
    tiles = tiles.filter((t) => {
      if (seen.has(t)) return false;
      seen.add(t);
      return true;
    });
    const cells = [];
    tiles.forEach((tile) => {
      const textCol = tile.querySelector(".feature-block__text") || tile;
      const mediaCol = tile.querySelector(".feature-block__media") || tile;
      const headingEl = textCol.querySelector(".text-container__title, h1, h2, h3, h4");
      const cta = textCol.querySelector(".text-container__button-component a[href], .button-component a[href], a.button[href], a[href]");
      const image = mediaCol.querySelector(".image-container img, img");
      if (!headingEl && !cta && !image) return;
      const imageCell = [];
      if (image) {
        imageCell.push(document2.createComment(" field:image "));
        imageCell.push(image);
      }
      const textCell = [document2.createComment(" field:text ")];
      if (headingEl && headingEl.textContent.trim()) {
        const h = document2.createElement("h3");
        h.textContent = headingEl.textContent.trim();
        textCell.push(h);
      }
      if (cta && cta.getAttribute("href")) {
        const a = document2.createElement("a");
        a.href = cta.getAttribute("href");
        a.textContent = (cta.textContent || "").trim() || cta.getAttribute("href");
        textCell.push(a);
      }
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-promo-dark-withimg-4", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-card-dark.js
  function parse4(element, { document: document2 }) {
    const container = element.closest(".promoCard-container") || element.parentElement || element;
    const image = container.querySelector(".promoCard-image-container img, .promoCard-image, img") || element.querySelector("img");
    const heading = element.querySelector(".promoCard-content-text h1, .promoCard-content-text h2, .promoCard-content-text h3, h1, h2, h3");
    const paras = Array.from(element.querySelectorAll(".promoCard-content-text p, .promoCard-content p")).filter((p) => p.textContent.trim());
    const cta = element.querySelector(".promoCard-content-cta a[href], .button-component a[href], a.button[href], a[href]");
    if (!image && !heading && !paras.length && !cta) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) {
      cells.push([[document2.createComment(" field:image "), image]]);
    }
    const textCell = [document2.createComment(" field:text ")];
    if (heading) textCell.push(heading);
    paras.forEach((p) => textCell.push(p));
    if (cta) {
      const a = document2.createElement("a");
      a.href = cta.getAttribute("href");
      a.textContent = (cta.textContent || "").trim() || cta.getAttribute("href");
      textCell.push(a);
    }
    if (textCell.length > 1) cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-card-dark", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo-light-withimg-3.js
  function parse5(element, { document: document2 }) {
    let tiles = Array.from(element.querySelectorAll(".feature-block--v2"));
    if (!tiles.length) tiles = [element];
    const seen = /* @__PURE__ */ new Set();
    tiles = tiles.filter((t) => {
      if (seen.has(t)) return false;
      seen.add(t);
      return true;
    });
    const cells = [];
    tiles.forEach((tile) => {
      const textCol = tile.querySelector(".feature-block__text") || tile;
      const mediaCol = tile.querySelector(".feature-block__media") || tile;
      const headingEl = textCol.querySelector(".text-container__title, h1, h2, h3, h4");
      const paras = Array.from(
        textCol.querySelectorAll(".feature-block__text-content p, .text-container__text p")
      ).filter((p) => p.textContent.trim());
      const cta = textCol.querySelector(".text-container__button-component a[href], .button-component a[href], a.button[href], a[href]");
      const image = mediaCol.querySelector(".image-container img, img");
      if (!headingEl && !paras.length && !cta && !image) return;
      const imageCell = [];
      if (image) {
        imageCell.push(document2.createComment(" field:image "));
        imageCell.push(image);
      }
      const textCell = [document2.createComment(" field:text ")];
      if (headingEl && headingEl.textContent.trim()) {
        const h = document2.createElement("h3");
        h.textContent = headingEl.textContent.trim();
        textCell.push(h);
      }
      paras.forEach((p) => textCell.push(p));
      if (cta && cta.getAttribute("href")) {
        const a = document2.createElement("a");
        a.href = cta.getAttribute("href");
        a.textContent = (cta.textContent || "").trim() || cta.getAttribute("href");
        textCell.push(a);
      }
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-promo-light-withimg-3", cells });
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

  // tools/importer/import-study.js
  var parsers = {
    "hero-video-dark": parse,
    "search-course-light": parse2,
    "cards-promo-dark-withimg-4": parse3,
    "hero-card-dark": parse4,
    "cards-promo-light-withimg-3": parse5
  };
  var PAGE_TEMPLATE = {
    name: "study",
    description: "Study hub landing page: video hero + course search, intro, dark image promo tiles (2x2), Open Days hero-card, light image promo cards (3-up), Our Campuses hero-card.",
    urls: ["https://www.nottingham.ac.uk/study/home.html"],
    blocks: [
      { name: "hero-video-dark", instances: [".content-search--withHero .video-fullWidth"] },
      { name: "search-course-light", instances: [".content-search__content"] },
      { name: "cards-promo-dark-withimg-4", instances: [".featureblock.feature-block--dark-bg"] },
      { name: "hero-card-dark", instances: [".promoCard-banner"] },
      { name: "cards-promo-light-withimg-3", instances: [".featureblock.feature-block--white-bg"] }
    ],
    sections: [
      { id: "rc1", name: "Video hero", selector: [".content-search--withHero .video-fullWidth"], style: null, blocks: ["hero-video-dark"], defaultContent: [] },
      { id: "rc2", name: "Course search", selector: [".content-search__content"], style: "dark", blocks: ["search-course-light"], defaultContent: [] },
      { id: "rc3", name: "Study options tiles", selector: [".featureblock.feature-block--dark-bg"], style: null, blocks: ["cards-promo-dark-withimg-4"], defaultContent: ["h1"] },
      { id: "rc4", name: "Open days hero-card", selector: [".promoCard-banner"], style: null, blocks: ["hero-card-dark"], defaultContent: [] },
      { id: "rc5", name: "Light promo cards", selector: [".featureblock.feature-block--white-bg"], style: null, blocks: ["cards-promo-light-withimg-3"], defaultContent: [] },
      { id: "rc6", name: "Our campuses hero-card", selector: [".promoCard-banner"], style: null, blocks: ["hero-card-dark"], defaultContent: [] }
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
  var import_study_default = {
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
  return __toCommonJS(import_study_exports);
})();
