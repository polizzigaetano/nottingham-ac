/**
 * Site-wide design-system extraction for nottingham.ac.uk.
 * Reads COMPUTED styles across the captured template pages and aggregates a
 * brand surface: palette, typography, spacing, section backgrounds, buttons,
 * links, radii, shadows, image treatments. Writes stardust/current/_brand-extraction.json.
 *
 * Capture-only: touches nothing under blocks/ content/ styles/ models/.
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const PAGES = [
  'https://www.nottingham.ac.uk/',
  'https://www.nottingham.ac.uk/study/home.html',
  'https://www.nottingham.ac.uk/studywithus/international-applicants/index.aspx',
  'https://www.nottingham.ac.uk/study/campus-visit/open-days.html',
  'https://www.nottingham.ac.uk/research/research.aspx',
];

const OUT = '/backups/polizzigaetano/nottingham-ac/repo/stardust/current/_brand-extraction.json';

// tally helper
function bump(map, key, n = 1) { if (key == null || key === '') return; map[key] = (map[key] || 0) + n; }
function topN(map, n) {
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n)
    .map(([value, count]) => ({ value, count }));
}

const perPage = await extractAll();

async function extractAll() {
  const browser = await chromium.launch();
  const results = [];
  for (const url of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
      await page.waitForTimeout(1200);
      // dismiss cookie banner if present so it doesn't skew top colours
      await page.evaluate(() => {
        const b = [...document.querySelectorAll('button')].find((x) => /accept all/i.test(x.textContent || ''));
        if (b) b.click();
      }).catch(() => {});
      await page.waitForTimeout(400);
      const data = await page.evaluate(pageProbe);
      results.push({ url, ...data });
      // eslint-disable-next-line no-console
      console.error('[design] OK', url);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[design] FAIL', url, e.message);
    }
    await ctx.close();
  }
  await browser.close();
  return results;
}

// ---- runs in the page ----
function pageProbe() {
  const rgbToHex = (rgb) => {
    const m = (rgb || '').match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(',').map((s) => parseFloat(s.trim()));
    const [r, g, b, a] = parts;
    if (a !== undefined && a === 0) return null; // fully transparent
    const h = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
  };
  const out = {
    cssVars: {},
    textColors: {}, bgColors: {},
    fontFamilies: {}, headingSizes: {}, headingWeights: {}, headingLineHeights: {},
    bodyFont: null, bodySize: null, bodyLineHeight: null,
    sectionBgs: {}, sectionPaddings: {},
    buttons: [], links: [],
    radii: {}, shadows: {},
    imageTreatments: { objectFit: {}, aspectRatios: {}, radii: {} },
  };
  // CSS custom properties on :root
  const rootStyle = getComputedStyle(document.documentElement);
  for (const name of rootStyle) {
    if (name.startsWith('--')) {
      const v = rootStyle.getPropertyValue(name).trim();
      if (v && v.length < 40) out.cssVars[name] = v;
    }
  }
  // body baseline
  const bs = getComputedStyle(document.body);
  out.bodyFont = bs.fontFamily;
  out.bodySize = bs.fontSize;
  out.bodyLineHeight = bs.lineHeight;

  const bump = (m, k) => { if (k) m[k] = (m[k] || 0) + 1; };

  // text + bg colours across a sample of visible elements
  const all = [...document.querySelectorAll('body *')].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 4 && r.height > 4;
  });
  for (const el of all.slice(0, 4000)) {
    const cs = getComputedStyle(el);
    const tc = rgbToHex(cs.color); if (tc) bump(out.textColors, tc);
    const bg = rgbToHex(cs.backgroundColor); if (bg) bump(out.bgColors, bg);
    bump(out.fontFamilies, cs.fontFamily);
    if (cs.borderRadius && cs.borderRadius !== '0px') bump(out.radii, cs.borderRadius);
    if (cs.boxShadow && cs.boxShadow !== 'none') bump(out.shadows, cs.boxShadow);
  }
  // headings
  for (const tag of ['h1', 'h2', 'h3', 'h4']) {
    for (const el of document.querySelectorAll(tag)) {
      const cs = getComputedStyle(el);
      bump(out.headingSizes, `${tag}:${cs.fontSize}`);
      bump(out.headingWeights, `${tag}:${cs.fontWeight}`);
      bump(out.headingLineHeights, `${tag}:${cs.lineHeight}`);
    }
  }
  // sections
  for (const el of document.querySelectorAll('section, main > div, [class*="section"], [class*="Section"]')) {
    const cs = getComputedStyle(el);
    const bg = rgbToHex(cs.backgroundColor); if (bg) bump(out.sectionBgs, bg);
    bump(out.sectionPaddings, `${cs.paddingTop}/${cs.paddingBottom}`);
  }
  // buttons + link-styled CTAs
  const btnSel = 'a[class*="button"], a[class*="btn"], button, .btn, [class*="cta"] a, a[role="button"]';
  const seenBtn = new Set();
  for (const el of [...document.querySelectorAll(btnSel)].slice(0, 60)) {
    const cs = getComputedStyle(el);
    const key = `${rgbToHex(cs.backgroundColor)}|${rgbToHex(cs.color)}|${cs.borderRadius}|${cs.fontWeight}|${cs.padding}`;
    if (seenBtn.has(key)) continue; seenBtn.add(key);
    out.buttons.push({
      label: (el.textContent || '').trim().slice(0, 30),
      bg: rgbToHex(cs.backgroundColor), color: rgbToHex(cs.color),
      border: cs.border, borderRadius: cs.borderRadius,
      fontWeight: cs.fontWeight, fontSize: cs.fontSize,
      padding: cs.padding, textTransform: cs.textTransform,
    });
  }
  // inline text links (nav/footer excluded roughly by ancestor check)
  const seenLink = new Set();
  for (const el of [...document.querySelectorAll('main a, article a, p a')].slice(0, 80)) {
    const cs = getComputedStyle(el);
    const key = `${rgbToHex(cs.color)}|${cs.textDecorationLine}|${cs.fontWeight}`;
    if (seenLink.has(key)) continue; seenLink.add(key);
    out.links.push({ color: rgbToHex(cs.color), decoration: cs.textDecorationLine, fontWeight: cs.fontWeight });
    if (out.links.length >= 12) break;
  }
  // image treatments
  for (const img of [...document.querySelectorAll('img')].slice(0, 120)) {
    const cs = getComputedStyle(img);
    bump(out.imageTreatments.objectFit, cs.objectFit);
    if (cs.borderRadius && cs.borderRadius !== '0px') bump(out.imageTreatments.radii, cs.borderRadius);
    const r = img.getBoundingClientRect();
    if (r.width > 20 && r.height > 20) {
      const ratio = (r.width / r.height);
      let label = ratio.toFixed(2);
      if (Math.abs(ratio - 16 / 9) < 0.08) label = '16:9';
      else if (Math.abs(ratio - 4 / 3) < 0.08) label = '4:3';
      else if (Math.abs(ratio - 1) < 0.08) label = '1:1';
      else if (Math.abs(ratio - 3 / 2) < 0.08) label = '3:2';
      else if (Math.abs(ratio - 21 / 9) < 0.15) label = '21:9';
      bump(out.imageTreatments.aspectRatios, label);
    }
  }
  return out;
}

// ---- aggregate across pages ----
const agg = {
  cssVars: {}, textColors: {}, bgColors: {}, fontFamilies: {},
  headingSizes: {}, headingWeights: {}, headingLineHeights: {},
  sectionBgs: {}, sectionPaddings: {}, radii: {}, shadows: {},
  buttons: [], links: [], imgFit: {}, imgRatios: {}, imgRadii: {},
  bodyFonts: {}, bodySizes: {}, bodyLineHeights: {},
};
for (const p of perPage) {
  Object.assign(agg.cssVars, p.cssVars);
  const merge = (dst, src) => { for (const [k, v] of Object.entries(src || {})) bump(dst, k, v); };
  merge(agg.textColors, p.textColors); merge(agg.bgColors, p.bgColors);
  merge(agg.fontFamilies, p.fontFamilies);
  merge(agg.headingSizes, p.headingSizes); merge(agg.headingWeights, p.headingWeights);
  merge(agg.headingLineHeights, p.headingLineHeights);
  merge(agg.sectionBgs, p.sectionBgs); merge(agg.sectionPaddings, p.sectionPaddings);
  merge(agg.radii, p.radii); merge(agg.shadows, p.shadows);
  bump(agg.bodyFonts, p.bodyFont); bump(agg.bodySizes, p.bodySize); bump(agg.bodyLineHeights, p.bodyLineHeight);
  agg.buttons.push(...(p.buttons || []));
  agg.links.push(...(p.links || []));
  merge(agg.imgFit, p.imageTreatments?.objectFit); merge(agg.imgRatios, p.imageTreatments?.aspectRatios);
  merge(agg.imgRadii, p.imageTreatments?.radii);
}
// dedupe buttons/links
const dedupe = (arr, keyFn) => {
  const seen = new Set(); const r = [];
  for (const x of arr) { const k = keyFn(x); if (!seen.has(k)) { seen.add(k); r.push(x); } }
  return r;
};

const brand = {
  _provenance: {
    generatedBy: 'stardust design-system extraction (computed styles via Playwright, 1440x900 @2x)',
    generatedAt: 'RUNDATE',
    source: 'https://www.nottingham.ac.uk',
    authorized: true,
    repoModified: false,
    pagesProbed: perPage.map((p) => p.url),
    method: 'per-element getComputedStyle aggregation across 5 template pages; colours frequency-ranked; CSS custom properties read from :root',
    note: 'Analysis only. Writes stardust/current/_brand-extraction.json. No changes to blocks/, content/, styles/, or models/.',
  },
  palette: {
    brandTokens: agg.cssVars, // the site's own --global* variables (authoritative)
    topBackgrounds: topN(agg.bgColors, 12),
    topTextColors: topN(agg.textColors, 12),
    sectionBackgrounds: topN(agg.sectionBgs, 10),
  },
  typography: {
    bodyFont: topN(agg.bodyFonts, 3),
    bodySize: topN(agg.bodySizes, 3),
    bodyLineHeight: topN(agg.bodyLineHeights, 3),
    fontFamilies: topN(agg.fontFamilies, 6),
    headingSizes: topN(agg.headingSizes, 16),
    headingWeights: topN(agg.headingWeights, 10),
    headingLineHeights: topN(agg.headingLineHeights, 10),
  },
  spacing: {
    sectionPaddings: topN(agg.sectionPaddings, 12),
  },
  buttons: dedupe(agg.buttons, (b) => `${b.bg}|${b.color}|${b.borderRadius}|${b.padding}`).slice(0, 20),
  links: dedupe(agg.links, (l) => `${l.color}|${l.decoration}|${l.fontWeight}`),
  motifs: {
    borderRadius: topN(agg.radii, 10),
    boxShadow: topN(agg.shadows, 8),
  },
  imageTreatments: {
    objectFit: topN(agg.imgFit, 4),
    aspectRatios: topN(agg.imgRatios, 8),
    borderRadius: topN(agg.imgRadii, 6),
  },
};

writeFileSync(OUT, JSON.stringify(brand, null, 2));
// eslint-disable-next-line no-console
console.error(`[design] wrote ${OUT} (${perPage.length} pages probed)`);
