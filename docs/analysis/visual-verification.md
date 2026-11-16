# Visual verification: LIVE vs migrated pages (Playwright)

Run: 31 October 2026, after the design migration (previous run, 30 October: 29 of 342 passed), `e2e/visual-testing` (Playwright 1.58.2, Chromium 145, pixelmatch threshold 0.2).
References were captured from the LIVE sites (careers.blueshieldca.com, www.stellarus.com/careers); the migrated
side is each `content/<path>.plain.html` rendered with the project code, its metadata and the local nav/footer.

**Pass rule (strict):** at most 1% of pixels differ and the same screenshot size. Cells show the % of differing
pixels (for different heights: in the shared area) and the height difference of the migrated side.

**Result:** 72 of 342 comparisons pass. Not pixel-perfect yet. 255 of the 270 failures are height differences
(a page or block a few pixels taller or shorter fails even when it looks the same); photo-heavy areas also
differ through image resampling.

**Known remaining gaps:** story lead paragraphs and right-aligned attributions not imported; float widths lost
in import; 6 malformed LIVE stories render 1290px wide; YouTube embeds show a consent-gated thumbnail instead of
the player; story hero MP4s do not show their first frame (preload none); story-listing and growth-stories card
grids (about 22%); Stellarus hero spacing (+88px at 390, +176px at 1440); FAQ and quote spacing on mobile;
image-cta banner at 390 (+26px, a LIVE layout bug not copied); video tiles at 1440 (LIVE tiles overflow, not copied).

## Static pages and Stellarus (full page)

| Page | 360 | 390 | 768 | 900 | 1024 | 1280 | 1440 | 1600 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a-culture-of-belonging | 7.4% (-30px) | 7.5% (-30px) | 16.1% (-5px) | 22.5% (+23px) | 7.7% (-36px) | 14.5% (+5px) | 12.7% (+133px) | 12.2% (+133px) |
| blog | 2.6% (+66px) | 2.6% (+66px) | 19.9% (+91px) | 44.6% (-192px) | 3.6% (+60px) | 4.0% (+60px) | 4.1% (+60px) | 4.1% (+60px) |
| events | 7.7% (-24px) | 7.4% (-24px) | 12.7% (-29px) | 37.5% (-231px) | 16.9% (-78px) | 7.6% (-30px) | 7.2% (-30px) | 7.3% (-30px) |
| growth-development | 9.7% (+10px) | 13.8% (-28px) | 23.3% (+47px) | 36.2% (+111px) | 15.9% (+26px) | 17.5% (+26px) | 22.8% (+56px) | 22.1% (+56px) |
| home | 10.0% (-72px) | 12.8% (-96px) | 9.1% (-72px) | 10.3% (-96px) | 7.9% (-24px) | 8.3% (-24px) | 8.3% (-24px) | 8.2% (-24px) |
| how-to-get-hired | 7.6% (-95px) | 10.7% (-268px) | 6.0% (+11px) | 14.0% (-162px) | 5.1% (-10px) | 3.9% (+19px) | 3.7% (+20px) | 3.5% (+20px) |
| life-at-blue-shield | 29.5% (-77px) | 28.7% (-60px) | 16.9% (-22px) | 25.2% (-45px) | 27.1% (-104px) | 27.6% (-74px) | 22.3% (-54px) | 20.9% (-54px) |
| life-at-blue-shield-our-workplace-model | 24.0% (-142px) | 24.5% (-142px) | 30.4% (-117px) | 49.7% (-581px) | 24.6% (-158px) | 23.5% (-90px) | 18.6% (-60px) | 17.6% (-60px) |
| stellarus-careers | ✅ 0.2% | ✅ 0.0% | 0.0% | 0.0% | ✅ 0.1% | 0.0% (-1px) | ✅ 0.1% | ✅ 0.1% |
| total-rewards | 5.1% (-33px) | 1.1% (+6px) | 9.3% (+31px) | 12.5% (+39px) | ✅ 0.9% | 11.2% (-30px) | ✅ 0.2% | ✅ 0.2% |
| why-relocate | 11.1% (+52px) | 11.0% (+52px) | 10.6% (+52px) | 10.1% (+52px) | 9.3% (+46px) | 10.5% (+46px) | 11.0% (+46px) | 11.1% (+46px) |

## Stories (full page, 390 and 1440)

| Story | 390 | 1440 |
| --- | --- | --- |
| a-day-in-the-life-of-a-blue-shield-actuarial-analyst | 7.1% (-12px) | 9.1% (-48px) |
| a-great-place-to-do-meaningful-work | 12.0% (-182px) | 7.0% (-92px) |
| a-tribute-to-our-black-employee-network | 30.3% (-1324px) | 23.9% (-744px) |
| a-tribute-to-our-employees-of-asian-and-pacific-islander-american-heritage | 19.2% (-22px) | 22.0% (-14px) |
| advancing-through-leadership-and-beyond-with-apa-co-chairs-sree-iyyanki-and | 11.6% (-18px) | ✅ 0.5% |
| alvins-story-making-an-impact-while-helping-your-friends-and-family | 12.3% (-23px) | 10.8% (+1px) |
| an-inside-look-into-the-role-of-a-blue-shield-of-california-pharmacist | 0.8% (+6px) | ✅ 0.2% |
| asian-american-and-pacific-islander-heritage-month | 32.8% (-715px) | 29.6% (-640px) |
| being-your-authentic-self-in-a-hybrid-work-environment-and-more-with-pride | 13.0% (-651px) | 7.0% (-98px) |
| beyond-the-bedside-how-two-nurses-thrive-at-blue-shield | 22.4% (-332px) | 16.0% (-235px) |
| black-employee-network-celebrates-black-history-month-a-conversation-with-e | 13.9% (-611px) | 13.4% (-567px) |
| blue-goes-greener-a-conversation-with-baylis-beard-blue-shields-new-directo | 6.1% (-38px) | 4.9% (-44px) |
| blue-shield-of-california-internship-program-2024 | 22.5% (-321px) | 18.5% (+334px) |
| blue-shield-of-california-internship-program-and-early-career-opportunities | 27.4% (-169px) | 22.1% (-176px) |
| celebrating-a-record-breaking-year-of-giving-back-in-2023 | 15.4% (-48px) | 8.4% (-12px) |
| connecting-values-to-my-work | 1.3% (+6px) | ✅ 0.1% |
| corporate-citizenship-award-recipient-mari-corbin | 14.8% (-137px) | 14.4% (-47px) |
| creating-more-breathing-space-for-our-people-to-rejuvenate | 4.1% (-24px) | 2.0% (-1px) |
| customer-service-spotlight-mal-madrigal-medicare-advantage | 23.1% (+153px) | 20.4% (+175px) |
| developing-future-leaders-from-high-school-on-up-blue-shield-partners-with | 22.7% (-255px) | 11.9% (-157px) |
| dont-speak-for-me-speak-with-me | 22.1% (-117px) | 13.7% (-93px) |
| embracing-sabbatical-bliss-personal-journeys-of-refreshment-and-renewal | 8.0% (-38px) | 5.8% (-44px) |
| empowered-to-succeed-moises-bandas-leadership-and-development-journey-69102 | 6.4% (+96px) | 14.3% (+378px) |
| empowering-purposeful-change-in-the-workplace-insights-from-our-elevating-w | 10.2% (-19px) | 0.8% (-1px) |
| equal-pay-a-goal-were-committed-to-at-blue-shield | 26.3% (-178px) | 32.1% (-905px) |
| eva-durazo-championing-health-equity-at-blue-shield-of-california | 20.6% (-626px) | 2.1% |
| find-your-passion-and-it-will-grow | 3.8% (-18px) | 1.4% (-1px) |
| finding-purpose-and-passion-at-work | 1.6% (+6px) | ✅ 0.2% |
| from-kangaroo-encounters-to-lifesaving-endeavors-three-blue-shield-employee | 15.0% (+118px) | 11.2% (+120px) |
| from-linkedin-live-let-s-talk-career-opportunities-in-health-care | 32.7% (-1214px) | 28.7% (-611px) |
| giving-back-to-our-community-ricquels-volunteer-story | 17.1% (-168px) | 8.2% (-89px) |
| health-and-environmental-sustainability | 9.2% (+108px) | 3.1% (+34px) |
| how-blue-shield-celebrated-employee-appreciation-week | 12.0% (-235px) | 5.8% (-67px) |
| how-blue-shield-elevates-and-supports-our-women-year-round | 22.6% (-1239px) | 22.3% (-612px) |
| how-blue-shield-is-cultivating-a-mindset-of-gratitude | 13.9% (-142px) | 15.4% (-52px) |
| how-blue-shield-of-californias-mentorship-program-fosters-career-growth-and | 4.2% (-48px) | ✅ 0.5% |
| how-kelly-aaron-uses-her-free-time-to-make-meaningful-change-for-others | 1.9% (+6px) | ✅ 0.7% |
| how-one-nurse-is-transforming-health-care-without-wearing-scrubs-to-work | 27.4% (+529px) | 20.2% (+288px) |
| how-our-people-gave-back-to-their-beloved-communities-this-martin-luther-ki | 21.6% (-751px) | 16.8% (-617px) |
| how-salina-wong-is-helping-reimagine-pharmacy-care-at-blue-shield-of-califo | 21.4% (+158px) | 15.1% (+144px) |
| how-sarah-miller-is-nurturing-her-passion-for-healing-communities | 4.2% (+2px) | 4.3% (+20px) |
| how-three-blue-shield-employees-recharged-and-reconnected-on-sabbatical | 9.5% (-18px) | ✅ 0.2% |
| how-two-bluesky-leaders-are-championing-mental-health-access-awareness-and | 24.7% (+188px) | 13.0% (+95px) |
| how-working-at-blue-shield-improved-sheridans-health-and-wellbeing | 20.6% (-525px) | 14.3% (-67px) |
| inaugural-ready-to-lead-rosemarie-pham-leadership-excellence-award-presente | 19.5% (-89px) | 6.6% (-120px) |
| jack-zhang-embracing-storytelling-and-belonging-at-blue-shield | 13.0% (+38px) | 19.3% (+104px) |
| joining-the-it-organization-at-blue-shield-of-california-with-lisa-davis-se | 23.7% (-24px) | 17.8% (+31px) |
| jumpstart-your-health-care-career | 20.8% (-53px) | 11.6% (-6px) |
| lessons-and-advice-from-mentors-and-proteges-at-blue-shield-of-california | 18.1% (-461px) | 14.0% (-470px) |
| life-at-blue-shield | 7.1% (+6px) | 9.4% |
| looking-back-on-a-year-of-giving-at-blue-shield | 11.5% (-24px) | 5.9% (-23px) |
| looking-for-your-next-tech-job | 24.1% (-102px) | 17.1% (-84px) |
| marias-story-aligning-values-working-with-blue-shield-of-california | 12.9% (+7px) | 13.0% (+1px) |
| mission-report-our-engaged-employees | 18.7% (-138px) | 14.0% (-47px) |
| mission-values-in-action-awards-our-highest-honor-6893914 | 21.9% (-652px) | 19.5% (-116px) |
| my-perfect-destination-the-intersection-of-passion-and-profession | 2.7% (+6px) | ✅ 1.0% |
| my-sabbatical-stories-of-joy-and-inspiration-from-around-the-world | 12.2% (-38px) | 9.0% (-44px) |
| our-people-our-stories-bridget-cordova | 2.7% (+6px) | 5.3% |
| passion-respect-and-pride-honoring-our-people-of-hispanic-heritage-through | 19.4% (-633px) | 13.7% (-103px) |
| perseverance-in-motion | 8.2% (+2px) | 14.1% (+17px) |
| recruiting-and-mentoring-future-talent-actuarial-manager-joe-sabo-shares-ad | 20.6% (-422px) | 13.2% (-76px) |
| reflections-from-our-2025-interns | 26.6% (-814px) | 23.8% (-430px) |
| reflections-from-our-2026-interns | 16.6% (-84px) | 13.8% (+139px) |
| releases-20221130-6884118 | 7.9% (-38px) | 9.5% (+112px) |
| responding-to-covid-fatigue-our-people-need-more-support | 8.1% (-90px) | 2.9% (-42px) |
| sabbatical-stories-our-people-share-tales-of-family-bonds-new-beginnings-an | 43.9% (+2233px) | 30.2% (+1103px) |
| supporting-our-future-leaders-blue-shields-internship-program | 18.2% (-552px) | 16.4% (-433px) |
| the-actuarial-study-program-supporting-the-career-growth-of-our-actuaries | 16.8% (-764px) | 12.2% (-614px) |
| the-best-leaders-make-themselves-available | 2.2% (+6px) | ✅ 0.3% |
| the-power-of-giving-back-shayok-dutta-s-inspiring-volunteer-journey | 13.4% (+50px) | 17.5% (+188px) |
| to-the-call-and-beyond-a-blue-shield-salute-to-customer-experience | 14.1% (-53px) | 10.0% (-24px) |
| uplifting-communities-is-part-of-my-culture | 1.4% (+6px) | ✅ 0.1% |
| veterans-bring-talent-and-loyalty-to-the-table | 12.7% (-18px) | ✅ 0.9% |
| we-see-and-celebrate-y-for-you | 28.9% (-673px) | 19.1% (-78px) |
| what-we-stand-for-our-core-values-in-action | 32.6% (-144px) | 26.6% (-102px) |
| when-a-corporate-mission-becomes-deeply-personal | 4.6% (+5px) | 2.3% (-1px) |

## Blocks (element screenshots)

| Block case | 360 | 390 | 768 | 900 | 1024 | 1280 | 1440 | 1600 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| header | ✅ 0.4% | ✅ 0.4% | ✅ 0.2% | ✅ 0.2% | ✅ 0.5% | 2.0% | 1.8% | 1.8% |
| mobile-menu-open | 4.2% | 3.8% | 2.3% | 2.1% | 2.0% |  |  |  |
| footer | 6.2% (+6px) | 5.9% (+6px) | 4.6% (+6px) | 4.1% (+6px) | ✅ 0.2% | ✅ 0.2% | ✅ 0.2% | ✅ 0.2% |
| home-hero | ✅ 0.0% | ✅ 0.0% | ✅ 0.0% | ✅ 0.0% | ✅ 0.4% | ✅ 0.1% | ✅ 0.0% | ✅ 0.0% |
| faq-first-open | 3.9% (-81px) | 6.6% (-240px) | 3.2% (-24px) | 3.7% (-24px) | 0.3% | 1.4% | 1.9% (-24px) | 1.9% (-24px) |
| icon-tiles | ✅ 0.0% | ✅ 0.1% | ✅ 0.6% | 1.4% (-1px) | 1.3% | ✅ 0.1% | ✅ 0.0% | ✅ 0.0% |
| page-hero |  | ✅ 0.1% |  |  |  |  | 0.0% (+40px) |  |
| video-tiles |  | 1.0% (+1px) |  |  |  |  | 38.5% (-26px) |  |
| highlight-panel |  | 5.9% (-54px) |  |  |  |  | 3.0% (-9px) |  |
| banner-image-cta |  | 36.3% (+26px) |  |  |  |  | ✅ 0.0% |  |
| home-gallery |  | ✅ 0.0% |  |  |  |  | 1.0% |  |
| home-quotes |  | 5.7% (-78px) |  |  |  |  | ✅ 0.2% |  |
| feature-links |  | 3.4% (-24px) |  |  |  |  | 8.5% |  |
| banner-locations |  | ✅ 0.0% |  |  |  |  | ✅ 0.3% |  |
| columns-alternating |  | 0.7% (-48px) |  |  |  |  | ✅ 0.7% |  |
| banner-statement |  | ✅ 0.2% |  |  |  |  | ✅ 0.0% |  |
| belonging-gallery |  | ✅ 0.0% |  |  |  |  | ✅ 0.0% |  |
| faq-closed |  | 4.8% (-216px) |  |  |  |  | 0.0% |  |
| growth-stories |  | 13.7% (-11px) |  |  |  |  | 21.6% |  |
| article-header |  | ✅ 0.0% |  |  |  |  | ✅ 0.0% |  |
| story-listing |  | 21.8% (-30px) |  |  |  |  | 24.6% (-30px) |  |
| article-hero-image |  | ✅ 0.0% |  |  |  |  | ✅ 0.0% |  |
| image-left |  | ✅ 0.1% |  |  |  |  | ✅ 0.1% |  |
| image-right |  | ✅ 0.1% |  |  |  |  | ✅ 0.1% |  |
| story-callout |  | ✅ 0.0% |  |  |  |  | ✅ 0.0% |  |
| more-stories |  | ✅ 0.0% |  |  |  |  | ✅ 0.0% |  |
| share |  | ✅ 0.2% |  |  |  |  | ✅ 0.3% |  |
| table-callout |  | ✅ 0.1% |  |  |  |  | ✅ 0.1% |  |
| video-hero |  | 20.2% |  |  |  |  | 22.6% (-1px) |  |
| youtube-embed |  | 67.6% |  |  |  |  | 87.7% (-1px) |  |
| stellarus-header |  | ✅ 0.3% |  |  |  |  | 0.2% (-1px) |  |
| stellarus-footer |  | ✅ 0.0% |  |  |  |  | ✅ 0.1% |  |
| stellarus-hero |  | 21.2% (+88px) |  |  |  |  | 9.0% (+176px) |  |
| header-dropdown-open |  |  |  |  |  | 1.5% (-1px) | 1.3% (-1px) | 1.3% (-1px) |
