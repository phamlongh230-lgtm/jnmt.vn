---
id: "001"
title: "Thiết kế Prisma schema cho jnmt.vn"
status: "completed"
area: "database"
agent: "@database-expert"
priority: "high"
created_at: "2026-04-19"
due_date: null
started_at: "2026-04-19"
completed_at: "2026-04-19"
prd_refs: ["FR-001", "FR-010", "FR-011", "FR-012", "FR-020", "FR-021", "FR-030", "FR-031"]
blocks: ["005", "006", "007", "008"]
blocked_by: []
---

## Description

Thiết kế và viết Prisma schema cho toàn bộ domain của jnmt.vn: thông tin trường học, tài liệu học tập, lịch thi, và thông báo. Schema phải đủ để serve tất cả API routes trong backlog (005–008). Cần quyết định structure cho file storage (URL field hay metadata) trước khi implement.

## Acceptance Criteria

- [ ] Model `School` — thông tin trường (tên, địa chỉ, liên hệ, mô tả)
- [ ] Model `Document` — tài liệu (tiêu đề, môn học, URL file, ngày upload, mô tả)
- [ ] Model `Exam` — lịch thi (môn, ngày, giờ, phòng thi, ghi chú)
- [ ] Model `Announcement` — thông báo (tiêu đề, nội dung, ngày đăng)
- [ ] Migration chạy thành công (`prisma migrate dev`)
- [ ] Seed data mẫu cho mỗi model (ít nhất 3 records mỗi loại)
- [ ] Indexes trên các trường thường query: `subject` (Document, Exam), `publishedAt` (Announcement)

## Technical Notes

- Xem ADR-001 trong `docs/technical/DECISIONS.md` — stack đã chọn là Prisma + PostgreSQL
- Quyết định file storage (Open Question #2 trong PRD) ảnh hưởng đến Document model — nếu chưa quyết định, dùng `fileUrl String` là URL tới file hosted ngoài
- Tham khảo `docs/technical/DATABASE.md` sau khi hoàn thành để update schema documentation

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-04-19 | human | Task created during onboarding |
| 2026-04-19 | @database-expert | Schema designed and written; seed data created; DATABASE.md updated |
