#!/bin/sh
set -e
: "${PORT:=3000}"
exec node node_modules/next/dist/bin/next start -p "$PORT" -H 0.0.0.0
