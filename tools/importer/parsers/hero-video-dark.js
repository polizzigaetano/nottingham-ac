/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-video-dark. Base: hero (single, standalone xwalk block).
 * Source: https://www.nottingham.ac.uk/study/home.html
 * Anchor: .content-search--withHero .video-fullWidth
 *
 * xwalk simple block — one column, one row per model field (imageAlt collapses
 * into the <img>). Authoritative structure is blocks/hero-video-dark model:
 *   image (reference -> poster), imageAlt (collapsed), video (aem-content),
 *   text (richtext, optional). => up to 3 content rows (image, video, text).
 * The generic library "Hero" convention has no video slot; this variant's model
 * adds one, so a video row is model-correct here.
 *
 * Source shape:
 *  - .video-fullWidth__img-container img  = Scene7 DM poster (emit as-is; the
 *    DM pipeline rewrites it into a carrier anchor downstream).
 *  - .video-fullWidth__player .video__play-btn = play button (not content).
 *  - <dialog class="video-modal"> <video src="blob:..."> = actual video, but the
 *    src is a NON-PORTABLE blob: URL — never emit it. Only a real
 *    https/data-src/data-video URL is usable; otherwise poster-only (graceful).
 */
export default function parse(element, { document }) {
  // Poster image (Scene7 DM). Emit the <img> untouched.
  const image = element.querySelector('.video-fullWidth__img-container img, .video-fullWidth__img, img');

  // Look for a usable (non-blob) video URL across likely carriers.
  const candidates = [];
  const video = element.querySelector('video');
  if (video) {
    candidates.push(video.getAttribute('data-hls-url'));
    candidates.push(video.getAttribute('data-src'));
    candidates.push(video.getAttribute('data-video'));
    candidates.push(video.getAttribute('src'));
  }
  element.querySelectorAll('[data-src], [data-video], [data-video-src]').forEach((el) => {
    candidates.push(el.getAttribute('data-src'));
    candidates.push(el.getAttribute('data-video'));
    candidates.push(el.getAttribute('data-video-src'));
  });
  const playerLink = element.querySelector('.video-fullWidth__player a[href], a[href]');
  if (playerLink) candidates.push(playerLink.getAttribute('href'));

  const videoUrl = candidates.find((u) => u && /^https?:\/\//i.test(u) && !/^blob:/i.test(u));

  // Optional heading/subtext/CTA. Current source has none inside the video block.
  const heading = element.querySelector('.video-fullWidth h1, .video-fullWidth h2, .video-fullWidth h3');
  const descr = element.querySelector('.video-fullWidth__description, .video-fullWidth p');

  const cells = [];

  // Row: image (field:image).
  if (image) {
    cells.push([[document.createComment(' field:image '), image]]);
  }

  // Row: video (field:video) — only when a real, portable URL exists.
  if (videoUrl) {
    const a = document.createElement('a');
    a.href = videoUrl;
    a.textContent = videoUrl;
    cells.push([[document.createComment(' field:video '), a]]);
  }

  // Row: text (field:text) — only when optional copy is present.
  const textParts = [];
  if (heading) textParts.push(heading);
  if (descr && descr.textContent.trim()) textParts.push(descr);
  if (textParts.length) {
    cells.push([[document.createComment(' field:text '), ...textParts]]);
  }

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-video-dark', cells });
  element.replaceWith(block);
}
