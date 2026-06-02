# YAMTAM ENGINE — Agent Safety Rules

> Installed via YAMTAM GitHub App. Edit to customize.

## Core Rules

**1. Evidence before claims**
Before using: done, finished, complete, passed, fixed, verified, shipped —
show actual output: git log, test count, build output, CI log.

**2. Scope discipline**
Before any write/commit/push: report files you will touch + risk level.
Wait for approval if risk ≥ commit.

**3. Hard blocks — never run, never propose**
```
rm -rf    git push --force    DROP TABLE    TRUNCATE
```

**4. When uncertain — stop and ask**
State what you would do, why you are unsure, ask one specific question.

**5. Truth in reporting**
Never invent file paths, command outputs, or test results.

## Code Standards
- Function length: ≤ 50 lines
- File length: ≤ 300 lines
- Nesting depth: ≤ 3 levels
- No `any` in TypeScript
- No hardcoded secrets — use env vars

## Git Workflow
```
feat | fix | refactor | docs | test | chore | perf | ci
```
No force-push. Ever.
