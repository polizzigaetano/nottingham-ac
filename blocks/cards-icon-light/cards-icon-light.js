import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Cards (icon, light) — a 4-up credibility strip. Each tile is a small icon
 * above a short caption, on a light background. Each authored row is a tile:
 * cell 1 = icon image, cell 2 = caption text.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    li.className = 'cards-icon-light-card';
    while (row.firstElementChild) {
      const cell = row.firstElementChild;
      if (cell.children.length === 1 && cell.querySelector('picture')) {
        cell.className = 'cards-icon-light-icon';
      } else {
        cell.className = 'cards-icon-light-body';
      }
      li.append(cell);
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });

  block.replaceChildren(ul);
}
