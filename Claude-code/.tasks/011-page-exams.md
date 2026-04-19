---
id: "011"
title: "Frontend: Trang lịch thi (/lich-thi)"
status: "todo"
area: "frontend"
agent: "@frontend-developer"
priority: "normal"
created_at: "2026-04-19"
due_date: null
started_at: null
completed_at: null
prd_refs: ["FR-020", "FR-021", "FR-022"]
blocks: []
blocked_by: ["002", "003", "004", "006"]
---

## Description

Implement trang /lich-thi hiển thị lịch thi với filter theo tháng và môn học. Fetch từ `/api/exams`.

## Acceptance Criteria

- [ ] List lịch thi (môn, ngày, giờ, phòng thi)
- [ ] Filter theo tháng (picker hoặc prev/next buttons)
- [ ] Filter theo môn học
- [ ] Sắp xếp theo ngày thi
- [ ] Empty state khi không có lịch thi trong khoảng thời gian
- [ ] Mobile responsive (375px+)

## Technical Notes

- Client Component cho filter interactivity
- Fetch từ `/api/exams?month=YYYY-MM`

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-04-19 | human | Task created during onboarding |
