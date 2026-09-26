/**
 * Columns (with image, light) — a two-column feature banner on a light
 * background: one column holds heading + paragraphs + CTA, the other a large
 * photographic image. Mirrors the vanilla columns structure (one authored row,
 * N cells = columns). The light sibling of columns-minimal-dark-withimg-2.
 * @param {Element} block
 */
export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const cols = firstRow ? [...firstRow.children] : [];
  block.classList.add(`columns-withimg-light-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic && col.children.length === 1) {
        col.classList.add('columns-withimg-light-img-col');
      } else {
        col.classList.add('columns-withimg-light-content-col');
      }
    });
  });
}
