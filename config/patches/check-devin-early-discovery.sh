#!/bin/sh
# One runnable check: fails when pi cannot resolve an enabledModels-style pattern
# against devin's real (post-discovery) model list, i.e. the fix is missing.
set -e
out=$(cd /tmp && pi -p --models 'devin/swe-2-*' "ok" 2>&1 || true)
if printf '%s' "$out" | grep -q 'No models match pattern'; then
  echo "FAIL: devin/swe-2-* does not resolve at startup"
  exit 1
fi
echo "PASS: devin/swe-2-* resolves at startup"
