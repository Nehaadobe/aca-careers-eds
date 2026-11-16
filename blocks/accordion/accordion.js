/**
 * Accordion block: one row per item; first cell is the question (summary),
 * second cell is the rich-text answer. Built on native <details>/<summary>.
 *
 * Defensive handling:
 *   - rows without any text are dropped;
 *   - a question authored as an in-page link (e.g. `#tab_...`) is unwrapped to text;
 *   - a row with a single cell becomes an item with an empty answer;
 *   - extra cells are appended to the answer.
 *
 * Like the source, only one item per block is open at a time (native exclusive
 * <details name="...">).
 */
let accordionCount = 0;

export default function decorate(block) {
  accordionCount += 1;
  const group = `accordion-${accordionCount}`;
  const items = [];
  [...block.children].forEach((row) => {
    const [label, ...rest] = [...row.children];
    if (!label || row.textContent.trim() === '') return;

    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    // Unwrap in-page anchors so the summary is plain, clickable text.
    label.querySelectorAll('a[href^="#"]').forEach((a) => a.replaceWith(...a.childNodes));
    const only = label.children.length === 1 ? label.firstElementChild : null;
    if (only && only.tagName === 'P') summary.append(...only.childNodes);
    else summary.append(...label.childNodes);

    const body = document.createElement('div');
    body.className = 'accordion-item-body';
    rest.forEach((cell) => body.append(...cell.childNodes));

    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.name = group;
    details.append(summary, body);
    items.push(details);
  });
  block.replaceChildren(...items);
}
