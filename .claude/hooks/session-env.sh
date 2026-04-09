#!/bin/bash
# SessionStart hook: inject environment variables so builds work
# without a manual .env file.

if [ -n "$CLAUDE_ENV_FILE" ]; then
  cat >> "$CLAUDE_ENV_FILE" << 'ENVEOF'
export NUXT_PUBLIC_STORYBLOK_ACCESS_TOKEN=1ymwdVwtIgg5WL7NV5IABQtt
export NUXT_PUBLIC_SPACE_ID=291713566231447
export NUXT_PUBLIC_NODE_ENV=development
export NUXT_PUBLIC_AUTH_ENABLED=false
ENVEOF
fi

exit 0
