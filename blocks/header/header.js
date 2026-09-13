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

  // The nav fragment lives at /content/nav.plain.html and references images
  // with relative paths (e.g. images/uon-logo.svg). Those resolve against the
  // current page's folder, so they 404 on nested pages. Anchor every relative
  // image to the fragment's own folder so the logo/icons work at any depth.
  dom.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('/')) {
      img.setAttribute('src', `/content/${src}`);
    }
  });

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
  toggle.append(toggleLabel, toggleIcon);

  bar.append(brand, search, toggle);

  // Navigation panel (accordion of top-level sections)
  const panel = document.createElement('nav');
  panel.className = 'header-panel';
  panel.setAttribute('aria-label', 'Main navigation');
  panel.hidden = true;

  // Two-pane layout: a left rail of section buttons + a shared right area that
  // shows the active section's groups (multi-column on desktop).
  const inner = document.createElement('div');
  inner.className = 'header-panel-inner';

  const rail = document.createElement('div');
  rail.className = 'header-rail';

  const list = document.createElement('ul');
  list.className = 'header-nav-list';

  const buttons = [];

  // Activate one section: mark its button expanded and show its subpanel,
  // collapsing every other section (single-open in both layouts).
  function activate(btn) {
    buttons.forEach((other) => {
      const isTarget = other === btn;
      other.setAttribute('aria-expanded', String(isTarget));
      other.nextElementSibling.hidden = !isTarget;
    });
  }

  // On mobile the menu is a drill-down: tapping a section replaces the list
  // with that section's groups (single-open) and reveals a "Back to menu"
  // button. On desktop the section is just activated in the shared right pane.
  function drillInto(btn) {
    activate(btn);
    block.classList.add('nav-drilled');
  }

  function drillBack() {
    block.classList.remove('nav-drilled');
    buttons.forEach((b) => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.hidden = true;
    });
  }

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
          if (isDesktop.matches) {
            activate(btn);
          } else {
            drillInto(btn);
          }
        });
        // desktop: hovering a section switches the active pane (source behavior)
        btn.addEventListener('mouseenter', () => {
          if (isDesktop.matches) activate(btn);
        });
        item.append(btn, sub);
        currentSub = sub;
        buttons.push(btn);
        list.append(item);
      } else if (currentSub && node.tagName === 'H3') {
        // start a new column group. On mobile the heading collapses its links
        // (sub-accordion); on desktop CSS keeps everything expanded.
        const group = document.createElement('div');
        group.className = 'header-group';
        const heading = document.createElement('button');
        heading.type = 'button';
        heading.className = 'header-group-heading';
        heading.setAttribute('aria-expanded', 'false');
        heading.textContent = node.textContent.trim();
        heading.addEventListener('click', () => {
          if (isDesktop.matches) return;
          const open = heading.getAttribute('aria-expanded') === 'true';
          heading.setAttribute('aria-expanded', String(!open));
          group.classList.toggle('header-group-open', !open);
        });
        group.append(heading);
        currentSub.append(group);
      } else if (currentSub && node.tagName === 'UL') {
        const clone = node.cloneNode(true);
        clone.className = 'header-group-links';
        // attach to the most recent group column (fall back to the subpanel)
        const lastGroup = currentSub.querySelector('.header-group:last-child');
        (lastGroup || currentSub).append(clone);
      }
    });
  }

  // "Back to menu" control for the mobile drill-down (hidden on desktop via CSS)
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'header-back';
  back.textContent = 'Back to menu';
  back.addEventListener('click', drillBack);
  rail.append(back);
  rail.append(list);

  if (secondarySection) {
    const secondary = document.createElement('div');
    secondary.className = 'header-secondary';
    [...secondarySection.children].forEach((ul) => secondary.append(ul.cloneNode(true)));
    rail.append(secondary);
  }

  inner.append(rail);
  panel.append(inner);

  function closePanel() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    panel.hidden = true;
    block.classList.remove('nav-open');
    drillBack();
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
      // On desktop the panel always shows an active section (first one by default).
      if (isDesktop.matches && buttons.length
        && !buttons.some((b) => b.getAttribute('aria-expanded') === 'true')) {
        activate(buttons[0]);
      }
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
