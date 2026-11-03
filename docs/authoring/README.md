---
title: "Careers Sites (Blue Shield of California, Stellarus) - Author Guide"
date: "November 2, 2026"
---

# Careers Sites - Author Guide

This guide is for the people who write, edit and publish the careers pages: the Blue Shield of California
careers site, the Stellarus careers page and, later, Ascendiun. All brands share one site, one block library
and one header and footer; each brand gets its own colors and fonts through a **theme**.

The site runs on AEM Edge Delivery Services. Content is written in **Document Authoring** (da.live).

## Quick Reference

| Resource | URL |
| --- | --- |
| Document Authoring (all content) | https://da.live/#/nehaadobe/aca-careers-eds/ |
| Block Library (inside the editor) | https://da.live/#/nehaadobe/aca-careers-eds/.da/library |
| Library source documents | https://da.live/#/nehaadobe/aca-careers-eds/tools/library |
| Preview | https://main--aca-careers-eds--nehaadobe.aem.page/ |
| Live | https://main--aca-careers-eds--nehaadobe.aem.live/ |
| Bulk preview / publish | https://da.live/apps/bulk |

### Sites and brands

| Brand | Pages | Theme | Preview example |
| --- | --- | --- | --- |
| Blue Shield of California | Everything outside `/stellarus/` and `/ascendiun/` | `bsc` (default) | https://main--aca-careers-eds--nehaadobe.aem.page/ |
| Stellarus | `/stellarus/` folder (today: `/stellarus/careers`) | `stellarus` | https://main--aca-careers-eds--nehaadobe.aem.page/stellarus/careers |
| Ascendiun | `/ascendiun/` folder (not created yet) | `ascendiun` | - |

Content source (Config Service): `content.da.live/nehaadobe/aca-careers-eds`. There is one language (English).

## Getting Started

### Access

- [ ] A Document Authoring account with access to `nehaadobe/aca-careers-eds` (ask your administrator)
- [ ] Preview and publish permission

### Your first page

1. Open Document Authoring and go to the folder the page belongs in (for a story: `blog`).
2. Click **New** → **Document** and type the page name. The name becomes the URL, so use lowercase words
   joined by hyphens (`my-new-story` → `/blog/my-new-story`).
3. Open the **Library** (sidebar) → **Templates**, and insert the matching template (see Page Templates).
4. Replace the sample text and images. Add blocks from **Library** → **Blocks**.
5. Fill in the **Metadata** table at the bottom of the page.
6. Click **Preview** and check the page. Then click **Publish**.

## Content Organization

| Folder / document | What it holds |
| --- | --- |
| `/` (root) | The careers pages: `index` (home), `life-at-blue-shield`, `a-culture-of-belonging`, `growth-development`, `total-rewards`, `how-to-get-hired`, `events`, `why-relocate`, `blog` (story listing) |
| `/life-at-blue-shield/` | `our-workplace-model` |
| `/blog/` | One document per employee story (76 today), the `external-stories` sheet, and `media/` |
| `/stellarus/` | The Stellarus careers page (`careers`). `nav` and `footer` in this folder are kept but **not used** |
| `/nav`, `/footer` | The header and footer for **all** brands |
| `/metadata`, `/redirects` | Site-wide sheets (see Configuration Sheets) |
| `/tools/library/` | The authoring library: block examples, templates, icons and the option lists. Not part of the site |
| `/drafts/` | Work in progress and shared fragments (`/drafts/fragments/`). Hidden from search engines |

## Block Library

The **Library** panel in the editor sidebar lists everything you can insert. Click an item to insert it at
the cursor.

| Library tab | What it contains |
| --- | --- |
| **Blocks** | Every block with each of its variations (source: `/tools/library/blocks/`) |
| **Templates** | Section landing page, Text page, Story article, Stellarus landing page |
| **Icons** | facebook, twitter, instagram, linkedin, glassdoor, search, inserted as `:name:` |
| **Media** | Images already uploaded to Document Authoring |

**Slash menu:** inside a block table, type `/` in a value cell to pick from the allowed values (for example
Columns `2 | 3 | 4`, or the Roles list on a story). These lists live in the `options` tab of
`/tools/library/blocks` and are the **same lists the blog filters use**, so you only maintain them in one place.

## How blocks work

A block is a table. The first row holds the block name, with the variation in brackets:
`Cards (icon-tiles)`, `Image (left)`. The other rows hold the content. Rules that apply to every block:

- In the editor every block is a plain table; its design (photos, icons, layout) appears only on the
  preview or live page. Blocks built by code, such as Share, show just their text in the editor.
- Spelling of the block name and variation matters; capitals and spaces do not (`Columns (Curve)` = `columns (curve)`).
- Optional rows and cells can be left out.
- Buttons: put the link alone in its own paragraph and format it. **Bold** = solid button, _italic_ =
  outline button, **_bold and italic_** = high-impact button. An unformatted link stays a text link.
- Always write alt text on images (right-click the image → alt text).

## Available Blocks

### Page-opening and promotional blocks

| Block | Purpose | Variations | How to author |
| --- | --- | --- | --- |
| **Hero** | Page-opening image with a headline and button | `home` (home page, full image with headline), `centered` (centered text without an image, used on Stellarus). Section page headers are **Columns (curve)** | Row 1: background image (leave empty for `centered`). Row 2: H1 heading, optional paragraphs, and an optional button link in its own paragraph |
| **Banner** | Heading, text and button over a background image | `locations` (navy band, office locations), `statement` (large statement text over an image), `image-cta` ("View our job opportunities" band) | Row 1: background image. Row 2: H2 heading, paragraphs, and a button link in its own paragraph |
| **Gallery** | Edge-to-edge row of photos; the middle one is wider | none | One row per image; the cell holds the image and an optional caption. Photos are display-only: links are ignored (client decision) |

### Content blocks

| Block | Purpose | Variations | How to author |
| --- | --- | --- | --- |
| **Cards** | Grid of repeating tiles | `icon-tiles` (icon + title + text), `feature-links` (linked feature tiles), `video-tiles` (video thumbnails that play in a pop-up) | One row per card: optional image cell, then a text cell with a heading, a short paragraph and a link in its own paragraph. For story cards use **Article List** instead |
| **Columns** | Side-by-side content | `alternating` (image/text rows; the image goes on the side of the cell you put first), `curve` (page header of the section pages: H1 and intro beside a photo with a curved corner; formerly Hero (page)) | One row per line, one cell per column. With `alternating`: an image cell (optionally followed by a YouTube link for a video) and a text cell; **the cell order sets the side** (image first = image left), so swap the cells on every other row for a zigzag. With `curve`: a text cell (H1 and intro) and a photo cell; **the cell order sets the side**: text first = photo right, photo first = photo left, and the curved corner always faces the text |
| **Accordion** | Expandable questions and answers (FAQ) | none | One row per item: question (plain text) in the first cell, answer (paragraphs, lists, links) in the second |
| **Quote** | Employee quotation with a round portrait | none | Row 1: portrait (optional). Row 2: the quotation. Row 3: name and role |
| **Table** | Data table, or a bordered callout box | `no-header` (no header row). A table with a **single cell** becomes a callout box | One block row per table row, one cell per column. The first row is the header unless `no-header` is set |
| **Image** | Story image that the text wraps around | `left`, `right` | One cell: the picture, optionally followed by an italic caption. Place it between paragraphs; the text that follows wraps beside it |
| **Embed** | Responsive 16:9 video | `video` (MP4 file, used as story hero video) | Row 1: poster image (optional). Row 2: the link (`.mp4` for `video`, or a YouTube / Vimeo URL). Shortcut: a YouTube or Vimeo URL pasted alone on its own line becomes a video automatically |
| **Fragment** | Reuse content from another document | none | One cell with the path of the document to include, e.g. `/drafts/fragments/find-your-next-role`. A link to a `/fragments/` path on its own also becomes a fragment |

### Story blocks

| Block | Purpose | Variations | How to author |
| --- | --- | --- | --- |
| **Article List** | Curated cards for chosen stories ("More Stories" on every story, "Growth & development stories") | Set by option rows (below) | One row per story with a single cell: a story link (`/blog/<name>`), any other site page (e.g. `/how-to-get-hired`), or an off-site story URL listed in the `external-stories` sheet. Add option rows as needed |
| **Story Listing** | The searchable, filterable, paginated story grid on `/blog` | none | Settings only, as key / value rows (below). Cards, filters and paging are built automatically |
| **Article Header** | Story header: Roles/Topics links, title, date, author line, share links and hero | none | **Not authored.** Built automatically on pages with Template `blog-article` from the page metadata, the H1 and the image or video right after it |
| **Share** | Share links (LinkedIn, Facebook, X) | none | Added automatically inside the Article Header. If authored on another page: one cell with the label ("Share"), or an empty cell for the default label. The icons are drawn when the page is previewed or published, so in the editor the block shows only its label |

**Article List options** (two-cell rows; type `/` in the value cell for the allowed values):

| Option | Values | Default | Effect |
| --- | --- | --- | --- |
| Columns | 2, 3, 4 | 3 | Cards per row on wide screens |
| Ground | Light, Tinted, Dark | Light | Light: plain tiles. Tinted / Dark: the "More Stories" band with a "View highlights" label |
| Display Article date | Yes, No | Yes | Show the story date on the card |
| Display Short description | Yes, No | Yes | Show the story's Description on the card |
| Link Label | any text, or No | "View highlights" on Tinted/Dark, none on Light | Text of the card link label (not in the slash menu; type it) |

The heading ("More Stories") and a "View More Stories" link go **above** the block as normal text; they are
not part of it. Cards are filled in from the story index, so a story only shows up after it has been
**published** (see Troubleshooting).

**Story Listing settings** (all optional; the `/blog` page already has them):

| Key | Value | Default |
| --- | --- | --- |
| Filters | Which filters to show | Roles, Topics |
| Page Size | Stories per page | 9 |
| Sort | Newest, Oldest, Title A-Z, Title Z-A | Newest |
| Roles / Topics | Fixed dropdown values (normally leave out: the library option lists are used) | library `options` tab |
| External Stories | Sheet with off-site stories | `/blog/external-stories.json` |
| Search Label, Search Placeholder, Filter Label, Clear Label, Sort Label, Roles Label, Topics Label, No Results | Replacement text for the on-screen labels | built-in text |

Visitors can share a filtered view: the address keeps the search, filters, sort and page
(`/blog?role=Finance&page=2`).

### Site-wide and library-only blocks

| Block | Purpose | How to author |
| --- | --- | --- |
| **Header** | Utility links, logo, main menu with dropdown, "Find your next role" button | Not placed on pages: edit the `/nav` document (below) |
| **Footer** | Logo, fair hiring notice, link groups, social icons, utility links, copyright | Not placed on pages: edit the `/footer` document (below) |
| **Section Metadata** | Style for one section | See Sections |
| **Metadata** | Page settings | See Page Metadata |
| **Library Metadata** | Name and description shown in the Library panel | Only in `/tools/library/blocks/` documents; renders nothing |

### Header (`/nav`) and footer (`/footer`)

One header and one footer serve **every brand**; each brand's theme recolors them (on Stellarus the logo
shows in white). Sections are separated with `---`.

| Document | Sections, in order |
| --- | --- |
| `/nav` | 1. Utility links (bulleted list). 2. Brand: logo image, then the "Careers" link. 3. Main menu (bulleted list; a nested list under an item makes it a dropdown). 4. The call-to-action link |
| `/footer` | 1. Logo. 2. Notice: heading and paragraphs. 3. Link groups: a bold label followed by a bulleted list, per group. 4. Social: a bulleted list of linked icons (`:facebook:`, `:linkedin:` …). 5. Utility links. 6. Copyright paragraph |

A footer link to `#cookie-preferences` opens the cookie preference center. A page can use a different header
or footer with the `nav` / `footer` metadata (not needed today).

## Page Templates

Insert a template from **Library** → **Templates**, then replace the sample content.

| Template | Use for | Contains | Required metadata |
| --- | --- | --- | --- |
| **Story article** | A new employee story in `/blog/` | H1, hero image (or an Embed (video) block) right after the H1, story text, "More Stories" heading and an Article List | Title, Description, **Template = blog-article**, Roles, Topics, Publication Date, Author, Author Title, Image |
| **Section landing page** | Pages like Life at Blue Shield or How to Get Hired | Columns (curve) page header, a centered intro section, content sections, Banner (image-cta) | Title, Description, Image |
| **Text page** | Simple text pages (e.g. Why Relocate) | H1, paragraphs, lists | Title, Description |
| **Stellarus landing page** | Pages in `/stellarus/` | Hero (centered) with the two buttons | Title, Description (the theme comes from the folder) |

**Story video hero:** put an **Embed (video)** block directly after the H1, with the poster image in row 1 and
the MP4 link in row 2. (The "Hero video" field offered in the metadata slash menu is not used; ignore it.)

## Sections and Section Metadata

A section is everything between two `---` lines. To style a section, add a **Section Metadata** block at the
end of it:

| Section Metadata | |
| --- | --- |
| style | light-blue |

| Style | Effect |
| --- | --- |
| `centered` | Centers the section's text and headings |
| `light-blue` | Rounded light-blue panel around the section's text (on stories: a full-width band) |
| `blue` | Brand blue band with white text |
| `two-up` | Offered in the slash menu but has **no visible effect** at the moment |

Several styles can be combined with a comma: `light-blue, centered`.

## Page Metadata

Every page ends with a **Metadata** block. Type `/` in a value cell for the allowed values.

| Property | Required | Purpose | Example |
| --- | --- | --- | --- |
| Title | Yes | Browser tab and search result title | `Supporting our veterans in the workplace` |
| Description | Yes | Search result text and the card text in story lists | One or two sentences |
| Image | Recommended | Share image (social networks) and story card image. Replace the picture to change it | 1200×630 image |
| Template | Stories | `blog-article` turns on the story layout and the automatic Article Header | `blog-article` |
| Roles | Stories | Role tags: shown above the title and used by the blog Roles filter. Several: separate with commas | `Finance, Operations` |
| Topics | Stories | Topic tags, same as Roles | `Life at Blue Shield` |
| Publication Date | Stories | Date shown on the story and its cards, and used for sorting | `2026-10-13` |
| Author | Stories | Author name(s). Several: separate with `;` | `Jane Doe; John Roe` |
| Author Title | Stories | Job title, one per author, separated by `;` | `Actuarial Analyst` |
| Author Image | Optional | Author photo URL, one per author, separated by `;` | |
| Theme | Rarely | Overrides the brand theme from the folder | `stellarus` |
| nav / footer | Rarely | Use another header / footer document | `/nav` |

Roles and Topics must use the exact values from the library lists (the slash menu shows them). To add a new
Role or Topic, ask an administrator to add it to the `options` tab of `/tools/library/blocks` and preview it;
it then appears in the slash menu **and** in the blog filters.

## Configuration Sheets

| Sheet | Location | Purpose | When to update |
| --- | --- | --- | --- |
| Bulk metadata | `/metadata` | Settings applied by folder: theme `bsc` for `/**`, `stellarus` for `/stellarus/**`; `noindex` for `/drafts/**` and `/tools/**` | Adding a brand folder (e.g. `/ascendiun/**` → `ascendiun`) |
| Redirects | `/redirects` | `Source` → `Destination` (today: `/blog/authors` and `/blog/search` → `/blog`) | A page is moved, renamed or deleted |
| External stories | `/blog/external-stories` | Off-site stories (news site) shown in the blog listing and usable in Article Lists. Columns: title, url, image, publication-date, description, roles, topics | Adding or removing an off-site story |
| Library options | `/tools/library/blocks` → `options` tab | Allowed values for the slash menu: Article List options, section styles, Template, Theme, Roles, Topics | New Role or Topic, new option value |
| Library lists | `/tools/library/blocks` (`data` tab), `/tools/library/templates`, `/tools/library/icons` | What the Library panel shows | Adding a block example, template or icon |

There is no placeholders sheet in this project. After changing a sheet, **preview** it (and publish it) for
the change to apply.

## Publishing Workflow

| Environment | Address | Purpose |
| --- | --- | --- |
| Preview | `main--aca-careers-eds--nehaadobe.aem.page` | Check changes before they go live |
| Live | `main--aca-careers-eds--nehaadobe.aem.live` | The published site (the production domains point here once launched) |

**Workflow:** edit in Document Authoring → **Preview** → check → **Publish**. Many pages at once:
https://da.live/apps/bulk.

**Story index:** the blog listing and every Article List read a story index that is updated **only when a page
is published**. A new or changed story appears in the listing and in "More Stories" after you publish it, not
after preview.

## Common Tasks

| Task | Steps |
| --- | --- |
| **Add a story** | `/blog` → New document → insert the **Story article** template → write the story → fill Metadata (Template `blog-article`, Roles, Topics, Publication Date, Author, Image) → Preview → Publish |
| **Add an off-site story** | Add a row to `/blog/external-stories` → Preview and publish the sheet |
| **Change "More Stories" on a story** | Edit the Article List rows (one story link per row) → Preview → Publish |
| **Edit a page** | Open it → change → Preview → Publish |
| **Delete or move a page** | Add a row to `/redirects` first → delete or move the document → preview and publish `/redirects` |
| **Update the menu** | Edit `/nav` → Preview → Publish (applies to all brands) |
| **Update the footer** | Edit `/footer` → Preview → Publish (applies to all brands) |
| **Add a Role or Topic** | Ask an administrator to update the library `options` tab; then tag stories with it |
| **Start the Ascendiun pages** | Create the `/ascendiun/` folder and its pages; add `/ascendiun/**` → theme `ascendiun` to `/metadata` |

## Images and Media

| Method | How |
| --- | --- |
| Drag and drop | Drag an image into the document; it is stored in Document Authoring |
| Media library | Library → Media, to reuse an uploaded image |
| Videos | Upload the MP4 to Document Authoring and link it from an **Embed (video)** block |

Best practices: descriptive file names, alt text on every image, a 1200×630 share image for each page. Images
are resized and compressed automatically.

## Troubleshooting

| Issue | Solution |
| --- | --- |
| A new story is missing from the blog listing or "More Stories" | Publish it: the story index only includes published pages. Check that Template is `blog-article` |
| A story card has no image or text | Check the story's Image and Description metadata, then publish it again |
| A Role or Topic is missing from the filters | The value must exist in the library `options` tab, and the tab must be previewed/published |
| Page not updating after publish | Wait 1-2 minutes, then hard refresh (Cmd/Ctrl + Shift + R) |
| A block looks like a plain table | Check the block name and variation spelling in the first row |
| A button shows as a plain link | Put the link alone in its own paragraph and make it bold (solid) or italic (outline) |
| Wrong colors or fonts on a page | Check the folder's theme in `/metadata`, or the page's Theme metadata |
| A share image is missing | The page's Image metadata points to a missing picture; replace it |

## Resources

| Resource | URL |
| --- | --- |
| Document Authoring documentation | https://docs.da.live/ |
| Authoring on AEM Edge Delivery Services | https://www.aem.live/docs/authoring |
| Redirects | https://www.aem.live/docs/redirects |
| Bulk metadata | https://www.aem.live/docs/bulk-metadata |
| Block details for developers | `blocks/<block>/README.md` in the code repository |

## Support Contacts

Add the project contacts here (content lead, administrator, development team).
