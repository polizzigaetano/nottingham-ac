/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-minimal-dark-withimg-5. Base: cards (container, with image).
 * Source: https://www.nottingham.ac.uk/ (.homepage-image-cta-row).
 * Each image tile = one row, 2 columns: [image][text(CTA)].
 * Model fields per item: image, imageAlt (collapsed into alt), text (CTA richtext).
 */
export default function parse(element, { document }) {
  const tiles = element.querySelectorAll('.imageWhiteCTA-card');

  const cells = [];
  tiles.forEach((tile) => {
    const image = tile.querySelector('img.background-image, img');
    const cta = tile.querySelector('a.stripe-white-cta, a');

    // Column 1: image (field:image). imageAlt collapses into the <img> alt.
    const imageCell = [];
    if (image) {
      imageCell.push(document.createComment(' field:image '));
      imageCell.push(image);
    }

    // Column 2: CTA (field:text).
    const textCell = [document.createComment(' field:text ')];
    if (cta) textCell.push(cta);

    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-minimal-dark-withimg-5', cells });
  element.replaceWith(block);
}
