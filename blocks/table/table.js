/**
 * Table block: authored rows/cells become an accessible <table>.
 *
 * - With more than one row, the first row is the header (th scope="col"),
 *   unless the `no-header` option is set.
 * - A single-cell table is not tabular data: it renders as a bordered
 *   callout box (`table-callout`) holding the cell content as authored.
 * - A wide table scrolls horizontally inside a focusable, labelled region.
 */

function moveChildren(from, to) {
  while (from.firstChild) to.append(from.firstChild);
  return to;
}

/** Name for the scroll region: the nearest preceding heading, else a generic label. */
function regionLabel(block) {
  const previous = block.parentElement?.previousElementSibling;
  const headings = previous ? [...previous.querySelectorAll('h1, h2, h3, h4, h5, h6')] : [];
  const heading = headings.pop();
  return heading?.textContent.trim() || 'Table';
}

export default function decorate(block) {
  const rows = [...block.children].filter((row) => row.children.length);
  if (!rows.length) return;

  if (rows.length === 1 && rows[0].children.length === 1) {
    const callout = moveChildren(rows[0].firstElementChild, document.createElement('div'));
    callout.className = 'table-callout';
    block.classList.add('table-is-callout');
    block.replaceChildren(callout);
    return;
  }

  const header = rows.length > 1 && !block.classList.contains('no-header');
  const table = document.createElement('table');
  const tbody = document.createElement('tbody');

  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    const isHead = header && i === 0;
    [...row.children].forEach((cell) => {
      const td = document.createElement(isHead ? 'th' : 'td');
      if (isHead) td.scope = 'col';
      tr.append(moveChildren(cell, td));
    });
    if (isHead) {
      const thead = document.createElement('thead');
      thead.append(tr);
      table.append(thead);
    } else {
      tbody.append(tr);
    }
  });
  table.append(tbody);

  const scroller = document.createElement('div');
  scroller.className = 'table-scroll';
  scroller.tabIndex = 0;
  scroller.setAttribute('role', 'region');
  scroller.setAttribute('aria-label', regionLabel(block));
  scroller.append(table);
  block.replaceChildren(scroller);
}
