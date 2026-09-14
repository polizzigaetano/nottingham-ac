/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero-dark. Base: carousel (container, per-slide items).
 * Source: https://www.nottingham.ac.uk/workingwithbusiness/degree-apprenticeships/degree-apprenticeships.aspx
 * Anchor: .banner.cycle
 *
 * Each unique slide = one row, 2 columns: [image][text].
 * Model fields per item (carousel-hero-dark-item): image, imageAlt (collapsed
 * into img alt), text (richtext = heading + subtext + CTA).
 * field:image before the image cell, field:text before the text cell.
 *
 * The cycle plugin renders a duplicate "sentinel" clone slide; identical slides
 * are de-duplicated by heading text so only real slides are emitted.
 */
export default function parse(element, { document }) {
  const slides = Array.from(element.querySelectorAll('.cycle-slide'));
  const cells = [];
  const seen = new Set();

  slides.forEach((slide) => {
    const text = slide.querySelector('.slide__text');
    // Skip non-content slides (e.g. the controls-only row) with no text block.
    if (!text) return;

    const heading = slide.querySelector('.slideHeading h2, .slideHeading h1, .slideHeading, h2, h1');
    const key = (heading ? heading.textContent : '').trim().toLowerCase();
    if (key && seen.has(key)) return; // de-dupe the sentinel clone / repeats
    if (key) seen.add(key);

    // Background image. Two source shapes:
    //  - scraped HTML: a real <img> in `.row.column` (control arrows are inline
    //    SVG/data-URI icons inside #controls — excluded).
    //  - live DOM: the slide image is a CSS background-image inline style on
    //    `.row.column`, so synthesize an <img> from that URL.
    let image = Array.from(slide.querySelectorAll('img')).find(
      (img) => !img.closest('.controls') && !img.closest('.control')
        && img.getAttribute('src') && !img.getAttribute('src').startsWith('data:'),
    );
    if (!image) {
      const bgHost = slide.querySelector('.row.column[style*="background"], [style*="background-image"]');
      const style = bgHost ? bgHost.getAttribute('style') || '' : '';
      const m = style.match(/background-image:\s*url\((['"]?)([^'")]+)\1\)/i);
      if (m && m[2]) {
        image = document.createElement('img');
        image.setAttribute('src', m[2]);
        if (heading) image.setAttribute('alt', (heading.textContent || '').trim());
      }
    }

    const subText = slide.querySelector('.subText');
    const cta = slide.querySelector('.callToAction a, a.button');

    // Column 1: image (field:image). imageAlt collapses into the <img> alt.
    const imageCell = [document.createComment(' field:image ')];
    if (image) imageCell.push(image);

    // Column 2: heading + subtext + CTA (field:text richtext).
    const textCell = [document.createComment(' field:text ')];
    if (heading) {
      const h = heading.matches('h1, h2, h3, h4, h5, h6') ? heading : heading.querySelector('h1, h2, h3, h4, h5, h6') || heading;
      textCell.push(h);
    }
    if (subText && subText.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = subText.textContent.trim();
      textCell.push(p);
    }
    if (cta) {
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      a.textContent = cta.textContent.trim() || cta.getAttribute('title') || 'Find out more';
      const wrap = document.createElement('p');
      wrap.appendChild(a);
      textCell.push(wrap);
    }

    cells.push([imageCell, textCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero-dark', cells });
  element.replaceWith(block);
}
