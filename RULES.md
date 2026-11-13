# Repository rules

Plain Git hooks (`.githooks/`) and one Node script (`tools/rules.mjs`, Node built-ins only) check
commits and pushes locally; CI (`.github/workflows/`) repeats the checks that matter, because local
hooks can be skipped. No extra npm packages.

## Rules

| Rule | Checked by | Escape hatch |
| --- | --- | --- |
| Commit message first line is `type(optional-scope): description`. Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `perf`, `ci`, `build`, `revert`. Scope: lowercase letters, digits, hyphens. Description: 1–72 characters, does not start with an uppercase letter, no trailing period. Body and trailers (`Co-authored-by: ...`) are free. Git's own `Merge ...` and `Revert "..."` subjects pass; lines starting with `#` are ignored. | `commit-msg` hook; CI on pull requests (every commit of the PR, first parent, no merges) | none in CI (`--no-verify` skips only the local hook) |
| No commits on `main` | `pre-commit` hook | `ALLOW_MAIN=1` |
| `scripts/aem.js` (vendored aem-boilerplate core) is not changed or deleted | `pre-commit` hook (all staged paths, deletions included); CI workflow `Vendored aem.js` compares it with [aem-boilerplate main](https://raw.githubusercontent.com/adobe/aem-boilerplate/main/scripts/aem.js) and comments on the PR | `ALLOW_AEM_JS=1` (to copy a new upstream version) |
| A changed block (`blocks/<name>/*.js`, `.css`, `.html` added or modified) has `blocks/<name>/README.md`; removed and renamed blocks are not checked | `pre-commit` hook | none |
| Staged `.js` / `.mjs` files pass ESLint, staged `.css` files pass Stylelint (generated paths `storybook/storybook-static/` and `helix-importer-ui/` are skipped) | `pre-commit` hook; full `npm run lint` in `pre-push` and CI | none |
| No pushes to `main` | `pre-push` hook; GitHub ruleset (below) | `ALLOW_MAIN=1` (the ruleset still applies) |
| Other pushed branches are `develop` or `<type>/<description>`. Types: `feature`, `fix`, `hotfix`, `release`, `chore`, `docs`, `refactor`. Characters `A-Z a-z 0-9 . _ -`, no spaces, no `--`. Example: `feature/story-filters` | `pre-push` hook | none |
| The preview host `<branch>--<repo>--<owner>` fits in 63 characters (`/` in the branch becomes `-`). Checked for the GitHub repo you push to, and for `aemsites/bsca-careers` also as `bsca-careers--blueshieldca` (its repoless site). The message shows the maximum branch length. | `pre-push` hook | none |
| `npm test` (when a `test` script exists) and `npm run lint` pass | `pre-push` hook; CI (`npm run lint`) | none |

Rule settings (types, branches, generated paths, site overrides) are at the top of `tools/rules.mjs`.

## Turn the hooks on

The hooks are activated by pointing Git at `.githooks/`:

```sh
npm ci                 # runs "prepare", which sets core.hooksPath
npm run hooks:install  # or set it explicitly
```

Both run `git config core.hooksPath .githooks` in your clone. Hooks need Node.js on `PATH`;
`.githooks/_common.sh` also looks in `/usr/local/bin`, `/opt/homebrew/bin` and `~/.nvm`. GUI clients
(GitHub Desktop, some IDEs) start hooks with a minimal `PATH`: if a hook says Node.js was not found,
start the client from a terminal where `node` works.

Run a check by hand:

```sh
node tools/rules.mjs commit-msg .git/COMMIT_EDITMSG
node tools/rules.mjs branch feature/my-change --remote-url "$(git remote get-url origin)"
node tools/rules.mjs commits origin/main..HEAD
```

## Escape hatches

- `ALLOW_MAIN=1 git commit ...` / `ALLOW_MAIN=1 git push ...`: commit on or push to `main` (the GitHub
  ruleset still blocks direct pushes).
- `ALLOW_AEM_JS=1 git commit ...`: update `scripts/aem.js` to a new aem-boilerplate version (copy it as is).
- `git commit --no-verify` / `git push --no-verify` skip the local hooks; CI still checks lint, commit
  messages and `scripts/aem.js` on pull requests.

## Limits

- Hooks only run on branches that contain `.githooks/`; on older branches nothing is checked locally.
- Edits made on github.com and `--no-verify` bypass the hooks. Real enforcement is the GitHub ruleset
  plus CI, which cannot be set from files:

## GitHub settings checklist (set by a repository admin)

- [ ] Ruleset for `main`: require a pull request with at least 1 approval
- [ ] Require status check `build` (workflow **Build**), and `aem-js` (workflow **Vendored aem.js**) if wanted
- [ ] Require branches to be up to date before merging
- [ ] Require conversation resolution
- [ ] Block force pushes and deletion
- [ ] No bypass list, administrators included
- [ ] Merge method: any (squash is fine: there is no subtree)
- [ ] Optional: CODEOWNERS for `.github/workflows/`, `.eslintrc.js`, `.stylelintrc.json`, `.githooks/`,
      `tools/rules.mjs`, `scripts/aem.js`, `scripts/scripts.js`, `styles/styles.css`, `head.html`
- [ ] Optional: the pull request template (`.github/pull_request_template.md`) with Before/After preview URLs
