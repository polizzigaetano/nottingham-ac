import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Cards (logos, light) — a horizontal strip of partner/accreditation logos.
 * Each authored row is a logo (an image, optionally wrapped in a link).
 *
 * Note: the authored logo images are transparent PNGs. We intentionally keep
 * the authored <picture> as-is rather than rebuilding it with
 * createOptimizedPicture — generating a webp <source> flattens the
 * transparency onto a black matte for these assets, which inverts the logos.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-logos-light-list';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    li.className = 'cards-logos-light-logo';
    while (row.firstElementChild) {
      const cell = row.firstElementChild;
      while (cell.firstChild) li.append(cell.firstChild);
      cell.remove();
    }
    ul.append(li);
  });
  // Preserve transparency: give <img> loading/decoding hints without
  // rebuilding the picture element.
  ul.querySelectorAll('img').forEach((img) => {
    img.loading = 'lazy';
    img.decoding = 'async';
  });
  block.replaceChildren(ul);
}
