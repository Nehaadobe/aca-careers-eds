# share

Custom **share** block. Purpose: share or social links (icons) with a title.

## Authoring (Document Authoring)

Model: `standalone`

| Share | |
| --- | --- |
| Share | |
| :facebook: | https://www.facebook.com/BlueShieldCA |
| :linkedin: | https://www.linkedin.com/company/blue-shield-of-california |
| :twitter: | https://twitter.com/BlueShieldCA |
| shareShow | on |
| sharePosition | right |

- **Title row** (one cell): the text before the icons. Empty or missing: the placeholder `Share.Label` ("Share").
- **Icon rows**: an icon (`:facebook:`, `:linkedin:`, `:twitter:`, `:x:` or any icon from the Icons library) or a pasted
  image, then a link. The rows set the order; delete a row to drop that icon. Links open in a new tab exactly as typed
  (`facebook.com` gets `https://`). They are plain links: to share the page, put `{url}` (and `{title}`) in the link,
  e.g. `https://www.linkedin.com/sharing/share-offsite/?url={url}`, `https://www.facebook.com/sharer/sharer.php?u={url}`,
  `https://x.com/intent/tweet?url={url}&text={title}`. Facebook, LinkedIn, Twitter and X keep the built-in round icons.
- **`shareShow`**: `on` or `off`. **`sharePosition`**: `left`, `right` or `center`. Names are not case-sensitive
  (`share show`, `show`, `share position`, `position` also work).
- **Every row is optional.** Without any Share table the row shows LinkedIn, Facebook and X *share* links for the page.

Which setting wins, strongest first:

1. A Share table in the story itself (it is moved into the story header and replaces the automatic row);
2. page metadata `Share` (on / off) and `Share position`;
3. the site default: the Share table on the page **`/fragments/share`** (all stories of that site);
4. the built-in default (shown; right of the author byline, or left under the date without an author; LinkedIn,
   Facebook and X share links).

Title and icon rows follow the same order (page table, then `/fragments/share`, then built-in); page metadata only sets
on/off and position. On other pages a Share table shows where it is placed, aligned by its own `sharePosition`.

## Supported variations

No variations.

Interface text comes from the placeholders sheet (`/placeholders/global`, keys Share.Label, Share.LinkLabel, Share.OpenLabel); the code keeps the current text as the default. See the author guide, "Placeholders: interface text".

## Universal Editor fields

N/A (Document Authoring project)
