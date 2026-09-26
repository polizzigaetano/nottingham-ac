/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-minimal-dark-withimg-5. Base: cards (container, with image).
 * Each image tile = one row, 2 columns: [image][text/CTA].
 * Model fields per item: image, imageAlt (collapsed into alt), text (CTA richtext).
 *
 * Handles two source shapes:
 *  - Homepage (.homepage-image-cta-row): tiles are `.imageWhiteCTA-card` with
 *    an img + a stripe CTA anchor.
 *  - UG "visiting us" style tile grids (.tileblock/.tile-block): tiles are
 *    `.cmp-tile` where the whole card is an <a> wrapping `.cmp-tile__image img`
 *    (Scene7 src) and a `.cmp-tile__title` heading.
 */
// Legacy Contensis (Food Systems Institute "Engage with us"): the instance
// selector matches each .imageWhiteCTA-card ITSELF (img.background-image +
// a.sys_white-btn), spread across .sys_threeColumns rows inside
// .container-yellow-bg. Contrast the homepage, where the instance is the
// .homepage-image-cta-row WRAPPER and the tiles are found inside it.
const LEGACY_GROUP_ROOT = '.container-yellow-bg, .container-grey-bg, .container.my-4';
const LEGACY_ROW_WRAPPER = '.sys_twoColumns5050, .sys_threeColumns, .sys_fourColumns';
const CONTENT = 'img, picture, video, iframe, table, a[href]';
const isBlankNode = (n) => !n.matches(CONTENT) && !n.querySelector(CONTENT)
  && !n.textContent.replace(/[\s\u00a0]+/g, '');

export default function parse(element, { document }) {
  // --- Legacy branch: element IS an .imageWhiteCTA-card. The runner calls the
  // parser once per card, but the group must be ONE block with a row per card.
  // First invocation collects every .imageWhiteCTA-card under the same section
  // root, emits one block in place of this card, removes the other cards plus
  // any column / row wrapper left empty, and marks them consumed so their own
  // invocations no-op. Section heading + intro stay above as default content.
  if (element.matches('.imageWhiteCTA-card')) {
    if (element.dataset && element.dataset.cardsConsumed) {
      element.remove();
      return;
    }
    const root = element.closest(LEGACY_GROUP_ROOT);
    let cards = root ? Array.from(root.querySelectorAll('.imageWhiteCTA-card')) : [];
    cards = cards.filter((c) => !(c.dataset && c.dataset.cardsConsumed));
    if (!cards.includes(element)) cards = [element];

    const rows = [];
    cards.forEach((card) => {
      const image = card.querySelector('img.background-image, img');
      const cta = card.querySelector('a.sys_white-btn[href], a.stripe-white-cta[href], a[href]');
      if (!image && !cta) return;
      const imageCell = [];
      if (image) {
        imageCell.push(document.createComment(' field:image '));
        imageCell.push(image);
      }
      const textCell = [document.createComment(' field:text ')];
      if (cta) {
        const a = document.createElement('a');
        a.href = cta.getAttribute('href');
        a.textContent = (cta.textContent || '').replace(/\s+/g, ' ').trim() || cta.getAttribute('href');
        textCell.push(a);
      }
      rows.push([imageCell, textCell]);
    });

    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }

    const rowWrappers = new Set();
    cards.forEach((card) => {
      const row = card.closest(LEGACY_ROW_WRAPPER);
      if (row && (!root || root.contains(row))) rowWrappers.add(row);
    });
    cards.forEach((card) => {
      if (card === element) return;
      if (card.dataset) card.dataset.cardsConsumed = '1';
      card.remove();
    });

    const legacyBlock = WebImporter.Blocks.createBlock(document, { name: 'cards-minimal-dark-withimg-5', cells: rows });
    element.replaceWith(legacyBlock);

    // Drop vacated / empty columns, then row wrappers with nothing left.
    rowWrappers.forEach((row) => {
      Array.from(row.children).forEach((col) => {
        if (isBlankNode(col)) col.remove();
      });
      if (isBlankNode(row)) row.remove();
    });
    return;
  }

  // Prefer the homepage tile class; fall back to the cmp-tile grid; then the
  // study-with-us image-tile shapes.
  let tiles = element.querySelectorAll('.imageWhiteCTA-card');
  let mode = 'homepage';
  if (!tiles.length) {
    // Degree-apprenticeships news/events tiles: each `.sys_*` column has an
    // <a class="sys_CTA-ImageAndTextBlock" href> wrapping a `.sys_image`
    // (background image) + `.sys_CTA-textOverlay .sys_CTA-name` (pill title),
    // with a caption <p> below the link.
    tiles = element.querySelectorAll('.sys_CTA-ImageAndTextBlock');
    if (tiles.length) mode = 'sys-cta';
  }
  if (!tiles.length) {
    tiles = element.querySelectorAll('.cmp-tile');
    mode = 'cmp-tile';
  }
  if (!tiles.length) {
    // Study-with-us .ctaTiles-component: each tile = `.image-container` (img + .cta pill).
    tiles = element.querySelectorAll('.image-container');
    mode = 'image-container';
  }
  if (!tiles.length) {
    // Study-with-us .statsTilesBlock-component .tiles-block: tiles = `.tile-content`.
    tiles = element.querySelectorAll('.tile-content');
    mode = 'image-container';
  }

  const cells = [];
  tiles.forEach((tile) => {
    let image;
    let ctaHref;
    let ctaLabel;

    if (mode === 'sys-cta') {
      // tile is the <a class="sys_CTA-ImageAndTextBlock">. The photo is the
      // <img> inside `.sys_image` (avoid the pill icon in `.sys_CTA-textOverlay`).
      image = tile.querySelector('.sys_image img');
      const name = tile.querySelector('.sys_CTA-name');
      ctaHref = tile.getAttribute('href');
      ctaLabel = name ? name.textContent.trim()
        : (tile.getAttribute('title') || tile.textContent.trim());
      // Caption <p> is a sibling of the anchor, below it in the column.
      const caption = tile.parentElement
        ? tile.parentElement.querySelector(':scope > p') : null;

      const imageCell = [];
      if (image) {
        imageCell.push(document.createComment(' field:image '));
        imageCell.push(image);
      }

      const textCell = [document.createComment(' field:text ')];
      if (ctaHref) {
        const a = document.createElement('a');
        a.href = ctaHref;
        a.textContent = ctaLabel || ctaHref;
        textCell.push(a);
      } else if (ctaLabel) {
        textCell.push(document.createTextNode(ctaLabel));
      }
      if (caption && caption.textContent.trim()) textCell.push(caption);

      cells.push([imageCell, textCell]);
      return;
    }

    if (mode === 'cmp-tile') {
      image = tile.querySelector('.cmp-tile__image img, img');
      const link = tile.matches('a') ? tile : tile.querySelector('a');
      const title = tile.querySelector('.cmp-tile__title, h1, h2, h3, h4, h5, h6');
      ctaHref = link ? link.getAttribute('href') : null;
      ctaLabel = title ? title.textContent.trim() : (link ? link.textContent.trim() : '');
    } else {
      image = tile.querySelector('img.background-image, img');
      const cta = tile.querySelector('a.stripe-white-cta, a');
      ctaHref = cta ? cta.getAttribute('href') : null;
      ctaLabel = cta ? cta.textContent.trim() : '';
    }

    // Column 1: image (field:image). imageAlt collapses into the <img> alt.
    const imageCell = [];
    if (image) {
      imageCell.push(document.createComment(' field:image '));
      imageCell.push(image);
    }

    // Column 2: CTA (field:text) — rebuild a clean anchor so the overlaid
    // pill CTA carries the tile title and destination.
    const textCell = [document.createComment(' field:text ')];
    if (ctaHref) {
      const a = document.createElement('a');
      a.href = ctaHref;
      a.textContent = ctaLabel || ctaHref;
      textCell.push(a);
    } else if (ctaLabel) {
      textCell.push(document.createTextNode(ctaLabel));
    }

    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-minimal-dark-withimg-5', cells });
  element.replaceWith(block);
}
