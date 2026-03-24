#!/usr/bin/env bash
set -euo pipefail

release_tag="${GITHUB_REF_NAME:-}"

if [[ -z "${release_tag}" ]]; then
    echo "GITHUB_REF_NAME is not set"
    exit 1
fi

if [[ ! "${release_tag}" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Expected release tag format vX.Y.Z, got '${release_tag}'"
    exit 1
fi

echo "Validated release tag: ${release_tag}"
