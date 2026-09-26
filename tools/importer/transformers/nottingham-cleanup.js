/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: University of Nottingham site-wide cleanup.
 * All selectors verified against migration-work/cleaned.html.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Cookie consent / OneTrust overlays (verified: #onetrust-consent-sdk line 1276,
    // #ot-sdk-btn line 1260, iframe.ot-text-resize line 1523).
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#ot-sdk-btn',
      '.ot-sdk-container',
      '.ot-fade-in',
      'iframe.ot-text-resize',
    ]);

    // ---- Legacy news press-release template (news-press-release) ----------
    // GUARDED: runs only when the news article marker article.pressReleaseMain
    // is present, so no other template is affected. Runs here in cleanup's
    // beforeTransform, i.e. before the sections transformer inserts its <hr>
    // breaks and before any parser runs. Selectors verified in cleaned.html
    // (news/hidden-signs-of-financial-abuse).
    const newsArticle = element.querySelector('article.pressReleaseMain');
    if (newsArticle) {
      // 1. News menu -> horizontal bar directly under the lead image + H1.
      //    #NavDiv (line 55, inside #internalNav) moved to sit right after
      //    #content > .sys_detailImage (line 139). The nav-anchor-light parser
      //    targets #NavDiv > ul.sys_simpleListMenu, which moves with it.
      const newsTitle = element.querySelector('#content > .sys_detailImage');
      const newsNav = element.querySelector('#NavDiv');
      if (newsTitle && newsNav) newsTitle.after(newsNav);

      // 2. Press-office box (#bottom > .sys_content, line 226: h2 "Media
      //    Relations - External Relations" + address/phone/email paragraphs)
      //    rescued to the end of the article (after .boilerplate) because
      //    afterTransform removes #bottom. Wrapper div unwrapped so the h2 and
      //    paragraphs import as plain default content.
      const pressBox = element.querySelector('#bottom > .sys_content');
      if (pressBox) {
        newsArticle.append(...pressBox.childNodes);
        pressBox.remove();
      }

      // 3. Date (line 144) -> <p> with the same text so it imports as a paragraph.
      newsArticle.querySelectorAll(':scope > span.date').forEach((span) => {
        const p = document.createElement('p');
        p.textContent = span.textContent.trim();
        span.replaceWith(p);
      });

      // 4. Pull quotes (.quoteWithImage / .quoteNoImage) are left to the
      //    columns-withimg-light parser, which emits plain paragraphs — AEM's
      //    md2jcr rejects <blockquote>, so no quote element may survive import.

      // 5. Hidden / duplicate chrome on this template only:
      //    #pageheader   -> legacy logo + campus links bar (line 8; .campuslinks
      //                     alone is removed site-wide, the .logo img is not)
      //    #pageTitle    -> hidden second H1 "article" (line 54)
      //    #pageToolsTab -> Print / Email this Page tools (line 120)
      WebImporter.DOMUtils.remove(element, ['#pageheader', '#pageTitle', '#pageToolsTab']);
      //    Empty .introParagraph (line 145) — only if it has no content at all.
      const isEmptyNode = (el) => !el.children.length
        && el.textContent.replace(/[\s ]+/g, '') === '';
      newsArticle.querySelectorAll(':scope > .introParagraph').forEach((el) => {
        if (isEmptyNode(el)) el.remove();
      });
      //    Empty <strong> </strong> in the Story credits paragraph (line 191,
      //    "via<strong> </strong><a>"). Replaced by a plain space rather than
      //    deleted so "via" and the email link don't run together.
      newsArticle.querySelectorAll('p strong').forEach((strong) => {
        if (isEmptyNode(strong)) strong.replaceWith(document.createTextNode(' '));
      });
    }

    // Hidden mobile-duplicate hero variant inside the heroSearch component
    // (verified in cleaned.html: .heroSearch-component > .d-block.d-lg-none,
    // line 476, is a byte-for-byte duplicate of the visible desktop hero at
    // .d-none.d-lg-block, line 459). Removed before block parsing so the hero
    // parser extracts a single hero rather than two. Scoped to the hero
    // component so the responsive .d-*/.d-lg-* utility classes used on real
    // content elsewhere (e.g. the intro paragraph at line 604) are untouched.
    WebImporter.DOMUtils.remove(element, [
      '.heroSearch-component .d-block.d-lg-none',
    ]);

    // Hidden mobile duplicate of the in-page section nav (verified in
    // cleaned.html: .standard-nav-with-dropdown-mobile.d-block.d-lg-none is the
    // mobile twin of the visible desktop .standard-nav-with-dropdown-desktop).
    // It carries a "Menu" toggle plus every expanded dropdown sub-link, which
    // would otherwise be swept into the nav-anchor-light section and render as a
    // long flat link dump. Remove before parsing so only the 6 top-level desktop
    // links become the block.
    WebImporter.DOMUtils.remove(element, [
      '.standard-nav-with-dropdown-mobile',
    ]);

    // Legacy Contensis standard banner: mobile-only duplicate copy (verified in
    // cleaned.html, Food Systems Institute page: .sys_standard-banner >
    // .background-image.d-block.d-sm-none at lines 472 and 670 repeat the same
    // h1 / p / CTA as the desktop .background-image.d-none.d-sm-block sibling
    // at lines 480 and 678, with only a different mobile image crop). The hero
    // parser grabs the first img/h1/p/a, so without this it would take the
    // mobile crop and leave the desktop copy behind as duplicate default
    // content. Guarded: only removed when a desktop sibling exists AND it
    // repeats the same heading text, so the desktop copy the parser needs is
    // always kept and no non-duplicate content is ever stripped.
    element.querySelectorAll('.sys_standard-banner').forEach((banner) => {
      const mobile = banner.querySelector(':scope > .background-image.d-block.d-sm-none');
      const desktop = banner.querySelector(':scope > .background-image.d-none.d-sm-block');
      if (!mobile || !desktop) return;
      const headingText = (el) => {
        const h = el.querySelector('h1, h2, h3');
        return h ? h.textContent.replace(/\s+/g, ' ').trim() : '';
      };
      if (headingText(mobile) && headingText(mobile) === headingText(desktop)) mobile.remove();
    });

    // Legacy-template page tools + hidden framework text. Scoped so modern
    // templates are untouched: `javascript:` links are never authorable content
    // (e.g. the "Print" tool), and `.hidden` blocks are only stripped inside the
    // legacy `#serviceDetail` content wrapper (where Contensis emits a hidden
    // "JavaScriptManager" text node) — never globally.
    element.querySelectorAll('a[href^="javascript:"]').forEach((a) => a.remove());
    element.querySelectorAll('#serviceDetail .hidden').forEach((n) => n.remove());
  }

  if (hookName === H.after) {
    // Unwrap leftover source <blockquote> wrappers that still enclose a parsed
    // block table. On this page the testimonial (columns-withimg-light) and the
    // "Preparing for Nottingham" panel (cards-promo-light) are authored inside a
    // Contensis <blockquote class="sys_blockquoteAlt">; the parser replaces the
    // inner content but the <blockquote> remains. EDS only decorates block tables
    // that are direct children of the section <div> — a wrapping <blockquote>
    // leaves the table rendering as a raw "Columns Withimg Light" table. Lift the
    // blockquote's children up in place, then drop the now-empty blockquote.
    element.querySelectorAll('blockquote').forEach((bq) => {
      if (!bq.querySelector('table')) return;
      while (bq.firstChild) bq.parentNode.insertBefore(bq.firstChild, bq);
      bq.remove();
    });

    // Legacy Contensis spacer nodes inside the page body (verified in
    // cleaned.html: <p>&nbsp;</p> at lines 603, 620, 626, 692, 821, 862, 879,
    // 882, 895, 898 and <div class="clear">&nbsp;</div> float-clearers at lines
    // 619, 661, 721, 748, 765, 815, 844, 861, 894). They carry no authorable
    // content and would import as empty paragraphs. Scoped to #container and
    // only removed when they contain nothing but whitespace/&nbsp; and no child
    // elements (images, links, etc.), so real paragraphs are never touched.
    // Runs after parsing so no parser selector can be affected.
    const isBlank = (el) => !el.children.length
      && el.textContent.replace(/[\s\u00a0]+/g, '') === '';
    element.querySelectorAll('#container p, #container div.clear').forEach((el) => {
      if (isBlank(el)) el.remove();
    });

    // Non-authorable global chrome (verified in cleaned.html):
    //   .headerv2-component  -> header wrapper (skip-link, flyout, header.headerv2) line 18
    //   header.headerv2      -> header line 26
    //   footer#footer        -> footer line 980
    //   #flyout-status, .headerv2-skip-content-link -> a11y/skip chrome lines 20-24
    WebImporter.DOMUtils.remove(element, [
      '.headerv2-component',
      'header.headerv2',
      '#footer',
      'footer',
      '#flyout-status',
      '.headerv2-skip-content-link',
      // Older Nottingham template chrome (e.g. studywithus/what-next pages):
      //   #nav / .slicknav_menu -> the top "Main Menu" primary nav + mobile menu
      //   .sys_simpleListMenu   -> in-page left sidebar section menu
      //   #breadcrumbs / .sys_breadcrumbs -> "You are here" breadcrumb trail
      //   #bottom, .sys_corners -> legacy footer address + corner chrome
      '#nav',
      '.slicknav_menu',
      '.sys_simpleListMenu',
      '#breadcrumb',
      '#breadcrumbs',
      '.sys_breadcrumbs',
      '.sys_youAreHere',
      // Modern header breadcrumb trail on studywithus/* pages (verified in
      // cleaned.html: <div id="L1_Breadcrumbs" class="global-breadcrumbs">
      // "University of Nottingham > Study with us > International students",
      // line 462). Non-authorable global chrome sitting just below the header;
      // the template's sec-breadcrumb section (style null, first section) is
      // skipped by the section transformer, so removing it here is consistent.
      '#L1_Breadcrumbs',
      '.global-breadcrumbs',
      '.campuslinks',
      '#SocialButtons',
      '#bottom',
      '.sys_corners',
      '.aspNetHidden',
      'iframe',
      'link',
      'noscript',
      'style',
      'script',
    ]);
  }
}
