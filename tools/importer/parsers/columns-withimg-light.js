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
  // --- Branch B: legacy Contensis testimonial (International applicants).
  // The instance selector `.sys_vertically-centred-content` matches TWO sibling
  // divs (inside sys_one_1585 / sys_two_1585): one holds a portrait <img>, the
  // other a quote (p.introParagraph) + attribution <p>. They must combine into
  // ONE 2-column block. The runner invokes this parser once per matched element,
  // so the FIRST invocation gathers all sibling cells and emits the block; a
  // marker on consumed elements makes the SECOND invocation bail.
  if (element.matches('.sys_vertically-centred-content')) {
    if (element.dataset && element.dataset.colsConsumed) {
      element.remove();
      return;
    }

    // Gather the full group of sibling column-contents. Walk up to the nearest
    // multi-column wrapper, else fall back to just this element.
    const wrapper = element.closest('[class*="Columns"], [class*="columns"], blockquote')
      || element.parentElement;
    let parts = wrapper
      ? Array.from(wrapper.querySelectorAll('.sys_vertically-centred-content'))
      : [element];
    if (!parts.length) parts = [element];

    const columnCells = parts.map((part) => {
      const cell = [];
      const img = part.querySelector('img');
      if (img) cell.push(img);
      Array.from(part.querySelectorAll('p, h1, h2, h3, h4, blockquote'))
        .filter((n) => n.textContent.trim() || n.querySelector('img'))
        .forEach((n) => cell.push(n));
      // If nothing structural was found but text exists, keep the whole part.
      if (!cell.length && part.textContent.trim()) cell.push(part);
      return cell;
    }).filter((cell) => cell.length);

    if (!columnCells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }

    // Mark all consumed parts so their own parser invocations no-op.
    parts.forEach((part) => {
      if (part !== element && part.dataset) part.dataset.colsConsumed = '1';
    });

    // No field hints for columns blocks — one row, N columns.
    const block = WebImporter.Blocks.createBlock(document, {
      name: 'columns-withimg-light',
      cells: [columnCells],
    });
    element.replaceWith(block);
    return;
  }

  // --- Branch A: original .feature-block--reverse markup -----------------
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
