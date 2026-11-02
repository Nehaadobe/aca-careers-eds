# Careers multi-brand migration — analysis report

Source sites: <https://careers.blueshieldca.com/> (Blue Shield of California, "BSC") and <https://www.stellarus.com/careers> (Stellarus). A third brand, Ascendiun, gets a theme slot only.

Analysis date: 30 October 2026. Every URL listed here was opened on the live site at 1440px and 390px (rendered DOM, computed styles and full-page screenshots). Every story was downloaded and parsed one by one. Nothing in this report is carried over from the earlier scope report without being re-checked. Where the earlier report differed, the difference is called out (§10).

Scope decisions confirmed by the business:

| Decision | Answer |
| --- | --- |
| Extra live pages | `/why-relocate` and `/events` are **in**. `/blog/authors`, `/login`, `/registration`, `/password_recover` are **out**. |
| Content baseline | **Live site as-is**. The "Proposed changes" in *Career Site Changes FOC* become a follow-up list (§9). |
| Earlier migration in the repo | **Audit and reuse**: keep, refactor or replace each block (§8). |
| Ascendiun | **Theme slot only**. No pages yet; its plan is summarized in §7.4. |
| Home-page feedback poll | Out of scope. |
| OneTrust | Both OneTrust scripts are included (§7.5). |

Companion files:

- [`manual-checklist.md`](manual-checklist.md): page-by-page manual QA checklist, plus the global checklist.
- [`data/blog-stories-migrate.csv`](data/blog-stories-migrate.csv): the 76 stories to migrate, with categories, hero type, authors and the components each story body uses.
- [`data/blog-stories-link-only.csv`](data/blog-stories-link-only.csv): the 39 listing entries hosted on other sites, with title, URL, date, image, description, Roles and Topics. This is the seed for the external-stories sheet.

---

## 1. Totals at a glance

| Item | Count |
| --- | --- |
| **Pages to migrate** | **87** |
| BSC static pages | 10 |
| BSC blog stories (same domain, `/blog/<slug>`) | 76 |
| Stellarus pages | 1 |
| Blog listing entries that are **link-only** (other domains) | 39 (34 news.blueshieldca.com, 4 promisenews.blueshieldca.com, 1 blueshieldca.cc short link) |
| Shared fragments | 4 (nav + footer for each of 2 brands); Ascendiun adds 2 later |
| Data sheets | 1 (`/blog/external-stories`), plus the query index and the authoring library (`/library/blocks` with `data` + `options` tabs, `/library/templates`) |
| Page templates | 6 (5 BSC, 1 Stellarus) |
| Blocks | 17 (12 reused or refactored, 2 new, 3 platform) |
| Block variants | 29 (§5) |
| Section styles | 5 |
| Live URLs out of scope | 5 by decision, 3 that return 404, 5 malformed sitemap entries |

---

## 2. Page inventory

### 2.1 BSC static pages (10)

| # | Source URL | Title (live) | Template | In nav |
| --- | --- | --- | --- | --- |
| 1 | `/` | A great place to do meaningful work | Homepage | logo |
| 2 | `/life-at-blue-shield` | Life at Blue Shield | Section landing | top level, has a dropdown |
| 3 | `/life-at-blue-shield/our-workplace-model` | Our workplace model | Section landing | dropdown |
| 4 | `/a-culture-of-belonging` | A Culture of Belonging | Section landing | top level |
| 5 | `/growth-development` | Growth & development programs | Section landing | top level |
| 6 | `/total-rewards` | Total rewards | Section landing | top level |
| 7 | `/how-to-get-hired` | Our Hiring Process | Section landing | top level |
| 8 | `/events` | Upcoming events | Section landing (header only, empty body) | no |
| 9 | `/blog` | Our people | Story listing | dropdown ("Our people") |
| 10 | `/why-relocate` | Why Relocate? | Text page | no |

The "Life at Blue Shield" dropdown has three items: **Our people** → `/blog`, **Our workplace model**, and **Awards & Recognition** → `https://www.blueshieldca.com/en/home/about-blue-shield/corporate-information/awards`. The last one is external, so it stays a link.

### 2.2 BSC blog stories (76 to migrate, 39 link-only)

- The listing at `/blog` has **115 cards over 13 pages** (9 per page). 76 are hosted at `careers.blueshieldca.com/blog/<slug>`, so they are migrated with the **same URL**. 39 link to other domains, so they are **link-only** cards.
- The sitemap's `/blog/*` entries match the listing's same-domain cards exactly (76 = 76), apart from `/blog/authors` and `/blog/search`.
- Stories by year: 2020: 4, 2021: 13, 2022: 13, 2023: 19, 2024: 20, 2025: 5, 2026: 2.
- Full per-story detail is in `data/blog-stories-migrate.csv`.

### 2.3 Stellarus (1)

| # | Source URL | Title | Template | Proposed EDS path |
| --- | --- | --- | --- | --- |
| 1 | `https://www.stellarus.com/careers` | Stellarus - Universal Healthcare Platform | Stellarus careers landing | `/stellarus/careers` (confirmed) |

The source is a client-rendered React single-page app (the HTML is 3.6 KB with an empty `#root`), so it had to be analyzed in a browser.

### 2.4 Out of scope or not migrated

| URL | Status | Treatment |
| --- | --- | --- |
| `/blog/authors`, `/blog/search` | 200, but both serve the listing | Redirect to `/blog` |
| `/login`, `/registration`, `/password_recover` | 200, account forms | Out of scope (decision); no redirects. |
| `/confirm`, `/file`, `/alerts` | 404 | Not migrated |
| 5 sitemap entries such as `https://careers.blueshieldca.comhttps://demo.com` | malformed | Ignored |
| `/blog/how-a-special-investigations-unit-manager-fosters-teamwork-and-transparency-at-blue-shield` | Serves the listing; the story no longer exists | Not migrated (it was in the earlier scope, §10) |
| `/blog/celebrating-and-honoring-juneteenth-at-blue-shield-of-california` | Redirects to `/login` (unpublished) | Not migrated. **7 stories' "More Stories" link to it** (§9). |
| Home "[+] Feedback" poll (Qualtrics modal) | n/a | Out of scope (decision) |

---

## 3. Templates

| Template | Pages | Structure (top → bottom) |
| --- | --- | --- |
| **T1 Homepage** | 1 | Hero (home) · centered intro · gallery with overlapping feature-link cards · "Why work with us" quotes · locations banner |
| **T2 Section landing** | 7 | Hero (page: text left, image right with an 80px rounded bottom-left corner) · varying content sections |
| **T3 Text page** | 1 | Plain H1 title (no image) · rich text |
| **T4 Story listing** | 1 | Hero (page) · story listing (search, filters, sort, paging) |
| **T5 Story article** | 76 | Article header (topics, title, date, authors, share, hero image or video) · body · CTA · "More Stories" |
| **T6 Stellarus landing** | 1 | Dark "space" backdrop · centered hero (eyebrow, H1, two paragraphs, two CTAs) |

All BSC templates share the BSC header and footer. T6 uses the Stellarus header and footer.

---

## 4. Block mapping, page by page

Notation: `block (variant)`. "Default" means default content (headings, paragraphs, lists, images) with no block.

### T1 — `/`

| # | Source section (class) | EDS mapping | Notes |
| --- | --- | --- | --- |
| 1 | `.hero`: full-bleed photo, uppercase H2 "A great place to do meaningful work.", CTA "Find Your Next Role" (Oracle) | `hero (home)` | 480px tall. Display font, white, uppercase. |
| 2 | `.home-textSection`: H2 + paragraph, centered | Default + section style `centered` | |
| 3 | `.homegallery`: 3 photos, the middle one wider | `gallery` | On the source each photo links to its full-size file (verified by clicking). **Decision: photos are not clickable on EDS** (no lightbox, no link). Feature cards overlap the bottom of the gallery on desktop. |
| 4 | `.homegallery_tiles`: 3 white cards (title, text, chevron link) | `cards (feature-links)` | Same section as 3; overlaps it. Links: `/life-at-blue-shield`, `/blog`, `citizenship.blueshieldca.com` |
| 5 | `.contentSection__centerTitle` + `.bioTiles`: "Why work with us", 2 quotes with round portraits | Default H2 + 2 × `quote` | Section `centered`. Stray hidden text "google-site-verification…" inside quote 1: do not migrate. |
| 6 | `.locations`: navy band, California map, H2, 3 paragraphs, white button "Search open positions" | `banner (locations)` | Background `#014d83` with the map image on the right. Button inverted (white background, navy text). |

### T2 — `/life-at-blue-shield`

| # | Source | EDS mapping | Notes |
| --- | --- | --- | --- |
| 1 | `.page-header`: H1, 2 subtitle paragraphs, image | `hero (page)` | Same on all T2 and T4 pages |
| 2 | `.simplebox`: "Our mission and values", H2 + paragraph on light blue | Default + section style `highlight` | `#edf6f9` panel, radius `20px 0` |
| 3 | Empty `<h1>` | Not migrated | Source artifact |
| 4 | `.ipr_videoTiles`: 3 portrait tiles (Human, Honest, Courageous) with a play icon and blue caption bar | `cards (video-tiles)` | Click opens a modal (Magnific Popup) playing the YouTube video with autoplay (verified) |
| 5 | `.ipr_banner`: full image, centered H2 "View our job opportunities" + button | `banner (image-cta)` | Inside the content width (1290px), 529px tall |

### T2 — `/life-at-blue-shield/our-workplace-model`

| # | Source | EDS mapping | Notes |
| --- | --- | --- | --- |
| 1 | `.page-header` | `hero (page)` | |
| 2 | `.ipr_indexChess`: 2 rows, image and text alternating sides | `columns (alternating)` | H3 titles. Row 2 has 3 paragraphs with bold lead-ins. |

### T2 — `/a-culture-of-belonging`

| # | Source | EDS mapping | Notes |
| --- | --- | --- | --- |
| 1 | `.page-header` | `hero (page)` | Subtitle is one long paragraph |
| 2 | `.dei_cards .homegallery`: 3 photos | `gallery` | Links are empty (`href=""`), so the photos are not clickable here. Alt text is "Block Image 1/2/3" and needs rewriting (§9). |
| 3 | `.page-narrowContent`: centered H2 "Our employee resource groups", 2 paragraphs, ERG logo grid **as a single image** | Default + section style `centered`, `narrow` | The 9 ERG names exist only inside the image. Alt text needs rewriting (§9). |

### T2 — `/growth-development`

| # | Source | EDS mapping | Notes |
| --- | --- | --- | --- |
| 1 | `.page-header` | `hero (page)` | |
| 2 | `.ipr_textBanner`: full-width blue band with a large statement | `banner (statement)` | `#0071bc` background, 24px/600 white text, max 960px |
| 3 | `.homegallery`: 3 photos | `gallery` | Not clickable (decision) |
| 4 | "Our Internship Program": H2 + one row (image with play button + text, list, link) | Default H2 + `columns (alternating)` with one row | The image links to YouTube `R2OGCW75eaY`. Duplicated list item in the source (§9). |
| 5 | "Growth & development stories" + "View More Stories" link (`/blog?c=29653`) + 3 curated cards | Default H2 + link + **`article-list`** | 1 external and 2 internal cards. The link becomes `/blog?topic=growth-and-development`. |

### T2 — `/total-rewards`

| # | Source | EDS mapping | Notes |
| --- | --- | --- | --- |
| 1 | `.page-header` | `hero (page)` | |
| 2 | "Our promise to our employees": 8 icon tiles | Default H2 + `cards (icon-tiles)` | Section `centered`. Tiles: icon, H-title, paragraph. |
| 3 | 3 photos | `gallery` | |
| 4 | "Health and well-being": 3 icon tiles | Default H2 + `cards (icon-tiles)` | |
| 5 | 3 photos | `gallery` | |
| 6 | "Career growth and development": 5 icon tiles | Default H2 + `cards (icon-tiles)` | |

### T2 — `/how-to-get-hired`

| # | Source | EDS mapping | Notes |
| --- | --- | --- | --- |
| 1 | `.page-header` | `hero (page)` | |
| 2 | "We want you to succeed" + one-line description + 6 step tiles | Default + `cards (icon-tiles)` | Tile 1 links to "talent community" |
| 3 | "Frequently asked questions": 11 items | Default H2 + `accordion` | **Only one answer open at a time**: opening one closes the other (verified). Questions `#003b5c` on `#f4f4f4`, radius 8px. Hover: navy background, white text. The source has no `aria-expanded` on the toggles; EDS uses `<details>`/`<summary>`. |

### T2 — `/events`

| # | Source | EDS mapping | Notes |
| --- | --- | --- | --- |
| 1 | `.page-header` (title, subtitle, image) | `hero (page)` | The page body is empty on the live site. Migrated as-is. The FOC document says "archive" (§9). |

### T3 — `/why-relocate`

| # | Source | EDS mapping | Notes |
| --- | --- | --- | --- |
| 1 | `.page-header.no_hero`: H1 only | Default H1 | Display-font H1 styling comes from global styles, so no block is needed |
| 2 | `.text-editor`: paragraph + ordered list of 10 | Default | |

### T4 — `/blog` (Our people)

| # | Source | EDS mapping | Notes |
| --- | --- | --- | --- |
| 1 | `.page-header` | `hero (page)` | |
| 2 | `.indexFilter` + `.tiles` + `.pagination` | `story-listing` | See §6 for the data model and behavior |

### T5 — Story article (76 pages)

Measured over all 76 stories:

| Element | Source | EDS mapping | Stories using it |
| --- | --- | --- | --- |
| Category links (Roles + Topics) | `.article-categories` | Page metadata `roles`, `topics`, shown by `article-header` | 74 (2 have none) |
| Title, date | `.article-title`, `.article-date` | Page title (H1) + metadata `publication-date` | 76 |
| Authors | `.article-authors`: name, position, optional photo | Metadata `author` rows (name, position, photo) | 68: one author 65, two 2, three 1. **10 with an author photo.** |
| Share | `.article-share` (LinkedIn, Facebook, X) | `share`, inserted by `article-header` | 76 |
| Hero | `.article-hero` image, or `.article-hero-video` MP4 with poster | `article-header`: image 63, **video 12** (iprsoftwaremedia MP4), none 1 | 76 |
| Lead paragraph | `p.lead.fw-bold` | Default paragraph, bold | 8 |
| Body text, H-titles, lists | `.cBuilder` | Default | ul: 13, ol: 4 |
| Inline images | `.textImage-left/right/center/inline` | Floated images → **`image (left)` / `image (right)`** (confirmed: keep floats). Centered and inline images → default image. Captions → italic paragraph after the image. | 31 stories, 90 images. 25 stories have floats (left in 13, right in 21). Center 5, inline 2. Captions in 3. |
| Callout / pull-quote box | `.simplebox` | Section style `highlight` | 9 |
| YouTube embeds | `iframe` | `embed` | 13 stories, 16 embeds |
| Single-cell bordered table | `table` | `table (callout)` | 1 (`how-sarah-miller-…`) |
| "Find Your Next Role" button | `.article-action` | Default link in its own paragraph, styled as a button | 66 |
| "More Stories" | `.contentSection.blue_bottom` with 1–10 cards | **`article-list`** (curated paths) on the `tinted` ground | 76 stories, 242 cards: 197 internal stories, 43 external, **2 internal non-story pages** (`/a-culture-of-belonging`, `/how-to-get-hired`). The cards show title, description and "View highlights", with no date. |

### T6 — Stellarus `/careers`

| # | Source | EDS mapping | Notes |
| --- | --- | --- | --- |
| 1 | `<nav>`: logo (star + "Stellarus"), 7 links as pills (Careers active), CTA "Start the Conversation" with a glow | `header`, Stellarus nav fragment | Mobile: burger menu opening a drawer. Links are absolute to `www.stellarus.com`. |
| 2 | `#careers`: eyebrow "CAREERS" (mono, uppercase), H1 "Help us fix healthcare.", 2 paragraphs, buttons "View All Open Positions →" (Oracle CX_6001) and "Submit Your Resume" (recsolu) | `hero (centered)` | Centered, max 760px text. Primary pill (blue) + secondary pill (glass with border). |
| 3 | Decoration: colored orbs, a starfield of about 70 dots, constellation SVG, grain overlay | Theme background (CSS only, tokens) | Decoration only. No authored content. |
| 4 | `<footer>`: brand + blurb (with a link to Ascendiun), Platform (7) / Company (5) / Connect (2) columns, copyright line | `footer`, Stellarus footer fragment | Source anchors such as `#atlas-detail` are broken on the careers page. Map them to `https://www.stellarus.com/#…` (§9). |

---

## 5. Final list of blocks and variants

| # | Block | Status in repo | Variants / options | Pages and instances |
| --- | --- | --- | --- | --- |
| 1 | `header` | Refactor (tokens, brand-aware) | **bsc** (utility row, logo + "Careers" label, 5 items, 1 dropdown, CTA; burger below 992px) · **stellarus** (logo, pill links with an active state, glow CTA; drawer) | All 87 pages |
| 2 | `footer` | Refactor (tokens, brand-aware) | **bsc** (logo, fair-hiring text, 2 link columns, 4 social icons, black utility bar, disclaimer) · **stellarus** (brand blurb, 3 columns, mono copyright) | All 87 pages |
| 3 | `fragment` | Keep | — | nav and footer |
| 4 | `hero` | Refactor | **home** (full-bleed, centered display H2 + CTA) · **page** (default: text left, image right, 80px bottom-left radius) · **centered** (Stellarus: eyebrow, H1, text, 2 CTAs, no image) | home 1 · page 8 · centered 1 |
| 5 | `cards` | Refactor (drop `story-grid`, `related`) | **feature-links** · **icon-tiles** · **video-tiles** | feature-links 1 · icon-tiles 4 (24 tiles) · video-tiles 1 |
| 6 | `columns` | Keep / tokens | **alternating** (image/text rows that swap sides; the image can open a video) | 2 |
| 7 | `gallery` | Refactor (tokens) | Single variant. Photos are not clickable (decision); the existing lightbox code is removed. | 5 instances on 4 pages |
| 8 | `quote` | Keep | Single variant (portrait, quote, attribution; side by side when adjacent) | 2 |
| 9 | `banner` | Refactor (tokens) | **locations** (navy band + map) · **image-cta** (full image + centered title + button) · **statement** (brand-blue band, large text) | 1 each |
| 10 | `accordion` | Refactor (tokens) | Single variant (FAQ) | 1 (11 items) |
| 11 | `embed` | Keep | **YouTube/Vimeo** (lazy facade) · **video** (MP4 + poster) | 16 YouTube + 12 MP4 (article heroes) |
| 12 | `table` | Keep | default · **callout** (single cell, bordered box) | 1 |
| 13 | `article-header` | Refactor (authors with photo, multiple authors, video hero) | image hero · video hero · no hero (chosen automatically from metadata) | 76 |
| 14 | `share` | Keep | Single variant (LinkedIn, Facebook, X) | 76 (inside article-header) |
| 15 | `story-listing` | Refactor (filters from data, URL params, tokens) | Single variant | 1 |
| 16 | `article-list` | **New** (replaces `cards (story-grid)` and `cards (related)`) | Options rows: **Columns** 2 / 3 / 4 · **Ground** Light / Tinted / Dark · **Display Article date** Yes/No · **Display Short description** Yes/No | 77 (Growth page + 76 stories); authors can use it on any page |
| 17 | `image` | **New** | **left** · **right**: the image floats beside the following text from 900px and stacks full width on mobile. Optional caption. | 25 stories |

Not needed: `widget` (no matching source pattern). Recommendation: remove it, or keep it unused.

**Variant count:** header 2, footer 2, hero 3, cards 3, columns 1, gallery 1, quote 1, banner 3, accordion 1, embed 2, table 1, article-header 3, share 1, story-listing 1, article-list 1 (with options), image 2, fragment 1 = **29 variants.** Of these, the header and footer variants (4) follow the page's brand theme, and the article-header variants (3) follow the page metadata. Authors pick the remaining 22.

### 5.1 Section styles (section metadata `style`)

| Style | Source | Used on |
| --- | --- | --- |
| `centered` | `contentSection__centerTitle`, centered intros | Home ×2, Belonging, Total rewards ×3, Hiring ×2 |
| `highlight` | `.simplebox` (`#edf6f9`, radius `20px 0`, 40px padding) | Life at Blue Shield, 9 stories |
| `narrow` | `.page-narrowContent` (960px) | Belonging |
| `tinted-bottom` | `.blue_bottom` (light-blue band behind the bottom 60% of cards) | Story "More Stories". Covered by the `article-list` Ground "Tinted" option, so no section style is needed. |
| `dark` | Stellarus page background / BSC navy band | Reserved for the theme. Ascendiun TBD. |

### 5.2 Auto blocks and metadata (no authored table)

- **Article header**: built from metadata on pages whose `template` is `article`. Fields: `roles`, `topics`, `publication-date`, `author` (name | position | photo, repeatable), `image` (hero), `hero-video` (MP4 URL).
- **Embed**: plain YouTube or Vimeo links become embeds automatically. MP4 links can too.
- **Fragments**: all brands use the careers site `/nav` and `/footer`, restyled by their theme (decision of 31 October 2026). `nav` / `footer` page metadata can still point a page at another fragment; `/stellarus/nav` and `/stellarus/footer` are kept, unused.

---

## 6. Blog: indexing, listing and article-list

### 6.1 Data sources

1. **Query index** (EDS indexing). `helix-query.yaml` is retired in this project, so the index definition lives in the Config Service at tools.aem.live; the repo copy is `default-query.yaml` (not served, see `.hlxignore`). Two indexes: `sitemap` → `/sitemap.json` (every public page of both brands: `title, image, description, template, theme, robots, lastModified`) and `blog` → `/blog/query-index.json` (the stories `/blog/*`: `title, description, image, date, roles, topics, author, template, robots, lastModified`). The story listing reads the blog index; article-list reads the blog index first, then the sitemap index, because 2 "More Stories" cards point to non-story pages (`/a-culture-of-belonging`, `/how-to-get-hired`).
2. **External stories sheet** `/blog/external-stories` (DA spreadsheet), with columns `title, url, image, publication-date, description, roles, topics`. It is seeded with the 39 rows in `data/blog-stories-link-only.csv`. Roles and Topics come from crawling each listing filter: 31 of 39 entries have categories, 8 have none. Cards from this sheet open the external URL in the same way as on the live site.
3. **Roles and Topics** come from the library `options` tab (rows `roles` and `topics`, §6.5). The listing reads them from `/library/blocks.json?sheet=options`, so authors keep **one list** for tagging stories and for the filters. The library `blocks` sheet must therefore be published.
4. `scripts/story-index.js` (already in the repo) merges both sources into one normalized story list. It is reused by both blocks below.

### 6.2 Categories (verified against the live filters)

- **Roles (15):** Commercial Markets, Consumer Markets, Customer Experience, Finance, Foundation, Health Solutions, Information Technology, Innovation, Law, Marketing, Medi-Cal, Operations, People and Engagement, Promise Medical Clinics, Transformation.
- **Topics (8):** Awards and Recognition, Blue Shield Foundation, Corporate Citizenship, Culture of Belonging, Employee Resource Groups, Growth and Development, Growth and Development Programs, Life at Blue Shield.
- Cards per value across all 115 cards: People and Engagement 90, Life at Blue Shield 72, Corporate Citizenship 35, Growth and Development 24, Awards and Recognition 12, Culture of Belonging 11, Growth and Development Programs 9, Transformation 6, Employee Resource Groups 6, Health Solutions 4, Finance 3, Information Technology 3, Promise Medical Clinics 3, Customer Experience 2, Operations 2, Law 2, Innovation 2, Blue Shield Foundation 2.
- **5 Roles have no stories**: Commercial Markets, Consumer Markets, Foundation, Marketing, Medi-Cal. **Decision:** the filter shows every authored value, as on the live site. The values come from the library `options` tab (§6.5), not from the stories. Once an author tags a story with a value, it shows up in that value's results; until then the value shows the empty-result message.
- For every one of the 76 same-domain stories, the categories on the story page match the listing filters exactly.

### 6.3 `story-listing` behavior (the `/blog` page)

- Source behavior (verified): a server-side GET form (`?q=&c=&c=&s=-date&search_type=and`). Changing a select submits the form straight away. Searching "intern" returns 4 cards. The EDS block filters on the client from the index and keeps the same instant behavior.
- Keyword **search** over title, description, Roles and Topics (source field "Search Blogs").
- **Filters:** Roles select + Topics select, with options read from the `roles` and `topics` rows of `/library/blocks.json?sheet=options` in authored order. Combined with AND (as on the source), plus "Clear Filters".
- **Sort:** Newest (default) / Oldest / Title A–Z / Title Z–A.
- **Pagination:** 9 per page, with prev/next and number links (source: "1 2 3 … 13").
- **Deep links:** `?q=&role=&topic=&sort=&page=`. Legacy `?c=<id>` links are mapped to the right Role or Topic using the ID table from the source.
- **Cards:** image (16:9, 230px tall at 410px wide), blue title (24/30, 600), date in grey (16px), description. Hover adds a 1px brand-blue ring.

### 6.4 `article-list` (new, follows the screenshot you provided)

```
| article-list                                          |
| /blog/reflections-from-our-2025-interns               |
| /blog/empowered-to-succeed-moises-bandas-…            |
| https://news.blueshieldca.com/2026/06/17/we-believe-… |
| Columns                   | 3                         |
| Ground                    | Tinted                    |
| Display Article date      | No                        |
| Display Short description | Yes                       |
```

- Single-cell rows hold story links: internal paths, or external URLs that are listed in the external-stories sheet. The block looks each one up in the merged index. Internal paths are read from the query index; external URLs from the sheet.
- Two-cell rows are options. Keys are case-insensitive. Unknown keys are ignored. A missing option falls back to its default (Columns 3, Ground Light, date Yes, description Yes).
- A link that is in neither source is skipped and a warning is logged. The page does not break. This is the case for the unpublished Juneteenth story.
- The heading ("More Stories", "Growth & development stories") and any "View More Stories" link stay **default content** in the same section. That keeps them editable as normal text.
- Typing `/` in an option's value cell shows the allowed values (2 / 3 / 4, Light / Tinted / Dark, Yes / No). These come from the block-options sheet in §6.5.

### 6.5 Authoring support in Document Authoring: library and slash-menu options

Your second screenshot shows Document Authoring's **block options**. The project library's `blocks` sheet gets a second tab named `options`, with the columns `key | blocks | values | type | label` ([Set up library](https://www.aem.live/docs/ew/administering/set-up-library)). When a row's `key` matches a key cell inside a block listed in `blocks`, typing `/` in the value cell offers the pipe-separated `values`:

- `type` empty: a single choice. `type: multi` saves several values comma-separated.
- `Label=value` shows a friendly label but stores the value.
- `blocks` can name several blocks (comma-separated), `metadata`, `section-metadata` or `ALL`.
- For `metadata` rows, the same fields also appear in the **Page** side panel, so authors can set story metadata (Roles, Topics, date) without editing the table.

**Current state** (checked read-only on 30 October 2026): this site has **no library** in Document Authoring (`/library` is empty) and **no site config**. The library, its sheets and the config `library` tab need to be created.

**Proposed library** (`/library`, registered in the site config's `library` tab):

| Item | Content |
| --- | --- |
| `library/blocks/<block>` documents | One document per block, with every variant shown as a separate table: `hero (home)`, `hero` (page), `hero (centered)`, `cards (feature-links)`, `cards (icon-tiles)`, `cards (video-tiles)`, `columns (alternating)`, `banner (locations)`, `banner (image-cta)`, `banner (statement)`, `image (left)`, `image (right)`, `table (callout)`, `article-list`, `story-listing`, `gallery`, `quote`, `accordion`, `embed`. Each one ends with a `library-metadata` description for the block picker. |
| `library/blocks` sheet, tab `data` | `name`, `path` for each block document |
| `library/blocks` sheet, tab `options` | The slash-menu values below |
| `library/templates/<template>` documents + `library/templates` sheet | Starter pages: Section landing, Text page, Story article (with the metadata table filled in except for the values), Stellarus landing |

**Proposed `options` tab**

| key | blocks | values | type | label |
| --- | --- | --- | --- | --- |
| Columns | article-list | 2 \| 3 \| 4 | | Columns |
| Ground | article-list | Light \| Tinted \| Dark | | Ground |
| Display Article date | article-list | Yes \| No | | Display Article date |
| Display Short description | article-list | Yes \| No | | Display Short description |
| style | section-metadata | centered \| light-blue \| blue \| two-up | multi | Section style |
| template | metadata | Story article=blog-article | | Template |
| theme | metadata | Blue Shield=bsc \| Stellarus=stellarus \| Ascendiun=ascendiun | | Theme |
| nav / footer | metadata | (free text, fragment path, e.g. `/stellarus/nav`) | | Navigation / Footer |
| roles | metadata | the 15 Roles from §6.2 | multi | Roles |
| topics | metadata | the 8 Topics from §6.2 | multi | Topics |
| publication date | metadata | (free text, `yyyy-mm-dd`) | | Publication date |
| author | metadata | (free text; several authors separated by `;`) | | Author |
| author title | metadata | (free text; one per author, separated by `;`) | | Author title |
| author image | metadata | (free text; photo URL per author, separated by `;`) | | Author photo |
| hero-video | metadata | (free text, MP4 URL) | | Hero video |
| description | metadata | (free text) | | Short description |

Notes:

- Names match the imported content: section styles `centered`, `light-blue` (callout panel), `blue` (band) and `two-up` (side-by-side quotes) come from the earlier build's CSS; story pages use `Template: blog-article`.
- Blocks read option keys case-insensitively, so `Columns`, `columns` and `COLUMNS` behave the same. The slash menu only appears when the key matches the sheet's `key` exactly, so the library documents use the exact keys above.
- The theme should normally come from **bulk metadata** per folder (`/stellarus/**` → stellarus), so authors rarely set it. The option is there for overrides. This follows the [multi-brand sites](https://www.aem.live/developer/multi-brand-sites) guidance: a body class from `theme` metadata, plus a theme file loaded in `loadEager`.
- **Roles and Topics have a single source:** the `roles` and `topics` rows here feed both the slash menu / Page panel and the blog listing filters (decision, §11). Adding a value means adding it to that row only.

---

## 7. Theme / CSS analysis

### 7.1 BSC: source stack

- Bootstrap 5 build (`theme.css`, 208 KB) plus `custom.css`, `simplebox.css` and contentbuilder CSS. Bootstrap custom properties (`--bs-*`) are the only tokens on the source. Component colors are hard-coded hex values.
- Adobe Fonts kit **`wcg8bju`**: proxima-nova (400/600/700, regular and italic), trade-gothic-next-condensed (700, regular and italic), trade-gothic-next-compressed (700/800), tgn-soft-round-con (700), minion-pro and minion-pro-caption. **Only proxima-nova and trade-gothic-next-condensed are used** on the pages in scope.
- Icon font `fontello` (chevrons, social icons). Replace it with SVG icons in `/icons`.
- Breakpoints (Bootstrap): 576 / 768 / **992** (navigation collapses) / 1200 / 1400. Container max widths: 1140px at ≥1200, 1320px at ≥1400. Gutter 30px.

### 7.2 BSC: measured values (computed styles, 1440px; mobile in brackets where different)

**Color**

| Role | Value | Where |
| --- | --- | --- |
| Primary / link | `#0071bc` | Buttons, links, card titles, dropdown background, statement band, video-tile caption bar |
| Primary hover | `#0060a0` (background) / `#005a96` (border, link hover) | Buttons, links |
| Navy | `#014d83` | Locations band, inverted button text |
| Deep navy | `#003b5c` | FAQ question text, FAQ hover background |
| Text | `#25282a` | Body, headings, footer background |
| Muted text | `#767676` | Utility links, card dates |
| Tint | `#edf6f9` | Highlight panel, filter panel, More Stories band |
| Neutral 100 | `#f4f4f4` | FAQ rows, header border |
| Border | `#cccccc` | Inputs and selects |
| Black | `#000000` | Footer utility bar |
| Overlay | `rgb(0 0 0 / 50%)` | Image overlay on banners |
| Shadow | `0 0 10px rgb(0 0 0 / 15–16%)` | Cards, feature tiles |
| Focus | `0 0 0 .25rem rgb(0 113 188 / 25%)` | Inputs, buttons |
| Share icons | `#007bb6` (LinkedIn), Facebook and X brand colors | Share block |

**Typography**

| Element | Family | Size / line height | Weight | Other |
| --- | --- | --- | --- | --- |
| Body | proxima-nova | 16 / 24 | 400 | Same on mobile |
| Page H1 (`.page-title`) | trade-gothic-next-condensed | 42 / 50.4 | 500 (700 face) | uppercase, letter-spacing 1.333px |
| Home hero title | trade-gothic-next-condensed | 42 / 48 | 500 | uppercase, white, max 450px |
| Article H1 | trade-gothic-next-condensed | 36 / 40 | 500 | uppercase |
| Section H2 | proxima-nova | 32 / 38.4 | 600 | margin-bottom 30px |
| Card title (stories) | proxima-nova | 24 / 30 | 600 | brand blue |
| Feature tile title | proxima-nova | 24 / 36 | 600 | |
| Statement banner | proxima-nova | 24 / 28.8 | 600 | white, max 960px |
| Video tile caption | proxima-nova | 24 / 28.8 | 600 | white on `#0071bc` |
| Icon tile title | proxima-nova | 18 / 21.6 | 600 | |
| FAQ question | proxima-nova | 18 / 27 | 500 | `#003b5c` |
| Hero subtitle | proxima-nova | 20 / 30 | 400 | |
| Nav item | proxima-nova | 16 / 20 | 600 | Dropdown links 400, white on blue |
| Utility links / footer | proxima-nova | 14 / 17 and 14 / 21 | 400 / 700 (footer headings) | |
| Caption | proxima-nova | 14.4 / 21.6 | 400 | italic, 90% |

The source uses **the same type sizes on mobile and desktop**. Only the layout changes.

**Shape and spacing**

| Token | Value |
| --- | --- |
| Button | padding 10.56px 40px, radius 22.56px (1.41rem), 1px border in the background color, 16px/600 |
| Story card | radius 20px, image 230px tall, 40px side padding for text |
| Feature tile | radius 16px, padding 40px, overlaps the gallery's lower edge on desktop |
| Page hero image | radius `0 0 0 80px`, 774×406 at desktop (mobile: full width, 205px) |
| Highlight / filter panel | radius `20px 0` (`20px 0 20px 0`), padding 40px / 25px 30px |
| Inputs / selects | radius 6px, height 47px |
| FAQ row | radius 8px, padding 20px 30px |
| Section rhythm | 60px vertical margin; section header block 68px; footer padding 45px |
| Header | 134px desktop (utility row 49px + main row 83px + border); 80px mobile |

### 7.3 Stellarus: measured values

Unlike BSC, Stellarus ships a complete design token system in `:root` (120 custom properties). Use it directly as the theme's primitive layer.

| Group | Tokens (source names) |
| --- | --- |
| Neutrals (space) | 950 `#070B14` (page background) · 900 `#0B1120` · 850 `#0F1727` · 800 `#141D31` · 700 `#1E283F` · 600 `#2B3753` · 500 `#475571` · 400 `#8794B4` (muted) · 300 `#B6C2DC` (secondary) · 200 `#D6DEEC` · 100 `#EBEFF7` · 50 `#F7F9FD` (primary text) |
| Blue (accent) | 200 `#C2D4F0` · 300 `#93C5FD` · 400 `#60A5FA` (focus) · 500 `#3B82F6` · 600 `#2563EB` (buttons) · 700 `#1D4ED8` (press) |
| Coral (brand) | 300 `#F89097` · 400 `#F66A70` · 500 `#F04A52` · 600 `#D6353D` · 700 `#B02A31` |
| Extras | cyan-400 `#22D3EE`, violet-400 `#A78BFA`, emerald-400, amber-400, orange-400 (orbs, status) |
| Surfaces | card `rgb(255 255 255 / 4%)`, card hover 7%, glass `rgb(11 17 32 / 60%)`, border subtle 8% / strong 14% / accent `rgb(96 165 250 / 40%)` |
| Fonts | display **Space Grotesk** 700 · sans **Inter** 400/500/600/700 · mono **JetBrains Mono** 400/500. All three are open-source (OFL) and can be self-hosted in `/fonts`. |
| Type scale | 2xs .6875rem … 6xl 3.75rem, hero `clamp(2.5rem, 6vw, 4.5rem)`. Measured H1: 43.2px desktop / 28.8px mobile, line height 1.08, tracking −0.03em. |
| Radius | xs .25 · sm .5 · md .75 · lg 1 · xl 1.5 · 2xl 2rem · full 9999px (all buttons and nav pills) |
| Shadow / glow | sm–xl dark shadows; glow-sm `0 0 20px rgb(59 130 246 / 30%)` on primary buttons |
| Layout | container 1280px + 24px padding; nav 80px; footer padding 56px 0 36px |
| Measured | nav link 14px/500 `#8794B4`, active `#C2D4F0` on 4% white; CTA 14px/600; eyebrow 11px mono uppercase, tracking 1.98px; body copy 18/30.6 `#B6C2DC`; buttons 16px/600, padding 15px 30px; footer headings 14px/700, links 12px `#8794B4` |

### 7.4 Ascendiun (theme slot only)

There is no live design source yet. The FOC document describes a future Ascendiun careers site:

- Navigation: Homepage, Life at Ascendiun (A Culture of Belonging, Our Workplace Model), Ascendiun Family of Companies (Blue Shield Careers, Stellarus Careers), Total Rewards, Our Hiring Process, Find your next role (Workday URL forthcoming), About Ascendiun.
- Its pages reuse the BSC layouts with "BSC" replaced by "Ascendiun".

So the **BSC templates and blocks cover the Ascendiun page plan with no new blocks**. Only a token file and its fonts are needed once the design exists.

### 7.5 Token architecture (CSS tokens only)

```
styles/
  tokens.css            semantic token *names* with neutral defaults (the contract)
  themes/bsc.css        primitives + semantic values for Blue Shield
  themes/stellarus.css  primitives + semantic values for Stellarus
  themes/ascendiun.css  placeholder (copy of the BSC values until a design exists)
  styles.css            global styles: semantic tokens only
blocks/*/*.css          semantic tokens only — no hex, rgb(), hsl(), named colors or raw font stacks
```

- **Theme selection:** page metadata `theme` (bsc | stellarus | ascendiun), set once per folder through a metadata sheet (`/stellarus/**` → stellarus). The default is bsc. The theme class is added to `<body>`, and the theme CSS loads in `loadEager` before the LCP, so the page renders in the right colors from the first paint.
- **Fonts per theme:** BSC uses the Adobe Fonts kit `wcg8bju`. The kit must allow `*.aem.page`, `*.aem.live`, `localhost` and the production host. Stellarus fonts are self-hosted with `font-display: swap` and metric-matched fallbacks.
- **Semantic tokens (initial set), values per theme:**

| Semantic token | BSC | Stellarus |
| --- | --- | --- |
| `--color-background` | `#fff` | `#070B14` |
| `--color-surface` (cards) | `#fff` | `rgb(255 255 255 / 4%)` |
| `--color-surface-tint` | `#edf6f9` | `#0B1120` |
| `--color-surface-muted` | `#f4f4f4` | `#0F1727` |
| `--color-text` | `#25282a` | `#F7F9FD` |
| `--color-text-secondary` | `#25282a` | `#B6C2DC` |
| `--color-text-muted` | `#767676` | `#8794B4` |
| `--color-link` / `-hover` | `#0071bc` / `#005a96` | `#C2D4F0` / `#F7F9FD` |
| `--color-primary` / `-hover` / `-press` | `#0071bc` / `#0060a0` / `#005a96` | `#2563EB` / `#2563EB` / `#1D4ED8` |
| `--color-on-primary` | `#fff` | `#fff` |
| `--color-band` / `--color-on-band` | `#014d83` / `#fff` | `#0B1120` / `#F7F9FD` |
| `--color-accent-strong` (FAQ etc.) | `#003b5c` | `#C2D4F0` |
| `--color-border` / `-strong` | `#ccc` / `#25282a` | `rgb(255 255 255 / 8%)` / `14%` |
| `--focus-ring` | 2px white + 2px `#005a96` | 2px `#60A5FA` |
| `--font-body` / `--font-heading` / `--font-display` / `--font-mono` | proxima-nova / proxima-nova / trade-gothic-next-condensed / — | Inter / Space Grotesk / Space Grotesk / JetBrains Mono |
| `--display-transform` / `--display-tracking` | uppercase / 1.333px | none / −0.03em |
| `--radius-button` / `--radius-card` / `--radius-panel` / `--radius-media` | 22.56px / 20px / 20px 0 / 0 0 0 80px | 9999px / 1rem / 1rem / 1rem |
| `--shadow-card` / `--shadow-button` | `0 0 10px rgb(0 0 0 / 15%)` / none | `0 4px 16px rgb(0 0 0 / 45%)` / `0 0 20px rgb(59 130 246 / 30%)` |
| `--header-background` / `--footer-background` / `--footer-text` | `#fff` / `#25282a` / `#fff` | transparent / transparent / `#8794B4` |
| `--content-max-width` / `--nav-height` | 1320px / 134px (80px mobile) | 1280px / 80px |

Stellarus card, panel and media radii are **not visible on the careers page**. They are proposed from Stellarus' own scale and need confirming when more Stellarus pages arrive.

- **Lint enforcement (CSS):** `stylelint-config-standard`, plus these rules for `blocks/**/*.css` and `styles/styles.css`: `color-no-hex`, `color-named: never`, `function-disallowed-list: [rgb, rgba, hsl, hsla]`, and `declaration-property-value-allowed-list` so `font-family` accepts `var(--…)` only. Theme files are exempt through an override. This makes "tokens only" a build check, not a review habit.
- **Lint enforcement (JS):** `airbnb-base` (already present), `import/extensions` (always `.js`), and no imports between blocks except `fragment` (as AGENTS.md requires).
- **OneTrust:** add both live files from cdn.cookielaw.org with the same domain script ID, `019878d6-0d4b-7b81-b399-94a1c6d2e133`:
  1. `https://cdn.cookielaw.org/consent/019878d6-0d4b-7b81-b399-94a1c6d2e133/OtAutoBlock.js` (auto-blocking; it must run before any tag, so it goes in `head.html` with the `nonce="aem"` the CSP requires)
  2. `https://cdn.cookielaw.org/scripttemplates/otSDKStub.js` with `data-domain-script="019878d6-0d4b-7b81-b399-94a1c6d2e133"` and `data-document-language="true"`.

  The current dummy `scripts/consent-check.js` is replaced by the `OptanonWrapper` callback. The source also loads a BSC wrapper (`www.blueshieldca.com/vendor/onetrust/onetrust.js` + `.css`) and GA4 (`G-2ZH0HXENHZ`). Including either one needs a decision (§11). The domain script ID is registered for blueshieldca.com, so OneTrust must also allow the EDS hosts. Stellarus has no OneTrust. Its careers page loads only Google Fonts (`fonts.googleapis.com`) and Plausible analytics (`plausible.io`), checked through the browser's network log. The BSC wrapper also logs "Dynatrace not available", so it expects Dynatrace; that is not included either (decision: the 2 OneTrust files only).

---

## 8. Audit of the earlier repo work

| Area | Finding | Action |
| --- | --- | --- |
| `styles/brand.css` | Single-brand. Token names are brand-specific (`--brand-blue`, `--brand-navy`) and values are hard-coded. 13 raw color lines. | Split into `tokens.css` (semantic) + `themes/bsc.css`, and add `themes/stellarus.css`. |
| Block CSS | Raw colors in 10 of 16 block CSS files (67 lines: gallery 11, cards 10, footer 9, story-listing 8, accordion 7, header 7, share 6, banner 4, table 3, hero 2). Also `styles/styles.css` (6) and `styles/video-modal.css` (4). | Refactor to semantic tokens. The new stylelint rules then keep it clean. |
| `cards` | Variants `feature-links`, `icon-tiles`, `video-tiles` match the source. `story-grid` and `related` duplicate what `article-list` does. | Keep the 3. Move the story variants into `article-list`. |
| `story-listing`, `scripts/story-index.js` | Already merge the query index with an external-stories sheet. | Keep. Add filters generated from the data, URL params, and the legacy `?c=` mapping. Move to tokens. |
| `article-header` | Exists. | Add multiple authors, author photo and video hero. Move to tokens. |
| `header` / `footer` | BSC only. | Make them theme-aware. Stellarus gets its own nav and footer fragments. |
| `widget` | Not used by any source pattern. | Remove, or keep it unused. |
| `scripts/consent-check.js` | Dummy consent; OneTrust not wired up. | Replace (§7.5). |
| `.stylelintrc.json` | Standard config only; nothing enforces tokens. | Add the rules from §7.5. |
| `content/` | Only `index`, `nav` and `footer` are in the workspace. | The 87 pages are generated with the import scripts. |
| Document Authoring library / config | None. `/library` is empty, and there is no site config (checked read-only). | Create the library, the `options` tab and the config `library` tab (§6.5). |
| Import infrastructure | Parsers and transformers exist for the BSC templates. The story transformer drops image floats. | Reuse. Add a Stellarus template. Change float handling according to the decision in §11. |
| README | Boilerplate. | Replace with the authoring guide for every block (deliverable). |

---

## 9. Source issues found (fix during migration or confirm)

1. The 7 stories whose "More Stories" link to the unpublished **Juneteenth** story: a-tribute-to-our-black-employee-network, asian-american-and-pacific-islander-heritage-month, being-your-authentic-self-…-theo-retos, black-employee-network-celebrates-black-history-month-…, how-our-people-gave-back-…-martin-luther-king-day, passion-respect-and-pride-…, we-see-and-celebrate-y-for-you. On EDS the card is skipped (§6.4).
2. Category links on 49 stories (62 links) use `href="None?c=…"`, which is broken on the source. On EDS they become working `/blog?topic=` and `/blog?role=` links.
3. `/life-at-blue-shield` has an empty `<h1>` before the video tiles. It is not migrated.
4. Home "Why work with us" quote 1 contains hidden text: "google-site-verification: googledaad20a72e94ef99.html". It is not migrated.
5. `/growth-development` internship list repeats an item: "Build meaningful relationships … in the community" and "build meaningful relationships … volunteer experiences". Migrated as-is unless the business says otherwise.
6. Poor alt text: Belonging gallery "Block Image 1/2/3"; home gallery "3-Row-Image-1/2/3"; all page-hero images have `alt=""`; the ERG logo grid alt "ERG group" hides 9 group names.
7. The footer Facebook icon links to `http://facebook.com` (no BSC page).
8. Stellarus footer "Platform" and "Company" links are in-page anchors (`#atlas-detail`, `#team`, …) that do not exist on `/careers`.
9. **Canonical tags point at a UAT host** on 22 live pages: 9 static pages (all except Our workplace model) and 13 stories use `http://uat.bsccareers.iprsoftware.com/…`. On EDS the canonical is generated from the production URL.
10. FOC document follow-ups that **the live site already reflects**: the BSC home has no job-search banner; the "Life at Blue Shield" dropdown is ordered Our People → Our Workplace Model → Awards; the Belonging carousel is gone; Our Workplace Model exists. Still open on the live site: "Archive the Upcoming Events page" (`/events` is still live and migrated as-is); the "Find Your Next Role" wording is already in place.

---

## 10. Differences from the earlier scope report (`site-scope/`)

| Earlier report | Verified now |
| --- | --- |
| 77 story articles | **76**. `/blog/how-a-special-investigations-unit-manager-…` no longer exists (it serves the listing and is not in the sitemap or the listing). |
| "SOW baseline 22 of 77 stories" | All **76** same-domain stories are migrated with the same URL. The **39** off-domain cards are link-only, which follows your rule. |
| Authors listing in scope as a cards option | Out of scope (decision); redirect to `/blog`. |
| `cards (related / story-grid)` | Replaced by the new `article-list` block (your screenshot). |
| Single brand | Multi-brand theme architecture (§7.5). |

---

## 11. Decisions and open questions

Answered on 30 October 2026:

| Question | Decision |
| --- | --- |
| Stellarus URL | `/stellarus/careers`. The `/stellarus/` folder gets the Stellarus theme through the metadata sheet. Ascendiun later gets `/ascendiun/` the same way. |
| Stellarus header and footer (31 Oct) | The careers site header and footer (`/nav`, `/footer`), in Stellarus colors and fonts; the careers logo shows white (`--nav-logo-filter`). `/stellarus/nav` and `/stellarus/footer` are kept, unused. |
| Floated story images | Keep the floats with the new `image (left / right)` block (25 stories). |
| Scripts | Only the 2 OneTrust files (`OtAutoBlock.js`, `otSDKStub.js`). No BSC wrapper and no GA4. |
| Empty Roles | Show all authored values, as on the live site; results appear once stories are tagged (§6.2). |
| Roles and Topics source | One list: the `roles` and `topics` rows of the library `options` tab feed authoring and the listing filters. No separate taxonomy sheet. |
| Creating the library in Document Authoring | During the build. Everything is prepared locally first; I ask for a go-ahead right before uploading the library documents, sheets and config tab. |
| Account pages (`/login`, `/registration`, `/password_recover`) | Out of scope: not migrated and no redirects. |
| Gallery click behavior | Photos are **not clickable**: no lightbox and no link to the full-size file (client decision). |
| Story hero MP4s (12) | Moved into Document Authoring by the client team (copy and paste). The import keeps the source MP4 URL until each one is replaced; the 12 stories are listed in `data/blog-stories-migrate.csv` (hero = video). |

No open questions remain.

---

## 12. Authoring setup in Document Authoring (uploaded 30 October 2026)

Status: all items below were uploaded to Document Authoring (35 files), the site config `library` tab was created, and the story index definition was applied to the Config Service. Nothing has been previewed or published.

Layout follows the reference project: everything for the Library panel lives under **`/tools/library`**, each folder next to its sheet.

| Document Authoring path | Contents | Local file(s) |
| --- | --- | --- |
| `/tools/library/blocks/` (folder) | 16 block pages, 26 variants (incl. Section Metadata styles); each variant has a `library-metadata` name and description | `content/tools/library/blocks/*.plain.html` |
| `/tools/library/blocks` (sheet) | `data`: block name → page; `options`: slash-menu values (article-list options, section styles, story Roles/Topics/theme/template/date/authors) | `content/tools/library/blocks.json` |
| `/tools/library/icons/` (folder) + `/tools/library/icons` (sheet) | 6 SVG icons (search, facebook, instagram, linkedin, glassdoor, twitter); the same SVGs are in the code repo `/icons` so `:name:` renders them | `content/tools/library/icons/*.svg`, `icons.json` |
| `/tools/library/templates/` (folder) + `/tools/library/templates` (sheet) | Section landing, Text page, Story article, Stellarus landing | `content/tools/library/templates/*.plain.html`, `templates.json` |
| `/drafts/fragments/find-your-next-role` | Fragment used by the Fragment block example | `content/drafts/fragments/find-your-next-role.plain.html` |
| `/metadata` (sheet) | `theme` per folder (`/**` bsc; `/stellarus/**` stellarus + its nav/footer); `noindex` for `/drafts/**` and `/tools/**` | `content/metadata.json` |
| `/redirects` (sheet) | `/blog/authors`, `/blog/search` → `/blog` | `content/redirects.json` |
| `/blog/external-stories` (sheet) | 39 link-only stories | `content/blog/external-stories.json` |
| `/stellarus/nav`, `/stellarus/footer` | Stellarus fragments | `content/stellarus/*.plain.html` |
| Site config, `library` tab | Blocks, Templates, Icons (→ `/tools/library/*.json`), Media Library | `docs/setup/da-site-config.json` |
| Config Service `content/query.yaml` | Applied 30 Oct: one site index `/query-index.json`. **To re-apply:** `sitemap` (`/sitemap.json`) + `blog` (`/blog/query-index.json`) indexes | `default-query.yaml` |

Not configured: **AEM Assets** (needs the AEM as a Cloud Service repository ID, config key `aem.repositoryId`) and **Fragment Picker** (not a standard Document Authoring library item; needs its plugin URL).

Sheets take effect on the site only after preview and publish. The blog listing reads Roles/Topics from `/tools/library/blocks.json?sheet=options`, so that sheet must be published.
