---
id: "010"
title: "Frontend: Trang tài liệu học tập (/tai-lieu)"
status: "todo"
area: "frontend"
agent: "@frontend-developer"
priority: "normal"
created_at: "2026-04-19"
due_date: null
started_at: null
completed_at: null
prd_refs: ["FR-010", "FR-011", "FR-012", "FR-013"]
blocks: []
blocked_by: ["002", "003", "004", "005"]
---

## Description

Implement trang /tai-lieu hiển thị danh sách tài liệu học tập với filter theo môn và search. Fetch data từ `/api/documents`.

## Acceptance Criteria

- [ ] Danh sách tài liệu dạng card (tiêu đề, môn, mô tả, nút tải/xem)
- [ ] Filter dropdown theo môn học
- [ ] Search input theo tên tài liệu
- [ ] Empty state khi không có kết quả
- [ ] Loading state khi fetch data
- [ ] Mobile responsive (375px+)

## Technical Notes

- Client Component cho filter/search interactivity
- Fetch từ `/api/documents` với query params

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-04-19 | human | Task created during onboarding |
