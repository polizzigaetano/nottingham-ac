import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Cards (steps, light) — a vertical list of numbered step rows. Each row shows
 * an auto-incrementing number, a title, supporting text and an optional CTA
 * link. Each authored row is a step: cell 1 = body (title, text, link).
 * @param {Element} block
 */
export default function decorate(block) {
  const ol = document.createElement('ol');
  ol.className = 'cards-steps-light-list';

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    li.className = 'cards-steps-light-step';

    // Auto-numbered marker (CSS renders the counter; keep an element for styling).
    const marker = document.createElement('span');
    marker.className = 'cards-steps-light-number';
    marker.setAttribute('aria-hidden', 'true');

    const body = document.createElement('div');
    body.className = 'cards-steps-light-body';
    while (row.firstElementChild) {
      const cell = row.firstElementChild;
      while (cell.firstChild) body.append(cell.firstChild);
      cell.remove();
    }

    li.append(marker, body);
    ol.append(li);
  });

  block.replaceChildren(ol);
}
