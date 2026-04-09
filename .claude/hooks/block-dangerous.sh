#!/bin/bash
# PreToolUse hook: block dangerous commands and file edits.
# Returns JSON with decision "block" + exit code 2 to prevent execution.

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

# --- Block dangerous Bash commands ---
if [ "$TOOL_NAME" = "Bash" ]; then
  COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

  # Block destructive commands
  if echo "$COMMAND" | grep -qE '(rm\s+-rf\s+[/~]|rm\s+-rf\s+\.\s|git\s+push\s+--force|git\s+reset\s+--hard|git\s+clean\s+-fd)'; then
    echo '{"decision":"block","reason":"Destructive command blocked by hook"}'
    exit 2
  fi
fi

# --- Block edits to protected files ---
if [ "$TOOL_NAME" = "Edit" ] || [ "$TOOL_NAME" = "Write" ]; then
  FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty')

  case "$FILE" in
    *.env|*.env.*|*/.env|*/.env.*)
      echo '{"decision":"block","reason":"Cannot edit .env files — add secrets manually"}'
      exit 2
      ;;
    */package-lock.json|package-lock.json)
      echo '{"decision":"block","reason":"Cannot edit package-lock.json — run npm install instead"}'
      exit 2
      ;;
    *.pem|*.key)
      echo '{"decision":"block","reason":"Cannot edit certificate files"}'
      exit 2
      ;;
  esac
fi

exit 0
