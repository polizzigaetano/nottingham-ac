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

  // tools/importer/import-degree-apprenticeships.js
  var import_degree_apprenticeships_exports = {};
  __export(import_degree_apprenticeships_exports, {
    default: () => import_degree_apprenticeships_default
  });

  // tools/importer/parsers/carousel-hero-dark.js
  function parse(element, { document: document2 }) {
    const slides = Array.from(element.querySelectorAll(".cycle-slide"));
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    slides.forEach((slide) => {
      const text = slide.querySelector(".slide__text");
      if (!text) return;
      const heading = slide.querySelector(".slideHeading h2, .slideHeading h1, .slideHeading, h2, h1");
      const key = (heading ? heading.textContent : "").trim().toLowerCase();
      if (key && seen.has(key)) return;
      if (key) seen.add(key);
      let image = Array.from(slide.querySelectorAll("img")).find(
        (img) => !img.closest(".controls") && !img.closest(".control") && img.getAttribute("src") && !img.getAttribute("src").startsWith("data:")
      );
      if (!image) {
        const bgHost = slide.querySelector('.row.column[style*="background"], [style*="background-image"]');
        const style = bgHost ? bgHost.getAttribute("style") || "" : "";
        const m = style.match(/background-image:\s*url\((['"]?)([^'")]+)\1\)/i);
        if (m && m[2]) {
          image = document2.createElement("img");
          image.setAttribute("src", m[2]);
          if (heading) image.setAttribute("alt", (heading.textContent || "").trim());
        }
      }
      const subText = slide.querySelector(".subText");
      const cta = slide.querySelector(".callToAction a, a.button");
      const imageCell = [document2.createComment(" field:image ")];
      if (image) imageCell.push(image);
      const textCell = [document2.createComment(" field:text ")];
      if (heading) {
        const h = heading.matches("h1, h2, h3, h4, h5, h6") ? heading : heading.querySelector("h1, h2, h3, h4, h5, h6") || heading;
        textCell.push(h);
      }
      if (subText && subText.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = subText.textContent.trim();
        textCell.push(p);
      }
      if (cta) {
        const a = document2.createElement("a");
        a.href = cta.getAttribute("href");
        a.textContent = cta.textContent.trim() || cta.getAttribute("title") || "Find out more";
        const wrap = document2.createElement("p");
        wrap.appendChild(a);
        textCell.push(wrap);
      }
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-hero-dark", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-nav-light.js
  function parse2(element, { document: document2 }) {
    const cards = Array.from(element.querySelectorAll(".card"));
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    cards.forEach((card) => {
      const link = card.closest("a[href]") || card.querySelector("a[href]");
      const href = link ? link.getAttribute("href") : null;
      const image = card.querySelector("img");
      const title = card.querySelector(".card-section h2, .card-section h3, h2, h3");
      const caption = card.querySelector(".card-section p, p");
      const key = (href || title && title.textContent || "").trim();
      if (key && seen.has(key)) return;
      if (key) seen.add(key);
      const imageCell = [document2.createComment(" field:image ")];
      if (image) imageCell.push(image);
      const textCell = [document2.createComment(" field:text ")];
      if (title) textCell.push(title);
      if (caption) textCell.push(caption);
      if (href) {
        const a = document2.createElement("a");
        a.href = href;
        a.textContent = link && link.getAttribute("title") || title && title.textContent.trim() || "Find out more";
        const wrap = document2.createElement("p");
        wrap.appendChild(a);
        textCell.push(wrap);
      }
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-nav-light", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon-light.js
  function parse3(element, { document: document2 }) {
    let columns = Array.from(element.querySelectorAll(
      ":scope > .sys_one, :scope > .sys_two, :scope > .sys_three, :scope > .sys_four"
    ));
    if (!columns.length) {
      columns = Array.from(element.querySelectorAll(":scope > div"));
    }
    const cells = [];
    columns.forEach((col) => {
      const image = col.querySelector("img");
      const captionParts = Array.from(col.querySelectorAll(":scope > p")).filter(
        (p) => !p.querySelector("img")
      );
      const imageCell = [document2.createComment(" field:image ")];
      if (image) imageCell.push(image);
      const textCell = [document2.createComment(" field:text ")];
      captionParts.forEach((p) => textCell.push(p));
      if (!image && !captionParts.length) return;
      cells.push([imageCell, textCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-icon-light", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-video-light.js
  function parse4(element, { document: document2 }) {
    const textCol = element.querySelector(":scope > .sys_one");
    const videoCol = element.querySelector(":scope > .sys_two");
    const textCell = [];
    if (textCol) {
      Array.from(textCol.children).forEach((child) => {
        if (child.textContent && child.textContent.trim()) textCell.push(child);
      });
    }
    const videoCell = [];
    const iframe = element.querySelector(".kalturaEmbed iframe, iframe");
    const src = iframe ? iframe.getAttribute("src") : null;
    if (src) {
      const a = document2.createElement("a");
      a.href = src;
      a.textContent = (iframe.getAttribute("title") || "Video").trim();
      videoCell.push(a);
    }
    if (!textCell.length && !videoCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[textCell, videoCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-video-light", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo-dark.js
  function parse5(element, { document: document2 }) {
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

  // tools/importer/import-degree-apprenticeships.js
  var parsers = {
    "carousel-hero-dark": parse,
    "cards-nav-light": parse2,
    "cards-icon-light": parse3,
    "columns-video-light": parse4,
    "cards-promo-dark": parse5,
    "cards-minimal-dark-withimg-5": parse6
  };
  var PAGE_TEMPLATE = {
    name: "degree-apprenticeships",
    description: "Degree Apprenticeships landing page: hero carousel, intro, employer/apprentice nav cards, credibility icon strip, programme overview + video, vacancies promo, news/events tiles, question-zone promo, and connect CTAs.",
    urls: ["https://www.nottingham.ac.uk/workingwithbusiness/degree-apprenticeships/degree-apprenticeships.aspx"],
    blocks: [
      { name: "carousel-hero-dark", instances: [".banner.cycle"] },
      { name: "cards-nav-light", instances: [".sys_twoColumns5050:has(.card)"] },
      { name: "cards-icon-light", instances: [".sys_fourColumns"] },
      { name: "columns-video-light", instances: [".sys_twoColumns5050:has(.kalturaEmbed)"] },
      { name: "cards-promo-dark", instances: [".sys_twoColumns5050:not(:has(.card)):not(:has(.kalturaEmbed))", ".sys_twoColumns_3070"] },
      { name: "cards-minimal-dark-withimg-5", instances: [".sys_threeColumns:has(.sys_CTA-ImageAndTextBlock)"] }
    ],
    sections: [
      { id: "s1", name: "Page title", selector: [".breadcrumbs + *", "h1"], style: null, blocks: [], defaultContent: ["h1"] },
      { id: "s2", name: "Hero banner carousel", selector: [".banner.cycle"], style: null, blocks: ["carousel-hero-dark"], defaultContent: [] },
      { id: "s3", name: "Intro lead paragraph", selector: [".sys_twoColumns5050:has(.card)"], style: null, blocks: [], defaultContent: [] },
      { id: "s4", name: "For employers / apprentices tiles", selector: [".sys_twoColumns5050:has(.card)"], style: null, blocks: ["cards-nav-light"], defaultContent: [] },
      { id: "s5", name: "Ranking / credibility strip", selector: [".sys_fourColumns"], style: null, blocks: ["cards-icon-light"], defaultContent: [] },
      { id: "s6", name: "Programme overview + video", selector: [".sys_twoColumns5050:has(.kalturaEmbed)"], style: null, blocks: ["columns-video-light"], defaultContent: [] },
      { id: "s7", name: "Vacancies promo", selector: [".sys_twoColumns5050:not(:has(.card)):not(:has(.kalturaEmbed))"], style: null, blocks: ["cards-promo-dark"], defaultContent: [] },
      { id: "s8", name: "Latest news and events tiles", selector: [".sys_threeColumns:has(.sys_CTA-ImageAndTextBlock)"], style: null, blocks: ["cards-minimal-dark-withimg-5"], defaultContent: [] },
      { id: "s9", name: "Question zone promo", selector: [".sys_twoColumns_3070"], style: null, blocks: ["cards-promo-dark"], defaultContent: [] },
      { id: "s10", name: "Connect CTA row", selector: [".sys_threeColumns:has(.CTA-LinkedIn)"], style: null, blocks: [], defaultContent: [".CTA-LinkedIn", ".CTA-Twitter", ".CTA-ArrowRoundRight"] }
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
  var import_degree_apprenticeships_default = {
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
  return __toCommonJS(import_degree_apprenticeships_exports);
})();
