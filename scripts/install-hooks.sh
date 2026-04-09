#!/bin/bash
# Install git hooks for the storyblok-test project
#
# Usage: ./scripts/install-hooks.sh

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOKS_DIR="$REPO_ROOT/.git/hooks"

echo "Installing git hooks..."

cp "$REPO_ROOT/scripts/hooks/pre-push" "$HOOKS_DIR/pre-push"
chmod +x "$HOOKS_DIR/pre-push"

echo "  ✓ pre-push — auto-generates e2e tests for changed components"
echo ""
echo "Done. Requires Claude Code CLI: npm install -g @anthropic-ai/claude-code"
