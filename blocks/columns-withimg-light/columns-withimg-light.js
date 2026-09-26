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
      // aem.js wraps a cell in <p> when it starts with a <blockquote> (not a
      // recognised wrapper), leaving invalid <p><blockquote> nesting. Unwrap it
      // and hand the Universal Editor attributes back to the cell.
      const wrapper = col.children.length === 1 && col.firstElementChild.tagName === 'P'
        ? col.firstElementChild : null;
      if (wrapper && wrapper.children.length
        && [...wrapper.children].every((el) => el.tagName === 'BLOCKQUOTE')) {
        [...wrapper.attributes].forEach(({ name, value }) => col.setAttribute(name, value));
        wrapper.replaceWith(...wrapper.childNodes);
      }

      const pic = col.querySelector('picture');
      if (pic && col.children.length === 1) {
        col.classList.add('columns-withimg-light-img-col');
      } else {
        col.classList.add('columns-withimg-light-content-col');
      }
    });
  });
}
