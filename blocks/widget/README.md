# widget

Utility **widget** block. Purpose: embed a self-contained code widget (HTML + CSS + JS) kept in the `/widgets/` folder of the code repository.

## Authoring (Document Authoring)

Model: `standalone`

Add a link to the widget, e.g. `/widgets/name.html` or `/widgets/folder/name.html`. Links to `/widgets/...` in page content are turned into widget blocks automatically, so a plain link is enough; a block table with one cell holding the link also works.

Query parameters on the link are passed to the widget as configuration (they become `data-*` attributes on the widget element), e.g. `/widgets/name.html?mode=compact`.

## Behavior

The block loads `widgets/<folder>/<name>.html` into the page, then that widget's `.css` and `.js`; the widget's JavaScript default export is called with the widget element. The block, wrapper and section are renamed after the widget (`<name>`, `<name>-wrapper`, `<name>-container`) so the widget's CSS can target them. Load errors are logged to the console and leave the rest of the page unaffected.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
