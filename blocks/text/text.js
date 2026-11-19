/**
 * Text block: story paragraphs with an alignment the default content cannot carry, as the
 * source's inline `text-align` (e.g. right-aligned quote attributions).
 *
 * Authored shape: one or more cells holding paragraphs (or headings, lists).
 * Options (block classes): `right` | `center`; none = start-aligned.
 */
export default function decorate(block) {
  const content = [...block.querySelectorAll(':scope > div > div')].flatMap((cell) => [...cell.childNodes]);
  block.replaceChildren(...content);
}
