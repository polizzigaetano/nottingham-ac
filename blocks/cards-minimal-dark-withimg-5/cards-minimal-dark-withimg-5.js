import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Cards (minimal, dark, with image) — a row of image tiles, each a photo with
 * an overlaid pill CTA link. Each authored row is a tile: an image cell plus a
 * body cell (holding the link).
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    li.className = 'cards-minimal-dark-withimg-5-card';
    while (row.firstElementChild) {
      const cell = row.firstElementChild;
      if (cell.children.length === 1 && cell.querySelector('picture')) {
        cell.className = 'cards-minimal-dark-withimg-5-image';
      } else {
        cell.className = 'cards-minimal-dark-withimg-5-body';
      }
      li.append(cell);
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });
  block.replaceChildren(ul);
}
