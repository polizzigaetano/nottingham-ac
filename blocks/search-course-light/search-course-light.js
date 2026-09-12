/**
 * Course search (light) — a compact "find your course" panel with a keyword
 * input, a study-level select and a submit button. Authored content provides
 * the heading/label text and, optionally, the list of study levels (one per
 * row) and the search action URL.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Row 1: heading / intro text. Remaining rows: study level options.
  const headingCell = rows[0]?.querySelector('div');
  const levels = [];
  let action = '';

  rows.slice(1).forEach((row) => {
    const link = row.querySelector('a');
    if (link) {
      action = link.getAttribute('href') || '';
      return;
    }
    const label = row.textContent.trim();
    if (label) levels.push(label);
  });

  block.textContent = '';

  const heading = document.createElement('div');
  heading.className = 'search-course-light-heading';
  if (headingCell) {
    while (headingCell.firstChild) heading.append(headingCell.firstChild);
  }

  const form = document.createElement('form');
  form.className = 'search-course-light-form';
  form.setAttribute('role', 'search');
  if (action) form.action = action;

  const keyword = document.createElement('input');
  keyword.type = 'search';
  keyword.name = 'q';
  keyword.className = 'search-course-light-keyword';
  keyword.setAttribute('aria-label', 'Search courses by keyword');
  keyword.placeholder = 'Search courses';

  const select = document.createElement('select');
  select.name = 'level';
  select.className = 'search-course-light-level';
  select.setAttribute('aria-label', 'Study level');
  (levels.length ? levels : ['Undergraduate', 'Postgraduate']).forEach((label) => {
    const opt = document.createElement('option');
    opt.value = label.toLowerCase().replace(/\s+/g, '-');
    opt.textContent = label;
    select.append(opt);
  });

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'search-course-light-submit';
  submit.textContent = "Let's go";

  form.append(keyword, select, submit);
  block.append(heading, form);
}
