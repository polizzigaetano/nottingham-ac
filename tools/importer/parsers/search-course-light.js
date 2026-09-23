/* eslint-disable */
/* global WebImporter */
/**
 * Parser for search-course-light. Base: search (project custom variant).
 * Model fields: text (Heading, richtext), action (search action URL, aem-content).
 *
 * Handles three source shapes for the UoN course finder:
 *  - Homepage: finder inside the hero's `.search-section` / `.search-content`.
 *  - study-with-us: `.search-block` mapped directly (finder in `.search-box`),
 *    with a sibling `.search-col` intro column preserved as default content.
 *  - study/home.html: `.content-search__content` — a "Find your ideal course"
 *    band with an input, a study-level dropdown, a Search button and
 *    "View undergraduate/postgraduate courses" links.
 */
export default function parse(element, { document }) {
  // --- Mode: content-search (study/home.html) ---
  const contentSearch = element.matches('.content-search__content')
    ? element
    : element.querySelector('.content-search__content');
  if (contentSearch) {
    const heading = contentSearch.querySelector('.content-search__title h1, .content-search__title h2, .content-search__title h3, h1, h2, h3');
    // Preferred action = the "View undergraduate courses" link (primary CTA),
    // else the first real course link.
    const actionLink = contentSearch.querySelector('.content-search__links--secondary[href], .content-search__links a[href], a[href]');

    const cells = [];

    // Row 2: heading (field:text).
    const headingCell = [document.createComment(' field:text ')];
    if (heading) {
      const h = document.createElement('h2');
      h.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
      headingCell.push(h);
    } else {
      headingCell.push(document.createTextNode('Find your ideal course'));
    }
    cells.push([headingCell]);

    // Row 3: search action URL (field:action) — only when a real link exists.
    if (actionLink && actionLink.getAttribute('href')) {
      const a = document.createElement('a');
      a.href = actionLink.getAttribute('href');
      a.textContent = actionLink.getAttribute('href');
      cells.push([[document.createComment(' field:action '), a]]);
    }

    const block = WebImporter.Blocks.createBlock(document, { name: 'search-course-light', cells });
    element.replaceWith(block);
    return;
  }

  // --- Existing modes (homepage .search-content / study-with-us .search-block) ---
  // Locate the course-finder panel regardless of which mapped selector matched.
  const panel = element.querySelector('.search-content')
    || (element.matches('.search-block') ? element : null)
    || element.querySelector('.search-block .search-box, .search-box')
    || element.closest('.search-section')?.querySelector('.search-content')
    || document.querySelector('.search-section .search-content')
    || element;

  // Heading text for the finder.
  const heading = panel.querySelector('.search-section-title, .search-box h2, h1, h2, h3')
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

  // .search-block mode only: the study-with-us finder band has a SECOND
  // .search-col (the one WITHOUT .search-box) carrying intro copy that is
  // mapped as the section's default content (page-templates.json s2
  // defaultContent ".search-block .search-col.mb-5"). Preserve it ALONGSIDE the
  // block as plain default content so it is not discarded by replaceWith.
  // Homepage (.search-content) has no such column, so this branch is a no-op there.
  const introNodes = [];
  if (element.matches('.search-block') || element.querySelector('.search-block')) {
    const scope = element.matches('.search-block') ? element : element.querySelector('.search-block');
    const introCol = [...scope.querySelectorAll('.search-col')]
      .find((col) => !col.querySelector('.search-box') && !col.matches('.search-box'));
    if (introCol) {
      // Prefer the inner content wrapper; fall back to the column itself.
      const introSource = introCol.querySelector('.extra-content') || introCol;
      introSource.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach((node) => {
        introNodes.push(node);
      });
    }
  }

  if (introNodes.length) {
    // Block first (the finder), then the intro copy as sibling default content.
    element.replaceWith(block, ...introNodes);
  } else {
    element.replaceWith(block);
  }
}
