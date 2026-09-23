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
