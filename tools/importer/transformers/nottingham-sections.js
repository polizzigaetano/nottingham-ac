/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: University of Nottingham section breaks + section metadata.
 * Section boundaries come from page-templates.json (carousel-landing-page),
 * all verified against migration-work/cleaned.html:
 *   s1 hero            .homepage-hero-banner          (line 457)
 *   s2 campaign-tiles  .homepage-campaign-tiles       (line 523)
 *   s3 ranking-tiles   .homepage-rankings             (line 548)
 *   s4 research        .homepage-image-cta-block      (line 603)   style: highlight
 *   s5 university-news .news-section                  (line 654)
 *   s6 featured-events .events-section                (line 883)   style: highlight
 *   s7 partnerships    .homepage-partnerships         (line 936)
 * Uses both hooks per the reference implementation: breaks inserted in
 * beforeTransform (while section elements still exist), styled-section
 * metadata anchored to a marker <hr> in afterTransform.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// section.selector is an array of candidate selectors — first match wins.
function querySection(root, selectors) {
  for (const sel of selectors) {
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break needed
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue; // no selector matched — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers may have replaced section elements; anchor each styled section's
    // Section Metadata block to the surviving marker <hr> or original element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
