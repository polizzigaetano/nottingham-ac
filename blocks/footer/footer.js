// Nottingham footer — navy footer with a contact + social column, four link
// columns, and a legal bar. All copy/links/images come from
// /content/footer.plain.html; this file only reads that DOM and lays it out.

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // metadata-independent dual-fetch: /content first (localhost), then root (DA/EDS prod)
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return;
  const html = await resp.text();

  const dom = document.createElement('div');
  dom.innerHTML = html;
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
      const clone = node.cloneNode(true);
      if (node.tagName === 'UL') clone.className = 'footer-social';
      contact.append(clone);
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
        currentCol.append(node.cloneNode(true));
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
      const clone = node.cloneNode(true);
      if (node.tagName === 'UL') clone.className = 'footer-legal-links';
      legal.append(clone);
    });
    footer.append(legal);
  }

  block.append(footer);
}
