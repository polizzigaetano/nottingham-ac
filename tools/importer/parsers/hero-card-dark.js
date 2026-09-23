/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-card-dark. Base: hero (card, dark) — single standalone block.
 * Source: https://www.nottingham.ac.uk/study/home.html
 * Anchor: .promoCard-banner  (2 instances: "Open days" and "Our campuses").
 *
 * Matches the library "Hero" convention (1 column, up to 3 rows: name +
 * background image + content) and the block JS
 * (blocks/hero-card-dark/hero-card-dark.js), which treats the first
 * picture-only cell as the background and the remaining cell as content.
 * xwalk model hero-card-dark: image (reference bg), imageAlt (collapsed), text
 * (richtext). => Row 1 = [field:image] bg picture only; Row 2 = [field:text]
 * heading + paragraph + CTA.
 *
 * IMPORTANT DOM note: the background photo (`.promoCard-image`) is NOT inside
 * `.promoCard-banner` — it is a sibling within the parent `.promoCard-container`.
 * Each `.promoCard-banner` is passed separately, so we walk up to the container
 * to find the matching image.
 */
export default function parse(element, { document }) {
  const container = element.closest('.promoCard-container') || element.parentElement || element;

  // Background image lives beside the banner, in the container.
  const image = container.querySelector('.promoCard-image-container img, .promoCard-image, img')
    || element.querySelector('img');

  // Content: heading + paragraph + CTA (all inside the banner).
  const heading = element.querySelector('.promoCard-content-text h1, .promoCard-content-text h2, .promoCard-content-text h3, h1, h2, h3');
  const paras = Array.from(element.querySelectorAll('.promoCard-content-text p, .promoCard-content p'))
    .filter((p) => p.textContent.trim());
  const cta = element.querySelector('.promoCard-content-cta a[href], .button-component a[href], a.button[href], a[href]');

  if (!image && !heading && !paras.length && !cta) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 1: background image only (field:image) — single cell, picture/img only.
  if (image) {
    cells.push([[document.createComment(' field:image '), image]]);
  }

  // Row 2: content (field:text) = heading + paragraph(s) + CTA.
  const textCell = [document.createComment(' field:text ')];
  if (heading) textCell.push(heading);
  paras.forEach((p) => textCell.push(p));
  if (cta) {
    const a = document.createElement('a');
    a.href = cta.getAttribute('href');
    a.textContent = (cta.textContent || '').trim() || cta.getAttribute('href');
    textCell.push(a);
  }
  if (textCell.length > 1) cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-card-dark', cells });
  element.replaceWith(block);
}
