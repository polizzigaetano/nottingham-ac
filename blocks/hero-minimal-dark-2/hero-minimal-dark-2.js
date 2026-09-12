import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Hero (minimal, dark) — full-bleed photographic banner with an overlaid
 * heading, short paragraph and a single CTA. Authored as a block with a
 * background image and a content area (heading + text + button).
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];

  // First cell containing only a picture is treated as the background image.
  let bgPicture;
  const contentRows = [];
  rows.forEach((row) => {
    const cells = [...row.children];
    const onlyPicture = cells.length === 1 && cells[0].querySelector('picture')
      && cells[0].textContent.trim() === '';
    if (onlyPicture && !bgPicture) {
      bgPicture = cells[0].querySelector('picture');
    } else {
      contentRows.push(row);
    }
  });

  block.textContent = '';

  if (bgPicture) {
    const img = bgPicture.querySelector('img');
    const media = document.createElement('div');
    media.className = 'hero-minimal-dark-2-media';
    if (img) {
      const optimized = createOptimizedPicture(img.src, img.alt, true, [{ width: '2000' }]);
      media.append(optimized);
    } else {
      media.append(bgPicture);
    }
    block.append(media);
  }

  const content = document.createElement('div');
  content.className = 'hero-minimal-dark-2-content';
  contentRows.forEach((row) => {
    [...row.children].forEach((cell) => {
      while (cell.firstChild) content.append(cell.firstChild);
    });
  });
  block.append(content);
}
