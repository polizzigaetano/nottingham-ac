/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo-light. Base: cards (container, per-item rows).
 * Source: https://www.nottingham.ac.uk/study/campus-visit/open-days.html
 * Anchor: .featureblock.feature-block--white-bg (3 separate promo cards:
 * "Talk to a student", "Attend a virtual open day", "Book a campus tour").
 *
 * findBlocksOnPage passes EACH matched .feature-block--white-bg element to the
 * parser separately, so normally the parser receives ONE card and emits ONE row.
 * Fallback: if the element contains multiple .feature-block__text, emit one row
 * each (handles the grouped case).
 *
 * Model field per item (cards-promo-light-item): text (richtext).
 * One row per card, 1 cell: field:text = <h3>heading</h3> + <p>paragraph</p> + CTA.
 */
export default function parse(element, { document }) {
  // A card unit is a .feature-block__text; the element may be one card or a group.
  let units = Array.from(element.querySelectorAll('.feature-block__text'));
  if (!units.length) units = [element];

  const cells = [];
  units.forEach((unit) => {
    const cell = [document.createComment(' field:text ')];

    // Heading — demote source h2.text-container__title to h3.
    const titleEl = unit.querySelector('.text-container__title, h1, h2, h3');
    if (titleEl && titleEl.textContent.trim()) {
      const h3 = document.createElement('h3');
      h3.textContent = titleEl.textContent.trim();
      cell.push(h3);
    }

    // Paragraph(s).
    const paras = Array.from(
      unit.querySelectorAll('.text-container__text p, .feature-block__text-content p'),
    ).filter((p) => p.textContent.trim());
    paras.forEach((p) => cell.push(p));

    // CTA link — clean anchor preserving href + label.
    const source = unit.querySelector('.text-container__button-component a[href], .button-component a[href], a.button[href]');
    if (source) {
      const a = document.createElement('a');
      a.setAttribute('href', source.getAttribute('href'));
      a.textContent = (source.textContent || '').replace(/\s+/g, ' ').trim();
      cell.push(a);
    }

    // Skip empty card unit.
    if (cell.length === 1) return;

    cells.push([cell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo-light', cells });
  element.replaceWith(block);
}
