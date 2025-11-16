#!/bin/sh
set -euo pipefail
PORT="${PORT:-3000}"
exec node node_modules/next/dist/bin/next start -H 0.0.0.0 -p "$PORT"
