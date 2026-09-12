/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-events-light. Base: carousel (container, with image).
 * Source: https://www.nottingham.ac.uk/ (.events-section).
 * Each event card = one row, 2 columns: [image][text(date + title + read more)].
 * Model fields per item: image, imageAlt (collapsed into alt), text (richtext).
 */
export default function parse(element, { document }) {
  const cards = element.querySelectorAll('.vertical-card');

  const cells = [];
  cards.forEach((card) => {
    const image = card.querySelector('img.vertical-card-img, img');
    const date = card.querySelector('.date');
    const title = card.querySelector('.event-title, h3, h2');
    const readMore = card.querySelector('.card-content a, a.inline-link, a');

    // Column 1: image (field:image). imageAlt collapses into the <img> alt.
    const imageCell = [];
    if (image) {
      imageCell.push(document.createComment(' field:image '));
      imageCell.push(image);
    }

    // Column 2: text (field:text) — date + title + read more.
    const textCell = [document.createComment(' field:text ')];
    if (date) {
      // Join day/month parts (separate spans in source) with a single space.
      const parts = [...date.querySelectorAll('.day, .month, span')]
        .map((s) => s.textContent.trim())
        .filter(Boolean);
      const dayMonth = parts.length
        ? parts.join(' ')
        : date.textContent.replace(/\s+/g, ' ').trim();
      if (dayMonth) {
        const p = document.createElement('p');
        p.textContent = dayMonth;
        textCell.push(p);
      }
    }
    if (title) textCell.push(title);
    if (readMore) textCell.push(readMore);

    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-events-light', cells });
  element.replaceWith(block);
}
