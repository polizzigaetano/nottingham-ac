import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Nav (anchor, light) — a light horizontal section-navigation bar: a single
 * row of links that scrolls horizontally on narrow screens. Each authored row
 * is one link. A link whose href matches the current page is marked active
 * (aria-current="page").
 * @param {Element} block
 */
export default function decorate(block) {
  const nav = document.createElement('nav');
  nav.className = 'nav-anchor-light-bar';
  nav.setAttribute('aria-label', 'Section navigation');

  const ul = document.createElement('ul');
  ul.className = 'nav-anchor-light-list';

  const here = window.location.pathname.replace(/\.html?$/, '').replace(/\/$/, '');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    li.className = 'nav-anchor-light-item';
    // Pull the link (or bare text) out of the cell(s).
    while (row.firstElementChild) {
      const cell = row.firstElementChild;
      while (cell.firstChild) li.append(cell.firstChild);
      cell.remove();
    }
    const link = li.querySelector('a[href]');
    if (link) {
      const linkPath = (() => {
        try {
          return new URL(link.href, window.location.origin).pathname
            .replace(/\.html?$/, '').replace(/\/$/, '');
        } catch (e) {
          return '';
        }
      })();
      if (linkPath && linkPath === here) {
        link.classList.add('nav-anchor-light-active');
        link.setAttribute('aria-current', 'page');
      }
    }
    ul.append(li);
  });

  nav.append(ul);
  block.replaceChildren(nav);
}
