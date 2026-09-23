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

  // tools/importer/import-international-applicants.js
  var import_international_applicants_exports = {};
  __export(import_international_applicants_exports, {
    default: () => import_international_applicants_default
  });

  // tools/importer/parsers/hero-card-dark.js
  function parse(element, { document: document2 }) {
    if (element.matches(".sys_standard-banner") || element.querySelector(".background-image")) {
      const bgDivs = Array.from(element.querySelectorAll(".background-image"));
      const bgDiv = bgDivs.find((d) => d.classList.contains("d-sm-block")) || bgDivs[0] || null;
      let image2 = element.querySelector("img");
      if (!image2 && bgDiv) {
        const style = bgDiv.getAttribute("style") || "";
        const m = style.match(/url\((['"]?)([^'")]+)\1\)/i);
        if (m && m[2]) {
          image2 = document2.createElement("img");
          image2.setAttribute("src", m[2].trim());
        }
      }
      const scope = bgDiv || element;
      const heading2 = scope.querySelector(".banner-content h1, .banner-content h2, .banner-content h3, h1, h2, h3");
      const paras2 = Array.from(scope.querySelectorAll(".banner-content p, p")).filter((p) => p.textContent.trim());
      if (!image2 && !heading2 && !paras2.length) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const cells2 = [];
      if (image2) cells2.push([[document2.createComment(" field:image "), image2]]);
      const textCell2 = [document2.createComment(" field:text ")];
      if (heading2) textCell2.push(heading2);
      paras2.forEach((p) => textCell2.push(p));
      if (textCell2.length > 1) cells2.push([textCell2]);
      const block2 = WebImporter.Blocks.createBlock(document2, { name: "hero-card-dark", cells: cells2 });
      element.replaceWith(block2);
      return;
    }
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

  // tools/importer/parsers/nav-anchor-light.js
  function parse2(element, { document: document2 }) {
    let links = Array.from(element.querySelectorAll("a.sub-nav__link"));
    let legacy = false;
    if (!links.length) {
      legacy = true;
      links = Array.from(element.querySelectorAll("a.home-link, a.top-level-link"));
    }
    const resolveHref = (source) => {
      const raw = (source.getAttribute("href") || "").trim();
      if (raw && raw !== "#") return raw;
      if (!legacy) return null;
      let menu = source.nextElementSibling && source.nextElementSibling.classList.contains("dropdown-menu") ? source.nextElementSibling : null;
      if (!menu) {
        const id = source.getAttribute("id");
        if (id) menu = element.querySelector(`.dropdown-menu[aria-labelledby="${id}"]`);
      }
      if (!menu) return null;
      const label = (source.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
      const items = Array.from(menu.querySelectorAll("a.dropdown-item[href]"));
      const match = items.find((it) => (it.textContent || "").replace(/\s+/g, " ").trim().toLowerCase() === label);
      return (match || items[0] || {}).getAttribute ? (match || items[0]).getAttribute("href") : null;
    };
    const cells = [];
    links.forEach((source) => {
      const href = resolveHref(source);
      if (!href) return;
      const a = document2.createElement("a");
      a.setAttribute("href", href);
      const isHome = source.classList.contains("sub-nav__home-btn") || source.classList.contains("home-link");
      let label = (source.textContent || "").replace(/\s+/g, " ").trim();
      if (isHome || !label || label.toLowerCase() === "home") {
        label = isHome ? "Home" : label || href;
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

  // tools/importer/parsers/cards-promo-light-withimg-3.js
  function parse3(element, { document: document2 }) {
    if (element.matches(".imageTextContentCTA-card") || element.querySelector(".cta-content, .text-content")) {
      const image = element.querySelector("img");
      const textContent = element.querySelector(".text-content") || element;
      const headingEl = textContent.querySelector("span, h1, h2, h3, h4");
      const paras = Array.from(textContent.querySelectorAll("p")).filter((p) => p.textContent.trim());
      const cta = element.querySelector(".cta-content a[href], a.sys_secondary-btn[href], a.button[href], a[href]");
      if (!image && !headingEl && !paras.length && !cta) {
        element.replaceWith(...element.childNodes);
        return;
      }
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
      const block2 = WebImporter.Blocks.createBlock(document2, {
        name: "cards-promo-light-withimg-3",
        cells: [[imageCell, textCell]]
      });
      element.replaceWith(block2);
      return;
    }
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

  // tools/importer/parsers/cards-nav-light.js
  function parse4(element, { document: document2 }) {
    if (element.matches(".card-section") || !element.querySelector(".card") && element.closest(".card")) {
      const section = element.matches(".card-section") ? element : element.querySelector(".card-section") || element;
      const card = section.closest(".card") || section.parentElement;
      const link = section.closest("a[href]");
      const href = link ? link.getAttribute("href") : null;
      const image = card ? card.querySelector("img") : null;
      const title = section.querySelector("h2, h3, h4") || section.querySelector("h2");
      const caption = section.querySelector("p");
      if (!image && !title && !caption && !href) {
        element.replaceWith(...element.childNodes);
        return;
      }
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
      const replaceTarget = link && element.contains(link) === false && link.contains(element) ? link : element;
      const block2 = WebImporter.Blocks.createBlock(document2, {
        name: "cards-nav-light",
        cells: [[imageCell, textCell]]
      });
      replaceTarget.replaceWith(block2);
      return;
    }
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

  // tools/importer/parsers/cards-promo-light.js
  function parse5(element, { document: document2 }) {
    if (element.matches(".sys_solid-blue-background-box, .sys_solid-background-box, blockquote.sys_blockquoteAlt") && !element.querySelector(".feature-block__text")) {
      const cell = [document2.createComment(" field:text ")];
      const titleEl = element.querySelector("h1, h2, h3, .text-container__title");
      if (titleEl && titleEl.textContent.trim()) {
        const h3 = document2.createElement("h3");
        h3.textContent = titleEl.textContent.trim();
        cell.push(h3);
      }
      const paras = Array.from(element.querySelectorAll("p")).filter((p) => p.textContent.trim() && !(p.querySelector("a[href]") && !p.textContent.replace(p.querySelector("a[href]").textContent, "").trim()));
      paras.forEach((p) => cell.push(p));
      const source = element.querySelector("a[href]");
      if (source && source.getAttribute("href")) {
        const a = document2.createElement("a");
        a.setAttribute("href", source.getAttribute("href"));
        a.textContent = (source.textContent || "").replace(/\s+/g, " ").trim() || source.getAttribute("title") || source.getAttribute("href");
        cell.push(a);
      }
      if (cell.length === 1) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const block2 = WebImporter.Blocks.createBlock(document2, {
        name: "cards-promo-light",
        cells: [[cell]]
      });
      element.replaceWith(block2);
      return;
    }
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

  // tools/importer/parsers/columns-withimg-light.js
  function parse6(element, { document: document2 }) {
    if (element.matches(".sys_vertically-centred-content")) {
      if (element.dataset && element.dataset.colsConsumed) {
        element.remove();
        return;
      }
      const wrapper = element.closest('[class*="Columns"], [class*="columns"], blockquote') || element.parentElement;
      let parts = wrapper ? Array.from(wrapper.querySelectorAll(".sys_vertically-centred-content")) : [element];
      if (!parts.length) parts = [element];
      const columnCells = parts.map((part) => {
        const cell = [];
        const img = part.querySelector("img");
        if (img) cell.push(img);
        Array.from(part.querySelectorAll("p, h1, h2, h3, h4, blockquote")).filter((n) => n.textContent.trim() || n.querySelector("img")).forEach((n) => cell.push(n));
        if (!cell.length && part.textContent.trim()) cell.push(part);
        return cell;
      }).filter((cell) => cell.length);
      if (!columnCells.length) {
        element.replaceWith(...element.childNodes);
        return;
      }
      parts.forEach((part) => {
        if (part !== element && part.dataset) part.dataset.colsConsumed = "1";
      });
      const block2 = WebImporter.Blocks.createBlock(document2, {
        name: "columns-withimg-light",
        cells: [columnCells]
      });
      element.replaceWith(block2);
      return;
    }
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

  // tools/importer/parsers/cards-ranking-gold.js
  function parse7(element, { document: document2 }) {
    var _a;
    if (element.matches(".sys_drop-shadow-background-box")) {
      const cell = [document2.createComment(" field:text ")];
      const paras = Array.from(element.querySelectorAll("p")).filter((p) => p.textContent.trim());
      const headlineEl = element.querySelector("p.introParagraph") || paras[0] || null;
      const sourceEls = paras.filter((p) => p !== headlineEl);
      if (headlineEl && headlineEl.textContent.trim()) {
        const h = document2.createElement("h3");
        h.textContent = headlineEl.textContent.replace(/\s+/g, " ").trim();
        cell.push(h);
      }
      sourceEls.forEach((p) => cell.push(p));
      if (cell.length === 1) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const block2 = WebImporter.Blocks.createBlock(document2, {
        name: "cards-ranking-gold",
        cells: [[cell]]
      });
      element.replaceWith(block2);
      return;
    }
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
      WebImporter.DOMUtils.remove(element, [
        ".standard-nav-with-dropdown-mobile"
      ]);
      element.querySelectorAll('a[href^="javascript:"]').forEach((a) => a.remove());
      element.querySelectorAll("#serviceDetail .hidden").forEach((n) => n.remove());
    }
    if (hookName === H.after) {
      element.querySelectorAll("blockquote").forEach((bq) => {
        if (!bq.querySelector("table")) return;
        while (bq.firstChild) bq.parentNode.insertBefore(bq.firstChild, bq);
        bq.remove();
      });
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
        // Modern header breadcrumb trail on studywithus/* pages (verified in
        // cleaned.html: <div id="L1_Breadcrumbs" class="global-breadcrumbs">
        // "University of Nottingham > Study with us > International students",
        // line 462). Non-authorable global chrome sitting just below the header;
        // the template's sec-breadcrumb section (style null, first section) is
        // skipped by the section transformer, so removing it here is consistent.
        "#L1_Breadcrumbs",
        ".global-breadcrumbs",
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

  // tools/importer/import-international-applicants.js
  var parsers = {
    "hero-card-dark": parse,
    "nav-anchor-light": parse2,
    "cards-promo-light-withimg-3": parse3,
    "cards-nav-light": parse4,
    "cards-promo-light": parse5,
    "columns-withimg-light": parse6,
    "cards-ranking-gold": parse7
  };
  var PAGE_TEMPLATE = {
    name: "international-applicants",
    description: "International applicants landing page (Study With Us family): full-bleed hero, in-page anchor nav, 2 promo tiles, 6 nav cards, feature panels, testimonial, 5 ranking stats, closing panel. Reuse-only migration.",
    urls: ["https://www.nottingham.ac.uk/studywithus/international-applicants/index.aspx"],
    blocks: [
      { name: "hero-card-dark", instances: [".sys_standard-banner"] },
      { name: "nav-anchor-light", instances: [".standard-nav-with-dropdown-desktop"] },
      { name: "cards-promo-light-withimg-3", instances: [".imageTextContentCTA-card"] },
      { name: "cards-nav-light", instances: [".card-section"] },
      { name: "cards-promo-light", instances: [".sys_solid-blue-background-box", "blockquote.sys_blockquoteAlt:nth-of-type(2)"] },
      { name: "columns-withimg-light", instances: [".sys_vertically-centred-content"] },
      { name: "cards-ranking-gold", instances: [".sys_drop-shadow-background-box"] }
    ],
    sections: [
      { id: "sec-breadcrumb", name: "breadcrumb", selector: ["#L1_Breadcrumbs", ".global-breadcrumbs"], style: null, blocks: [], defaultContent: ["#L1_Breadcrumbs"] },
      { id: "sec-hero", name: "hero", selector: [".sys_standard-banner"], style: null, blocks: ["hero-card-dark"], defaultContent: [] },
      { id: "sec-anchornav", name: "anchor-nav", selector: [".standard-nav-with-dropdown-desktop"], style: null, blocks: ["nav-anchor-light"], defaultContent: [] },
      { id: "sec-intro-cta", name: "intro-cta", selector: [".introParagraph"], style: null, blocks: [], defaultContent: [".introParagraph"] },
      { id: "sec-promo-tiles", name: "promo-tiles", selector: [".text-content", ".imageTextContentCTA-card"], style: "grey", blocks: ["cards-promo-light-withimg-3"], defaultContent: [] },
      { id: "sec-nav-cards", name: "nav-cards", selector: [".card-section"], style: null, blocks: ["cards-nav-light"], defaultContent: [] },
      { id: "sec-feature-panels-1", name: "feature-panels", selector: [".sys_solid-blue-background-box"], style: "navy-blue", blocks: ["cards-promo-light"], defaultContent: [] },
      { id: "sec-testimonial", name: "testimonial", selector: [".sys_vertically-centred-content"], style: null, blocks: ["columns-withimg-light"], defaultContent: [] },
      { id: "sec-rankings", name: "rankings", selector: [".sys_fiveColumns", ".sys_drop-shadow-background-box"], style: null, blocks: ["cards-ranking-gold"], defaultContent: [] },
      { id: "sec-intro-cta-2", name: "intro-cta-2", selector: [".introParagraph"], style: null, blocks: [], defaultContent: [".introParagraph"] },
      { id: "sec-preparing", name: "preparing", selector: ["blockquote.sys_blockquoteAlt:nth-of-type(2)"], style: "navy-blue", blocks: ["cards-promo-light"], defaultContent: [] }
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
  var import_international_applicants_default = {
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
  return __toCommonJS(import_international_applicants_exports);
})();
