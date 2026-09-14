/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-minimal-dark-2. Base: hero.
 * Source: https://www.nottingham.ac.uk/ (.homepage-hero-banner)
 * Simple block, 1 column x 3 rows (name + image + content).
 * Model fields: image (Background Image), imageAlt (collapsed into alt), text.
 */
export default function parse(element, { document }) {
  // Background image: prefer the desktop banner image, fall back to any banner image.
  // Study-with-us (.heroSearch-component .hero-image-background) exposes the background
  // as a bare <img> directly under the anchor, covered by the trailing `img` fallback.
  const bgImage = element.querySelector(
    '.desktop-banner-image, img.mobile-banner-image, .banner-background img, .hero-background-image img, img',
  );

  // Content: heading, supporting paragraph and single CTA.
  // On study-with-us the heading + CTA live inside `.hero-background-image` and the CTA
  // uses the generic `.cta` pill class.
  const heading = element.querySelector('.banner-title, .hero-background-image h1, h1, h2');
  const text = element.querySelector('.banner-text, p');
  const cta = element.querySelector('.banner-content a, a.stripe-white-cta, .hero-background-image a.cta, a.cta, a');

  if (!heading && !text && !cta && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (field:image). imageAlt collapses into the <img> alt.
  if (bgImage) {
    cells.push([[document.createComment(' field:image '), bgImage]]);
  } else {
    cells.push(['']);
  }

  // Row 3: content (field:text) — heading + paragraph + CTA grouped in one cell.
  const contentCell = [document.createComment(' field:text ')];
  if (heading) contentCell.push(heading);
  if (text) contentCell.push(text);
  if (cta) contentCell.push(cta);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-minimal-dark-2', cells });
  element.replaceWith(block);
}
