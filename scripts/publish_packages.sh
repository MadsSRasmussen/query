#!/usr/bin/env bash
set -euo pipefail

deno run --allow-read scripts/list_publish_paths.ts | while IFS= read -r package_path; do
    echo "Publishing ${package_path}"
    (
        cd "${package_path}"
        deno publish
    )
done
