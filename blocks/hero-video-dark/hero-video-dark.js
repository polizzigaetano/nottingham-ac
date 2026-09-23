import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Hero (video, dark) — a full-bleed dark media hero: a poster image with a
 * circular play button overlaid. Clicking play opens the video in a modal
 * dialog. Optional heading/subtext + CTA can sit over the poster.
 *
 * Authored cells (standalone):
 *   - a picture cell (poster/background image)
 *   - an optional link cell whose href is the video URL (YouTube/Vimeo/mp4)
 *   - optional text (heading, subtext, CTA)
 * If no video URL is present, the block renders just the poster (no play btn).
 * @param {Element} block
 */
function buildModal(videoUrl) {
  const dialog = document.createElement('dialog');
  dialog.className = 'hero-video-dark-modal';

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'hero-video-dark-close';
  close.setAttribute('aria-label', 'Close video');
  close.textContent = '×';
  close.addEventListener('click', () => dialog.close());

  const frameWrap = document.createElement('div');
  frameWrap.className = 'hero-video-dark-frame';

  const isFile = /\.(mp4|webm|ogg)(\?|$)/i.test(videoUrl);
  let media;
  if (isFile) {
    media = document.createElement('video');
    media.src = videoUrl;
    media.controls = true;
    media.setAttribute('playsinline', '');
  } else {
    media = document.createElement('iframe');
    media.src = videoUrl;
    media.title = 'Video';
    media.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
    media.setAttribute('allowfullscreen', '');
  }
  frameWrap.append(media);
  dialog.append(close, frameWrap);
  return dialog;
}

export default function decorate(block) {
  const rows = [...block.children];

  let bgPicture;
  let videoUrl;
  const contentRows = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    const onlyPicture = cells.length === 1 && cells[0].querySelector('picture')
      && cells[0].textContent.trim() === '';
    const link = row.querySelector('a[href]');
    const onlyLink = cells.length === 1 && link
      && cells[0].textContent.trim() === link.textContent.trim();

    if (onlyPicture && !bgPicture) {
      bgPicture = cells[0].querySelector('picture');
    } else if (onlyLink && !videoUrl) {
      videoUrl = link.getAttribute('href');
    } else {
      contentRows.push(row);
    }
  });

  block.textContent = '';

  // Media (poster)
  const media = document.createElement('div');
  media.className = 'hero-video-dark-media';
  if (bgPicture) {
    const img = bgPicture.querySelector('img');
    if (img) {
      media.append(createOptimizedPicture(img.src, img.alt, true, [{ width: '2000' }]));
    } else {
      media.append(bgPicture);
    }
  }
  block.append(media);

  // Content overlay (optional)
  if (contentRows.length) {
    const content = document.createElement('div');
    content.className = 'hero-video-dark-content';
    contentRows.forEach((row) => {
      [...row.children].forEach((cell) => {
        while (cell.firstChild) content.append(cell.firstChild);
      });
    });
    block.append(content);
  }

  // Play button + modal (only when a video URL is present)
  if (videoUrl) {
    const dialog = buildModal(videoUrl);
    const playWrap = document.createElement('div');
    playWrap.className = 'hero-video-dark-play-wrapper';
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'hero-video-dark-play';
    play.setAttribute('aria-label', 'Play video');
    play.textContent = '▶';
    play.addEventListener('click', () => {
      if (typeof dialog.showModal === 'function') dialog.showModal();
    });
    playWrap.append(play);
    media.append(playWrap);
    block.append(dialog);
  }
}
