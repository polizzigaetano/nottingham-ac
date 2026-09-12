import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Carousel (events, light) — a rotating strip of event cards, each with an
 * image, a date block, a title and a "Read more" link. Arrows and dots scroll
 * the track. Each authored row is a slide; the first heading is treated as the
 * date/title and image cells are detected automatically.
 * @param {Element} block
 */
function showSlide(track, index) {
  const slides = [...track.children];
  const clamped = Math.max(0, Math.min(index, slides.length - 1));
  slides[clamped].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  track.dataset.active = String(clamped);
  const dots = track.parentElement.querySelectorAll('.carousel-events-light-dot');
  dots.forEach((dot, i) => dot.setAttribute('aria-current', i === clamped ? 'true' : 'false'));
}

export default function decorate(block) {
  const track = document.createElement('ul');
  track.className = 'carousel-events-light-track';
  track.dataset.active = '0';

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    li.className = 'carousel-events-light-slide';
    while (row.firstElementChild) {
      const cell = row.firstElementChild;
      if (cell.children.length === 1 && cell.querySelector('picture')) {
        cell.className = 'carousel-events-light-image';
      } else {
        cell.className = 'carousel-events-light-body';
        // Format the prominent date: split "29 April" into a big day + month below.
        const dateP = [...cell.querySelectorAll('p')].find(
          (p) => !p.querySelector('a') && /^\s*\d{1,2}\s+\S+/.test(p.textContent),
        );
        if (dateP) {
          const match = dateP.textContent.trim().match(/^(\d{1,2})\s+(.+)$/);
          if (match) {
            dateP.textContent = '';
            dateP.className = 'carousel-events-light-date';
            const day = document.createElement('span');
            day.className = 'carousel-events-light-day';
            [day.textContent] = [match[1]];
            const month = document.createElement('span');
            month.className = 'carousel-events-light-month';
            [, , month.textContent] = match;
            dateP.append(day, month);
          }
        }
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
  nav.className = 'carousel-events-light-nav';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'carousel-events-light-arrow carousel-events-light-prev';
  prev.setAttribute('aria-label', 'Previous');
  prev.textContent = '‹';

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'carousel-events-light-arrow carousel-events-light-next';
  next.setAttribute('aria-label', 'Next');
  next.textContent = '›';

  const dots = document.createElement('div');
  dots.className = 'carousel-events-light-dots';
  for (let i = 0; i < slideCount; i += 1) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-events-light-dot';
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
