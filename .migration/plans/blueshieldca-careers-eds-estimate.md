# careers.blueshieldca.com: AEM Edge Delivery Services Migration Plan

## Goal
Migrate **https://careers.blueshieldca.com/** to **AEM Edge Delivery Services with Document Authoring**. The scope follows the agreed SOW and the scope analysis we've already built (estimate: 550 dev hours). This run covers the **full site in SOW scope**:

- the **4 SOW templates**: Homepage, Landing, Content page, Blog article
- the **17 reusable blocks** (12 core, 5 custom), with variants delivered as block options
- global design, header and footer
- as-is content migration of about **34 pages**, including the **22 most recent blog stories**

Everything happens in the local workspace and on a feature branch. Nothing is uploaded to Document Authoring, previewed remotely or published unless you ask.

## Starting point (already done)
- **URL inventory:** 95 sitemap URLs grouped into 8 page types, mapped to the 4 SOW templates. Saved as `lists/urls.csv`.
- **Block inventory:** 25 components observed on the live site, consolidated into 17 SOW blocks. Saved as `lists/sow-blocks.csv`.
- **Screenshots:** each component, each of its variations, and a full-page capture per template, all from the live site.
- **Importer page templates:** `tools/importer/page-templates.json`, emitted from the site catalog. It needs remapping from the 4 automated layout clusters to the 4 SOW templates.
- **Project:** a Document Authoring project (`content.da.live/nehaadobe/aca-careers-eds`) on aem-boilerplate. Existing boilerplate blocks are reused: hero, cards, columns, header, footer, fragment.

## Scope

### Pages to migrate (about 34)
| SOW template | Pages |
|---|---|
| Homepage | `/` |
| Landing (7) | `/a-culture-of-belonging`, `/growth-development`, `/total-rewards`, `/how-to-get-hired`, `/life-at-blue-shield`, `/life-at-blue-shield/our-workplace-model`, `/events` (empty today, migrated as-is) |
| Content page (3) | `/blog` (Our People listing; `/blog/search` becomes listing URL state), `/blog/authors`, `/why-relocate` |
| Blog article (22) | The **22 most recent stories by publish date**, picked during the run. This is a placeholder selection until Blue Shield sends its list, and easy to swap. |

### Not migrated (added to the redirect map; Blue Shield implements the 301s)
- 55 older stories → `/blog`
- `/login`, `/registration`, `/password_recover`: account flows are out of scope and handled by Oracle Recruiting Cloud
- `/alerts`, `/confirm`, `/file`: these return 404 today
- Legacy slugs found in the canonical tags (`/diversity-equity-inclusion`, `/university-programs`, `/our-benefits-and-programs`, `/workplaces-of-the-future`), `/blog/search?…` and `?page=` URLs
- Out of scope per the SOW: the feedback poll, job alerts, account forms, GA4, and the news.blueshieldca.com feed (its 39 stories are kept as static listing entries)

### Blocks (17)
| Core (12) | Custom (5) |
|---|---|
| Header (desktop nav + dropdown, mobile off-canvas) · Footer · Hero (home, page header, title only) · Cards (related stories, story grid, feature links, icon tiles, ERG logos, video tiles, authors) · Columns (inline text-image, alternating rows, text over image) · Accordion (FAQ) · Embed (YouTube facade) · Modal (video and image dialog) · Quote · Table · Search (built-in) · Fragment | Article Header (auto-blocked from metadata, with or without hero image) · Social Share · Image Gallery (lightbox) · Banner (statement, image + CTA, locations map band) · Story Listing (Role/Topic filters, sort, paging) |

### Integrations (SOW-listed only)
- **Oracle Recruiting Cloud:** deep links from every job button, including keyword/location search links and the `utm_medium=jobshare` tag.
- **OneTrust:** the consent script loads late, with tracking and YouTube held until consent is given. The footer's "Cookie preferences" link reopens it.
- **Adobe Customer Journey Analytics:** page tagging that loads late. **Needs Blue Shield's CJA setup and credentials;** until then it's stubbed and flagged.
- **Built-in search:** a site index with Role, Topic, author, date and image columns. It powers the search block, the story listing and the related-stories cards.
- **Document Authoring:** the preview → publish workflow and permissions.
- **Media:** images from iprsoftwaremedia.com and `/_gallery/get_file` re-hosted into Document Authoring. PDFs stay on blueshieldca.com.

## Approach

### Phase 0: Branch and setup
- Create a working branch (for example `feature/site-migration`) from `main`. Branch previews will be at `https://feature-site-migration--aca-careers-eds--nehaadobe.aem.page/`, which this repo requires in any pull request.
- Confirm the project type and block library, and record them in the migration project file.
- Set up the shared multi-site repo configuration, with Blue Shield Careers configured now and Stellarus/Ascendiun to be added later.

### Phase 1: Design foundation
- Extract design tokens from the live site: proxima-nova via Adobe Fonts kit `wcg8bju` with a size-matched fallback font, plus colours, spacing, buttons, links and 3 breakpoints.
- Set up section styles (centered title, blue band, white text) and default-content styles for story text.

### Phase 2: Header and footer
- **Header:** utility bar, logo + "Careers" wordmark, and horizontal desktop nav with the "Life at Blue Shield" dropdown and "Find your next role" button. On mobile, a hamburger opens an off-canvas menu with a close button. Navigation is authored as a nav fragment.
- **Footer:** "Fair hiring practices" copy with the PDF links and the Qualtrics accommodation link, the "Our company" and "Legal notices" link columns, the "Cookie preferences" link, social icons, the bottom utility nav and the copyright line. Authored as a footer fragment.
- Validate desktop and mobile against the live site screenshots.

### Phase 3: Page analysis and block mapping per template
- Analyze one representative page per SOW template: `/`, `/total-rewards` (plus `/life-at-blue-shield` and `/how-to-get-hired` for video tiles and the FAQ), `/blog` and `/blog/perseverance-in-motion`.
- Map each section to the 17 blocks and their options, and update `page-templates.json` to the 4 SOW templates.

### Phase 4: Block development
- Build or extend the 17 blocks with the variants delivered as block options. Use plain JS with no jQuery, Owl, lightGallery or Magnific, and keep each block's CSS scoped to its own block.
- Auto-block the Article Header from page metadata (Role, Topic, date, authors, hero image).
- Build the Story Listing on the site index: search, Role (15) and Topic (8) filters, 4 sort orders, 9 per page, and filter settings kept in the URL. It lists 22 local stories plus 39 external news-site entries.
- Auto-generate the related-stories cards (same Role/Topic, excluding the current story).

### Phase 5: Import infrastructure and content import
- Generate parsers for the content-bearing block options, and transformers for:
  - iPR cleanup (theme wrappers, cBuilder markup, tracking parameters, the stray verification text)
  - section breaks, YouTube links → embeds, and metadata (title, description, OG image)
  - Role/Topic categories, authors and dates
- Bundle one import script per template and run a bulk import of the about 34 pages into the local content folder.
- Re-host media, fix the canonical tags (correct URLs instead of the UAT host) and write the redirect map for Blue Shield.

### Phase 6: Integrations
- Wire the Oracle Recruiting Cloud deep links and UTM conventions.
- Load OneTrust late and gate tracking and YouTube on consent.
- Add the CJA page-tagging scaffold, with events for job-button clicks, search/filter use, video plays and shares (activated once credentials arrive).
- Configure the site index and the Document Authoring publishing workflow.

### Phase 7: Validation
- Score every imported page against its source (text, images, links, metadata) and fix systemic parser gaps.
- Compare blocks and pages visually against the live site, per template and at desktop and mobile widths.
- Check Lighthouse / Core Web Vitals and WCAG 2.1 AA (Lighthouse plus manual keyboard and focus checks), and test in the latest Chrome and Edge.
- Check links (internal, Oracle Recruiting Cloud, PDFs, external stories), confirm the 61 listing entries are present, and check the redirect map.

## Checklist
- [ ] Create the working branch from `main` and confirm the project type and block library
- [ ] Configure the shared multi-site repo (Blue Shield Careers only for now)
- [ ] Extract design tokens, fonts and section styles from the live site
- [ ] Build header (desktop nav + dropdown, mobile off-canvas) and footer as fragments; validate both breakpoints
- [ ] Analyze representative pages for the 4 SOW templates and remap `page-templates.json`
- [ ] Build the 12 core blocks with options (header, footer, hero, cards, columns, accordion, embed, modal, quote, table, search, fragment)
- [ ] Build the 5 custom blocks (article header auto-block, social share, image gallery, banner, story listing)
- [ ] Configure the site index (Role, Topic, author, date, image) for search, listing and related stories
- [ ] Pick the 22 most recent stories by publish date and record the selection
- [ ] Generate parsers, transformers and import scripts per template
- [ ] Bulk-import the ~34 pages into local content; re-host media; fix canonicals
- [ ] Add the 39 news-site stories as static listing entries
- [ ] Wire Oracle Recruiting Cloud deep links, OneTrust (delayed, consent-gated) and the CJA tagging scaffold
- [ ] Write the redirect map (55 excluded stories, account pages, 404s, legacy slugs, query URLs) for Blue Shield
- [ ] Run import validation scoring and remediate flagged pages
- [ ] Run visual comparison per block and template (desktop + mobile) and fix differences
- [ ] Run Lighthouse, accessibility and Chrome/Edge checks
- [ ] Summarize results, open items and the branch preview URL for you

## Open items needing Blue Shield
- The final list of 22 stories. The 22 most recent are used as placeholders.
- CJA data-collection setup and credentials, and the OneTrust domain script on the new domain.
- Confirmation that the feedback poll and job-alerts sign-up are dropped at launch.
- Who implements DNS/CDN and the 301s: this is Blue Shield's responsibility per the SOW, and Adobe supplies the redirect map.

## Notes
- **Running this needs Execute mode.** Plan mode only allows read-only work.
- Work stays local and on the feature branch. Committing, pushing, opening a pull request, uploading to Document Authoring, previewing remotely or publishing happens only when you ask.
- The forms add-on stays disabled, as you chose: forms are out of SOW scope, and the blog search and filters are built as a block.
