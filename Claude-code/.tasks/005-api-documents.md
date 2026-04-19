---
id: "005"
title: "API Route: GET /api/documents"
status: "todo"
area: "backend"
agent: "@backend-developer"
priority: "normal"
created_at: "2026-04-19"
due_date: null
started_at: null
completed_at: null
prd_refs: ["FR-010", "FR-011", "FR-012", "FR-013"]
blocks: ["010"]
blocked_by: ["001", "002"]
---

## Description

Implement API Route Handler `GET /api/documents` trả về danh sách tài liệu học tập. Hỗ trợ filter theo môn học (`?subject=toan`) và search theo tên (`?q=dai-so`). Validate input với Zod.

## Acceptance Criteria

- [ ] `GET /api/documents` trả về tất cả tài liệu (array JSON)
- [ ] `?subject=<subject>` filter đúng theo môn học
- [ ] `?q=<query>` search theo tên tài liệu (case-insensitive)
- [ ] Response include: id, title, subject, fileUrl, description, createdAt
- [ ] 404 không xảy ra — trả về empty array nếu không có kết quả
- [ ] Input validated với Zod
- [ ] Unit tests cho service function

## Technical Notes

- Dùng Prisma để query — schema từ task #001
- Xem ARCHITECTURE.md về service layer pattern: thin route handler + service function trong `src/lib/services/`

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-04-19 | human | Task created during onboarding |
