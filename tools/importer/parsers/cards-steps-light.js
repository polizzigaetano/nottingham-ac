/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-steps-light. Base: cards (container, per-item rows).
 * Source: https://www.nottingham.ac.uk/study/campus-visit/open-days.html
 * Anchor: .card-list
 *
 * Each step = .card-list__content: .card-list__number (a digit — IGNORED, the
 * block CSS auto-numbers), .card-list__right .card-list__text (h2.card-title +
 * description), and .card-list__link a.button (CTA).
 *
 * Model field per item (cards-steps-light-item): text (richtext).
 * One row per step, 1 cell: field:text = <h3>title</h3> + <p>description</p> + CTA.
 */
export default function parse(element, { document }) {
  const steps = Array.from(element.querySelectorAll(':scope > .card-list__content'));

  const cells = [];
  steps.forEach((step) => {
    const cell = [document.createComment(' field:text ')];

    // Title — demote source h2.card-title to h3 for card semantics.
    const titleEl = step.querySelector('.card-list__text .card-title, .card-list__text h1, .card-list__text h2, .card-list__text h3');
    if (titleEl && titleEl.textContent.trim()) {
      const h3 = document.createElement('h3');
      h3.textContent = titleEl.textContent.trim();
      cell.push(h3);
    }

    // Description (.body-medium is a <div>; normalise to <p>).
    const descEl = step.querySelector('.card-list__text .body-medium, .card-list__text p');
    if (descEl && descEl.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = descEl.textContent.replace(/\s+/g, ' ').trim();
      cell.push(p);
    }

    // CTA link — clean anchor preserving href + label.
    const source = step.querySelector('.card-list__link a[href], a.button[href]');
    if (source) {
      const a = document.createElement('a');
      a.setAttribute('href', source.getAttribute('href'));
      a.textContent = (source.textContent || '').replace(/\s+/g, ' ').trim();
      cell.push(a);
    }

    // Skip a step with no usable content (guards the ignored number-only case).
    if (cell.length === 1) return;

    cells.push([cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-steps-light', cells });
  element.replaceWith(block);
}
