/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-logos-light. Base: cards (container, logos).
 * Source: https://www.nottingham.ac.uk/ (.homepage-partnerships / .partnerships-container).
 * Each logo = one row, 1 column: [image]. Model fields per item: image, imageAlt
 * (collapsed into the <img> alt). No text field.
 * NOTE: source duplicates the logo set for mobile (.d-md-none) and desktop
 * (.d-none.d-md-inline) layouts — de-duplicated here by image src.
 */
export default function parse(element, { document }) {
  const images = element.querySelectorAll('img.partner-icon, img');

  const cells = [];
  const seen = new Set();
  images.forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (src && seen.has(src)) return;
    if (src) seen.add(src);

    // 1 column: image (field:image). imageAlt collapses into the <img> alt.
    cells.push([[document.createComment(' field:image '), img]]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-logos-light', cells });
  element.replaceWith(block);
}
