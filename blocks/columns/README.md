# columns

Custom **columns** block. Purpose: Side-by-side columns of content; with 'alternating', image/text rows whose image side follows the cell order; with 'curve', the page header (H1 and intro beside a photo with a curved corner).

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row per line of columns, one cell per column. With 'alternating': each row has a media cell (image, optionally followed by a youtube.com/watch link for a video) and a text cell (optional H3, paragraphs, lists, links); the cell order sets the side: image cell first = image left, text cell first = image right (to zigzag, swap the cell order on every other row).

With 'curve' (page header, formerly Hero (page)): each row has a text cell (H1 and intro paragraphs) and a photo cell. **The cell order sets the side:** text cell first = photo on the right (curve on its bottom-left corner); photo cell first = photo on the left (curve on its bottom-right corner). The curve always faces the text. On mobile the photo stacks above centered text. A row without a photo shows the title only. Usually the first block on the page; the section below it starts 30px lower, as on the source.

## Supported variations

| Variation | Option class |
| --- | --- |
| Alternating (image side set by cell order) | `alternating` |
| Curve (page header; photo side set by cell order) | `curve` |

## Universal Editor fields

N/A (Document Authoring project)
