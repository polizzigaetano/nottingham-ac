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
/**
 * Add an autoplay parameter to a provider embed URL so the video starts when
 * the modal is opened (not on page load). Files use the <video> element's
 * play() instead, so they don't need this.
 */
function withAutoplay(url) {
  try {
    const u = new URL(url, window.location.origin);
    if (/youtube\.com|youtu\.be|vimeo\.com/i.test(u.hostname)) {
      u.searchParams.set('autoplay', '1');
    }
    return u.toString();
  } catch (e) {
    return url;
  }
}

/**
 * Build the video modal. The player's src is NOT set here — it is loaded only
 * when the modal opens (openModal) and cleared when it closes (closeModal), so
 * the video never plays in the background on page load.
 */
function buildModal(videoUrl) {
  const dialog = document.createElement('dialog');
  dialog.className = 'hero-video-dark-modal';

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'hero-video-dark-close';
  close.setAttribute('aria-label', 'Close video');
  close.textContent = '×';

  const frameWrap = document.createElement('div');
  frameWrap.className = 'hero-video-dark-frame';

  const isFile = /\.(mp4|webm|ogg|m3u8)(\?|$)/i.test(videoUrl);
  let media;
  if (isFile) {
    media = document.createElement('video');
    media.controls = true;
    media.setAttribute('playsinline', '');
    media.setAttribute('preload', 'none');
  } else {
    media = document.createElement('iframe');
    media.title = 'Video';
    media.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
    media.setAttribute('allowfullscreen', '');
  }
  frameWrap.append(media);
  dialog.append(close, frameWrap);

  function openModal() {
    // Load the source only now, so nothing plays until the user asks for it.
    if (isFile) {
      media.src = videoUrl;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      const p = media.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } else {
      media.src = withAutoplay(videoUrl);
      if (typeof dialog.showModal === 'function') dialog.showModal();
    }
  }

  function closeModal() {
    if (isFile) media.pause();
    // Clearing the src stops iframe playback and releases the video.
    media.removeAttribute('src');
    if (isFile) media.load();
    if (dialog.open) dialog.close();
  }

  close.addEventListener('click', closeModal);
  // Close when the backdrop (area outside the frame) is clicked.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) closeModal();
  });
  // Native Escape triggers dialog 'close' — make sure the src is cleared too.
  dialog.addEventListener('close', () => {
    if (media.getAttribute('src')) {
      if (isFile) media.pause();
      media.removeAttribute('src');
      if (isFile) media.load();
    }
  });

  return { dialog, openModal };
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
    const { dialog, openModal } = buildModal(videoUrl);
    const playWrap = document.createElement('div');
    playWrap.className = 'hero-video-dark-play-wrapper';
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'hero-video-dark-play';
    play.setAttribute('aria-label', 'Play video');
    play.textContent = '▶';
    play.addEventListener('click', openModal);
    playWrap.append(play);
    media.append(playWrap);
    block.append(dialog);
  }
}
