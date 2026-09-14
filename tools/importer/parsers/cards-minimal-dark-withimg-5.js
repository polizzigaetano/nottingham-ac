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
export default function parse(element, { document }) {
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
