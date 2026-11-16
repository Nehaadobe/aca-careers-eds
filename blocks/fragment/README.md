# fragment

Standard **fragment** block (from the AEM Block Collection). Purpose: reuse content from another page inside the current page.

## Authoring (Document Authoring)

Model: `standalone`

Single block table with one cell containing a link (or the path as text) to the page to include, e.g. `/fragments/hiring-notice`.

Links to `/fragments/...` placed directly in page content are also turned into fragments automatically.

The included page's sections are inserted in place of the block: if the fragment is the only content of its section, it replaces that section; otherwise its content is merged into the current section. Images from the fragment keep working because their paths are resolved against the fragment's location.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
