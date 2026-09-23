#!/bin/sh
# Re-apply the early-discovery patch after `pi update --extensions` or
# `pi update --all` replaces the pi-devin-provider package.
set -e
target="$HOME/.pi/agent/npm/node_modules/pi-devin-provider/extensions/devin/index.ts"
cp "$HOME/.pi/agent/patches/pi-devin-provider-index.ts" "$target"
echo "patched $target"
