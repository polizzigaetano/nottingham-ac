/* eslint-disable */
/* global WebImporter */
/**
 * Parser for nav-anchor-light. Base: nav (container, per-item rows).
 * Source: https://www.nottingham.ac.uk/study/campus-visit/open-days.html
 * Anchor: .sub-nav
 *
 * Source structure: .sub-nav__level > .sub-nav__item > a.sub-nav__link
 * (one home/landing link + sibling section links; one carries --active).
 * Skip the arrow buttons (.sub-nav__arrow) and the mobile dropdown toggle
 * (.sub-nav__expand-btn) — those are <button>s, not links.
 *
 * Model fields per item (nav-anchor-light-item): link (aem-content),
 * linkText (collapsed — ends in `Text` → becomes the anchor's text).
 * Each link = one row, 1 cell: field:link containing <a href>label</a>.
 */
export default function parse(element, { document }) {
  const links = Array.from(element.querySelectorAll('a.sub-nav__link'));

  const cells = [];
  links.forEach((source) => {
    const href = source.getAttribute('href');
    if (!href) return;

    // Clean anchor: preserve href, use link text (or a Home fallback for the
    // icon-only landing link) as the collapsed linkText.
    const a = document.createElement('a');
    a.setAttribute('href', href);
    let label = (source.textContent || '').replace(/\s+/g, ' ').trim();
    if (!label) {
      label = source.classList.contains('sub-nav__home-btn') ? 'Home' : href;
    }
    a.textContent = label;

    cells.push([[document.createComment(' field:link '), a]]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'nav-anchor-light', cells });
  element.replaceWith(block);
}
