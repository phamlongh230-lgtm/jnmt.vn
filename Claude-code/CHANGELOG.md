# Changelog

## v4.0 — Context compression, Auto-QA loop, and predictive next-step analysis

### 🆕 BRAIN_DUMP.md — Automatic context compression

**Problem**: Opus reads every `.md` file at session start. A project with 20 handoff docs,
15 ADRs, and 50 commit messages costs hundreds of tokens before a single line of code
is touched. Context compression fixes this.

**What's added**:
- **`context-synthesizer` agent** (runs on Haiku, not Opus — compression is reading, not reasoning):
  reads all project history and writes a single 400–600 token `BRAIN_DUMP.md`. Agents read
  this first; it replaces re-reading the full history.
- **`brain-dump-trigger.sh`** (PostToolUse, Bash): counts commits after every `git commit`.
  Every 10th commit, signals Claude to invoke `@context-synthesizer`.
- **`/brain-dump` slash command**: manual trigger for early updates before a handoff or
  new session.
- `BRAIN_DUMP.md` and `.claude/auto-qa-count.txt` added to `.gitignore` — neither belongs
  in version control.

### 🆕 Auto-QA loop — backend commits trigger automatic test coverage

**Problem**: `@qa-engineer` existed but only ran when explicitly asked.

**What's added**:
- **`auto-qa-trigger.sh`** (PostToolUse, Bash): after every `feat(*)` or `fix(*)` commit
  touching API/service layer files, signals Claude to invoke `@qa-engineer` automatically.
  The QA engineer writes tests, runs them, and if they fail, returns the log for
  `@backend-developer` to fix.
- **Hard guardrails** (critical — without these, the loop runs forever):
  - Maximum **3 iterations** per trigger. After 3, escalates to human with a clear message.
  - Only fires on `feat`/`fix` scoped commits — not `chore`, `docs`, `refactor`, `test`.
  - Only fires when backend/API pattern files are in the diff.
  - Does not fire on test-only commits (avoids meta-loops).
- **`auto-qa-reset.sh`** (PostToolUse, Bash): resets the iteration counter when a test run
  exits 0, so the next feature starts fresh.

### 🆕 Predictive next-step analysis — task completion triggers suggestions

**Problem**: Claude Code is reactive — it waits for instructions. After completing a task,
the next step has to be explicitly requested.

**What's added**:
- `validate-completion.sh` (Stop hook) now detects when TODO.md marks a task complete.
  When detected, it signals `@project-manager` to read PRD.md and suggest:
  1. The 3 highest-value next tasks (with FR reference)
  2. Risk assessment per task (High/Medium/Low + reason)
  3. Any blocking dependency
- **Non-intrusive**: suggestion is capped at 150 words. Claude suggests — human decides.
  Nothing runs automatically. This is a nudge, not autopilot.

---

## v3.0 — Debug discipline, project-specific context, and blind-edit prevention

### 🆕 `/debug` slash command

Added `.claude/commands/debug.md`. Invoking `/debug [symptom]` forces structured
root-cause analysis before any code is touched:

- Writes a debug document to `docs/debug/YYYY-MM-DD-<slug>.md`
- Requires a written hypothesis with a **falsification test** before attempting any fix
- Maintains an Investigation Log — dead ends are recorded, never deleted
- Blocks the "let me try this and see" pattern that wastes tokens on random edits
- After confirming root cause: adds regression test, optionally adds a "Known Footguns"
  entry to CLAUDE.md so future agents don't repeat the same investigation

### 🆕 `/init-claude` slash command

Added `.claude/commands/init-claude.md`. Invoking `/init-claude` generates a
project-specific CLAUDE.md by:

- Reading existing files to detect stack, structure, and conventions
- Interviewing the human with 22 targeted questions (stack, architecture, state
  management, code style, testing, known footguns, critical files)
- Generating a fully populated CLAUDE.md — no template placeholders remaining
- Showing the output for human review before saving

Addresses the single biggest variable in Claude Code quality: a generic CLAUDE.md
produces generic (and often wrong) agent behaviour. A project-specific one is the
difference between an agent that needs hand-holding and one that works autonomously.

### 🆕 Context gate hooks — `context-gate.sh` + `context-gate-log.sh`

Two new hooks prevent blind edits — the most common cause of broken code in
multi-file refactors:

**`context-gate-log.sh`** (PostToolUse, Read): logs every file Claude reads to
`.claude/session-read-log.txt`. Lightweight — just appends a path, deduplicated.

**`context-gate.sh`** (PreToolUse, Write/Edit/MultiEdit): before allowing any
edit, checks whether the target file appears in the session read log. If not,
blocks the edit with a clear message: "Read this file first, then retry."

Exempt from the gate (always allowed without prior read):
- New files (nothing to read)
- `docs/handoff/`, `docs/debug/` (created fresh by commands)
- `TODO.md`, `CHANGELOG.md`, `.claude/agent-log.txt` (side-effect writes)

Fails open on missing `jq` (unlike `guard-destructive.sh` which fails closed —
write-blocking is advisory, not a security boundary).

### 🆕 `docs/debug/` added to `.gitignore`

Debug documents are working notes, not permanent history. Added alongside the
existing `docs/handoff/` exclusion.

### Updated — `CLAUDE.md` slash commands table

Added `/debug` and `/init-claude` to the commands table.

---


## v2.1 — Compatibility, versioning, and continuity

Additive improvements inspired by patterns observed in the [Multica](https://github.com/multica-ai/multica) codebase. Nothing from v2 was removed or changed in behaviour.

### 🆕 Multi-CLI compatibility — `AGENTS.md`

Codex, OpenCode, Cursor Agent, Aider and several other CLIs look for `AGENTS.md` at the project root rather than `CLAUDE.md`. Added a short pointer file (`AGENTS.md`, ~60 lines) that summarises the delegation table and the hard rules, then defers to `CLAUDE.md` as the single source of truth. No duplication of the full conventions — just enough for a non-Claude agent to orient itself and stop before doing something the guard hooks would block anyway.

### 🆕 Versioning for GitNexus skills — `skills-lock.json`

The 7 GitNexus skills shipped in `.claude/skills/gitnexus/` are copied from an upstream repository. Previously there was no way to detect whether a skill had drifted — either from an accidental edit or from a partial upstream sync. Added:

- **`skills-lock.json`** at project root — records a SHA-256 hash per skill, with the upstream source path for traceability.
- **`.claude/scripts/verify-skills-lock.sh`** — compares on-disk hashes against the lock, exits non-zero on drift. Designed to be wired into CI.
- **`.claude/scripts/update-skills-lock.sh`** — regenerates hashes after an intentional update. Never runs automatically.

Both scripts use relative paths inside `find`, so the lockfile is portable across machines and checkouts.

### 🆕 Session continuity — `/handoff` slash command

Added `.claude/commands/handoff.md`. Invoking `/handoff [topic]` writes a structured handoff document to `docs/handoff/YYYY-MM-DD-<slug>.md` with:

- Priority-tagged task list (P0/P1/P2) — root cause, repro steps, fix plan, scope of change
- What's already done vs what's in flight vs what's blocked
- Ordered "files to read first" list so the next reader has a minimum reading path
- Commands specific to the work in question

Modelled after the architecture-audit format used in production post-mortems. Fills the gap between a commit message (too narrow) and a PR description (too outcome-focused) — useful whenever work spans multiple Claude sessions or moves between a human and an agent.

Updated the slash-commands table in `CLAUDE.md` accordingly.

---

## v2.0 — Merge fixes (Claude Code × GitNexus)

This version fixes 6 merge-integration issues found in v1 (`claude-code-gitnexus-template.zip`).
The two upstream projects — `Claude-code-main` and `GitNexus-main/gitnexus-claude-plugin` —
were correctly sourced, but the merge had inconsistencies between the inline-hook path
and the Claude Code plugin path, plus a pre-existing silent-failure bug in the `jq`-based
shell hooks.

### 🔴 Fixed — architecture

- **Removed the half-plugin, half-inline split.** The previous `.claude/plugins/gitnexus/hooks/`
  folder shipped a plugin-style `hooks.json` (using `${CLAUDE_PLUGIN_ROOT}`) but without
  the `.claude-plugin/plugin.json` manifest that Claude Code requires to actually load a
  plugin. In parallel, the same hook was registered again in `.claude/settings.json`.
  Result: either the hook ran twice (if interpreted as a plugin) or the plugin folder
  was dead code (if not). **Fix:** collapsed to the inline model — `gitnexus-hook.js`
  now lives at `.claude/hooks/gitnexus-hook.js` alongside the four shell hooks, and
  `.claude/settings.json` is the single source of truth for hook registration.

### 🔴 Fixed — security

- **`guard-destructive.sh`, `format-on-write.sh`, `log-agent.sh` now check for `jq`.**
  Previously, a machine without `jq` caused the hooks to crash silently. For
  `guard-destructive.sh` this was a real security hole — Claude Code interprets a
  crashed hook as "hook didn't block", so `rm -rf`, `git push --force`, and `DROP TABLE`
  would slip through. **Fix:**
  - `guard-destructive.sh` **fails closed** — missing `jq` now blocks every Bash call
    with a clear install message. Safer to be loud than silently unprotected.
  - `format-on-write.sh` fails open — formatting is advisory, missing `jq` just skips it.
  - `log-agent.sh` fails open — writes a placeholder entry noting `jq` was missing.

### 🟡 Fixed — consistency

- **`CLAUDE.md` MCP table** now lists `gitnexus` alongside `sequential-thinking` and
  `context7`, matching what `.mcp.json` actually declares. Agents will no longer be
  unaware of the GitNexus MCP when reading the main instructions file.

- **`.gitignore`** now excludes `.claude/agent-log.txt` (written by `log-agent.sh`)
  and `.gitnexus/` (the graph index directory). Neither belongs in version control.

- **`systems-architect.md`** step numbering fixed (previously: 1, 2, 2, 3, 4, …).

- **`README.md`** — added a Prerequisites section that makes the `jq` requirement
  explicit, and updated the directory tree to reflect the new hook location and
  the `.claude/skills/gitnexus/` folder.

### 🟢 Preserved — intentionally left alone

The following were audited and confirmed correct as shipped:

- All 12 agent definitions (only `systems-architect` received a numbering fix and
  the pre-existing GitNexus augmentation)
- All 7 GitNexus skills (copied verbatim from the upstream plugin)
- All 7 slash commands, 3 file-scoped rules, and all doc templates
- `SOUL.md`, `PRD.md`, `TODO.md`, `START_HERE.md`
