#!/usr/bin/env bash
# YAMTAM guard — blocks destructive commands
BLOCKED_PATTERNS=("rm -rf" "git push --force" "git push -f" "DROP TABLE" "TRUNCATE" "dd if=")
CMD="${CLAUDE_TOOL_INPUT:-}"
for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$CMD" | grep -qi "$pattern"; then
    echo "[yamtam/guard] BLOCKED: $pattern detected"
    exit 2
  fi
done
