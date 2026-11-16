# Manual migration checklist

Use one row per item. Mark ✅ when it matches the live source at 1440px **and** 390px. Mark ⚠️ for a known, accepted difference (note it). Mark ❌ for a defect. Block names refer to [README.md §5](README.md#5-final-list-of-blocks-and-variants).

## A. Global (every page)

| # | Check | BSC | Stellarus |
| --- | --- | --- | --- |
| A1 | The theme is right on first paint: no flash of the other brand's colors or fonts | ☐ | ☐ |
| A2 | Fonts: BSC and Ascendiun use Fieldwork (Light, Light Italic, DemiBold; self-hosted, client files; client decision November 2026, replacing the Adobe Fonts kit `wcg8bju`); Stellarus uses Inter, Space Grotesk and JetBrains Mono. Fallbacks don't shift the layout. | ☐ | ☐ |
| A3 | Header (desktop): BSC has the utility row (Pay my premium, Employers, Brokers, Providers), logo + "Careers", 5 items, the "Life at Blue Shield" dropdown (Our people, Our workplace model, Awards & Recognition → external) and the "Find your next role" CTA. Stellarus has the logo, 7 pill links with Careers active, and the "Start the Conversation" CTA with a glow. | ☐ | ☐ |
| A4 | Header (mobile, below 992px): burger, menu or drawer opens and closes, Escape closes it, focus returns to the burger, the dropdown is reachable | ☐ | ☐ |
| A5 | Footer: BSC has the logo, fair-hiring text with 5 links, Our company (5), Legal notices (4, including "Cookie preferences", which opens OneTrust), 4 social icons, the black utility bar and the disclaimer. Stellarus has the blurb with the Ascendiun link, Platform (7), Company (5), Connect (2) and the copyright. | ☐ | ☐ |
| A6 | OneTrust (only these 2 files; no BSC wrapper, no GA4): `OtAutoBlock.js` loads before any other third-party tag; `otSDKStub.js` loads with domain script `019878d6-0d4b-7b81-b399-94a1c6d2e133`; the banner appears; "Cookie preferences" reopens it; consented scripts load only after consent | ☐ | ☐ |
| A7 | No hard-coded colors or font stacks in block CSS (`npm run lint` passes, including the token rules) | ☐ | ☐ |
| A8 | `npm run lint` (ESLint + Stylelint) passes with no warnings | ☐ | ☐ |
| A9 | Page metadata: title, description, og:image, canonical on the production host (never the source's UAT host); `theme` set; `nav` / `footer` point at the right brand fragments | ☐ | ☐ |
| A10 | Lighthouse mobile performance ≥ 90 on home, one landing page, the listing and one story | ☐ | ☐ |
| A11 | Keyboard: visible focus ring on every link, button, input and select; skip link | ☐ | ☐ |
| A12 | Redirects: `/blog/authors` and `/blog/search` → `/blog`; account pages are out of scope (no redirects) | ☐ | n/a |
| A13 | 404 page uses the brand theme | ☐ | ☐ |
| A14 | The preview link `{branch}--aca-careers-eds--Nehaadobe.aem.page/{path}` is in the PR | ☐ | ☐ |
| A15 | Authoring: the block picker lists every block variant with a description; typing `/` in the article-list option cells offers 2/3/4, Light/Tinted/Dark, Yes/No; story metadata Roles/Topics offer the taxonomy values (multi-select); section-metadata style offers centered/highlight/narrow/dark; templates insert a complete page | ☐ | ☐ |

## B. BSC pages

### B1. `/` (Homepage)

| # | Section | Block | Check |
| --- | --- | --- | --- |
| 1 | Hero | `hero (home)` | ☐ Full-bleed HQ photo, 480px tall · ☐ uppercase display headline in white, max 450px · ☐ "Find Your Next Role" → Oracle CX_1003 · ☐ the image is the LCP and loads eagerly |
| 2 | Intro | default, `centered` | ☐ H2 "Help us shape the future of health care" · ☐ paragraph |
| 3 | Gallery | `gallery` | ☐ 3 photos, the middle one wider · ☐ photos are not clickable (no lightbox, no link) |
| 4 | Feature cards | `cards (feature-links)` | ☐ 3 white cards overlapping the gallery's lower edge on desktop · ☐ radius 16px, shadow · ☐ links: Life at Blue Shield, Our people (`/blog`), Serving our communities (citizenship site) |
| 5 | Why work with us | default H2 + 2 × `quote` | ☐ round 94px portraits · ☐ quotes side by side on desktop, stacked on mobile · ☐ hidden "google-site-verification" text **not** present |
| 6 | Find Your Next Role | `banner (locations)` | ☐ navy `#014d83` band with the CA map · ☐ 3 paragraphs · ☐ white button "Search open positions" with navy text → Oracle (`utm_medium=jobshare`) |
| 7 | Feedback poll | — | ☐ Not present (out of scope) |

### B2. `/life-at-blue-shield`

| # | Section | Block | Check |
| --- | --- | --- | --- |
| 1 | Header | `hero (page)` | ☐ uppercase H1 · ☐ 2 subtitle paragraphs at 20/30 · ☐ image with an 80px bottom-left radius · ☐ mobile: image stacks |
| 2 | Our mission and values | default, `highlight` | ☐ `#edf6f9` panel, radius `20px 0`, centered |
| 3 | Values videos | `cards (video-tiles)` | ☐ 3 portrait tiles with play icon and blue caption bar (Human, Honest, Courageous) · ☐ each opens its YouTube video in a modal · ☐ modal closes with Escape |
| 4 | Job banner | `banner (image-cta)` | ☐ HQ image, centered white H2 "View our job opportunities" · ☐ "Find your next role" button |
| 5 | — | — | ☐ The empty source `<h1>` is **not** migrated |

### B3. `/life-at-blue-shield/our-workplace-model`

| # | Section | Block | Check |
| --- | --- | --- | --- |
| 1 | Header | `hero (page)` | ☐ title, subtitle, image |
| 2 | Rows | `columns (alternating)` | ☐ row 1 image left, row 2 image right · ☐ "Human: / Honest: / Courageous:" bold lead-ins · ☐ stacked on mobile, image first |

### B4. `/a-culture-of-belonging`

| # | Section | Block | Check |
| --- | --- | --- | --- |
| 1 | Header | `hero (page)` | ☐ long subtitle paragraph |
| 2 | Photos | `gallery` | ☐ 3 photos, not clickable (the source links are empty) · ☐ meaningful alt text |
| 3 | ERGs | default, `centered` + `narrow` | ☐ H2 + 2 paragraphs · ☐ ERG logo image with alt text listing all 9 groups |

### B5. `/growth-development`

| # | Section | Block | Check |
| --- | --- | --- | --- |
| 1 | Header | `hero (page)` | ☐ two-line H1 |
| 2 | Statement | `banner (statement)` | ☐ `#0071bc` band, white 24px text, max 960px |
| 3 | Photos | `gallery` | ☐ 3 photos, not clickable |
| 4 | Our Internship Program | default H2 + `columns (alternating)` | ☐ image with play button opens the video · ☐ list of 5 (the duplicated item is kept as on the source unless the business says otherwise) · ☐ "View our current internship opportunities" link |
| 5 | Growth & development stories | default H2 + link + `article-list` | ☐ 3 cards, in the source order · ☐ the external card opens news.blueshieldca.com · ☐ "View More Stories" → `/blog?topic=growth-and-development` with the filter applied |

### B6. `/total-rewards`

| # | Section | Block | Check |
| --- | --- | --- | --- |
| 1 | Header | `hero (page)` | ☐ |
| 2 | Our promise to our employees | default + `cards (icon-tiles)` | ☐ 8 tiles: icon, title (18/600), text · ☐ 3 per row on desktop, 1 on mobile |
| 3 | Photos | `gallery` | ☐ |
| 4 | Health and well-being | default + `cards (icon-tiles)` | ☐ 3 tiles |
| 5 | Photos | `gallery` | ☐ |
| 6 | Career growth and development | default + `cards (icon-tiles)` | ☐ 5 tiles |

### B7. `/how-to-get-hired`

| # | Section | Block | Check |
| --- | --- | --- | --- |
| 1 | Header | `hero (page)` | ☐ |
| 2 | We want you to succeed | default + `cards (icon-tiles)` | ☐ description line · ☐ 6 steps · ☐ "talent community" link in step 1 |
| 3 | FAQ | default H2 + `accordion` | ☐ 11 questions in the source order · ☐ `#003b5c` on `#f4f4f4`, radius 8px · ☐ hover/focus: navy background, white text · ☐ only one answer open at a time (as on the source) · ☐ open/close with keyboard · ☐ answer links (Oracle careers site, accommodation form) work |

### B8. `/events`

| # | Section | Block | Check |
| --- | --- | --- | --- |
| 1 | Header | `hero (page)` | ☐ title, subtitle, image · ☐ empty body, as on the live site |

### B9. `/blog` (Our people)

| # | Check |
| --- | --- |
| 1 | ☐ `hero (page)`: "Our people", 2 subtitle paragraphs, image |
| 2 | ☐ Filter panel: `#edf6f9`, radius `20px 0 20px 0` · ☐ "Search Blogs" input + search button · ☐ Roles and Topics selects list every value in the library `options` tab (`roles`, `topics`) in authored order (all 15 Roles, including the 5 with no stories yet) · ☐ "Clear Filters" · ☐ Sort By (Newest, Oldest, Title A–Z, Title Z–A) |
| 3 | ☐ 115 stories in total: page 1 starts with "The Mammogram That Saved Her Life…" (Oct 13, 2026); 13 pages of 9 |
| 4 | ☐ Search for "intern" returns the intern stories · ☐ Topic "Growth and Development Programs" returns 9 · ☐ Role "People and Engagement" returns 90 · ☐ Roles + Topics combined with AND |
| 5 | ☐ External cards (39) open their external URLs · ☐ same-domain cards (76) open `/blog/<slug>` |
| 6 | ☐ URL parameters `?q= &role= &topic= &sort= &page=` restore the state on reload and Back · ☐ legacy `?c=29653` maps to Topic "Growth and Development" |
| 7 | ☐ Card: 230px image, blue 24px title, grey date, description · ☐ hover ring · ☐ keyboard focus visible |
| 8 | ☐ Empty result message when nothing matches |

### B10. `/why-relocate`

| # | Check |
| --- | --- |
| 1 | ☐ Display-font uppercase H1 with no hero image · ☐ intro paragraph · ☐ numbered list of 10 |

## C. Blog stories (76): run on every story

The per-story expectations (hero type, number of authors, images, embeds, callouts, table, number of More Stories cards) are in [`data/blog-stories-migrate.csv`](data/blog-stories-migrate.csv). Check each story against its row.

| # | Check |
| --- | --- |
| C1 | ☐ URL is unchanged: `/blog/<slug>` |
| C2 | ☐ Roles and Topics links match the CSV and open the filtered listing (not the source's broken `None?c=` links) |
| C3 | ☐ Uppercase display H1 · ☐ date in "Month DD, YYYY" format |
| C4 | ☐ Authors: count, name, position and photo (10 stories have photos) match the source · ☐ stories with no author show no empty byline |
| C5 | ☐ Share: LinkedIn, Facebook and X share **this** page's URL |
| C6 | ☐ Hero: image (63), MP4 video with poster and controls (12; MP4 replaced with the Document Authoring copy), or none (1, `finding-purpose-and-passion-at-work`) |
| C7 | ☐ Lead paragraph bold (8 stories) |
| C8 | ☐ Inline images in the right order, with alt text; captions as italic text (3 stories) · ☐ floated images use `image (left/right)`, text wraps beside them from 900px and they stack on mobile (25 stories) |
| C9 | ☐ Callout boxes in the `highlight` style (9 stories) |
| C10 | ☐ YouTube embeds load lazily (13 stories, 16 embeds) |
| C11 | ☐ `how-sarah-miller-…`: single-cell table shown as a bordered callout |
| C12 | ☐ "Find Your Next Role" button → Oracle (66 stories) |
| C13 | ☐ More Stories: the same cards in the same order as the source, minus links to the unpublished Juneteenth story (7 stories) · ☐ tinted ground · ☐ no date, description shown |
| C14 | ☐ Story appears in the query index with title, description, image, date, roles, topics |
| C15 | ☐ Body links that pointed to `careers.blueshieldca.com/...` become relative |

## D. Stellarus `/stellarus/careers`

| # | Section | Check |
| --- | --- | --- |
| D1 | Backdrop | ☐ `#070B14` background with blue, violet and cyan orbs, starfield and grain, all done in theme CSS (no authored images) · ☐ respects `prefers-reduced-motion` |
| D2 | `hero (centered)` | ☐ "CAREERS" eyebrow (mono, 11px, uppercase, tracking 0.18em) · ☐ H1 "Help us fix healthcare." in Space Grotesk 700, 43px desktop / 29px mobile · ☐ 2 paragraphs, 18/30.6, `#B6C2DC`, max 760px · ☐ "View All Open Positions →" primary pill → Oracle CX_6001 · ☐ "Submit Your Resume" glass pill → recsolu form · ☐ buttons stack on mobile |
| D3 | Header / footer | ☐ links point to `https://www.stellarus.com/...` · ☐ footer anchors fixed (README §9 item 8) |
| D4 | Theme | ☐ Every color comes from `themes/stellarus.css` · ☐ no BSC font is requested |

## E. Ascendiun (theme slot)

| # | Check |
| --- | --- |
| E1 | ☐ `themes/ascendiun.css` exists and defines every semantic token |
| E2 | ☐ A test page with `theme: ascendiun` renders every block without missing tokens |
