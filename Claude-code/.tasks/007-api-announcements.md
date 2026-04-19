---
id: "007"
title: "API Route: GET /api/announcements"
status: "todo"
area: "backend"
agent: "@backend-developer"
priority: "normal"
created_at: "2026-04-19"
due_date: null
started_at: null
completed_at: null
prd_refs: ["FR-030", "FR-031", "FR-032"]
blocks: ["012"]
blocked_by: ["001", "002"]
---

## Description

Implement `GET /api/announcements` trả về danh sách thông báo trường, mới nhất trước. Hỗ trợ pagination cơ bản.

## Acceptance Criteria

- [ ] `GET /api/announcements` trả về thông báo sorted by publishedAt DESC
- [ ] `?page=N&limit=N` pagination
- [ ] Response include: id, title, content, publishedAt
- [ ] Unit tests cho service function

## Technical Notes

- Default limit: 20 per page
- Xem schema từ task #001

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-04-19 | human | Task created during onboarding |
