import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Carousel (minimal, dark, with image) — a rotating strip of news cards, each
 * with an image, headline, teaser and "Read more" link. Arrows and dot
 * pagination scroll the track. Each authored row is a slide.
 * @param {Element} block
 */
function showSlide(track, index) {
  const slides = [...track.children];
  const clamped = Math.max(0, Math.min(index, slides.length - 1));
  slides[clamped].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  track.dataset.active = String(clamped);
  const dots = track.parentElement.querySelectorAll('.carousel-minimal-dark-withimg-5-dot');
  dots.forEach((dot, i) => dot.setAttribute('aria-current', i === clamped ? 'true' : 'false'));
}

export default function decorate(block) {
  const track = document.createElement('ul');
  track.className = 'carousel-minimal-dark-withimg-5-track';
  track.dataset.active = '0';

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    li.className = 'carousel-minimal-dark-withimg-5-slide';
    while (row.firstElementChild) {
      const cell = row.firstElementChild;
      if (cell.children.length === 1 && cell.querySelector('picture')) {
        cell.className = 'carousel-minimal-dark-withimg-5-image';
      } else {
        cell.className = 'carousel-minimal-dark-withimg-5-body';
      }
      li.append(cell);
    }
    track.append(li);
  });

  track.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });

  const slideCount = track.children.length;

  const nav = document.createElement('div');
  nav.className = 'carousel-minimal-dark-withimg-5-nav';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'carousel-minimal-dark-withimg-5-arrow carousel-minimal-dark-withimg-5-prev';
  prev.setAttribute('aria-label', 'Previous');
  prev.textContent = '‹';

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'carousel-minimal-dark-withimg-5-arrow carousel-minimal-dark-withimg-5-next';
  next.setAttribute('aria-label', 'Next');
  next.textContent = '›';

  const dots = document.createElement('div');
  dots.className = 'carousel-minimal-dark-withimg-5-dots';
  for (let i = 0; i < slideCount; i += 1) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-minimal-dark-withimg-5-dot';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.setAttribute('aria-current', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => showSlide(track, i));
    dots.append(dot);
  }

  prev.addEventListener('click', () => showSlide(track, Number(track.dataset.active) - 1));
  next.addEventListener('click', () => showSlide(track, Number(track.dataset.active) + 1));

  nav.append(prev, dots, next);
  block.replaceChildren(track, nav);
}
