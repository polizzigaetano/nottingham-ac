/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo-dark. Base: cards (container, no-images variant).
 * Source: https://www.nottingham.ac.uk/ (.homepage-campaign-tiles).
 * Each promo tile = one row, 1 column (model field: text only, no image).
 * Cell groups heading + description + CTA as rich text.
 */
export default function parse(element, { document }) {
  // Degree-apprenticeships wrappers: the whole element IS a single promo tile
  // rendered as a two-column sys_ layout (image on one side, text on the other).
  //  (a) .sys_twoColumns5050 (vacancies): .sys_one img + .sys_two heading/p/CTA.
  //  (b) .sys_twoColumns_3070 (question zone): .sys_one_3070 heading/p/CTA +
  //      .sys_two_3070 img.
  if (element.matches('.sys_twoColumns_3070')
    || (element.matches('.sys_twoColumns5050')
      && !element.querySelector('.card')
      && !element.querySelector('.kalturaEmbed'))) {
    const is3070 = element.matches('.sys_twoColumns_3070');
    const textCol = element.querySelector(is3070 ? '.sys_one_3070' : '.sys_two');
    const imageCol = element.querySelector(is3070 ? '.sys_two_3070' : '.sys_one');

    const cell = [document.createComment(' field:text ')];
    const image = imageCol ? imageCol.querySelector('img') : null;
    // Image rides along in the richtext cell (model has no image field).
    if (image) cell.push(image);
    if (textCol) {
      // Headings + non-empty paragraphs + the pink pill CTA, in document order.
      Array.from(textCol.children).forEach((child) => {
        if (child.matches('h1, h2, h3, h4, h5, h6')) {
          if (child.textContent.trim()) cell.push(child);
        } else if (child.matches('p')) {
          const link = child.querySelector('a[href]');
          if (link) {
            const a = document.createElement('a');
            a.href = link.getAttribute('href');
            a.textContent = link.textContent.trim() || link.getAttribute('title') || 'Find out more';
            cell.push(a);
          } else if (child.textContent.trim()) {
            cell.push(child);
          }
        }
      });
    }

    const daCells = [[cell]];
    const daBlock = WebImporter.Blocks.createBlock(document, { name: 'cards-promo-dark', cells: daCells });
    element.replaceWith(daBlock);
    return;
  }

  // Homepage uses `.campaign-tile`; study-with-us `.largeCards-component` uses
  // `.card-container` (image-container + content-container with eyebrow/p/cta).
  let tiles = element.querySelectorAll('.campaign-tile');
  let mode = 'campaign-tile';
  if (!tiles.length) {
    tiles = element.querySelectorAll('.card-container');
    mode = 'card-container';
  }

  const cells = [];
  tiles.forEach((tile) => {
    const cell = [document.createComment(' field:text ')];

    if (mode === 'card-container') {
      // Image (single text-only column — model has no image field, so it rides
      // along in the richtext cell to preserve the promo card imagery).
      const image = tile.querySelector('.image-container img, img');
      if (image) cell.push(image);
      // Eyebrow label — promote the bare <span> to a heading so it renders.
      const eyebrow = tile.querySelector('.content-container > span, .content-container span');
      if (eyebrow && eyebrow.textContent.trim()) {
        const h = document.createElement('h3');
        h.textContent = eyebrow.textContent.trim();
        cell.push(h);
      }
      tile.querySelectorAll('.content-container p').forEach((p) => cell.push(p));
      const cta = tile.querySelector('.content-container a.cta, .content-container a, a.cta, a');
      if (cta) cell.push(cta);
    } else {
      const heading = tile.querySelector('.campaign-tile-title, h2, h3, h4');
      const desc = tile.querySelector('.campaign-tile-text, p');
      const cta = tile.querySelector('.campaign-tile-links a, a');
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo-dark', cells });
  element.replaceWith(block);
}
