---
id: "008"
title: "API Route: GET /api/school"
status: "todo"
area: "backend"
agent: "@backend-developer"
priority: "normal"
created_at: "2026-04-19"
due_date: null
started_at: null
completed_at: null
prd_refs: ["FR-001", "FR-002", "FR-003"]
blocks: ["013"]
blocked_by: ["001", "002"]
---

## Description

Implement `GET /api/school` trả về thông tin trường học. Đây là dữ liệu tương đối tĩnh — cần caching phù hợp.

## Acceptance Criteria

- [ ] `GET /api/school` trả về thông tin trường (tên, địa chỉ, liên hệ, mô tả)
- [ ] Response được cache — Next.js `revalidate` tag hoặc tương đương
- [ ] Unit test cho service function

## Technical Notes

- Dữ liệu ít thay đổi — có thể dùng Next.js `fetch` với `revalidate: 3600`
- Xem schema từ task #001

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-04-19 | human | Task created during onboarding |
