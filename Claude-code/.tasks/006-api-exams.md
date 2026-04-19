---
id: "006"
title: "API Route: GET /api/exams"
status: "todo"
area: "backend"
agent: "@backend-developer"
priority: "normal"
created_at: "2026-04-19"
due_date: null
started_at: null
completed_at: null
prd_refs: ["FR-020", "FR-021", "FR-022"]
blocks: ["011"]
blocked_by: ["001", "002"]
---

## Description

Implement `GET /api/exams` trả về lịch thi. Hỗ trợ filter theo tháng (`?month=2026-05`) và môn học (`?subject=ly`). Sắp xếp theo ngày thi tăng dần.

## Acceptance Criteria

- [ ] `GET /api/exams` trả về tất cả lịch thi sắp xếp theo ngày
- [ ] `?month=YYYY-MM` filter theo tháng
- [ ] `?subject=<subject>` filter theo môn
- [ ] Response include: id, subject, date, time, room, notes
- [ ] Input validated với Zod
- [ ] Unit tests cho service function

## Technical Notes

- Dùng Prisma `where` clause với date range cho filter tháng
- Xem schema từ task #001

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-04-19 | human | Task created during onboarding |
