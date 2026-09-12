import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Cards (ranking, gold) — a row of stat tiles, each with a large stat figure,
 * a supporting label and an optional citation link. No images. Each authored
 * row is a tile; the first line of each tile is treated as the stat.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    li.className = 'cards-ranking-gold-card';
    while (row.firstElementChild) {
      const cell = row.firstElementChild;
      cell.className = 'cards-ranking-gold-body';
      li.append(cell);
    }
    // Mark the first heading (if any) as the stat for styling hooks.
    const stat = li.querySelector('h1, h2, h3, h4, h5, h6');
    if (stat) stat.classList.add('cards-ranking-gold-stat');
    ul.append(li);
  });
  block.replaceChildren(ul);
}
