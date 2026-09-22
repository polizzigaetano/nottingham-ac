/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-minimal-dark-withimg-2. Base: columns.
 * Columns block: one row, N cells = columns. Per xwalk rules, Columns blocks
 * carry only default content and MUST NOT include field hints.
 * Layout: content column (heading + paragraph(s) + CTA) and an image column.
 *
 * Modes:
 *  A) Homepage .homepage-image-cta-block (.text-content / .block-content).
 *  B) Open Days .feature-block--dark-bg (Accessibility): .feature-block__text
 *     content + .feature-block__media image.
 *  C) Open Days .cmp-container--blue (Download the app): text/QR/badges column
 *     (.text-container__text + .qr-code) and a photo column (.cmp-image img).
 * Images may be Scene7 DM <img> — emitted as-is; the DM pipeline handles them.
 */
export default function parse(element, { document }) {
  // --- Mode B: feature-block dark (content in .feature-block__text). ---
  const fbText = element.querySelector('.feature-block__text');
  const fbMedia = element.querySelector('.feature-block__media');
  if (fbText || fbMedia) {
    const contentCell = [];
    const heading = (fbText || element).querySelector('h1, h2, h3, h4, .text-container__title');
    if (heading) contentCell.push(heading);
    Array.from((fbText || element).querySelectorAll('.text-container__text p, .feature-block__text-content p'))
      .filter((p) => p.textContent.trim())
      .forEach((p) => contentCell.push(p));
    const cta = (fbText || element).querySelector(
      '.text-container__button-component a[href], .button-component a[href], a.button[href]',
    );
    if (cta) contentCell.push(cta);

    const imageCell = [];
    const image = (fbMedia || element).querySelector('.image-container img, img');
    if (image) imageCell.push(image);

    if (contentCell.length || imageCell.length) {
      const cells = [[contentCell, imageCell]];
      const block = WebImporter.Blocks.createBlock(document, { name: 'columns-minimal-dark-withimg-2', cells });
      element.replaceWith(block);
      return;
    }
  }

  // --- Mode C: blue container (Download the app) — text/QR column + photo. ---
  const qr = element.querySelector('.qr-code');
  if (qr || element.classList.contains('cmp-container--blue')) {
    const textBlock = element.querySelector('.cmp-text .text-container__text, .text-container__text, .cmp-text');

    const contentCell = [];
    if (textBlock) {
      Array.from(textBlock.children)
        .filter((c) => c.textContent.trim() || c.querySelector('img, a'))
        .forEach((c) => contentCell.push(c));
    }
    // QR / app-store badge links ride along in the content column.
    Array.from(element.querySelectorAll('.qr-code__mobile a[href]')).forEach((a) => contentCell.push(a));
    const qrImg = element.querySelector('.qr-code__desktop-img');
    if (qrImg) contentCell.push(qrImg);

    // Photo column: the standalone .cmp-image (not the QR/badge images).
    const imageCell = [];
    const photo = element.querySelector('.cmp-image img, .image img');
    if (photo) imageCell.push(photo);

    if (contentCell.length || imageCell.length) {
      const cells = [[contentCell, imageCell]];
      const block = WebImporter.Blocks.createBlock(document, { name: 'columns-minimal-dark-withimg-2', cells });
      element.replaceWith(block);
      return;
    }
  }

  // --- Mode A: homepage .homepage-image-cta-block. ---
  const textContent = element.querySelector('.text-content');
  const cta = element.querySelector('.block-content a, a.stripe-white-cta');
  const heading = textContent?.querySelector('h1, h2, h3, h4')
    || element.querySelector('h1, h2, h3, h4');
  const para = textContent?.querySelector('p') || element.querySelector('.block-content p');
  const image = element.querySelector('.image-container img, img');

  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (para) contentCell.push(para);
  if (cta) contentCell.push(cta);

  const imageCell = [];
  if (image) imageCell.push(image);

  if (!contentCell.length && !imageCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One row, two columns (content, image) — no field hints for columns blocks.
  const cells = [[contentCell, imageCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-minimal-dark-withimg-2', cells });
  element.replaceWith(block);
}
