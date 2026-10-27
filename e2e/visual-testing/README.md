# Visual regression tests

Compares the migrated Edge Delivery Services site (local preview or a deployed preview)
against **approved reference screenshots captured from the LIVE site**
(https://careers.blueshieldca.com). This is visual regression testing only: no functional E2E,
no Storybook.

- References are captured **only** from LIVE, **only** with `npm run visual:baseline`.
- Comparisons visit **only** the site under test and **never** write or update references.
- A missing reference fails and prints the exact capture command.

## Requirements

- Node 20+ (repo CI uses Node 24) and npm.
- Playwright **1.58.2** with its Chromium build (Chrome for Testing 145.0.7632.6).
- A self-contained package: nothing here is added to the site's dependencies. The folder is excluded from the published site (`.hlxignore`) and from the site's lint (`.eslintignore`).

```sh
cd e2e/visual-testing
npm ci
npm run install:browsers      # downloads Chromium for this Playwright version
# on a fresh Linux machine you may also need: npx playwright install-deps chromium
```

## Running the site under test

- **Local preview:** from the repo root, `npx -y @adobe/aem-cli up --html-folder content`. It serves
  imported pages at `http://localhost:3000/content/<path>`. For localhost the suite applies the
  `/content` prefix automatically (`/` → `/content/index`); override with `VISUAL_ACTUAL_PATH_PREFIX`
  (set it to an empty string to disable).
- **Deployed preview:** `https://develop--aca-careers-eds--nehaadobe.aem.page`. Pages must be
  uploaded to Document Authoring and previewed there.

## Commands

```sh
# 1. Capture approved LIVE references (explicit; needs the LIVE URL)
VISUAL_REFERENCE_URL=https://careers.blueshieldca.com npm run visual:baseline

# 2. Compare the local preview
VISUAL_BASE_URL=http://localhost:3000 npm run visual

# 2b. Compare the deployed develop preview
VISUAL_BASE_URL=https://develop--aca-careers-eds--nehaadobe.aem.page npm run visual

# Only pages / only blocks
VISUAL_BASE_URL=http://localhost:3000 npm run visual:pages
VISUAL_BASE_URL=http://localhost:3000 npm run visual:blocks

# Filter by tag and viewport (works the same for visual:baseline)
VISUAL_BASE_URL=http://localhost:3000 npm run visual -- --grep @home --project=mobile-390

# Open the HTML report (expected / actual / diff images per failure)
npm run visual:report
```

| Variable | Used in | Meaning |
|---|---|---|
| `VISUAL_REFERENCE_URL` | baseline only | LIVE origin, e.g. `https://careers.blueshieldca.com` (origin only, no path) |
| `VISUAL_BASE_URL` | compare only | Site under test (origin only) |
| `VISUAL_ACTUAL_PATH_PREFIX` | compare | Path prefix on the site under test (default `/content` for localhost, otherwise none) |
| `VISUAL_ACTUAL_PROFILE` | compare | Markup of the site under test: `eds` (default) or `live` (automatic when `VISUAL_BASE_URL` is the LIVE origin). Selects per-side selectors. |
| `VISUAL_EDGES=1` | both | Adds widths 1px below each breakpoint: 575, 767, 899, 991, 1199, 1399 |
| `VISUAL_WORKERS` | both | Parallel workers (default 2, to keep the LIVE request rate low) |

The suite refuses to start on invalid or missing URLs and never falls back from one origin to another.
Run it through the npm scripts: `visual/run.js` sets the mode and rejects `-u` / `--update-snapshots`.

## Viewports

These come from the site's real breakpoints (`blocks/*/*.css`, `styles/*.css`, `blocks/header/header.js`).

| Project | Size | Why |
|---|---|---|
| `mobile-360` | 360×780 | small phone (phone emulation + touch) |
| `mobile-390` | 390×844 | typical phone |
| `tablet-768` | 768×1024 | wider header/footer gutters; utility links in one row |
| `tablet-900` | 900×1024 | block layouts change (cards, columns, banner…) |
| `laptop-1024` | 1024×768 | utility row visible; still the menu-button header (touch) |
| `desktop-1280` | 1280×800 | desktop navigation (≥1200px) |
| `desktop-1440` | 1440×900 | design width |
| `wide-1600` | 1600×900 | above the 1400px wide-layout breakpoint |

Every project uses Chromium with `deviceScaleFactor: 1`, the light color scheme, `en-US`,
`America/Los_Angeles`, and reduced motion.

## Inventories

**Pages** (`visual/pages.js`) are full-page screenshots:

| Case | Tags | Path |
|---|---|---|
| `home` | `@home` | `/` |
| `total-rewards` | `@total-rewards @landing` | `/total-rewards` |
| `life-at-blue-shield` | `@life @landing` | `/life-at-blue-shield` |
| `how-to-get-hired` | `@hiring @landing` | `/how-to-get-hired` |
| `growth-development` | `@growth @landing` | `/growth-development` |
| `why-relocate` | `@why-relocate @content` | `/why-relocate` |
| `story-interns-2026` | `@story` | `/blog/reflections-from-our-2026-interns` |

Readiness depends on the side:
- **LIVE:** the document is complete and `#site_content` is visible.
- **Migrated site:** `main` is visible, `body.appear` is set, and every section and block reports `loaded`. The header and footer are checked when present.

**Blocks and states** (`visual/blocks.js`): the two sites use different markup, so selectors are mapped per side.

| Case | LIVE | Migrated | Viewports | Capture |
|---|---|---|---|---|
| `header` | `#site_header` | `body > header` | all | element |
| `header-dropdown-open` | hover `.header-nav_item.subitems > a` | hover `.nav-drop > a` | ≥1200 | header + open dropdown |
| `mobile-menu-open` | click `button.header-navCaller` | click `.nav-hamburger button` | ≤1199 | viewport |
| `footer` | `#site_footer` | `footer .footer` | all | element |
| `home-hero` | `#site_content > .hero` | `main .hero.home` | all | element |
| `icon-tiles` | `.tileIcons` with "Compensation" | `.cards.icon-tiles` with "Compensation" | all | element |
| `faq-first-open` | click the `.faq-caller` "best way to apply" → one `.faq-item.opened` | click the `summary` "best way to apply" → one `details[open]` | all | element |

How block cases behave:
- **Exact matches:** every selector must match exactly the expected number of elements (default 1).
- **Read-only interactions:** only hover and click are used; nothing is ever submitted.
- **State checks:** the open or expanded state is asserted before capture.
- **Pointer:** the pointer is parked at (0,0) unless the case tests hover.
- **Padding:** component padding is included in the capture.

**Not covered:**
- **Story article header:** the hero sits outside the header on LIVE and inside it on the migrated site, so the regions aren't comparable. The page case covers it.
- **Blog listing and Authors:** their content changes and depends on the site index.
- **Search, forms and account flows:** not part of this site's scope.

## Determinism

Every case runs the same preparation on both sides (`visual/stabilize.js`):

1. Block the approved hosts below before navigating.
2. Navigate and check the status, final origin and path. A 429 or 503 is retried up to 3 times, honoring `Retry-After`, within a 60s budget.
3. Wait for the application to be ready.
4. Turn off animations, transitions, the text caret and smooth scrolling, and pause any audio or video.
5. Scroll in bounded steps to trigger lazy loading. Fail if the page keeps growing past 40,000px.
6. Wait for every rendered image and for the web fonts in use. Any broken image or required font that failed to load is an error.
7. Return to the top and park the pointer.

**Blocked hosts** (`visual/config.js`), applied to both sides:

| Host | Why |
|---|---|
| `cdn.cookielaw.org`, `geolocation.onetrust.com` | OneTrust consent banner on LIVE; it overlays content. This is the explicit consent-banner exclusion. |
| `www.googletagmanager.com`, `analytics.google.com`, `www.google-analytics.com`, `stats.g.doubleclick.net` | Analytics |

Fonts (`use.typekit.net`, `p.typekit.net`), images (`iprsoftwaremedia.com`) and jQuery stay allowed.

**Masks** preserve layout and paint a solid box:

| Where | What | Why |
|---|---|---|
| All LIVE pages | `.footer-feedback, #poll` (optional) | "[+] Feedback" poll widget: third-party and out of scope |
| Story, LIVE | `section.contentSection.blue_bottom` | "More Stories" lists the latest stories, which change |
| Story, migrated | `.section.related-stories` (optional) | Same band; empty without the site index |

## Tolerances

- **Defaults:** per-pixel threshold 0.2, `maxDiffPixelRatio` 0.01.
- **Size:** any difference in screenshot size fails.
- **No retries:** a failed comparison is never retried.
- **Overrides:** per-case overrides (`tolerance: { …, reason }`) require a documented reason. None are configured.

## Baselines: storage, metadata and refresh

**Layout:** `visual/__screenshots__/<pages|blocks>/<case>/<viewport>.png` plus `baseline-meta.json`. The tested host is never part of the path.

**Metadata:**
- the reference origin;
- per-file capture time and reference URL;
- Playwright and browser versions, and OS/platform;
- a settings fingerprint and a reference-side case fingerprint;
- the viewport size and a SHA-256 checksum for each file.

**Comparisons fail as a "stale baseline"** when:
- the capture settings changed;
- the Playwright or browser version differs;
- the case's LIVE-side definition changed;
- the viewport size changed;
- the checksum doesn't match.

The error message gives the recapture command.

**Capture safety:**
- **Staging:** screenshots are written to a staging folder first.
- **All or nothing:** they're promoted into the approved set only when the whole run passes, so a failed or interrupted capture adds or changes nothing.
- **Partial recaptures:** filtered recaptures, such as one case or one viewport, merge into the existing set.
- **Incompatibility:** a capture from a different origin, or with incompatible settings or browser, is refused. To replace the whole set, delete `visual/__screenshots__` and capture again.

**Storage: local only.** References are git-ignored and captured once per machine. Rendering depends on the OS, installed fonts and browser build, so references are only comparable on the platform that captured them. The metadata records which platform that was. There is no CI workflow yet, and references are never regenerated automatically.

**Approval and refresh:**
1. Capture the references.
2. Review the PNGs.
3. When LIVE content changes intentionally (for example, LIVE removed the Twitter icon from its footer), recapture only the affected cases:
   `VISUAL_REFERENCE_URL=https://careers.blueshieldca.com npm run visual:baseline -- --grep @footer`

## Results

- **Console:** the list reporter, then a summary with failures classified as `navigation`, `readiness`, `target`, `missing-baseline`, `stale-baseline`, `size` or `pixels`.
- **Report:** `playwright-report/index.html` (open with `npm run visual:report`), with expected/actual/diff images for each failure.
- **Machine-readable results:** `test-results/results.json` and `test-results/visual-summary.{json,md}` (case, viewport, status, URLs, failure kind, diff ratio).
- **Traces:** kept for failures under `test-results/artifacts/`.

A baseline capture prints "Baseline capture: N reference screenshot(s) approved". That's a capture, not a passing regression test.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `[missing-baseline]` | Run the printed `visual:baseline` command (with the same `--grep`/`--project`). |
| `[stale-baseline]` | Settings, browser or case definition changed since capture. Recapture the affected cases, or delete `visual/__screenshots__` and recapture everything. |
| `[readiness] Broken images` | A rendered image failed to load on the site under test, e.g. Document Authoring image URLs (`content.da.live`) return 401 to the local preview. |
| `[readiness] Web fonts failed` | A font used by rendered text failed to load. Adobe Fonts only serves allowed domains; check the kit's domain list. |
| `[navigation] HTTP 404` | The page doesn't exist on the target, e.g. not yet uploaded and previewed in Document Authoring. |
| `[size]` / `[pixels]` | A real visual difference. Open the report's diff. If LIVE content changed, review and recapture. |
| HTTP 429/503 | Rate limiting; the suite retries within a budget. Lower `VISUAL_WORKERS`. |
| Executable doesn't exist | Run `npm run install:browsers`. |
| Differences only on another machine | Fonts and OS rendering differ. Capture references on the machine (or container image) used for comparison. |
