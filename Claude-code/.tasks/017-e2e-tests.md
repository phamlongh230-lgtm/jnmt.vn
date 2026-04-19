---
id: "017"
title: "E2E tests cho 3 happy paths chính"
status: "todo"
area: "qa"
agent: "@qa-engineer"
priority: "normal"
created_at: "2026-04-19"
due_date: null
started_at: null
completed_at: null
prd_refs: ["FR-010", "FR-020", "FR-030"]
blocks: []
blocked_by: ["010", "011", "012"]
---

## Description

Viết Playwright E2E tests cho 3 happy paths quan trọng nhất: xem danh sách tài liệu và lọc, xem lịch thi, và đọc thông báo.

## Acceptance Criteria

- [ ] Test: User vào /tai-lieu, thấy danh sách tài liệu, filter theo môn, kết quả đúng
- [ ] Test: User vào /lich-thi, thấy lịch thi, filter theo tháng, lịch thi đúng
- [ ] Test: User vào /thong-bao, thấy danh sách thông báo, click xem chi tiết
- [ ] Tất cả selectors dùng `data-testid`
- [ ] Page Object Model pattern
- [ ] Tests pass trên local với dev server chạy

## Technical Notes

- Xem `.claude/rules/tests.md` cho test conventions bắt buộc
- Cần `data-testid` attributes được thêm vào frontend components (coordinate với @frontend-developer)

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-04-19 | human | Task created during onboarding |
