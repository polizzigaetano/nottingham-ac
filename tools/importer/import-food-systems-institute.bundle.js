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

  // tools/importer/import-food-systems-institute.js
  var import_food_systems_institute_exports = {};
  __export(import_food_systems_institute_exports, {
    default: () => import_food_systems_institute_default
  });

  // tools/importer/parsers/hero-minimal-dark-2.js
  function parse(element, { document: document2 }) {
    if (element.matches(".sys_standard-banner, .sys_fullWidthImage-TextWithCTA")) {
      const scope = element.querySelector(":scope > .background-image.d-none.d-sm-block") || element.querySelector(":scope > .background-image:not(.d-sm-none)") || element.querySelector(".background-image") || element;
      let image = scope.querySelector("img");
      if (!image) {
        const styled = [scope, ...scope.querySelectorAll('[style*="background-image"]')].find((el) => /url\(/i.test(el.getAttribute("style") || ""));
        const m = styled && (styled.getAttribute("style") || "").match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
        if (m) {
          image = document2.createElement("img");
          image.setAttribute("src", m[1].trim());
          image.setAttribute("alt", "");
        }
      }
      const content = scope.querySelector(".banner-content, .main-content") || scope;
      const headingSrc = content.querySelector("h1, h2, h3");
      const paras = Array.from(content.querySelectorAll("p")).filter((p) => p.textContent.replace(/[\s\u00a0]+/g, "").length);
      const ctaSrc = content.querySelector("a.sys_white-btn[href], a[href]");
      if (!headingSrc && !paras.length && !ctaSrc && !image) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const contentCell2 = [document2.createComment(" field:text ")];
      if (headingSrc && headingSrc.textContent.trim()) {
        const firstH1 = document2.querySelector("h1");
        const demote = headingSrc.tagName === "H1" && (firstH1 && !element.contains(firstH1) || !!element.parentElement.closest(".container, .container-grey-bg, .container-yellow-bg"));
        const level = demote ? "H2" : headingSrc.tagName;
        const h = document2.createElement(level);
        h.textContent = headingSrc.textContent.replace(/\s+/g, " ").trim();
        contentCell2.push(h);
      }
      paras.forEach((p) => {
        const np = document2.createElement("p");
        np.innerHTML = p.innerHTML;
        contentCell2.push(np);
      });
      if (ctaSrc) {
        const a = document2.createElement("a");
        a.setAttribute("href", ctaSrc.getAttribute("href"));
        if (ctaSrc.getAttribute("title")) a.setAttribute("title", ctaSrc.getAttribute("title"));
        a.textContent = (ctaSrc.textContent || "").replace(/\s+/g, " ").trim();
        contentCell2.push(a);
      }
      const legacyCells = [
        image ? [[document2.createComment(" field:image "), image]] : [""],
        [contentCell2]
      ];
      const block2 = WebImporter.Blocks.createBlock(document2, { name: "hero-minimal-dark-2", cells: legacyCells });
      element.replaceWith(block2);
      return;
    }
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
    let links = Array.from(element.querySelectorAll("a.sub-nav__link"));
    let legacy = false;
    let scope = element;
    if (!links.length) {
      legacy = true;
      scope = element.matches(".standard-nav-with-dropdown-desktop") ? element : element.querySelector(".standard-nav-with-dropdown-desktop") || element;
      links = Array.from(scope.querySelectorAll("a.home-link, a.top-level-link"));
    }
    const resolveHref = (source) => {
      const raw = (source.getAttribute("href") || "").trim();
      if (raw && raw !== "#") return raw;
      if (!legacy) return null;
      let menu = source.nextElementSibling && source.nextElementSibling.classList.contains("dropdown-menu") ? source.nextElementSibling : null;
      if (!menu) {
        const toggles = links.filter((a) => (a.getAttribute("href") || "").trim() === "#");
        const menus = Array.from(scope.querySelectorAll(".dropdown-menu"));
        if (toggles.length === menus.length) menu = menus[toggles.indexOf(source)] || null;
      }
      if (!menu) {
        const id = source.getAttribute("id");
        if (id) menu = element.querySelector(`.dropdown-menu[aria-labelledby="${id}"]`);
      }
      if (!menu) return null;
      const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
      const label = norm(source.textContent);
      const items = Array.from(menu.querySelectorAll("a.dropdown-item[href]"));
      const match = items.find((it) => norm(it.textContent) === label);
      let best = null;
      if (!match) {
        const STOP = ["and", "the", "our", "for", "with"];
        const words = (s) => norm(s).replace(/&/g, " and ").split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.includes(w));
        const labelWords = words(label);
        let bestScore = 0;
        items.forEach((it) => {
          const score = words(it.textContent).filter((w) => labelWords.includes(w)).length;
          if (score > bestScore) {
            bestScore = score;
            best = it;
          }
        });
      }
      const chosen = match || best || items[0];
      return chosen ? chosen.getAttribute("href") : null;
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

  // tools/importer/parsers/columns-withimg-light.js
  function parse3(element, { document: document2 }) {
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
    if (element.matches(".sys_twoColumns5050, .sys_threeColumns, .sys_fourColumns") && !element.querySelector(".imageTextContentCTA-card, .sys_imageTitleContentCTA-card, .imageWhiteCTA-card")) {
      const MEDIA = "img, picture, video, iframe";
      const isBlank = (n) => !n.matches(MEDIA) && !n.querySelector(MEDIA) && !n.textContent.replace(/[\s\u00a0]+/g, "");
      const columnCells = Array.from(element.children).filter((col) => col.tagName === "DIV" && !col.classList.contains("clear")).map((col) => {
        const cell = [];
        Array.from(col.children).forEach((child) => {
          if (isBlank(child)) return;
          if (/^H[1-6]$/.test(child.tagName)) {
            const h = document2.createElement(child.tagName);
            h.textContent = child.textContent.replace(/[\s\u00a0]+/g, " ").trim();
            cell.push(h);
          } else {
            cell.push(child);
          }
        });
        return cell;
      });
      if (!columnCells.some((cell) => cell.length)) {
        element.replaceWith(...element.childNodes);
        return;
      }
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

  // tools/importer/parsers/cards-promo-light-withimg-3.js
  var LEGACY_CARD = ".imageTextContentCTA-card, .sys_imageTitleContentCTA-card";
  var GROUP_ROOT = ".container-grey-bg, .container-yellow-bg, .container.my-4";
  var ROW_WRAPPER = ".sys_twoColumns5050, .sys_threeColumns, .sys_fourColumns";
  var CONTENT = "img, picture, video, iframe, table, a[href]";
  var isBlankNode = (n) => !n.matches(CONTENT) && !n.querySelector(CONTENT) && !n.textContent.replace(/[\s\u00a0]+/g, "");
  function buildLegacyRow(card, document2) {
    const image = card.querySelector("img");
    const textContent = card.querySelector(".text-content") || card;
    const headingEl = textContent.querySelector("span, h1, h2, h3, h4");
    let title = headingEl ? headingEl.textContent.trim() : "";
    if (!title) {
      const loose = Array.from(textContent.childNodes).find((n) => n.nodeType === 3 && n.textContent.trim());
      if (loose) title = loose.textContent.replace(/\s+/g, " ").trim();
    }
    const paras = Array.from(textContent.querySelectorAll("p")).filter((p) => p.textContent.trim());
    const cta = card.querySelector(".cta-content a[href], a.sys_secondary-btn[href], a.sys_primary-btn[href], a.button[href], a[href]");
    if (!image && !title && !paras.length && !cta) return null;
    const imageCell = [];
    if (image) {
      imageCell.push(document2.createComment(" field:image "));
      imageCell.push(image);
    }
    const textCell = [document2.createComment(" field:text ")];
    if (title) {
      const h = document2.createElement("h3");
      h.textContent = title;
      textCell.push(h);
    }
    paras.forEach((p) => textCell.push(p));
    if (cta && cta.getAttribute("href")) {
      const a = document2.createElement("a");
      a.href = cta.getAttribute("href");
      a.textContent = (cta.textContent || "").trim() || cta.getAttribute("href");
      textCell.push(a);
    }
    return [imageCell, textCell];
  }
  function parse4(element, { document: document2 }) {
    if (element.matches(LEGACY_CARD) || element.querySelector(".cta-content, .text-content")) {
      if (element.dataset && element.dataset.cardsConsumed) {
        element.remove();
        return;
      }
      const root = element.matches(LEGACY_CARD) ? element.closest(GROUP_ROOT) : null;
      let cards = root ? Array.from(root.querySelectorAll(LEGACY_CARD)) : [];
      cards = cards.filter((c) => !(c.dataset && c.dataset.cardsConsumed));
      if (!cards.includes(element)) cards = [element];
      const rows = cards.map((card) => buildLegacyRow(card, document2)).filter(Boolean);
      if (!rows.length) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const rowWrappers = /* @__PURE__ */ new Set();
      cards.forEach((card) => {
        const row = card.closest(ROW_WRAPPER);
        if (row && (!root || root.contains(row))) rowWrappers.add(row);
      });
      cards.forEach((card) => {
        if (card === element) return;
        if (card.dataset) card.dataset.cardsConsumed = "1";
        card.remove();
      });
      const block2 = WebImporter.Blocks.createBlock(document2, {
        name: "cards-promo-light-withimg-3",
        cells: rows
      });
      element.replaceWith(block2);
      rowWrappers.forEach((row) => {
        Array.from(row.children).forEach((col) => {
          if (isBlankNode(col)) col.remove();
        });
        if (isBlankNode(row)) row.remove();
      });
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

  // tools/importer/parsers/cards-minimal-dark-withimg-5.js
  var LEGACY_GROUP_ROOT = ".container-yellow-bg, .container-grey-bg, .container.my-4";
  var LEGACY_ROW_WRAPPER = ".sys_twoColumns5050, .sys_threeColumns, .sys_fourColumns";
  var CONTENT2 = "img, picture, video, iframe, table, a[href]";
  var isBlankNode2 = (n) => !n.matches(CONTENT2) && !n.querySelector(CONTENT2) && !n.textContent.replace(/[\s\u00a0]+/g, "");
  function parse5(element, { document: document2 }) {
    if (element.matches(".imageWhiteCTA-card")) {
      if (element.dataset && element.dataset.cardsConsumed) {
        element.remove();
        return;
      }
      const root = element.closest(LEGACY_GROUP_ROOT);
      let cards = root ? Array.from(root.querySelectorAll(".imageWhiteCTA-card")) : [];
      cards = cards.filter((c) => !(c.dataset && c.dataset.cardsConsumed));
      if (!cards.includes(element)) cards = [element];
      const rows = [];
      cards.forEach((card) => {
        const image = card.querySelector("img.background-image, img");
        const cta = card.querySelector("a.sys_white-btn[href], a.stripe-white-cta[href], a[href]");
        if (!image && !cta) return;
        const imageCell = [];
        if (image) {
          imageCell.push(document2.createComment(" field:image "));
          imageCell.push(image);
        }
        const textCell = [document2.createComment(" field:text ")];
        if (cta) {
          const a = document2.createElement("a");
          a.href = cta.getAttribute("href");
          a.textContent = (cta.textContent || "").replace(/\s+/g, " ").trim() || cta.getAttribute("href");
          textCell.push(a);
        }
        rows.push([imageCell, textCell]);
      });
      if (!rows.length) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const rowWrappers = /* @__PURE__ */ new Set();
      cards.forEach((card) => {
        const row = card.closest(LEGACY_ROW_WRAPPER);
        if (row && (!root || root.contains(row))) rowWrappers.add(row);
      });
      cards.forEach((card) => {
        if (card === element) return;
        if (card.dataset) card.dataset.cardsConsumed = "1";
        card.remove();
      });
      const legacyBlock = WebImporter.Blocks.createBlock(document2, { name: "cards-minimal-dark-withimg-5", cells: rows });
      element.replaceWith(legacyBlock);
      rowWrappers.forEach((row) => {
        Array.from(row.children).forEach((col) => {
          if (isBlankNode2(col)) col.remove();
        });
        if (isBlankNode2(row)) row.remove();
      });
      return;
    }
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
      WebImporter.DOMUtils.remove(element, [
        ".standard-nav-with-dropdown-mobile"
      ]);
      element.querySelectorAll(".sys_standard-banner").forEach((banner) => {
        const mobile = banner.querySelector(":scope > .background-image.d-block.d-sm-none");
        const desktop = banner.querySelector(":scope > .background-image.d-none.d-sm-block");
        if (!mobile || !desktop) return;
        const headingText = (el) => {
          const h = el.querySelector("h1, h2, h3");
          return h ? h.textContent.replace(/\s+/g, " ").trim() : "";
        };
        if (headingText(mobile) && headingText(mobile) === headingText(desktop)) mobile.remove();
      });
      element.querySelectorAll('a[href^="javascript:"]').forEach((a) => a.remove());
      element.querySelectorAll("#serviceDetail .hidden").forEach((n) => n.remove());
    }
    if (hookName === H.after) {
      element.querySelectorAll("blockquote").forEach((bq) => {
        if (!bq.querySelector("table")) return;
        while (bq.firstChild) bq.parentNode.insertBefore(bq.firstChild, bq);
        bq.remove();
      });
      const isBlank = (el) => !el.children.length && el.textContent.replace(/[\s\u00a0]+/g, "") === "";
      element.querySelectorAll("#container p, #container div.clear").forEach((el) => {
        if (isBlank(el)) el.remove();
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

  // tools/importer/import-food-systems-institute.js
  var parsers = {
    "hero-minimal-dark-2": parse,
    "nav-anchor-light": parse2,
    "columns-withimg-light": parse3,
    "cards-promo-light-withimg-3": parse4,
    "cards-minimal-dark-withimg-5": parse5
  };
  var PAGE_TEMPLATE = {
    "name": "food-systems-institute",
    "description": "Food Systems Institute landing page (legacy Contensis science institute template) \u2014 reuse-only migration.",
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
  var import_food_systems_institute_default = {
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
  return __toCommonJS(import_food_systems_institute_exports);
})();
