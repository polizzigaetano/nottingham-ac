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

  // tools/importer/import-carousel-landing-page.js
  var import_carousel_landing_page_exports = {};
  __export(import_carousel_landing_page_exports, {
    default: () => import_carousel_landing_page_default
  });

  // tools/importer/parsers/hero-minimal-dark-2.js
  function parse(element, { document: document2 }) {
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

  // tools/importer/parsers/search-course-light.js
  function parse2(element, { document: document2 }) {
    var _a;
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

  // tools/importer/parsers/cards-promo-dark.js
  function parse3(element, { document: document2 }) {
    if (element.matches(".sys_twoColumns_3070") || element.matches(".sys_twoColumns5050") && !element.querySelector(".card") && !element.querySelector(".kalturaEmbed")) {
      const is3070 = element.matches(".sys_twoColumns_3070");
      const textCol = element.querySelector(is3070 ? ".sys_one_3070" : ".sys_two");
      const imageCol = element.querySelector(is3070 ? ".sys_two_3070" : ".sys_one");
      const cell = [document2.createComment(" field:text ")];
      const image = imageCol ? imageCol.querySelector("img") : null;
      if (image) cell.push(image);
      if (textCol) {
        Array.from(textCol.children).forEach((child) => {
          if (child.matches("h1, h2, h3, h4, h5, h6")) {
            if (child.textContent.trim()) cell.push(child);
          } else if (child.matches("p")) {
            const link = child.querySelector("a[href]");
            if (link) {
              const a = document2.createElement("a");
              a.href = link.getAttribute("href");
              a.textContent = link.textContent.trim() || link.getAttribute("title") || "Find out more";
              cell.push(a);
            } else if (child.textContent.trim()) {
              cell.push(child);
            }
          }
        });
      }
      const daCells = [[cell]];
      const daBlock = WebImporter.Blocks.createBlock(document2, { name: "cards-promo-dark", cells: daCells });
      element.replaceWith(daBlock);
      return;
    }
    let tiles = element.querySelectorAll(".campaign-tile");
    let mode = "campaign-tile";
    if (!tiles.length) {
      tiles = element.querySelectorAll(".card-container");
      mode = "card-container";
    }
    const cells = [];
    tiles.forEach((tile) => {
      const cell = [document2.createComment(" field:text ")];
      if (mode === "card-container") {
        const image = tile.querySelector(".image-container img, img");
        if (image) cell.push(image);
        const eyebrow = tile.querySelector(".content-container > span, .content-container span");
        if (eyebrow && eyebrow.textContent.trim()) {
          const h = document2.createElement("h3");
          h.textContent = eyebrow.textContent.trim();
          cell.push(h);
        }
        tile.querySelectorAll(".content-container p").forEach((p) => cell.push(p));
        const cta = tile.querySelector(".content-container a.cta, .content-container a, a.cta, a");
        if (cta) cell.push(cta);
      } else {
        const heading = tile.querySelector(".campaign-tile-title, h2, h3, h4");
        const desc = tile.querySelector(".campaign-tile-text, p");
        const cta = tile.querySelector(".campaign-tile-links a, a");
        if (heading) cell.push(heading);
        if (desc) cell.push(desc);
        if (cta) cell.push(cta);
      }
      cells.push([cell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-promo-dark", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-ranking-gold.js
  function parse4(element, { document: document2 }) {
    var _a;
    let tiles = [...element.querySelectorAll(".ranking-tile")];
    let mode = "ranking-tile";
    if (!tiles.length) {
      tiles = [...element.querySelectorAll(".stat")];
      if (tiles.length) mode = "stat";
    }
    if (!tiles.length) {
      tiles = element.matches(".ranking-tile, .ranking-tile-container") ? [element] : [];
      mode = "ranking-tile";
    }
    const cells = [];
    tiles.forEach((tile) => {
      var _a2;
      const cell = [document2.createComment(" field:text ")];
      if (mode === "stat") {
        const captions = [...tile.querySelectorAll("p")];
        const figureClone = tile.cloneNode(true);
        figureClone.querySelectorAll("p").forEach((p) => p.remove());
        const statText = figureClone.textContent.replace(/\s+/g, " ").trim();
        if (statText) {
          const h = document2.createElement("h3");
          h.textContent = statText;
          cell.push(h);
        }
        captions.forEach((p) => cell.push(p));
      } else {
        const statText = (_a2 = tile.querySelector(".ranking-title span, .ranking-title")) == null ? void 0 : _a2.textContent.trim();
        if (statText) {
          const h = document2.createElement("h3");
          h.textContent = statText;
          cell.push(h);
        }
        tile.querySelectorAll(".ranking-text p").forEach((p) => cell.push(p));
      }
      cells.push([cell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-ranking-gold", cells });
    const introNodes = [];
    const outroNodes = [];
    if (mode === "stat") {
      const statsWrap = element.querySelector(".stats") || ((_a = tiles[0]) == null ? void 0 : _a.parentElement);
      const directChildren = [...element.children];
      const statsIndex = statsWrap ? directChildren.indexOf(statsWrap) : -1;
      directChildren.forEach((child, i) => {
        var _a2, _b;
        if (child === statsWrap) return;
        if (((_a2 = child.matches) == null ? void 0 : _a2.call(child, ".stat")) || ((_b = child.querySelector) == null ? void 0 : _b.call(child, ".stat"))) return;
        if (statsIndex !== -1 && i < statsIndex) {
          introNodes.push(child);
        } else {
          outroNodes.push(child);
        }
      });
    }
    element.replaceWith(...introNodes, block, ...outroNodes);
  }

  // tools/importer/parsers/columns-minimal-dark-withimg-2.js
  function parse5(element, { document: document2 }) {
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

  // tools/importer/parsers/cards-minimal-dark-withimg-5.js
  function parse6(element, { document: document2 }) {
    let tiles = element.querySelectorAll(".imageWhiteCTA-card");
    let mode = "homepage";
    if (!tiles.length) {
      tiles = element.querySelectorAll(".sys_CTA-ImageAndTextBlock");
      if (tiles.length) mode = "sys-cta";
    }
    if (!tiles.length) {
      tiles = element.querySelectorAll(".cmp-tile");
      mode = "cmp-tile";
    }
    if (!tiles.length) {
      tiles = element.querySelectorAll(".image-container");
      mode = "image-container";
    }
    if (!tiles.length) {
      tiles = element.querySelectorAll(".tile-content");
      mode = "image-container";
    }
    const cells = [];
    tiles.forEach((tile) => {
      let image;
      let ctaHref;
      let ctaLabel;
      if (mode === "sys-cta") {
        image = tile.querySelector(".sys_image img");
        const name = tile.querySelector(".sys_CTA-name");
        ctaHref = tile.getAttribute("href");
        ctaLabel = name ? name.textContent.trim() : tile.getAttribute("title") || tile.textContent.trim();
        const caption = tile.parentElement ? tile.parentElement.querySelector(":scope > p") : null;
        const imageCell2 = [];
        if (image) {
          imageCell2.push(document2.createComment(" field:image "));
          imageCell2.push(image);
        }
        const textCell2 = [document2.createComment(" field:text ")];
        if (ctaHref) {
          const a = document2.createElement("a");
          a.href = ctaHref;
          a.textContent = ctaLabel || ctaHref;
          textCell2.push(a);
        } else if (ctaLabel) {
          textCell2.push(document2.createTextNode(ctaLabel));
        }
        if (caption && caption.textContent.trim()) textCell2.push(caption);
        cells.push([imageCell2, textCell2]);
        return;
      }
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

  // tools/importer/parsers/carousel-minimal-dark-withimg-5.js
  function parse7(element, { document: document2 }) {
    let slides = [...element.querySelectorAll(".slick-slide:not(.slick-cloned) .vertical-card")];
    if (!slides.length) slides = [...element.querySelectorAll(".vertical-card")];
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    slides.forEach((card) => {
      const image = card.querySelector("img.vertical-card-img, img");
      const heading = card.querySelector(".news-title, h3, h2");
      const desc = card.querySelector(".news-desc, p");
      const readMore = card.querySelector(".card-content a, a.inline-link, a");
      const key = ((heading == null ? void 0 : heading.textContent) || "") + ((image == null ? void 0 : image.getAttribute("src")) || "");
      if (key && seen.has(key)) return;
      if (key) seen.add(key);
      const imageCell = [];
      if (image) {
        imageCell.push(document2.createComment(" field:image "));
        imageCell.push(image);
      }
      const textCell = [document2.createComment(" field:text ")];
      if (heading) textCell.push(heading);
      if (desc) textCell.push(desc);
      if (readMore) textCell.push(readMore);
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-minimal-dark-withimg-5", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-events-light.js
  function parse8(element, { document: document2 }) {
    const cards = element.querySelectorAll(".vertical-card");
    const cells = [];
    cards.forEach((card) => {
      const image = card.querySelector("img.vertical-card-img, img");
      const date = card.querySelector(".date");
      const title = card.querySelector(".event-title, h3, h2");
      const readMore = card.querySelector(".card-content a, a.inline-link, a");
      const imageCell = [];
      if (image) {
        imageCell.push(document2.createComment(" field:image "));
        imageCell.push(image);
      }
      const textCell = [document2.createComment(" field:text ")];
      if (date) {
        const parts = [...date.querySelectorAll(".day, .month, span")].map((s) => s.textContent.trim()).filter(Boolean);
        const dayMonth = parts.length ? parts.join(" ") : date.textContent.replace(/\s+/g, " ").trim();
        if (dayMonth) {
          const p = document2.createElement("p");
          p.textContent = dayMonth;
          textCell.push(p);
        }
      }
      if (title) textCell.push(title);
      if (readMore) textCell.push(readMore);
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-events-light", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-logos-light.js
  function parse9(element, { document: document2 }) {
    const images = element.querySelectorAll("img.partner-icon, img");
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    images.forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (src && seen.has(src)) return;
      if (src) seen.add(src);
      cells.push([[document2.createComment(" field:image "), img]]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-logos-light", cells });
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

  // tools/importer/import-carousel-landing-page.js
  var parsers = {
    "hero-minimal-dark-2": parse,
    "search-course-light": parse2,
    "cards-promo-dark": parse3,
    "cards-ranking-gold": parse4,
    "columns-minimal-dark-withimg-2": parse5,
    "cards-minimal-dark-withimg-5": parse6,
    "carousel-minimal-dark-withimg-5": parse7,
    "carousel-events-light": parse8,
    "cards-logos-light": parse9
  };
  var PAGE_TEMPLATE = {
    name: "carousel-landing-page",
    description: "Landing layout with a top carousel/feature banner, mixed content, and a form region",
    urls: [
      "https://www.nottingham.ac.uk/"
    ],
    blocks: [
      { name: "hero-minimal-dark-2", instances: [".homepage-hero-banner"] },
      { name: "search-course-light", instances: [".search-container", ".course-finder-label"] },
      { name: "cards-promo-dark", instances: [".homepage-campaign-tiles"] },
      { name: "cards-ranking-gold", instances: [".homepage-rankings", ".ranking-tile-container"] },
      { name: "columns-minimal-dark-withimg-2", instances: [".homepage-image-cta-block"] },
      { name: "cards-minimal-dark-withimg-5", instances: [".homepage-image-cta-row"] },
      { name: "carousel-minimal-dark-withimg-5", instances: [".news-section .news-carousel", ".news-section"] },
      { name: "carousel-events-light", instances: [".events-section"] },
      { name: "cards-logos-light", instances: [".homepage-partnerships", ".partnerships-container"] }
    ],
    sections: [
      { id: "s1", name: "hero", selector: [".homepage-hero-banner"], style: null, blocks: ["hero-minimal-dark-2", "search-course-light"], defaultContent: [] },
      { id: "s2", name: "campaign-tiles", selector: [".homepage-campaign-tiles"], style: null, blocks: ["cards-promo-dark"], defaultContent: [] },
      { id: "s3", name: "ranking-tiles", selector: [".homepage-rankings", ".ranking-tile-container"], style: null, blocks: ["cards-ranking-gold"], defaultContent: [] },
      { id: "s4", name: "research", selector: [".homepage-image-cta-block", ".container-max-width"], style: "highlight", blocks: ["columns-minimal-dark-withimg-2", "cards-minimal-dark-withimg-5"], defaultContent: [] },
      { id: "s5", name: "university-news", selector: [".news-section"], style: null, blocks: ["carousel-minimal-dark-withimg-5"], defaultContent: [] },
      { id: "s6", name: "featured-events", selector: [".events-section"], style: "highlight", blocks: ["carousel-events-light"], defaultContent: [] },
      { id: "s7", name: "partnerships", selector: [".homepage-partnerships", ".partnerships-container"], style: null, blocks: ["cards-logos-light"], defaultContent: [] }
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
  var import_carousel_landing_page_default = {
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
  return __toCommonJS(import_carousel_landing_page_exports);
})();
