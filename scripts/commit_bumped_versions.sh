#!/usr/bin/env bash
set -euo pipefail

target_branch="${TARGET_BRANCH:-}"
release_tag="${RELEASE_TAG:-${GITHUB_REF_NAME:-}}"

if [[ -z "${target_branch}" ]]; then
    echo "TARGET_BRANCH is not set"
    exit 1
fi

if [[ -z "${release_tag}" ]]; then
    echo "RELEASE_TAG and GITHUB_REF_NAME are not set"
    exit 1
fi

git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"

deno run --allow-read scripts/list_publish_paths.ts | while IFS= read -r package_path; do
    git add "${package_path}/deno.json"
done

if git diff --cached --quiet; then
    echo "No version changes to commit"
    exit 0
fi

git commit -m "chore: bump package versions for ${release_tag}"
git push origin "HEAD:${target_branch}"
