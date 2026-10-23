# careers.blueshieldca.com: Site Discovery and EDS Effort Estimate Plan

## Goal
Find every page and layout on **https://careers.blueshieldca.com/**, catalog its templates, blocks and variations, and produce two deliverables in the **same format as the attached reva.toryburch.com references**:

1. **`dashboard.html`**: the functional analysis, with the same tab structure: Overview · Templates · Blocks & Variations · Template → Block Map · Journeys & Forms · Observed Behaviors · Integrations · All URLs · Detailed Reports link.
2. **`estimates.html`**: the development effort estimate, with the same header stats, warning cards, numbered section tables, rate card, grand total and assumptions.

Both reports will use the same visual style as the attachments: the same CSS tokens, stat tiles, cards and pills. Their numbers will come from what is actually found on the site.

## Approach

### Phase 1: URL discovery
- Read `robots.txt` and the sitemap(s). Careers sites often have separate job sitemaps (for example `/sitemap_index.xml` or `/jobs-sitemap.xml`).
- If the sitemap is missing or incomplete, crawl the site, including job search results pages, job detail pages, category/location landing pages, life-at/benefits/culture pages, the talent community, and the FAQ, privacy and accessibility pages.
- Check which host each link goes to (the careers site vs. an outside system for applications). This tells us where EDS ends and an integration begins.
- Classify URLs into **content pages** (to migrate) and **data-driven pages** (job listings and job details, to integrate rather than migrate). Thousands of job detail URLs will be grouped into one template, not counted one by one.

### Phase 2: Template and block cataloging
- Group URLs into page templates by layout similarity (expected: Home, Content/Culture, Job Category landing, Location landing, Job Search Results, Job Detail, Talent Community/Join, FAQ, Legal/Utility, Error/404 and similar).
- Run a page analysis on one or more representative pages per template to find blocks, variations and default content.
- Name block variants, reusing an existing one when it is at least 80% similar, so the catalog lists unique blocks and variations, not raw counts.
- Capture header/nav (including mega-menu and mobile behavior) and footer as separate global blocks.
- Record **Observed Behaviors**: carousels, accordions, tabs, filters, typeahead, modals, video, sticky elements, lazy loading, cookie banner, chatbot.

### Phase 3: Integrations
Identify each third-party system from network requests, scripts and outbound links, and check what it is used for. Candidates to confirm, not assume:
- **ATS or recruiting platform** that powers job search, job detail and apply (for example Workday, Phenom, iCIMS, SuccessFactors or Avature). This is the job data feed, the job search API and the apply hand-off.
- **Job search and filtering**: keyword, location, radius, category, facets and pagination. Decide between a client-side API and an indexed JSON feed in EDS.
- **Job alerts / talent community sign-up**: form endpoint, CRM and email opt-in.
- **Location and maps**: geolocation, map embeds.
- **Analytics and tags**: GTM, GA4, Adobe Analytics, recruitment marketing pixels, LinkedIn Insight.
- **Consent management**: OneTrust or similar.
- **Chatbot or recruiting assistant**, if present.
- **Video and media**: YouTube, Vimeo or Brightcove embeds.
- **SEO structured data**: `JobPosting` schema.org markup on job detail pages, and the Google for Jobs requirement.
- **Social sharing, reviews and employer-branding widgets**, if present.

### Phase 4: Journeys and forms
Map the key candidate journeys:
- Search → Results → Job Detail → Apply (handed off to the ATS)
- Browse by category or location
- Join talent community / set up job alerts
- Content browsing (culture, benefits, DEI, students/early careers)

Then list every form, with its fields, where it submits, and whether it should be rebuilt in EDS or embedded.

### Phase 5: Effort estimate (same sections as the reference)

| # | Section | What it will cover |
|---|---|---|
| 1 | Project setup & environment | Repo/boilerplate, local dev and CI, site config, global styles and design tokens (Blue Shield of California brand), core decoration, header/footer scaffolding |
| 2 | Page templates | Template scaffolding × number of templates found, plus responsive/layout QA |
| 3 | Block development | One row per block, with variation count, mapping to a standard EDS block, and a High/Medium/Low complexity pill |
| 4 | Content migration | Import script, parsers, transformers, template mapping, bulk import, validation tooling, remediation, redirects, localization if any |
| 5 | **Third-party integrations** (called out clearly) | One row per confirmed integration: ATS job feed/search API, apply hand-off, job alerts/talent community, analytics/tags, consent, chatbot, maps, JobPosting schema |
| 6 | Cross-cutting quality / **validation** (called out clearly) | Responsive, accessibility (WCAG), Core Web Vitals, SEO/metadata, cross-browser, E2E tests (search/filter/apply), UAT support, post-import visual validation |
| 7 | Platform / backend services (only if needed) | For example a job-feed sync service (App Builder / scheduled job → EDS JSON index), search proxy, caching. Left out if the ATS API can be called directly from the client |

**Rate card:** same basis as the reference: High 18h · Medium 11h · Low 6h base, +2h per extra variation. It will be adjusted for a marketing/careers site rather than the SPA calibration, and the reference card will state this.

**Totals:** base hours, +15% contingency, person-days (8h per day) and person-weeks, shown in the 4 stat tiles.

**Warning cards:** "Estimate basis: manual review required" and "Scope: careers.blueshieldca.com", with assumptions listed at the end (for example: ATS licence in place, apply flow stays on the ATS, job content not authored in EDS, content authoring by the client team).

### Phase 6: Output
- Generate `dashboard.html` and `estimates.html` with the attachments' styling, and cross-link them through the top nav.
- Optionally add a `reports/index.html` hub with per-template detail pages, matching the reference link.
- Reports are saved only in the local project workspace (kept out of the served site via `.hlxignore`). Nothing is pushed, previewed or published.

## Checklist
- [ ] Discover all URLs (robots.txt, sitemaps, crawl fallback) and separate content pages from job detail and search pages
- [ ] Check which outbound domains are used (ATS/apply host, other subdomains)
- [ ] Group URLs into page templates and pick representative pages
- [ ] Analyze representative pages per template for blocks, variations and default content
- [ ] Name block variants and build a unique block/variation catalog with complexity ratings
- [ ] Analyze global header/nav (desktop, mobile, mega-menu) and footer
- [ ] Record observed behaviors (carousels, accordions, filters, typeahead, modals, video, consent banner, chatbot)
- [ ] Identify and confirm every third-party integration and what it does
- [ ] Map candidate journeys and list all forms (fields, submit targets, rebuild or embed)
- [ ] Build the Template → Block map
- [ ] Calculate effort for sections 1–7 using the rate card; total with 15% contingency, person-days and person-weeks
- [ ] Write the assumptions and the warning cards for estimate basis and scope
- [ ] Generate `dashboard.html` in the reference format (all tabs, including All URLs)
- [ ] Generate `estimates.html` in the reference format (integrations, blocks, templates, migration and validation called out clearly)
- [ ] (Optional) Generate the `reports/index.html` hub with per-template detail
- [ ] Summarize the key numbers and open questions for you

## Notes
- Running this needs **Execute mode**. Plan mode only allows read-only work.
- If the site blocks automated access, discovery will use a fallback scraper. Any page that can't be reached will be flagged in the estimate-basis card.
- **Optional:** if the talent-community or job-alert forms should be rebuilt as native EDS forms rather than embedded from the ATS, a forms migration add-on can be enabled to help estimate and convert them. Say so if you want it turned on.
