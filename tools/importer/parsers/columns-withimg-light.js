/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-withimg-light. Base: columns.
 * Source: https://www.nottingham.ac.uk/study/campus-visit/open-days.html
 * Anchor: .featureblock.feature-block--reverse ("What to expect").
 *
 * Columns block (2 columns, 1 row). Per xwalk rules, Columns blocks carry only
 * default content and MUST NOT include field hints.
 * Cell 1 (content): .feature-block__text = heading + paragraphs + CTA link.
 * Cell 2 (image): .feature-block__media img (a Scene7 DM <img>; the DM pipeline
 * turns it into a carrier anchor, so the parser just emits the <img> as-is).
 */
export default function parse(element, { document }) {
  const textCol = element.querySelector('.feature-block__text');
  const mediaCol = element.querySelector('.feature-block__media');

  // Content cell: heading, supporting paragraphs, CTA button (deduped, in order).
  const contentCell = [];
  const heading = (textCol || element).querySelector('h1, h2, h3, .text-container__title');
  if (heading) contentCell.push(heading);

  const paras = Array.from(
    (textCol || element).querySelectorAll('.text-container__text p, .feature-block__text-content p'),
  ).filter((p) => p.textContent.trim());
  paras.forEach((p) => contentCell.push(p));

  const cta = (textCol || element).querySelector('.text-container__button-component a[href], .button-component a[href], a.button[href]');
  if (cta) contentCell.push(cta);

  // Image cell.
  const imageCell = [];
  const image = (mediaCol || element).querySelector('.image-container img, img');
  if (image) imageCell.push(image);

  if (!contentCell.length && !imageCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One row, two columns (content, image) — no field hints for columns blocks.
  const cells = [[contentCell, imageCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-withimg-light', cells });
  element.replaceWith(block);
}
