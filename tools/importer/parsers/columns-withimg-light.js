/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-withimg-light. Base: columns.
 * Source: https://www.nottingham.ac.uk/study/campus-visit/open-days.html
 * Anchor: .featureblock.feature-block--reverse ("What to expect").
 *
 * Columns block (2 columns, 1 row). Per xwalk rules, Columns blocks carry only
 * default content and MUST NOT include field hints.
 * Cell 1 (content): .feature-block__text = heading + paragraphs + CTA link.
 * Cell 2 (image): .feature-block__media img (a Scene7 DM <img>; the DM pipeline
 * turns it into a carrier anchor, so the parser just emits the <img> as-is).
 */
export default function parse(element, { document }) {
  // --- Branch D: legacy Contensis pull quote with portrait (News press releases).
  // Instances `article.pressReleaseMain > .quoteWithImage` and `> .quoteNoImage`:
  //   [.blockquoteImage > img  +]  .blockquoteContent > blockquote
  // where the quote text is loose text directly inside <blockquote> and the
  // attribution is blockquote > footer > cite. One row:
  //   [image] [<p>quote</p><p><em>attribution</em></p>]   (with portrait)
  //   [<p>quote</p><p><em>attribution</em></p>]           (no portrait)
  // Plain paragraphs, NOT <blockquote>: md2jcr (AEM Author) rejects blockquote,
  // and treats columns-* cells as page-level content. The pull-quote look comes
  // from the block's CSS inside an "article" section.
  // Quote text is kept verbatim (whitespace collapsed only) — no quote marks added.
  if (element.matches('.quoteWithImage, .quoteNoImage')) {
    const clean = (s) => (s || '').replace(/[\s\u00a0]+/g, ' ').trim();
    const img = element.querySelector('.blockquoteImage img') || element.querySelector('img');
    const sourceQuote = element.querySelector('.blockquoteContent blockquote')
      || element.querySelector('blockquote');

    const quoteCell = [];
    if (sourceQuote) {
      const cite = sourceQuote.querySelector('footer cite') || sourceQuote.querySelector('cite, footer');
      // Quote body = everything in the blockquote except the attribution footer.
      const body = sourceQuote.cloneNode(true);
      body.querySelectorAll('footer').forEach((f) => f.remove());
      if (!sourceQuote.querySelector('footer') && cite) {
        body.querySelectorAll('cite').forEach((c) => c.remove());
      }
      const quoteText = clean(body.textContent);
      const attribution = clean(cite && cite.textContent);
      if (quoteText) {
        const p = document.createElement('p');
        p.textContent = quoteText;
        quoteCell.push(p);
      }
      if (attribution) {
        const p = document.createElement('p');
        const em = document.createElement('em');
        em.textContent = attribution;
        p.append(em);
        quoteCell.push(p);
      }
    }
    const imageCell = img ? [img] : [];

    if (!quoteCell.length && !imageCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }

    // No field hints for columns blocks — one row: (image,) quote.
    const block = WebImporter.Blocks.createBlock(document, {
      name: 'columns-withimg-light',
      cells: [imageCell.length ? [imageCell, quoteCell] : [quoteCell]],
    });
    element.replaceWith(block);
    return;
  }

  // --- Branch B: legacy Contensis testimonial (International applicants).
  // The instance selector `.sys_vertically-centred-content` matches TWO sibling
  // divs (inside sys_one_1585 / sys_two_1585): one holds a portrait <img>, the
  // other a quote (p.introParagraph) + attribution <p>. They must combine into
  // ONE 2-column block. The runner invokes this parser once per matched element,
  // so the FIRST invocation gathers all sibling cells and emits the block; a
  // marker on consumed elements makes the SECOND invocation bail.
  if (element.matches('.sys_vertically-centred-content')) {
    if (element.dataset && element.dataset.colsConsumed) {
      element.remove();
      return;
    }

    // Gather the full group of sibling column-contents. Walk up to the nearest
    // multi-column wrapper, else fall back to just this element.
    const wrapper = element.closest('[class*="Columns"], [class*="columns"], blockquote')
      || element.parentElement;
    let parts = wrapper
      ? Array.from(wrapper.querySelectorAll('.sys_vertically-centred-content'))
      : [element];
    if (!parts.length) parts = [element];

    const columnCells = parts.map((part) => {
      const cell = [];
      const img = part.querySelector('img');
      if (img) cell.push(img);
      Array.from(part.querySelectorAll('p, h1, h2, h3, h4, blockquote'))
        .filter((n) => n.textContent.trim() || n.querySelector('img'))
        .forEach((n) => cell.push(n));
      // If nothing structural was found but text exists, keep the whole part.
      if (!cell.length && part.textContent.trim()) cell.push(part);
      return cell;
    }).filter((cell) => cell.length);

    if (!columnCells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }

    // Mark all consumed parts so their own parser invocations no-op.
    parts.forEach((part) => {
      if (part !== element && part.dataset) part.dataset.colsConsumed = '1';
    });

    // No field hints for columns blocks — one row, N columns.
    const block = WebImporter.Blocks.createBlock(document, {
      name: 'columns-withimg-light',
      cells: [columnCells],
    });
    element.replaceWith(block);
    return;
  }

  // --- Branch C: legacy Contensis .sys_twoColumns5050 (Food Systems Institute
  // "Our mission"): .sys_one = h2 + intro <p><span.introParagraph> + body <p>
  // + <p><a.CTA-blueButtonWithArrow>; .sys_two = <img.img-responsive>.
  // One row, one cell per column, in source order (text, image). Guarded so a
  // .sys_twoColumns5050 row that holds legacy promo cards (those belong to the
  // cards parsers) is never turned into a columns block.
  if (element.matches('.sys_twoColumns5050, .sys_threeColumns, .sys_fourColumns')
    && !element.querySelector('.imageTextContentCTA-card, .sys_imageTitleContentCTA-card, .imageWhiteCTA-card')) {
    const MEDIA = 'img, picture, video, iframe';
    const isBlank = (n) => !n.matches(MEDIA) && !n.querySelector(MEDIA)
      && !n.textContent.replace(/[\s\u00a0]+/g, '');
    const columnCells = Array.from(element.children)
      .filter((col) => col.tagName === 'DIV' && !col.classList.contains('clear'))
      .map((col) => {
        const cell = [];
        Array.from(col.children).forEach((child) => {
          if (isBlank(child)) return;
          if (/^H[1-6]$/.test(child.tagName)) {
            // Rebuild headings to drop the trailing &nbsp; Contensis leaves behind.
            const h = document.createElement(child.tagName);
            h.textContent = child.textContent.replace(/[\s\u00a0]+/g, ' ').trim();
            cell.push(h);
          } else {
            cell.push(child);
          }
        });
        return cell;
      });

    if (!columnCells.some((cell) => cell.length)) {
      element.replaceWith(...element.childNodes);
      return;
    }

    // No field hints for columns blocks — one row, N columns.
    const block = WebImporter.Blocks.createBlock(document, {
      name: 'columns-withimg-light',
      cells: [columnCells],
    });
    element.replaceWith(block);
    return;
  }

  // --- Branch A: original .feature-block--reverse markup -----------------
  const textCol = element.querySelector('.feature-block__text');
  const mediaCol = element.querySelector('.feature-block__media');

  // Content cell: heading, supporting paragraphs, CTA button (deduped, in order).
  const contentCell = [];
  const heading = (textCol || element).querySelector('h1, h2, h3, .text-container__title');
  if (heading) contentCell.push(heading);

  const paras = Array.from(
    (textCol || element).querySelectorAll('.text-container__text p, .feature-block__text-content p'),
  ).filter((p) => p.textContent.trim());
  paras.forEach((p) => contentCell.push(p));

  const cta = (textCol || element).querySelector('.text-container__button-component a[href], .button-component a[href], a.button[href]');
  if (cta) contentCell.push(cta);

  // Image cell.
  const imageCell = [];
  const image = (mediaCol || element).querySelector('.image-container img, img');
  if (image) imageCell.push(image);

  if (!contentCell.length && !imageCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One row, two columns (content, image) — no field hints for columns blocks.
  const cells = [[contentCell, imageCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-withimg-light', cells });
  element.replaceWith(block);
}
