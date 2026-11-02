/**
 * Library metadata: name and description of a block example for the Document Authoring
 * library panel. It is authoring information only, so it is removed from the rendered page.
 * @param {Element} block
 */
export default function decorate(block) {
  block.closest('.library-metadata-wrapper')?.remove();
  block.remove();
}
