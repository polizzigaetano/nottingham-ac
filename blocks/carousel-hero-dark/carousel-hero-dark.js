import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Carousel (hero, dark) — a full-bleed, auto-cycling hero banner. Each slide is
 * a background image with an overlaid text panel (heading + subtext + CTA).
 * Previous / pause / next controls sit in the corner. Each authored row is a
 * slide: cell 1 = image, cell 2 = text (heading, optional subtext, CTA link).
 * @param {Element} block
 */
const AUTOPLAY_MS = 6000;

function showSlide(track, index) {
  const slides = [...track.children];
  const count = slides.length;
  const clamped = ((index % count) + count) % count;
  slides.forEach((slide, i) => {
    slide.setAttribute('aria-hidden', i === clamped ? 'false' : 'true');
  });
  track.dataset.active = String(clamped);
  const dots = track.parentElement.querySelectorAll('.carousel-hero-dark-dot');
  dots.forEach((dot, i) => dot.setAttribute('aria-current', i === clamped ? 'true' : 'false'));
}

export default function decorate(block) {
  const track = document.createElement('ul');
  track.className = 'carousel-hero-dark-track';
  track.dataset.active = '0';

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    li.className = 'carousel-hero-dark-slide';
    while (row.firstElementChild) {
      const cell = row.firstElementChild;
      if (cell.querySelector('picture')) {
        cell.className = 'carousel-hero-dark-image';
      } else {
        cell.className = 'carousel-hero-dark-body';
      }
      li.append(cell);
    }
    track.append(li);
  });

  track.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '1600' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });

  const slides = [...track.children];
  const slideCount = slides.length;
  slides.forEach((slide, i) => slide.setAttribute('aria-hidden', i === 0 ? 'false' : 'true'));

  const nav = document.createElement('div');
  nav.className = 'carousel-hero-dark-nav';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'carousel-hero-dark-arrow carousel-hero-dark-prev';
  prev.setAttribute('aria-label', 'Previous slide');
  prev.textContent = '‹';

  const pause = document.createElement('button');
  pause.type = 'button';
  pause.className = 'carousel-hero-dark-arrow carousel-hero-dark-pause';
  pause.setAttribute('aria-label', 'Pause');
  pause.setAttribute('aria-pressed', 'false');
  pause.textContent = '❚❚';

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'carousel-hero-dark-arrow carousel-hero-dark-next';
  next.setAttribute('aria-label', 'Next slide');
  next.textContent = '›';

  const dots = document.createElement('div');
  dots.className = 'carousel-hero-dark-dots';
  for (let i = 0; i < slideCount; i += 1) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-hero-dark-dot';
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.setAttribute('aria-current', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => showSlide(track, i));
    dots.append(dot);
  }

  let timer = null;
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  const start = () => {
    stop();
    if (slideCount > 1) {
      timer = setInterval(() => showSlide(track, Number(track.dataset.active) + 1), AUTOPLAY_MS);
    }
  };

  prev.addEventListener('click', () => { showSlide(track, Number(track.dataset.active) - 1); start(); });
  next.addEventListener('click', () => { showSlide(track, Number(track.dataset.active) + 1); start(); });
  pause.addEventListener('click', () => {
    if (timer) {
      stop();
      pause.setAttribute('aria-pressed', 'true');
      pause.setAttribute('aria-label', 'Play');
      pause.textContent = '►';
    } else {
      start();
      pause.setAttribute('aria-pressed', 'false');
      pause.setAttribute('aria-label', 'Pause');
      pause.textContent = '❚❚';
    }
  });

  nav.append(prev, pause, next, dots);
  block.replaceChildren(track, nav);

  if (slideCount > 1) start();
}
