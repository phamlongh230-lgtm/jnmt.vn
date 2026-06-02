#!/usr/bin/env bash
# YAMTAM audit — logs all tool calls
LOG=".claude/state/audit.log"
mkdir -p .claude/state
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) | tool=${CLAUDE_TOOL_NAME:-unknown} | ${CLAUDE_TOOL_INPUT:0:120}" >> "$LOG"
