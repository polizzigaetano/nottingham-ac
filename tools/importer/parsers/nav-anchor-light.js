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
  // --- Branch D: legacy Contensis section menu (News press releases).
  // Instance `#NavDiv > ul.sys_simpleListMenu`: one <li> per item. Most items are
  // `li > a`; the current item sits one level deeper
  // (`li > div.sys_selected.sys_currentitem > a`). Emit ONE row per top-level
  // <li> (its first own link) and ignore any nested sub-lists (`li > ul`).
  // Guarded on the list class so the other markups below are untouched.
  if (element.matches('ul.sys_simpleListMenu')) {
    const rows = [];
    Array.from(element.children).filter((li) => li.tagName === 'LI').forEach((li) => {
      const source = Array.from(li.querySelectorAll('a[href]'))
        .find((a) => a.closest('li') === li && a.closest('ul') === element);
      if (!source) return;
      const href = (source.getAttribute('href') || '').trim();
      if (!href || href === '#') return;
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = (source.textContent || '').replace(/\s+/g, ' ').trim() || href;
      rows.push([[document.createComment(' field:link '), a]]);
    });
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: 'nav-anchor-light', cells: rows });
    element.replaceWith(block);
    return;
  }

  // Support both markups:
  //  A) .sub-nav             → a.sub-nav__link
  //  B) legacy Contensis .standard-nav-with-dropdown-desktop (International
  //     applicants) → a.home-link + a.top-level-link. Dropdown toggles carry
  //     href="#"; the actual sub-links live in sibling .dropdown-menu > .dropdown-item
  //     which are NOT part of the anchor row, so we exclude them.
  let links = Array.from(element.querySelectorAll('a.sub-nav__link'));
  let legacy = false;
  let scope = element;
  if (!links.length) {
    legacy = true;
    // When the instance is the parent .standard-nav-with-dropdown (Food Systems
    // Institute) it holds BOTH the desktop bar and the .standard-nav-with-dropdown-mobile
    // twin (same items again + extra flattened links). Scope to the desktop bar
    // so only its top-level items are emitted; if the instance already IS the
    // desktop bar (International applicants), this resolves to the element itself.
    scope = element.matches('.standard-nav-with-dropdown-desktop')
      ? element
      : (element.querySelector('.standard-nav-with-dropdown-desktop') || element);
    // Only the top-level anchors — never the sibling .dropdown-menu > .dropdown-item.
    links = Array.from(scope.querySelectorAll('a.home-link, a.top-level-link'));
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
    // Sibling order isn't guaranteed in the import browser (the site script can
    // rearrange the bar), and the toggles share one id, so an id lookup always
    // returns the FIRST menu. Pair by order instead: the Nth "#" toggle owns the
    // Nth .dropdown-menu in the bar, when the counts line up.
    if (!menu) {
      const toggles = links.filter((a) => (a.getAttribute('href') || '').trim() === '#');
      const menus = Array.from(scope.querySelectorAll('.dropdown-menu'));
      if (toggles.length === menus.length) menu = menus[toggles.indexOf(source)] || null;
    }
    if (!menu) {
      const id = source.getAttribute('id');
      if (id) menu = element.querySelector(`.dropdown-menu[aria-labelledby="${id}"]`);
    }
    if (!menu) return null;
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const label = norm(source.textContent);
    const items = Array.from(menu.querySelectorAll('a.dropdown-item[href]'));
    const match = items.find((it) => norm(it.textContent) === label);
    // No exact label match: prefer the item sharing the most significant words
    // with the toggle label (e.g. "About FSI" -> "About us"), else the first item.
    let best = null;
    if (!match) {
      const STOP = ['and', 'the', 'our', 'for', 'with'];
      const words = (s) => norm(s).replace(/&/g, ' and ').split(/[^a-z0-9]+/)
        .filter((w) => w.length > 2 && !STOP.includes(w));
      const labelWords = words(label);
      let bestScore = 0;
      items.forEach((it) => {
        const score = words(it.textContent).filter((w) => labelWords.includes(w)).length;
        if (score > bestScore) { bestScore = score; best = it; }
      });
    }
    const chosen = match || best || items[0];
    return chosen ? chosen.getAttribute('href') : null;
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
