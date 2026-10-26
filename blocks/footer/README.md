# footer

Site **footer** block. Purpose: logo, fair hiring notice, company and legal link lists, social icons, utility links and copyright.

## Authoring (Document Authoring)

Model: `fragment` (loaded automatically on every page; not placed in page content)

The footer is built from the `footer` document (local preview: `content/footer.plain.html`; site: `/footer`). The block fetches `/content/footer.plain.html` first and falls back to `/footer.plain.html`. The document has six sections, in this order:

1. **Brand:** a paragraph with the white logo image, linked.
2. **Notice:** a heading (e.g. "Fair hiring practices") and paragraphs with links.
3. **Link groups:** for each group, a bold label paragraph (e.g. "Our company", "Legal notices") followed by a bulleted list of links.
4. **Social:** a bulleted list of icon images, each linked to the social profile (the image alt text is the link's accessible name).
5. **Utility:** a bulleted list of links.
6. **Legal:** the copyright / disclaimer paragraph.

A link to `#cookie-preferences` opens the consent manager's preference center (OneTrust when present; otherwise a `consent.preferences` event is dispatched for the site's consent integration).

## Behavior

- **992px and wider:** a charcoal band with four columns (logo | notice | link groups side by side | social icons), a black utility bar with right-aligned links separated by "|", and a white copyright band.
- **Below 992px:** all columns stack; social icons sit in one row.
- **Below 768px:** narrower 15px gutters; utility links stack vertically.
- Links in the notice and social sections open in a new tab; text links underline on hover.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
