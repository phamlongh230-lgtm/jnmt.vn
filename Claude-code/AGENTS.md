# Repository Guidelines for AI Agents

> **Single source of truth:** `CLAUDE.md` at the project root.
> Read that file first. Everything important — architecture rules, coding
> conventions, delegation protocol, slash commands, MCP servers, hooks —
> lives there. This file exists so non-Claude CLIs (Codex, OpenCode, Cursor
> Agent, Aider, etc.) can find a starting point without knowing Claude-
> specific conventions.

## Quick Reference

**Project scaffold powered by Claude Code + GitNexus.** Before you write or
modify any code:

1. Read `CLAUDE.md` for full conventions.
2. Read `SOUL.md` if you want to understand *why* the template is built this way.
3. Check `PRD.md` for functional requirements (read-only — never modify).
4. Check `TODO.md` for the active backlog.
5. Query the GitNexus knowledge graph before implementing anything
   (`gitnexus query <concept>`, `gitnexus impact <symbol>`) — the codebase
   is indexed for a reason.

## Specialist Delegation

Twelve specialist sub-agents live in `.claude/agents/`. Claude Code loads
them automatically. Other CLIs can read them as plain Markdown role prompts —
each file has a clear description, owned documents, and working protocol.

Routing table (full version in `CLAUDE.md`):

- **Architecture & ADRs** → `systems-architect`
- **Frontend UI / mobile UI** → `frontend-developer` / `react-native-developer`
- **Backend / API** → `backend-developer`
- **Database / schema** → `database-expert`
- **UX / design system** → `ui-ux-designer`
- **Tests (Playwright)** → `qa-engineer`
- **Docs** → `documentation-writer`
- **CI/CD** → `cicd-engineer`
- **Containers** → `docker-expert`
- **Copy & SEO** → `copywriter-seo`
- **Backlog & coordination** → `project-manager`

## Hard Rules

- `PRD.md` requires explicit human approval to modify.
- All commits follow Conventional Commits (`feat(scope): …`).
- Update `docs/` before marking any task complete.
- Never hardcode secrets.
- Never `git push --force`, never `rm -rf`, never `DROP TABLE` — the
  `guard-destructive.sh` hook blocks these anyway.

## Commands That Matter

```bash
/start                 # Run the onboarding protocol (first time only)
/orchestrate <task>    # Full multi-agent task execution
/review                # Multi-agent code review
/release               # Pre-release QA + docs + CI pass
/checkpoint            # Save, verify docs, commit WIP
/status                # Live project health card
```

For everything else: **read `CLAUDE.md`.**
