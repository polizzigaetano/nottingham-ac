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

  // tools/importer/import-news-press-release.js
  var import_news_press_release_exports = {};
  __export(import_news_press_release_exports, {
    default: () => import_news_press_release_default
  });

  // tools/importer/parsers/nav-anchor-light.js
  function parse(element, { document: document2 }) {
    if (element.matches("ul.sys_simpleListMenu")) {
      const rows = [];
      Array.from(element.children).filter((li) => li.tagName === "LI").forEach((li) => {
        const source = Array.from(li.querySelectorAll("a[href]")).find((a2) => a2.closest("li") === li && a2.closest("ul") === element);
        if (!source) return;
        const href = (source.getAttribute("href") || "").trim();
        if (!href || href === "#") return;
        const a = document2.createElement("a");
        a.setAttribute("href", href);
        a.textContent = (source.textContent || "").replace(/\s+/g, " ").trim() || href;
        rows.push([[document2.createComment(" field:link "), a]]);
      });
      if (!rows.length) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const block2 = WebImporter.Blocks.createBlock(document2, { name: "nav-anchor-light", cells: rows });
      element.replaceWith(block2);
      return;
    }
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
  function parse2(element, { document: document2 }) {
    if (element.matches(".quoteWithImage, .quoteNoImage")) {
      const clean = (s) => (s || "").replace(/[\s\u00a0]+/g, " ").trim();
      const img = element.querySelector(".blockquoteImage img") || element.querySelector("img");
      const sourceQuote = element.querySelector(".blockquoteContent blockquote") || element.querySelector("blockquote");
      const quoteCell = [];
      if (sourceQuote) {
        const cite = sourceQuote.querySelector("footer cite") || sourceQuote.querySelector("cite, footer");
        const body = sourceQuote.cloneNode(true);
        body.querySelectorAll("footer").forEach((f) => f.remove());
        if (!sourceQuote.querySelector("footer") && cite) {
          body.querySelectorAll("cite").forEach((c) => c.remove());
        }
        const quoteText = clean(body.textContent);
        const attribution = clean(cite && cite.textContent);
        if (quoteText) {
          const p = document2.createElement("p");
          p.textContent = quoteText;
          quoteCell.push(p);
        }
        if (attribution) {
          const p = document2.createElement("p");
          const em = document2.createElement("em");
          em.textContent = attribution;
          p.append(em);
          quoteCell.push(p);
        }
      }
      const imageCell2 = img ? [img] : [];
      if (!quoteCell.length && !imageCell2.length) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const block2 = WebImporter.Blocks.createBlock(document2, {
        name: "columns-withimg-light",
        cells: [imageCell2.length ? [imageCell2, quoteCell] : [quoteCell]]
      });
      element.replaceWith(block2);
      return;
    }
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

  // tools/importer/parsers/columns.js
  function parse3(element, { document: document2 }) {
    const clean = (s) => (s || "").replace(/[\s\u00a0]+/g, " ").trim();
    const img = element.querySelector(".authorImage img") || element.querySelector("img");
    const details = element.querySelector(".authorDetails") || Array.from(element.children).find((c) => !c.querySelector("img") && clean(c.textContent));
    const lines = [];
    let current = [];
    const flush = () => {
      if (current.length) lines.push(current);
      current = [];
    };
    if (details) {
      Array.from(details.childNodes).forEach((node) => {
        if (node.nodeType === 1 && node.tagName === "BR") {
          flush();
          return;
        }
        if (node.nodeType === 1 && /^(P|DIV|UL|OL|H[1-6])$/.test(node.tagName)) {
          flush();
          lines.push([node]);
          return;
        }
        current.push(node);
      });
      flush();
    }
    const detailsCell = [];
    lines.forEach((nodes) => {
      const text = clean(nodes.map((n) => n.textContent).join(""));
      if (!text) return;
      const labelText = clean(nodes.filter((n) => n.nodeType === 1 && /^(STRONG|B)$/.test(n.tagName)).map((n) => n.textContent).join(""));
      if (labelText && labelText === text && /:$/.test(labelText)) return;
      const p = document2.createElement("p");
      nodes.forEach((n) => p.append(n.cloneNode(true)));
      p.querySelectorAll("a").forEach((a) => {
        if (!a.querySelector("*")) a.textContent = clean(a.textContent);
      });
      const first = p.firstChild;
      if (first && first.nodeType === 3) first.textContent = first.textContent.replace(/^\s+/, "");
      const last = p.lastChild;
      if (last && last.nodeType === 3) last.textContent = last.textContent.replace(/\s+$/, "");
      detailsCell.push(p);
    });
    const imageCell = img ? [img] : [];
    if (!imageCell.length && !detailsCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[imageCell, detailsCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns", cells });
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
      const newsArticle = element.querySelector("article.pressReleaseMain");
      if (newsArticle) {
        const newsTitle = element.querySelector("#content > .sys_detailImage");
        const newsNav = element.querySelector("#NavDiv");
        if (newsTitle && newsNav) newsTitle.after(newsNav);
        const pressBox = element.querySelector("#bottom > .sys_content");
        if (pressBox) {
          newsArticle.append(...pressBox.childNodes);
          pressBox.remove();
        }
        newsArticle.querySelectorAll(":scope > span.date").forEach((span) => {
          const p = document.createElement("p");
          p.textContent = span.textContent.trim();
          span.replaceWith(p);
        });
        WebImporter.DOMUtils.remove(element, ["#pageheader", "#pageTitle", "#pageToolsTab"]);
        const isEmptyNode = (el) => !el.children.length && el.textContent.replace(/[\s ]+/g, "") === "";
        newsArticle.querySelectorAll(":scope > .introParagraph").forEach((el) => {
          if (isEmptyNode(el)) el.remove();
        });
        newsArticle.querySelectorAll("p strong").forEach((strong) => {
          if (isEmptyNode(strong)) strong.replaceWith(document.createTextNode(" "));
        });
      }
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

  // tools/importer/import-news-press-release.js
  var parsers = {
    "nav-anchor-light": parse,
    "columns-withimg-light": parse2,
    "columns": parse3
  };
  var PAGE_TEMPLATE = {
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
  var import_news_press_release_default = {
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
  return __toCommonJS(import_news_press_release_exports);
})();
