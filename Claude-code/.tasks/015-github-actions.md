---
id: "015"
title: "Setup GitHub Actions CI pipeline"
status: "todo"
area: "infra"
agent: "@cicd-engineer"
priority: "normal"
created_at: "2026-04-19"
due_date: null
started_at: null
completed_at: null
prd_refs: []
blocks: ["016"]
blocked_by: ["002"]
---

## Description

Setup GitHub Actions workflow chạy trên mỗi PR: lint, typecheck, và unit tests. Đảm bảo không có broken code vào `main`.

## Acceptance Criteria

- [ ] Workflow chạy trên `push` và `pull_request` vào `main`
- [ ] Steps: install deps → lint → typecheck → test
- [ ] Fail PR nếu bất kỳ step nào fail
- [ ] Cache `node_modules` để tăng tốc độ
- [ ] Workflow file tại `.github/workflows/ci.yml`

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-04-19 | human | Task created during onboarding |
