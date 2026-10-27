# story-listing

Custom **story-listing** block. Purpose: Searchable, filterable, sortable and paginated grid of employee stories.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: Configuration only: two-cell key | value rows (read with readBlockConfig). Cards, filters and pagination are built at runtime from the site query index merged with the external-stories sheet.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

## Configuration rows

| Key | Value |
| --- | --- |
| Filters | Comma-separated facets to show (default: Roles, Topics) |
| Page Size | Stories per page (default: 9) |
| Sort | Default sort: Newest, Oldest, Title A-Z or Title Z-A (default: Newest) |
| Roles | Comma-separated Roles dropdown options; if omitted, derived from the stories |
| Topics | Comma-separated Topics dropdown options; if omitted, derived from the stories |
| Index | Optional query index URL (default: /query-index.json) |
| External Stories | Optional external stories sheet URL (default: /blog/external-stories.json) |
| Path | Optional path prefix for index entries (default: /blog/) |
| Exclude | Optional comma-separated listing paths to drop (default: /blog, /blog/authors, /blog/search) |
| Search Label / Search Placeholder / Filter Label / Clear Label / Sort Label / Roles Label / Topics Label / No Results | Optional UI text overrides |

## Data sources

- Query index: EDS sheet JSON with columns path, title, description, image, date (falls back to lastModified), roles, topics, author; roles/topics comma-separated
- External stories: EDS sheet JSON with columns title, url, image, description, date, roles, topics; links open off-site in the same tab with rel=noopener

URL state: ?q=&role=&topic=&sort=&page= (defaults omitted); back/forward restores the view. Data loading lives in /scripts/story-index.js (loadStories, filterStories, sortStories) for reuse.
