#!/usr/bin/env bash
set -euo pipefail

docker rm -f -v mysql-test 2>/dev/null || true
