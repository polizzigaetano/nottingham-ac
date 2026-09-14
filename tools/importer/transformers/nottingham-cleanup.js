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

    // Legacy-template page tools + hidden framework text. Scoped so modern
    // templates are untouched: `javascript:` links are never authorable content
    // (e.g. the "Print" tool), and `.hidden` blocks are only stripped inside the
    // legacy `#serviceDetail` content wrapper (where Contensis emits a hidden
    // "JavaScriptManager" text node) — never globally.
    element.querySelectorAll('a[href^="javascript:"]').forEach((a) => a.remove());
    element.querySelectorAll('#serviceDetail .hidden').forEach((n) => n.remove());
  }

  if (hookName === H.after) {
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
