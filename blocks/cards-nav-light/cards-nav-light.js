import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Cards (nav, light) — a row of navigation cards: an image on top with a title
 * and short caption below in a light panel. The whole card is a link. Each
 * authored row is a card: cell 1 = image, cell 2 = body (title, caption and a
 * link whose href makes the whole card clickable).
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    li.className = 'cards-nav-light-card';
    while (row.firstElementChild) {
      const cell = row.firstElementChild;
      if (cell.children.length === 1 && cell.querySelector('picture')) {
        cell.className = 'cards-nav-light-image';
      } else {
        cell.className = 'cards-nav-light-body';
      }
      li.append(cell);
    }

    // Make the whole card clickable using the first link found in the body.
    const link = li.querySelector('.cards-nav-light-body a[href]');
    if (link) {
      const anchor = document.createElement('a');
      anchor.className = 'cards-nav-light-link';
      anchor.href = link.getAttribute('href');
      if (link.title) anchor.title = link.title;
      // Replace the inline link text with a plain heading/label if present.
      while (li.firstChild) anchor.append(li.firstChild);
      li.append(anchor);
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
