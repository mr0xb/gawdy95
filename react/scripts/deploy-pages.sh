#!/usr/bin/env bash
# Builds the demo site and publishes it to the gh-pages branch (served by GitHub Pages).
set -euo pipefail

cd "$(dirname "$0")/.."
pnpm run build:site

repo_root="$(git rev-parse --show-toplevel)"
source_sha="$(git rev-parse --short HEAD)"
worktree="$(mktemp -d)"
cleanup() {
  git -C "$repo_root" worktree remove --force "$worktree" >/dev/null 2>&1 || true
  git -C "$repo_root" branch -D gh-pages-new >/dev/null 2>&1 || true
}
trap cleanup EXIT

if git ls-remote --exit-code --heads origin gh-pages >/dev/null; then
  git fetch origin gh-pages
  git worktree add "$worktree" origin/gh-pages --detach
else
  git worktree add --detach "$worktree"
  git -C "$worktree" checkout --orphan gh-pages-new
fi

find "$worktree" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R site-dist/. "$worktree/"
git -C "$worktree" add -A
if git -C "$worktree" diff --cached --quiet; then
  echo "gh-pages is already up to date."
  exit 0
fi
git -C "$worktree" commit -m "Deploy demo from ${source_sha}"
git -C "$worktree" push origin HEAD:gh-pages
echo "Published. GitHub Pages updates in a minute or two."
