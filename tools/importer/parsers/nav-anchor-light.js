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
  // Support both markups:
  //  A) .sub-nav             → a.sub-nav__link
  //  B) legacy Contensis .standard-nav-with-dropdown-desktop (International
  //     applicants) → a.home-link + a.top-level-link. Dropdown toggles carry
  //     href="#"; the actual sub-links live in sibling .dropdown-menu > .dropdown-item
  //     which are NOT part of the anchor row, so we exclude them.
  let links = Array.from(element.querySelectorAll('a.sub-nav__link'));
  let legacy = false;
  if (!links.length) {
    legacy = true;
    // Only the top-level anchors — never the sibling .dropdown-menu > .dropdown-item.
    links = Array.from(element.querySelectorAll('a.home-link, a.top-level-link'));
  }

  // For legacy dropdown parents the anchor itself is a JS toggle (href="#").
  // Resolve it to a real destination: prefer the dropdown-item whose label
  // matches the toggle text, else the first dropdown-item under the same
  // labelling id. Returns null when no destination can be found (item skipped).
  const resolveHref = (source) => {
    const raw = (source.getAttribute('href') || '').trim();
    if (raw && raw !== '#') return raw;
    if (!legacy) return null;
    // The dropdown-menu immediately follows its toggle in the DOM. Prefer that
    // sibling — toggle `id`s are NOT unique on this page (multiple share
    // id="navbarDropdown"), so an id/aria-labelledby lookup would resolve to the
    // wrong menu. Fall back to the id lookup only if there's no sibling menu.
    let menu = source.nextElementSibling && source.nextElementSibling.classList.contains('dropdown-menu')
      ? source.nextElementSibling : null;
    if (!menu) {
      const id = source.getAttribute('id');
      if (id) menu = element.querySelector(`.dropdown-menu[aria-labelledby="${id}"]`);
    }
    if (!menu) return null;
    const label = (source.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const items = Array.from(menu.querySelectorAll('a.dropdown-item[href]'));
    const match = items.find((it) => (it.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase() === label);
    return (match || items[0] || {}).getAttribute
      ? (match || items[0]).getAttribute('href') : null;
  };

  const cells = [];
  links.forEach((source) => {
    const href = resolveHref(source);
    if (!href) return;

    // Clean anchor: preserve href, use link text (or a Home fallback for the
    // icon-only landing link) as the collapsed linkText.
    const a = document.createElement('a');
    a.setAttribute('href', href);
    const isHome = source.classList.contains('sub-nav__home-btn')
      || source.classList.contains('home-link');
    let label = (source.textContent || '').replace(/\s+/g, ' ').trim();
    // Home links are icon-only (a material-icons "home" glyph) — normalize the
    // label rather than emitting the raw glyph text.
    if (isHome || !label || label.toLowerCase() === 'home') {
      label = isHome ? 'Home' : (label || href);
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
