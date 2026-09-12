/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-minimal-dark-withimg-5. Base: carousel (container, with image).
 * Source: https://www.nottingham.ac.uk/ (.news-section .news-carousel — slick slider).
 * Each news slide = one row, 2 columns: [image][text(headline + teaser + read more)].
 * Model fields per item: image, imageAlt (collapsed into alt), text (richtext).
 * NOTE: slick duplicates slides with .slick-cloned — those are filtered out, and
 * duplicate cards (same headline/src) are de-duplicated.
 */
export default function parse(element, { document }) {
  // Real slides only — exclude slick clones. Fall back to any vertical-card.
  let slides = [...element.querySelectorAll('.slick-slide:not(.slick-cloned) .vertical-card')];
  if (!slides.length) slides = [...element.querySelectorAll('.vertical-card')];

  const cells = [];
  const seen = new Set();
  slides.forEach((card) => {
    // First card image (responsive variants share a src).
    const image = card.querySelector('img.vertical-card-img, img');

    const heading = card.querySelector('.news-title, h3, h2');
    const desc = card.querySelector('.news-desc, p');
    const readMore = card.querySelector('.card-content a, a.inline-link, a');

    // Skip duplicate cards (slick can leave visible duplicates).
    const key = (heading?.textContent || '') + (image?.getAttribute('src') || '');
    if (key && seen.has(key)) return;
    if (key) seen.add(key);

    // Column 1: image (field:image). imageAlt collapses into the <img> alt.
    const imageCell = [];
    if (image) {
      imageCell.push(document.createComment(' field:image '));
      imageCell.push(image);
    }

    // Column 2: text (field:text) — headline + teaser + read more.
    const textCell = [document.createComment(' field:text ')];
    if (heading) textCell.push(heading);
    if (desc) textCell.push(desc);
    if (readMore) textCell.push(readMore);

    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-minimal-dark-withimg-5', cells });
  element.replaceWith(block);
}
