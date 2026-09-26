/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-minimal-dark-2. Base: hero.
 * Source: https://www.nottingham.ac.uk/ (.homepage-hero-banner)
 * Simple block, 1 column x 3 rows (name + image + content).
 * Model fields: image (Background Image), imageAlt (collapsed into alt), text.
 */
export default function parse(element, { document }) {
  // Mode C: legacy Contensis banners (Food Systems Institute):
  //  - .sys_standard-banner: .gradient-overlay + two .background-image twins
  //    (mobile .d-block.d-sm-none / desktop .d-none.d-sm-block), each holding
  //    .banner-content (h1 + p + a.sys_white-btn). Image is a CSS
  //    background-image in the inline style, not an <img>.
  //  - .sys_fullWidthImage-TextWithCTA: one .background-image (style url) >
  //    .overlay > .container > .main-content (p.text-content + a.sys_white-btn),
  //    no heading.
  // Guarded on the legacy root classes so Modes A/B are untouched.
  if (element.matches('.sys_standard-banner, .sys_fullWidthImage-TextWithCTA')) {
    // Prefer the desktop twin (the cleanup transformer removes the mobile one in
    // the real import; the validator runs without transformers).
    const scope = element.querySelector(':scope > .background-image.d-none.d-sm-block')
      || element.querySelector(':scope > .background-image:not(.d-sm-none)')
      || element.querySelector('.background-image')
      || element;

    // Background image: real <img> first, else the inline style url(...).
    let image = scope.querySelector('img');
    if (!image) {
      const styled = [scope, ...scope.querySelectorAll('[style*="background-image"]')]
        .find((el) => /url\(/i.test(el.getAttribute('style') || ''));
      const m = styled && (styled.getAttribute('style') || '').match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      if (m) {
        image = document.createElement('img');
        image.setAttribute('src', m[1].trim());
        image.setAttribute('alt', '');
      }
    }

    const content = scope.querySelector('.banner-content, .main-content') || scope;
    const headingSrc = content.querySelector('h1, h2, h3');
    const paras = Array.from(content.querySelectorAll('p'))
      .filter((p) => p.textContent.replace(/[\s\u00a0]+/g, '').length);
    const ctaSrc = content.querySelector('a.sys_white-btn[href], a[href]');

    if (!headingSrc && !paras.length && !ctaSrc && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }

    const contentCell = [document.createComment(' field:text ')];
    if (headingSrc && headingSrc.textContent.trim()) {
      // Only one H1 per page: a banner that is not the first H1 on the page
      // (e.g. the "Annual Report" promo nested in .container.my-4) becomes H2.
      const firstH1 = document.querySelector('h1');
      const demote = headingSrc.tagName === 'H1'
        && ((firstH1 && !element.contains(firstH1))
          || !!element.parentElement.closest('.container, .container-grey-bg, .container-yellow-bg'));
      const level = demote ? 'H2' : headingSrc.tagName;
      const h = document.createElement(level);
      h.textContent = headingSrc.textContent.replace(/\s+/g, ' ').trim();
      contentCell.push(h);
    }
    paras.forEach((p) => {
      // Rebuild as a plain <p> (drops legacy classes like .text-content).
      const np = document.createElement('p');
      np.innerHTML = p.innerHTML;
      contentCell.push(np);
    });
    if (ctaSrc) {
      const a = document.createElement('a');
      a.setAttribute('href', ctaSrc.getAttribute('href'));
      if (ctaSrc.getAttribute('title')) a.setAttribute('title', ctaSrc.getAttribute('title'));
      a.textContent = (ctaSrc.textContent || '').replace(/\s+/g, ' ').trim();
      contentCell.push(a);
    }

    const legacyCells = [
      image ? [[document.createComment(' field:image '), image]] : [''],
      [contentCell],
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: 'hero-minimal-dark-2', cells: legacyCells });
    element.replaceWith(block);
    return;
  }

  // Mode B: Open Days feature-block hero (.feature-block--dark-bg.feature-block--standard).
  // Content lives in .feature-block__text (eyebrow h2 + heading/date paragraphs + CTA),
  // image/video poster in .feature-block__media (a Scene7 DM <img>).
  const fbText = element.querySelector('.feature-block__text');
  const fbMedia = element.querySelector('.feature-block__media');
  if (fbText || fbMedia) {
    const fbImage = (fbMedia || element).querySelector(
      '.video-fullWidth__img, .image-container img, img',
    );

    const contentCell = [document.createComment(' field:text ')];
    // Eyebrow / section label (h2.text-container__title).
    const eyebrow = fbText && fbText.querySelector('.text-container__title, h1, h2, h3');
    if (eyebrow && eyebrow.textContent.trim()) contentCell.push(eyebrow);
    // Heading + date paragraphs.
    const fbParas = fbText
      ? Array.from(fbText.querySelectorAll('.text-container__text p, .feature-block__text-content p'))
        .filter((p) => p.textContent.trim())
      : [];
    fbParas.forEach((p) => contentCell.push(p));
    // CTA button.
    const fbCta = fbText && fbText.querySelector(
      '.text-container__button-component a[href], .button-component a[href], a.button[href]',
    );
    if (fbCta) {
      const a = document.createElement('a');
      a.setAttribute('href', fbCta.getAttribute('href'));
      a.textContent = (fbCta.textContent || '').replace(/\s+/g, ' ').trim();
      contentCell.push(a);
    }

    if (contentCell.length === 1 && !fbImage) {
      element.replaceWith(...element.childNodes);
      return;
    }

    const fbCells = [];
    // Row 2: background image (field:image). imageAlt collapses into the <img> alt.
    if (fbImage) {
      fbCells.push([[document.createComment(' field:image '), fbImage]]);
    } else {
      fbCells.push(['']);
    }
    // Row 3: content (field:text).
    fbCells.push([contentCell]);

    const fbBlock = WebImporter.Blocks.createBlock(document, { name: 'hero-minimal-dark-2', cells: fbCells });
    element.replaceWith(fbBlock);
    return;
  }

  // Mode A: homepage / study-with-us banner hero.
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
