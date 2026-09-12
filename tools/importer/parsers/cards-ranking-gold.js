/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-ranking-gold. Base: cards (container, no-images variant).
 * Source: https://www.nottingham.ac.uk/ (.homepage-rankings / .ranking-tile-container).
 * Each stat tile = one row, 1 column (model field: text only, no image).
 * Cell groups the stat figure (heading) + supporting label + optional citation.
 * Handles both the container selector (many tiles) and a single tile-container.
 */
export default function parse(element, { document }) {
  // Collect tiles whether element is the whole rankings block or a single tile wrapper.
  let tiles = [...element.querySelectorAll('.ranking-tile')];
  if (!tiles.length) {
    tiles = element.matches('.ranking-tile, .ranking-tile-container') ? [element] : [];
  }

  const cells = [];
  tiles.forEach((tile) => {
    const cell = [document.createComment(' field:text ')];

    // Stat figure — wrap in a heading so the block JS can style it as the stat.
    const statText = tile.querySelector('.ranking-title span, .ranking-title')?.textContent.trim();
    if (statText) {
      const h = document.createElement('h3');
      h.textContent = statText;
      cell.push(h);
    }

    // Supporting label + citation paragraphs.
    tile.querySelectorAll('.ranking-text p').forEach((p) => cell.push(p));

    cells.push([cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-ranking-gold', cells });
  element.replaceWith(block);
}
