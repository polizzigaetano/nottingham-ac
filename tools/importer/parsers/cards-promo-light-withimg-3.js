/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo-light-withimg-3. Base: cards (container, with image, light).
 * Source: https://www.nottingham.ac.uk/study/home.html
 * Anchor: .featureblock.feature-block--white-bg  (3 tiles: Scholarships/fees /
 *   Discover life / Help and support).
 *
 * xwalk container block. Authoritative structure = the block's own item model
 * cards-promo-light-withimg-3-item (image + imageAlt + text), NOT the generic
 * "cards-logos" library convention. Same `.feature-block--v2` layout as the dark
 * variant, but may include a paragraph. Each tile = one row, 2 columns:
 *   Col 1: [field:image] the tile photo (Scene7 DM <img>, emit as-is; imageAlt
 *          collapses into the <img>).
 *   Col 2: [field:text] heading (rebuilt as <h3>) + optional paragraph + outline CTA.
 *
 * findBlocksOnPage passes EACH matched `.feature-block--white-bg` separately, so
 * this parser normally receives ONE tile. It also defensively handles a wrapper
 * that contains multiple `.feature-block--v2` tiles.
 */
// Legacy Contensis card classes (International applicants, Food Systems Institute).
const LEGACY_CARD = '.imageTextContentCTA-card, .sys_imageTitleContentCTA-card';
// Nearest section ancestor that bounds one card group.
const GROUP_ROOT = '.container-grey-bg, .container-yellow-bg, .container.my-4';
// Contensis column-row wrappers the cards are spread across.
const ROW_WRAPPER = '.sys_twoColumns5050, .sys_threeColumns, .sys_fourColumns';
const CONTENT = 'img, picture, video, iframe, table, a[href]';

const isBlankNode = (n) => !n.matches(CONTENT) && !n.querySelector(CONTENT)
  && !n.textContent.replace(/[\s\u00a0]+/g, '');

// One legacy card -> [imageCell, textCell], or null when the card is empty.
//  .imageTextContentCTA-card:      <img> + .cta-content > (.text-content > <span> + <p>) + a.sys_secondary-btn
//  .sys_imageTitleContentCTA-card: <img> + .text-content > (<span.d-block> + <p>) + a.sys_primary-btn
// NOTE the title is a <span>, not a heading tag — read its text.
function buildLegacyRow(card, document) {
  const image = card.querySelector('img');
  const textContent = card.querySelector('.text-content') || card;
  const headingEl = textContent.querySelector('span, h1, h2, h3, h4');
  // The importer unwraps attribute-less <span>s before parsers run, so a bare
  // `<span>Title</span>` (.imageTextContentCTA-card) arrives as a loose text
  // node inside .text-content. Fall back to that text so the title isn't lost.
  let title = headingEl ? headingEl.textContent.trim() : '';
  if (!title) {
    const loose = Array.from(textContent.childNodes)
      .find((n) => n.nodeType === 3 && n.textContent.trim());
    if (loose) title = loose.textContent.replace(/\s+/g, ' ').trim();
  }
  const paras = Array.from(textContent.querySelectorAll('p')).filter((p) => p.textContent.trim());
  const cta = card.querySelector('.cta-content a[href], a.sys_secondary-btn[href], a.sys_primary-btn[href], a.button[href], a[href]');

  if (!image && !title && !paras.length && !cta) return null;

  const imageCell = [];
  if (image) {
    imageCell.push(document.createComment(' field:image '));
    imageCell.push(image);
  }

  const textCell = [document.createComment(' field:text ')];
  if (title) {
    const h = document.createElement('h3');
    h.textContent = title;
    textCell.push(h);
  }
  paras.forEach((p) => textCell.push(p));
  if (cta && cta.getAttribute('href')) {
    const a = document.createElement('a');
    a.href = cta.getAttribute('href');
    a.textContent = (cta.textContent || '').trim() || cta.getAttribute('href');
    textCell.push(a);
  }
  return [imageCell, textCell];
}

export default function parse(element, { document }) {
  // --- Branch B: legacy Contensis cards (International applicants, Food
  // Systems Institute). The runner calls the parser once per matched CARD, but
  // a card group must become ONE block with one row per card. So the first
  // invocation of a group collects every legacy card under the same section
  // root (closest .container-grey-bg / .container-yellow-bg / .container.my-4),
  // emits one block in place of that first card, removes the other cards (and
  // any Contensis column / column-row wrapper left empty) and marks them
  // consumed so their own invocations no-op. Non-card content in a touched row
  // (e.g. the .sys_four "Browse more case studies" column) stays in the DOM
  // after the block as default content. The modern .featureblock branch (A)
  // is untouched.
  if (element.matches(LEGACY_CARD) || element.querySelector('.cta-content, .text-content')) {
    if (element.dataset && element.dataset.cardsConsumed) {
      element.remove();
      return;
    }

    const root = element.matches(LEGACY_CARD) ? element.closest(GROUP_ROOT) : null;
    let cards = root ? Array.from(root.querySelectorAll(LEGACY_CARD)) : [];
    cards = cards.filter((c) => !(c.dataset && c.dataset.cardsConsumed));
    if (!cards.includes(element)) cards = [element];

    const rows = cards.map((card) => buildLegacyRow(card, document)).filter(Boolean);
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }

    // Column-row wrappers touched by this group (for empty-wrapper cleanup).
    const rowWrappers = new Set();
    cards.forEach((card) => {
      const row = card.closest(ROW_WRAPPER);
      if (row && (!root || root.contains(row))) rowWrappers.add(row);
    });

    // Consume + remove the other cards of the group.
    cards.forEach((card) => {
      if (card === element) return;
      if (card.dataset) card.dataset.cardsConsumed = '1';
      card.remove();
    });

    const block = WebImporter.Blocks.createBlock(document, {
      name: 'cards-promo-light-withimg-3',
      cells: rows,
    });
    element.replaceWith(block);

    // Drop columns left empty (vacated card slots and Contensis' own empty
    // trailing column), then any row wrapper with nothing left in it.
    rowWrappers.forEach((row) => {
      Array.from(row.children).forEach((col) => {
        if (isBlankNode(col)) col.remove();
      });
      if (isBlankNode(row)) row.remove();
    });
    return;
  }

  // --- Branch A: original .feature-block--white-bg markup ----------------
  let tiles = Array.from(element.querySelectorAll('.feature-block--v2'));
  if (!tiles.length) tiles = [element];

  const seen = new Set();
  tiles = tiles.filter((t) => {
    if (seen.has(t)) return false;
    seen.add(t);
    return true;
  });

  const cells = [];
  tiles.forEach((tile) => {
    const textCol = tile.querySelector('.feature-block__text') || tile;
    const mediaCol = tile.querySelector('.feature-block__media') || tile;

    const headingEl = textCol.querySelector('.text-container__title, h1, h2, h3, h4');
    const paras = Array.from(
      textCol.querySelectorAll('.feature-block__text-content p, .text-container__text p'),
    ).filter((p) => p.textContent.trim());
    const cta = textCol.querySelector('.text-container__button-component a[href], .button-component a[href], a.button[href], a[href]');
    const image = mediaCol.querySelector('.image-container img, img');

    if (!headingEl && !paras.length && !cta && !image) return;

    // Col 1: image (field:image).
    const imageCell = [];
    if (image) {
      imageCell.push(document.createComment(' field:image '));
      imageCell.push(image);
    }

    // Col 2: text (field:text) = heading (as <h3>) + optional paragraph(s) + CTA.
    const textCell = [document.createComment(' field:text ')];
    if (headingEl && headingEl.textContent.trim()) {
      const h = document.createElement('h3');
      h.textContent = headingEl.textContent.trim();
      textCell.push(h);
    }
    paras.forEach((p) => textCell.push(p));
    if (cta && cta.getAttribute('href')) {
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      a.textContent = (cta.textContent || '').trim() || cta.getAttribute('href');
      textCell.push(a);
    }

    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo-light-withimg-3', cells });
  element.replaceWith(block);
}
