/**
 * Columns (minimal, dark, with image) — a two-column feature banner: one column
 * holds heading + paragraph + CTA, the other a large photographic image.
 * Mirrors the vanilla columns structure (one authored row, N cells = columns).
 * @param {Element} block
 */
export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const cols = firstRow ? [...firstRow.children] : [];
  block.classList.add(`columns-minimal-dark-withimg-2-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic && col.children.length === 1) {
        col.classList.add('columns-minimal-dark-withimg-2-img-col');
      } else {
        col.classList.add('columns-minimal-dark-withimg-2-content-col');
      }
    });
  });
}
