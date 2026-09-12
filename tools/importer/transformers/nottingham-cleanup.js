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
      '.aspNetHidden',
      'iframe',
      'link',
      'noscript',
      'style',
      'script',
    ]);
  }
}
