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
  // Homepage uses `.ranking-tile`; study-with-us `.stats-block` uses `.stat` tiles.
  let tiles = [...element.querySelectorAll('.ranking-tile')];
  let mode = 'ranking-tile';
  if (!tiles.length) {
    tiles = [...element.querySelectorAll('.stat')];
    if (tiles.length) mode = 'stat';
  }
  if (!tiles.length) {
    tiles = element.matches('.ranking-tile, .ranking-tile-container') ? [element] : [];
    mode = 'ranking-tile';
  }

  const cells = [];
  tiles.forEach((tile) => {
    const cell = [document.createComment(' field:text ')];

    if (mode === 'stat') {
      // Stat figure sits before the caption <p>. In the source it is a bare
      // <span>, but the html2md preprocessing that runs BEFORE this parser
      // unwraps inline <span>s, leaving the figure as bare text node(s) directly
      // inside .stat. So read the figure from the tile's own text minus its <p>
      // captions (covers both the raw-<span> and the unwrapped-text-node cases).
      const captions = [...tile.querySelectorAll('p')];
      const figureClone = tile.cloneNode(true);
      figureClone.querySelectorAll('p').forEach((p) => p.remove());
      const statText = figureClone.textContent.replace(/\s+/g, ' ').trim();
      if (statText) {
        const h = document.createElement('h3');
        h.textContent = statText;
        cell.push(h);
      }
      captions.forEach((p) => cell.push(p));
    } else {
      // Stat figure — wrap in a heading so the block JS can style it as the stat.
      const statText = tile.querySelector('.ranking-title span, .ranking-title')?.textContent.trim();
      if (statText) {
        const h = document.createElement('h3');
        h.textContent = statText;
        cell.push(h);
      }
      // Supporting label + citation paragraphs.
      tile.querySelectorAll('.ranking-text p').forEach((p) => cell.push(p));
    }

    cells.push([cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-ranking-gold', cells });

  // .stat mode only (study-with-us .stats-block): the block is wrapped by an
  // intro heading + copy BEFORE the stat tiles and a trailing CTA link AFTER
  // them. Neither belongs in the block table, but both must survive as default
  // content around the block. Homepage (.ranking-tile mode) has no such wrappers,
  // so these lookups yield nothing there and behavior is unchanged.
  const introNodes = [];
  const outroNodes = [];
  if (mode === 'stat') {
    // The .stats wrapper holds the tiles; siblings before it are the intro,
    // siblings after it (e.g. the CTA) are the outro.
    const statsWrap = element.querySelector('.stats') || tiles[0]?.parentElement;
    // Direct children of the stats-block, in document order.
    const directChildren = [...element.children];
    const statsIndex = statsWrap ? directChildren.indexOf(statsWrap) : -1;
    directChildren.forEach((child, i) => {
      if (child === statsWrap) return;
      // Skip anything that is (or contains) the stat tiles themselves.
      if (child.matches?.('.stat') || child.querySelector?.('.stat')) return;
      if (statsIndex !== -1 && i < statsIndex) {
        introNodes.push(child);
      } else {
        outroNodes.push(child);
      }
    });
  }

  element.replaceWith(...introNodes, block, ...outroNodes);
}
