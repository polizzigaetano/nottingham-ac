import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Columns (video, light) — a two-column, light section: a text panel on one
 * side and an embedded video on the other. The video cell holds a link to the
 * embed/player URL, which this block turns into a responsive iframe. A single
 * authored row with two cells: text cell + video cell (a link, or a picture as
 * a poster fallback).
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-video-light-row');
    [...row.children].forEach((cell) => {
      const link = cell.querySelector('a[href]');
      const isVideo = link && !cell.textContent.replace(link.textContent, '').trim();
      if (isVideo || cell.querySelector('picture')) {
        cell.className = 'columns-video-light-media';
      } else {
        cell.className = 'columns-video-light-text';
      }
    });
  });

  // Turn a lone media link into an embedded iframe (lazy: only its src).
  block.querySelectorAll('.columns-video-light-media a[href]').forEach((a) => {
    const url = a.getAttribute('href');
    const wrapper = document.createElement('div');
    wrapper.className = 'columns-video-light-embed';
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.title = a.textContent.trim() || 'Video';
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('allowfullscreen', '');
    moveInstrumentation(a, iframe);
    wrapper.append(iframe);
    a.replaceWith(wrapper);
  });
}
