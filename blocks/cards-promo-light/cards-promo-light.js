import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Cards (promo, light) — a row of light, text-only promo cards. Each card has a
 * heading, a short paragraph and a CTA link, on a light background. Each
 * authored row is a card: cell 1 = body (heading, text, CTA).
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-promo-light-list';

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    li.className = 'cards-promo-light-card';
    while (row.firstElementChild) {
      const cell = row.firstElementChild;
      while (cell.firstChild) li.append(cell.firstChild);
      cell.remove();
    }
    ul.append(li);
  });

  block.replaceChildren(ul);
}
