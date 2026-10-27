# header

Site **header** block. Purpose: utility links, logo, main navigation with a dropdown, and the "Find your next role" call to action.

## Authoring (Document Authoring)

Model: `fragment` (loaded automatically on every page; not placed in page content)

The header is built from the `nav` document (local preview: `content/nav.plain.html`; site: `/nav`). The block fetches `/content/nav.plain.html` first and falls back to `/nav.plain.html`. The document has four sections, in this order:

1. **Utility links:** a bulleted list of links (e.g. Pay my premium, Employers, Brokers, Providers).
2. **Brand:** a paragraph with the logo image linked to `/`, then a paragraph with the site name link ("Careers").
3. **Main navigation:** a bulleted list of links. A nested list under an item makes that item a dropdown (e.g. Life at Blue Shield → Our people, Our workplace model, Awards & recognition).
4. **Call to action:** one link (shown as a pill button).

All text, links and images come from the document; the block adds only the "Menu" drawer title and accessible labels.

## Behavior

- **Desktop (1200px and wider):** two rows: a utility bar, then logo + centered navigation + call to action. Dropdowns open on hover or keyboard focus as a full-width blue bar with a notch under the trigger, and close on mouse-out, focus-out or Escape. The trigger link still navigates on click.
- **Below 1200px:** an 80×80 menu button at the far left opens a drawer from the left edge (max 320px wide) with a blue "Menu" title bar, all links (dropdown links always visible, indented) and the call to action. The page behind is dimmed and made inert; the button turns into a cross; the cross or Escape closes the drawer.
- **992–1199px:** the utility bar is still shown above the menu-button row.
- Off-site links in dropdowns and the call to action open in a new tab.
- The header is not sticky; it scrolls with the page.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
