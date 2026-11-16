/* eslint-env node */
/* eslint-disable no-console */
/**
 * Repository rules engine (Node built-ins only), used by the Git hooks in .githooks/ and by CI.
 * See RULES.md.
 *
 *   commit-msg <file>                  check a commit message file (commit-msg hook)
 *   commits <range>                    check every first-parent commit in a range (CI)
 *   branch <name> [--remote-url <url>] check a branch name pushed to a remote (pre-push hook)
 *   pre-commit                         staged-file checks and lint (pre-commit hook)
 *
 * Usage: node tools/rules.mjs <subcommand> [args]
 *
 * Exit code 0 = passed, 1 = a rule failed.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

/* ---------- settings ---------- */

export const COMMIT_TYPES = [
  'feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'test', 'perf', 'ci', 'build', 'revert',
];
export const BRANCH_TYPES = ['feature', 'fix', 'hotfix', 'release', 'chore', 'docs', 'refactor'];
const PROTECTED_BRANCH = 'main'; // blocked unless ALLOW_MAIN=1
const DIRECT_BRANCHES = ['develop']; // may be pushed without a <type>/ prefix
const VENDORED = ['scripts/aem.js']; // blocked unless ALLOW_AEM_JS=1
export const GENERATED_PATHS = ['storybook/storybook-static/', 'helix-importer-ui/']; // not linted
const MAX_DESCRIPTION = 72;
const MAX_HOST_LABEL = 63; // DNS label limit for <branch>--<repo>--<owner>.aem.page
// extra sites on the same code (repoless): GitHub owner/repo -> more <repo>--<owner> labels
const SITE_OVERRIDES = {
  'aemsites/bsca-careers': ['bsca-careers--blueshieldca'],
};

/* ---------- helpers ---------- */

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function fail(lines) {
  console.error(['', ...lines, ''].join('\n'));
  return false;
}

/* ---------- commit messages ---------- */

/** First line that is not blank and not a comment. */
export function subjectOf(message) {
  return message.split('\n').find((line) => line.trim() !== '' && !line.startsWith('#')) || '';
}

/**
 * @param {string} subject first line of a commit message
 * @returns {string|null} why it is invalid, or null when it is valid
 */
export function checkSubject(subject) {
  if (subject.startsWith('Merge ') || subject.startsWith('Revert "')) return null;
  const match = subject.match(/^([a-zA-Z]+)(\(([^)]*)\))?: (.*)$/);
  if (!match) return 'the first line must be "type(optional-scope): description"';
  const [, type, , scope, description] = match;
  if (!COMMIT_TYPES.includes(type)) return `"${type}" is not a commit type (use one of: ${COMMIT_TYPES.join(', ')})`;
  if (scope !== undefined && !/^[a-z0-9-]+$/.test(scope)) return `the scope "${scope}" may only use lowercase letters, digits and hyphens`;
  if (description.length < 1 || description.length > MAX_DESCRIPTION) return `the description must be 1 to ${MAX_DESCRIPTION} characters (it has ${description.length})`;
  if (/^[A-Z]/.test(description) || /^\s/.test(description)) return 'the description must start with a lowercase letter';
  if (description.endsWith('.')) return 'the description must not end with a period';
  return null;
}

function commitHelp() {
  return [
    'Format:  type(optional-scope): description',
    `Types:   ${COMMIT_TYPES.join(', ')}`,
    'Example: fix(header): keep the dropdown open on hover',
  ];
}

function checkCommitMessageFile(file) {
  const subject = subjectOf(readFileSync(file, 'utf8'));
  const problem = checkSubject(subject);
  if (!problem) return true;
  return fail([`Commit message rejected: ${problem}.`, `  "${subject}"`, '', ...commitHelp()]);
}

function checkCommitRange(range) {
  let log;
  try {
    log = git('log', '--first-parent', '--no-merges', '--format=%h%x00%B%x01', range);
  } catch (e) {
    return fail([
      `Could not read the commits in "${range}": ${String(e.stderr || e.message).trim()}`,
      'In CI, check out with fetch-depth: 0 so the base branch is available.',
    ]);
  }
  const bad = log.split('\x01')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [hash, message] = entry.split('\x00');
      const subject = subjectOf(message);
      return { hash, subject, problem: checkSubject(subject) };
    })
    .filter((c) => c.problem);
  if (!bad.length) {
    console.log(`Commit messages OK (${range}).`);
    return true;
  }
  return fail([
    `${bad.length} commit message(s) in ${range} break the rules:`,
    ...bad.map((c) => `  ${c.hash} "${c.subject}": ${c.problem}`),
    '',
    ...commitHelp(),
    'Reword them (git rebase -i) and push again.',
  ]);
}

/* ---------- branch names ---------- */

/** owner/repo from a github.com remote URL (https or ssh), or null. */
export function parseGitHubRemote(url) {
  const m = (url || '').trim().match(/github\.com[:/]([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i);
  return m ? { owner: m[1], repo: m[2] } : null;
}

/** <branch> as it appears in the preview host: lowercase, "/" (and "." "_") become "-". */
export function hostBranch(branch) {
  return branch.toLowerCase().replace(/[/._]/g, '-');
}

function siteLabels(remoteUrl) {
  let site = parseGitHubRemote(remoteUrl);
  if (!site) {
    try {
      site = parseGitHubRemote(git('remote', 'get-url', 'origin'));
    } catch { /* no origin */ }
  }
  if (!site) return [];
  const key = `${site.owner}/${site.repo}`.toLowerCase();
  return [`${site.repo}--${site.owner}`.toLowerCase(), ...(SITE_OVERRIDES[key] || [])];
}

/**
 * @param {string} branch remote branch name (without refs/heads/)
 * @param {string} [remoteUrl]
 * @param {object} [env]
 * @returns {string[]} problems (empty when valid)
 */
export function branchProblems(branch, remoteUrl, env = process.env) {
  if (branch === PROTECTED_BRANCH) {
    return env.ALLOW_MAIN === '1' ? [] : [`pushing to "${PROTECTED_BRANCH}" is blocked: open a pull request (or set ALLOW_MAIN=1 if you really must)`];
  }
  const problems = [];
  if (!DIRECT_BRANCHES.includes(branch)) {
    if (/\s/.test(branch)) problems.push('the branch name must not contain spaces');
    else if (!/^[A-Za-z0-9._/-]+$/.test(branch)) problems.push('the branch name may only use letters, digits, ".", "_", "-" and one "/"');
    if (branch.includes('--')) problems.push('the branch name must not contain "--" (it separates the parts of the preview host)');
    const m = branch.match(/^([^/]+)\/([^/]+)$/);
    if (!m) problems.push(`the branch name must be <type>/<description>, with type one of: ${BRANCH_TYPES.join(', ')}`);
    else if (!BRANCH_TYPES.includes(m[1])) problems.push(`"${m[1]}" is not a branch type (use one of: ${BRANCH_TYPES.join(', ')})`);
  }
  const labels = siteLabels(remoteUrl);
  if (!labels.length) {
    console.log('Note: the remote is not a github.com URL; preview host length not checked.');
  }
  labels.forEach((label) => {
    const host = `${hostBranch(branch)}--${label}`;
    if (host.length > MAX_HOST_LABEL) {
      const max = MAX_HOST_LABEL - label.length - 2;
      problems.push(`the preview host "${host}" is ${host.length} characters; the limit is ${MAX_HOST_LABEL}, so the branch may have at most ${max} characters for ${label}`);
    }
  });
  return problems;
}

function checkBranch(branch, remoteUrl) {
  const problems = branchProblems(branch, remoteUrl);
  if (!problems.length) return true;
  return fail([`Branch "${branch}" rejected:`, ...problems.map((p) => `  - ${p}`), '', 'Example: feature/story-filters']);
}

/* ---------- pre-commit ---------- */

const isGenerated = (file) => GENERATED_PATHS.some((p) => file.startsWith(p));

function staged(filter) {
  const args = ['diff', '--cached', '--name-only', '-z'];
  if (filter) args.push(`--diff-filter=${filter}`);
  return git(...args).split('\0').filter(Boolean);
}

function inIndex(path) {
  return spawnSync('git', ['cat-file', '-e', `:${path}`], { stdio: 'ignore' }).status === 0;
}

function runBin(name, files) {
  const bin = `node_modules/.bin/${name}`;
  const result = spawnSync(bin, files, { stdio: 'inherit' });
  return result.status === 0;
}

function preCommit() {
  // vendored core: every staged path, including deletions
  const vendored = staged().filter((f) => VENDORED.includes(f));
  if (vendored.length && process.env.ALLOW_AEM_JS !== '1') {
    return fail([
      `Commit blocked: ${vendored.join(', ')} is vendored from aem-boilerplate and must not be changed or deleted.`,
      'Update it only by copying the upstream file (then commit with ALLOW_AEM_JS=1).',
    ]);
  }

  // block README: a changed block (added or modified files) must have blocks/<name>/README.md
  const blocks = new Set(staged('AM')
    .map((f) => f.match(/^blocks\/([^/]+)\/[^/]+\.(js|css|html)$/))
    .filter(Boolean)
    .map((m) => m[1]));
  const missing = [...blocks].filter((name) => !inIndex(`blocks/${name}/README.md`));
  if (missing.length) {
    return fail([
      'Commit blocked: every block needs a README.md (purpose, authoring, variations). Missing:',
      ...missing.map((name) => `  blocks/${name}/README.md`),
    ]);
  }

  // lint the staged js/mjs and css files only
  const files = staged('ACMR').filter((f) => !isGenerated(f));
  const js = files.filter((f) => /\.(js|mjs)$/.test(f));
  const css = files.filter((f) => f.endsWith('.css'));
  if (!js.length && !css.length) {
    console.log('pre-commit: no js/css staged, lint skipped.');
    return true;
  }
  const missingBins = ['eslint', 'stylelint'].filter((b) => !existsSync(`node_modules/.bin/${b}`));
  if (missingBins.length) return fail([`Lint tools missing (${missingBins.join(', ')}). Run: npm ci`]);
  let ok = true;
  if (js.length && !runBin('eslint', js)) ok = false;
  if (css.length && !runBin('stylelint', css)) ok = false;
  if (!ok) return fail(['Commit blocked: fix the lint errors above (npm run lint:fix fixes many).']);
  return true;
}

/* ---------- cli ---------- */

function main(argv) {
  const [command, arg, ...rest] = argv;
  switch (command) {
    case 'commit-msg':
      if (!arg) return fail(['Usage: node tools/rules.mjs commit-msg <file>']);
      return checkCommitMessageFile(arg);
    case 'commits':
      if (!arg) return fail(['Usage: node tools/rules.mjs commits <range>']);
      return checkCommitRange(arg);
    case 'branch': {
      if (!arg) return fail(['Usage: node tools/rules.mjs branch <name> [--remote-url <url>]']);
      const i = rest.indexOf('--remote-url');
      return checkBranch(arg, i >= 0 ? rest[i + 1] : undefined);
    }
    case 'pre-commit':
      return preCommit();
    default:
      return fail(['Usage: node tools/rules.mjs <commit-msg <file> | commits <range> | branch <name> | pre-commit>']);
  }
}

process.exitCode = main(process.argv.slice(2)) ? 0 : 1;
