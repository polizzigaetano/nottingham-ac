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
export default function parse(element, { document }) {
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
