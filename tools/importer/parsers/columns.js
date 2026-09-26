/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns (generic Columns block, blocks/columns). Base: columns.
 * Source: https://www.nottingham.ac.uk/news/hidden-signs-of-financial-abuse
 * Anchor: article.pressReleaseMain > .author (media contact card).
 * Generated: 2026-09-26
 *
 * Columns block: one row, N cells (here 2). Per xwalk rules (blocks/columns/
 * _columns.json only models `columns`/`rows`), Columns cells carry default
 * content and MUST NOT include field hints.
 *
 * Source structure:
 *   .authorImage > img
 *   .authorDetails = loose text lines separated by <br>:
 *     "Name - Role - Faculty" <br>
 *     <strong>Email:</strong> <a href="mailto:…"> address</a> <br>
 *     <strong>Phone:</strong> number <br>
 *     <strong>Location:</strong>            ← label with no value: dropped
 * Output: [image] [one <p> per non-empty line]
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/[\s\u00a0]+/g, ' ').trim();

  const img = element.querySelector('.authorImage img') || element.querySelector('img');
  const details = element.querySelector('.authorDetails')
    || Array.from(element.children).find((c) => !c.querySelector('img') && clean(c.textContent));

  // Split .authorDetails into lines on <br> (and on block children, if any).
  const lines = [];
  let current = [];
  const flush = () => { if (current.length) lines.push(current); current = []; };
  if (details) {
    Array.from(details.childNodes).forEach((node) => {
      if (node.nodeType === 1 && node.tagName === 'BR') { flush(); return; }
      if (node.nodeType === 1 && /^(P|DIV|UL|OL|H[1-6])$/.test(node.tagName)) {
        flush(); lines.push([node]); return;
      }
      current.push(node);
    });
    flush();
  }

  const detailsCell = [];
  lines.forEach((nodes) => {
    const text = clean(nodes.map((n) => n.textContent).join(''));
    if (!text) return;
    // Label-only line (e.g. "<strong>Location:</strong>" with no value) — drop it.
    const labelText = clean(nodes
      .filter((n) => n.nodeType === 1 && /^(STRONG|B)$/.test(n.tagName))
      .map((n) => n.textContent).join(''));
    if (labelText && labelText === text && /:$/.test(labelText)) return;

    const p = document.createElement('p');
    nodes.forEach((n) => p.append(n.cloneNode(true)));
    // Trim stray whitespace inside links (source has "<a> address</a>").
    p.querySelectorAll('a').forEach((a) => {
      if (!a.querySelector('*')) a.textContent = clean(a.textContent);
    });
    // Trim leading/trailing whitespace text nodes of the paragraph.
    const first = p.firstChild;
    if (first && first.nodeType === 3) first.textContent = first.textContent.replace(/^\s+/, '');
    const last = p.lastChild;
    if (last && last.nodeType === 3) last.textContent = last.textContent.replace(/\s+$/, '');
    detailsCell.push(p);
  });

  const imageCell = img ? [img] : [];

  if (!imageCell.length && !detailsCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One row, two columns (image, details) — no field hints for columns blocks.
  const cells = [[imageCell, detailsCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
