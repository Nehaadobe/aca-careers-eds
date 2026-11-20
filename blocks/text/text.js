/**
 * Text block: story paragraphs with an alignment the default content cannot carry, as the
 * source's inline `text-align` (e.g. right-aligned quote attributions).
 *
 * Authored shape: one or more cells holding paragraphs (or headings, lists).
 * Options (block classes): `right` | `center` (alignment; none = start-aligned), `box` (the
 * light-blue panel) and `float-left` (a third of the column, the content that follows beside it;
 * full width below 768px), e.g. `Text (box, float-left)` for the source's pull-quote boxes.
 */
export default function decorate(block) {
  const content = [...block.querySelectorAll(':scope > div > div')].flatMap((cell) => [...cell.childNodes]);
  block.replaceChildren(...content);
}
