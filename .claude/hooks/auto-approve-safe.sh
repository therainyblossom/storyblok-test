#!/bin/bash
# PermissionRequest hook: auto-approve known-safe commands.
# Skips the permission dialog for read-only and test commands.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Safe commands that never need approval
SAFE_PATTERNS=(
  "^npx playwright test"
  "^npx playwright install"
  "^npx nuxt generate"
  "^npx nuxt build"
  "^npm run lint"
  "^npm run dev"
  "^npm run build"
  "^npm test"
  "^npm ci$"
  "^npx eslint"
  "^npx serve"
  "^git status"
  "^git log"
  "^git diff"
  "^git branch"
  "^gh pr "
  "^gh run "
)

for pattern in "${SAFE_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    echo '{"hookSpecificOutput":{"hookEventName":"PermissionRequest","decision":{"behavior":"allow"}}}'
    exit 0
  fi
done

# Not a known-safe command — let the normal permission dialog show
exit 0
