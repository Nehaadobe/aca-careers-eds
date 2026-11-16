# article-list

Custom **article-list** block. Purpose: Curated grid of story cards; replaces the source 'More Stories' row on every story (76 pages, 1-10 cards each) and the 'Growth & development stories' row on /growth-development..

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One block table. Single-cell rows each hold one story link: an internal path (/blog/<slug> or any other indexed page such as /a-culture-of-belonging) or an external URL listed in the external-stories sheet. Two-cell rows are options (key | value): Columns (2 | 3 | 4, default 3), Ground (Light | Tinted | Dark, default Light), Display Article date (Yes | No, default Yes), Display Short description (Yes | No, default Yes), Link Label (card label text, or No to hide; default 'View highlights' on Tinted/Dark grounds and none on Light, as on the source). Keys are case-insensitive; unknown keys are ignored; authors may omit option rows. The section heading ('More Stories', 'Growth & development stories') and any 'View More Stories' link are default content before the block, not part of it..

## Supported variations

No variations. The Ground option also selects the source treatment: Tinted/Dark = the More Stories band (title 10px above the text, 'View highlights' label); Light = the plain tile row of /growth-development (30px inset, title 30px above the text, no label).

## Universal Editor fields

N/A (Document Authoring project)
