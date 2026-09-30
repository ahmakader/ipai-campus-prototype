#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
archive="${TMPDIR:-/tmp}/ipai-campus-media-v1.zip"
curl --fail --location --retry 3 'https://github.com/ahmedakader15/ipai-campus-prototype/releases/download/media-v1/ipai-campus-media-v1.zip' -o "$archive"
printf '%s  %s\n' 65136ff87889e410d7bb3139023fb8f82aa0f66ce63b563dbd193434f62633ee "$archive" | sha256sum --check
mkdir -p public
unzip -q -o "$archive" -d public
