#!/bin/bash
# Check if a Storyblok Vue component's blok.* accesses match its schema.
# Called by PostToolUse hook when a storyblok/*.vue file is edited.
#
# Usage: check-schema-match.sh <vue-file-path>

FILE="$1"
if [ -z "$FILE" ]; then exit 0; fi

# Only check storyblok/*.vue files
case "$FILE" in
  */storyblok/*.vue|storyblok/*.vue) ;;
  *) exit 0 ;;
esac

# Derive component name: WebsiteTeaser.vue → website-teaser, Button.vue → button
BASENAME=$(basename "$FILE" .vue)
COMP_NAME=$(echo "$BASENAME" | sed 's/\(.\)\([A-Z]\)/\1-\2/g' | tr '[:upper:]' '[:lower:]')

# Find the schema file
SCHEMA_FILE=$(find . -maxdepth 1 -name "components.*.json" | head -1)
if [ -z "$SCHEMA_FILE" ] || [ ! -f "$SCHEMA_FILE" ]; then
  exit 0
fi

# Extract schema fields for this component
SCHEMA_FIELDS=$(python3 -c "
import json, sys
with open('$SCHEMA_FILE') as f:
    data = json.load(f)
for c in data.get('components', []):
    if c['name'] == '$COMP_NAME':
        fields = [k for k in c['schema'] if not k.startswith('tab-')]
        print(' '.join(fields))
        sys.exit(0)
print('NO_SCHEMA')
" 2>/dev/null)

if [ "$SCHEMA_FIELDS" = "NO_SCHEMA" ]; then
  echo "⚠ [schema] No schema found for '$COMP_NAME' — component can't be used in Storyblok editor"
  exit 0
fi

# Extract blok.* accesses from the Vue template
TEMPLATE_FIELDS=$(grep -oE 'blok\.\w+' "$FILE" 2>/dev/null | sed 's/blok\.//' | sort -u | tr '\n' ' ')

if [ -z "$TEMPLATE_FIELDS" ]; then
  exit 0
fi

# Compare: find fields used in template but missing from schema
MISSING=""
for field in $TEMPLATE_FIELDS; do
  # Skip common non-schema props (v-editable directive, _uid, component)
  case "$field" in
    _uid|component|length) continue ;;
  esac
  if ! echo "$SCHEMA_FIELDS" | grep -qw "$field"; then
    MISSING="$MISSING $field"
  fi
done

if [ -n "$MISSING" ]; then
  echo "⚠ [schema] $BASENAME.vue uses blok fields not in '$COMP_NAME' schema:$MISSING"
  echo "   Schema has: $SCHEMA_FIELDS"
  echo "   Run: npx storyblok components pull --space <id> to sync, or update the schema"
fi

# Check for unsafe access (blok.X.Y without optional chaining)
UNSAFE=$(grep -nE 'blok\.\w+\.\w+' "$FILE" 2>/dev/null | grep -v '\?' | grep -v 'v-for\|v-if\|:key' | head -5)
if [ -n "$UNSAFE" ]; then
  echo "⚠ [schema] $BASENAME.vue has unsafe nested access (missing ?.):"
  echo "$UNSAFE" | sed 's/^/   /'
fi
