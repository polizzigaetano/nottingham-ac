/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-minimal-dark-withimg-2. Base: columns.
 * Source: https://www.nottingham.ac.uk/ (.homepage-image-cta-block).
 * Columns block: one row, N cells = columns. Per xwalk rules, Columns blocks
 * carry only default content and MUST NOT include field hints.
 * Layout: content column (heading + paragraph + CTA) and an image column.
 */
export default function parse(element, { document }) {
  // Content column: heading + paragraph + CTA.
  const textContent = element.querySelector('.text-content');
  const cta = element.querySelector('.block-content a, a.stripe-white-cta');
  const heading = textContent?.querySelector('h1, h2, h3, h4')
    || element.querySelector('h1, h2, h3, h4');
  const para = textContent?.querySelector('p') || element.querySelector('.block-content p');

  // Image column.
  const image = element.querySelector('.image-container img, img');

  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (para) contentCell.push(para);
  if (cta) contentCell.push(cta);

  const imageCell = [];
  if (image) imageCell.push(image);

  if (!contentCell.length && !imageCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One row, two columns (content, image) — no field hints for columns blocks.
  const cells = [[contentCell, imageCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-minimal-dark-withimg-2', cells });
  element.replaceWith(block);
}
