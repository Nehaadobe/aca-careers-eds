# image

Custom **image** block. Purpose: Inline story image that text wraps around, as on the source .textImage-left / .textImage-right..

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: Block table 'Image (left)' or 'Image (right)' with one cell: the picture, optionally followed by a caption paragraph (italic). The block sits between default-content paragraphs of a story body; the text that follows it in the same section wraps beside it..

## Supported variations

| Variation | Option class |
| --- | --- |
| Left | `left` |
| Right | `right` |
| Small (a 200px thumbnail; combine with Left or Right, e.g. `Image (right, small)`) | `small` |
| Large (a 600px image; combine with Left or Right, e.g. `Image (left, large)`) | `large` |
| Exact width in pixels, at most the text column (e.g. `Image (right, width-300)`), for a source image of another size | `width-<px>` |
| No wrap: with Left or Right, the image keeps its side and size but the text that follows starts below it (e.g. `Image (left, large, no-wrap)`) | `no-wrap` |

## Universal Editor fields

N/A (Document Authoring project)
