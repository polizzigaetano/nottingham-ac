import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Cards (promo, dark) — a small row of promotional tiles, each with a heading,
 * one-line description and a CTA link. No images. Each authored row is a tile.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    li.className = 'cards-promo-dark-card';
    while (row.firstElementChild) {
      const cell = row.firstElementChild;
      cell.className = 'cards-promo-dark-body';
      li.append(cell);
    }
    ul.append(li);
  });
  block.replaceChildren(ul);
}
