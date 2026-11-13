#!/bin/sh
# Shared setup for the Git hooks in .githooks/ (sourced, not run). See RULES.md.

# GUI clients (GitHub Desktop, IDEs) start hooks with a minimal PATH: add the usual Node locations
PATH="$PATH:/usr/local/bin:/opt/homebrew/bin"
export PATH

if ! command -v node >/dev/null 2>&1 && [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "" >&2
  echo "Git hook: Node.js was not found on PATH ($PATH)." >&2
  echo "Install Node.js, or start your Git client from a terminal where 'node' works" >&2
  echo "(GUI clients such as GitHub Desktop use a minimal PATH). See RULES.md." >&2
  echo "" >&2
  exit 1
fi

cd "$(git rev-parse --show-toplevel)" || exit 1

# lint tools come from the project's devDependencies
require_dependencies() {
  if [ ! -x node_modules/.bin/eslint ] || [ ! -x node_modules/.bin/stylelint ]; then
    echo "" >&2
    echo "Git hook: ESLint or Stylelint is missing. Run: npm ci" >&2
    echo "" >&2
    exit 1
  fi
}
