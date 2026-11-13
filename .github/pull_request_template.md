Please always provide the [GitHub issue(s)](../issues) your PR is for, as well as test URLs where your change can be observed (before and after):

Fix #<gh-issue-id>

Test URLs:
- Before: https://main--aca-careers-eds--Nehaadobe.aem.page/<path>
- After: https://<branch>--aca-careers-eds--Nehaadobe.aem.page/<path>

Checklist (see [RULES.md](../blob/main/RULES.md)):
- [ ] `npm run lint` passes
- [ ] CSS selectors are scoped to the block (`.blockname ...`), and values use design tokens
- [ ] Changed blocks have an up-to-date `README.md`
- [ ] PageSpeed Insights scores 100 on the After preview URL (mobile)
- [ ] Commit messages follow Conventional Commits (`type(scope): description`)
