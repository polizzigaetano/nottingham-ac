/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-icon-light. Base: cards (container, per-column items).
 * Source: https://www.nottingham.ac.uk/workingwithbusiness/degree-apprenticeships/degree-apprenticeships.aspx
 * Anchor: .sys_fourColumns
 *
 * Each column = one row, 2 columns: [icon image][caption].
 * Model fields per item (cards-icon-light-item): image, imageAlt (collapsed into
 * img alt), text (richtext = caption, may contain <br>).
 * field:image before the image cell, field:text before the text cell.
 *
 * Each source column (.sys_one .. .sys_four) has an icon <img> inside a <p> and
 * one or more caption paragraphs/spans.
 */
export default function parse(element, { document }) {
  // Direct-child columns (sys_one..sys_four, or generic sys_* wrappers).
  let columns = Array.from(element.querySelectorAll(
    ':scope > .sys_one, :scope > .sys_two, :scope > .sys_three, :scope > .sys_four',
  ));
  if (!columns.length) {
    columns = Array.from(element.querySelectorAll(':scope > div'));
  }

  const cells = [];
  columns.forEach((col) => {
    const image = col.querySelector('img');

    // Caption: paragraphs that are NOT the image wrapper. Preserve <br> markup.
    const captionParts = Array.from(col.querySelectorAll(':scope > p')).filter(
      (p) => !p.querySelector('img'),
    );

    // Column 1: icon (field:image). imageAlt collapses into the <img> alt.
    const imageCell = [document.createComment(' field:image ')];
    if (image) imageCell.push(image);

    // Column 2: caption (field:text richtext).
    const textCell = [document.createComment(' field:text ')];
    captionParts.forEach((p) => textCell.push(p));

    // Skip empty columns entirely.
    if (!image && !captionParts.length) return;

    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon-light', cells });
  element.replaceWith(block);
}
