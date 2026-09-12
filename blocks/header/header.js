// Nottingham header — logo + site search + click-to-open navigation panel.
// All copy/links/images come from /content/nav.plain.html; this file only
// reads that DOM and builds the bar, search form, and accordion panel.

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function buildSearch() {
  const form = document.createElement('form');
  form.className = 'header-search';
  form.setAttribute('role', 'search');
  form.action = 'https://www.nottingham.ac.uk/search/';
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = 'Search our site...';
  input.setAttribute('aria-label', 'Search our site');
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'header-search-submit';
  submit.setAttribute('aria-label', 'Search');
  const icon = document.createElement('span');
  icon.className = 'header-search-icon';
  icon.setAttribute('aria-hidden', 'true');
  submit.append(icon);
  form.append(input, submit);
  return form;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // metadata-independent dual-fetch: /content first (localhost), then root (DA/EDS prod)
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return;
  const html = await resp.text();

  const dom = document.createElement('div');
  dom.innerHTML = html;
  const sections = [...dom.children];
  const brandSection = sections[0];
  const navSection = sections[1];
  const secondarySection = sections[2];

  block.textContent = '';

  // Header bar: logo + search + menu toggle
  const bar = document.createElement('div');
  bar.className = 'header-bar';

  const brand = document.createElement('div');
  brand.className = 'header-brand';
  if (brandSection) {
    const logoLink = brandSection.querySelector('a');
    if (logoLink) brand.append(logoLink);
  }

  const search = buildSearch();

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'header-menu-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');
  const toggleIcon = document.createElement('span');
  toggleIcon.className = 'header-menu-toggle-icon';
  toggleIcon.setAttribute('aria-hidden', 'true');
  const toggleLabel = document.createElement('span');
  toggleLabel.className = 'header-menu-toggle-label';
  toggleLabel.textContent = 'Menu';
  toggle.append(toggleIcon, toggleLabel);

  bar.append(brand, search, toggle);

  // Navigation panel (accordion of top-level sections)
  const panel = document.createElement('nav');
  panel.className = 'header-panel';
  panel.setAttribute('aria-label', 'Main navigation');
  panel.hidden = true;

  const list = document.createElement('ul');
  list.className = 'header-nav-list';

  if (navSection) {
    const nodes = [...navSection.children];
    let currentSub = null;
    nodes.forEach((node) => {
      if (node.tagName === 'H2') {
        const item = document.createElement('li');
        item.className = 'header-nav-item';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'header-nav-btn';
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = node.textContent.trim();
        const sub = document.createElement('div');
        sub.className = 'header-subpanel';
        sub.hidden = true;
        btn.addEventListener('click', () => {
          const open = btn.getAttribute('aria-expanded') === 'true';
          // close siblings for a single-open accordion
          list.querySelectorAll('.header-nav-btn[aria-expanded="true"]').forEach((other) => {
            if (other !== btn) {
              other.setAttribute('aria-expanded', 'false');
              other.nextElementSibling.hidden = true;
            }
          });
          btn.setAttribute('aria-expanded', String(!open));
          sub.hidden = open;
        });
        item.append(btn, sub);
        currentSub = sub;
        list.append(item);
      } else if (currentSub && (node.tagName === 'H3' || node.tagName === 'UL')) {
        const clone = node.cloneNode(true);
        clone.className = node.tagName === 'H3' ? 'header-group-heading' : 'header-group-links';
        currentSub.append(clone);
      }
    });
  }
  panel.append(list);

  if (secondarySection) {
    const secondary = document.createElement('div');
    secondary.className = 'header-secondary';
    [...secondarySection.children].forEach((ul) => secondary.append(ul.cloneNode(true)));
    panel.append(secondary);
  }

  function closePanel() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    panel.hidden = true;
    block.classList.remove('nav-open');
  }

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    if (open) {
      closePanel();
    } else {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close navigation');
      panel.hidden = false;
      block.classList.add('nav-open');
    }
  });

  // Close on Escape
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closePanel();
  });

  block.append(bar, panel);

  // Reset the panel when crossing the desktop breakpoint (no refresh needed).
  isDesktop.addEventListener('change', closePanel);
}
