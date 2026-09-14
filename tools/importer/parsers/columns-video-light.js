/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-video-light. Base: columns (2-column, standalone block).
 * Source: https://www.nottingham.ac.uk/workingwithbusiness/degree-apprenticeships/degree-apprenticeships.aspx
 * Anchor: .sys_twoColumns5050:has(.kalturaEmbed)
 *
 * Columns block — NO field hints (default content only, per the columns model).
 * Row 1 = block name; Row 2 = two cells:
 *   - text cell: heading(s) + lead paragraph(s) from `.sys_one`
 *   - video cell: a LINK to the iframe's src. Iframes are stripped on import, so
 *     the video is emitted as an <a href=IFRAME_SRC>; the block JS converts a
 *     lone link back into an iframe at runtime.
 */
export default function parse(element, { document }) {
  const textCol = element.querySelector(':scope > .sys_one');
  const videoCol = element.querySelector(':scope > .sys_two');

  // Text cell: all headings/paragraphs from the text column.
  const textCell = [];
  if (textCol) {
    Array.from(textCol.children).forEach((child) => {
      if (child.textContent && child.textContent.trim()) textCell.push(child);
    });
  }

  // Video cell: pull the iframe src out to a link (iframes are stripped).
  const videoCell = [];
  const iframe = element.querySelector('.kalturaEmbed iframe, iframe');
  const src = iframe ? iframe.getAttribute('src') : null;
  if (src) {
    const a = document.createElement('a');
    a.href = src;
    a.textContent = (iframe.getAttribute('title') || 'Video').trim();
    videoCell.push(a);
  }

  if (!textCell.length && !videoCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[textCell, videoCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-video-light', cells });
  element.replaceWith(block);
}
