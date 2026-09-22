// Nottingham footer — navy footer with a contact + social column, four link
// columns, and a legal bar. All copy/links/images come from
// /footer.plain.html; this file only reads that DOM and lays it out.

/**
 * Rebuilds a paragraph authored as "- <a>...</a> - <a>...</a>" (links
 * separated by literal dash text, copied from a source site that only
 * added the dash visually via CSS) into a real <ul><li> list, so it renders
 * through the same list styling as an authored <ul>.
 * @param {Element} p
 * @returns {Element} ul
 */
function dashParagraphToList(p) {
  const ul = document.createElement('ul');
  let li = null;
  const openItem = () => {
    li = document.createElement('li');
    ul.append(li);
  };
  [...p.childNodes].forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'A') {
      if (!li) openItem();
      li.append(node.cloneNode(true));
      return;
    }
    node.textContent.split('-').forEach((part, i) => {
      if (i > 0) openItem();
      const text = part.trim();
      if (text) {
        if (!li) openItem();
        li.append(document.createTextNode(text));
      }
    });
  });
  return ul;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const resp = await fetch('/footer.plain.html');
  if (!resp.ok) return;
  const html = await resp.text();

  const dom = document.createElement('div');
  dom.innerHTML = html;

  // Anchor relative fragment images (social icons) to /content so they resolve
  // at any page depth instead of against the current page's folder.
  dom.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('/')) {
      img.setAttribute('src', `/content/${src}`);
    }
  });

  const sections = [...dom.children];

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  // Top region: contact/social column + link columns
  const top = document.createElement('div');
  top.className = 'footer-top';

  // Section 0 = contact + social
  if (sections[0]) {
    const contact = document.createElement('div');
    contact.className = 'footer-contact';
    [...sections[0].children].forEach((node) => {
      if (node.tagName === 'UL') {
        const clone = node.cloneNode(true);
        clone.className = 'footer-social';
        contact.append(clone);
      } else if (node.tagName === 'P' && node.querySelector('a')) {
        const list = dashParagraphToList(node);
        list.className = 'footer-social';
        contact.append(list);
      } else {
        contact.append(node.cloneNode(true));
      }
    });
    top.append(contact);
  }

  // Section 1 = link columns (each <h2> starts a column)
  if (sections[1]) {
    const cols = document.createElement('div');
    cols.className = 'footer-columns';
    let currentCol = null;
    [...sections[1].children].forEach((node) => {
      if (node.tagName === 'H2') {
        currentCol = document.createElement('div');
        currentCol.className = 'footer-column';
        currentCol.append(node.cloneNode(true));
        cols.append(currentCol);
      } else if (currentCol) {
        const item = node.tagName === 'P' && node.querySelector('a')
          ? dashParagraphToList(node)
          : node.cloneNode(true);
        currentCol.append(item);
      }
    });
    top.append(cols);
  }
  footer.append(top);

  // Section 2 = legal bar (copyright + legal links)
  if (sections[2]) {
    const legal = document.createElement('div');
    legal.className = 'footer-legal';
    [...sections[2].children].forEach((node) => {
      if (node.tagName === 'UL') {
        const clone = node.cloneNode(true);
        clone.className = 'footer-legal-links';
        legal.append(clone);
      } else if (node.tagName === 'P' && node.querySelector('a')) {
        const list = dashParagraphToList(node);
        list.className = 'footer-legal-links';
        legal.append(list);
      } else {
        legal.append(node.cloneNode(true));
      }
    });
    footer.append(legal);
  }

  block.append(footer);
}
