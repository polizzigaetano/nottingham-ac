/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-nav-light. Base: cards (container, per-card items).
 * Source: https://www.nottingham.ac.uk/workingwithbusiness/degree-apprenticeships/degree-apprenticeships.aspx
 * Anchor: .sys_twoColumns5050:has(.card)
 *
 * Each nav card = one row, 2 columns: [image][text].
 * Model fields per item (cards-nav-light-item): image, imageAlt (collapsed into
 * img alt), text (richtext = title + caption + card link).
 * field:image before the image cell, field:text before the text cell.
 *
 * Each card is wrapped in <a class="no-underlined" href> containing an <img>
 * and a `.card-section` (h2 title + caption p). The card's href is preserved as
 * a link in the text cell so the block JS can make the whole card clickable.
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('.card'));
  const cells = [];
  const seen = new Set();

  cards.forEach((card) => {
    const link = card.closest('a[href]') || card.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : null;
    const image = card.querySelector('img');
    const title = card.querySelector('.card-section h2, .card-section h3, h2, h3');
    const caption = card.querySelector('.card-section p, p');

    const key = (href || (title && title.textContent) || '').trim();
    if (key && seen.has(key)) return; // de-dupe repeated/clone cards
    if (key) seen.add(key);

    // Column 1: image (field:image). imageAlt collapses into the <img> alt.
    const imageCell = [document.createComment(' field:image ')];
    if (image) imageCell.push(image);

    // Column 2: title + caption + card link (field:text richtext).
    const textCell = [document.createComment(' field:text ')];
    if (title) textCell.push(title);
    if (caption) textCell.push(caption);
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = (link && link.getAttribute('title'))
        || (title && title.textContent.trim())
        || 'Find out more';
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-nav-light', cells });
  element.replaceWith(block);
}
