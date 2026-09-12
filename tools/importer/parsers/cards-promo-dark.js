/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo-dark. Base: cards (container, no-images variant).
 * Source: https://www.nottingham.ac.uk/ (.homepage-campaign-tiles).
 * Each promo tile = one row, 1 column (model field: text only, no image).
 * Cell groups heading + description + CTA as rich text.
 */
export default function parse(element, { document }) {
  const tiles = element.querySelectorAll('.campaign-tile');

  const cells = [];
  tiles.forEach((tile) => {
    const heading = tile.querySelector('.campaign-tile-title, h2, h3, h4');
    const desc = tile.querySelector('.campaign-tile-text, p');
    const cta = tile.querySelector('.campaign-tile-links a, a');

    const cell = [document.createComment(' field:text ')];
    if (heading) cell.push(heading);
    if (desc) cell.push(desc);
    if (cta) cell.push(cta);
    cells.push([cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo-dark', cells });
  element.replaceWith(block);
}
