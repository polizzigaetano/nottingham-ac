/* eslint-disable */
/* global WebImporter */
/**
 * Parser for search-course-light. Base: search (project custom variant).
 * Source: https://www.nottingham.ac.uk/ course finder panel (.search-section).
 * Model fields: text (Heading, richtext), action (search action URL).
 * The live page renders the finder inside the hero's .search-section; the mapped
 * selectors (.search-container / .course-finder-label) may resolve to the header
 * search widget, so we walk up to the finder panel and fall back defensively.
 */
export default function parse(element, { document }) {
  // Locate the course-finder panel regardless of which mapped selector matched.
  const panel = element.querySelector('.search-content')
    || element.closest('.search-section')?.querySelector('.search-content')
    || document.querySelector('.search-section .search-content')
    || element;

  // Heading text for the finder.
  const heading = panel.querySelector('.search-section-title, h1, h2, h3')
    || document.querySelector('.search-section-title');

  // Optional explicit action link (none in current source — button-driven search).
  const actionLink = panel.querySelector('a[href]');

  const cells = [];

  // Row 2: heading (field:text).
  const headingCell = [document.createComment(' field:text ')];
  if (heading) {
    headingCell.push(heading);
  } else {
    headingCell.push(document.createTextNode('Find your dream course'));
  }
  cells.push([headingCell]);

  // Row 3: search action URL (field:action) — only when a real link target exists.
  if (actionLink) {
    cells.push([[document.createComment(' field:action '), actionLink]]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'search-course-light', cells });
  element.replaceWith(block);
}
