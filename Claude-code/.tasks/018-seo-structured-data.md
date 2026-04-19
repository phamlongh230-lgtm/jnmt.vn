---
id: "018"
title: "SEO: Structured data (Organization, WebSite, BreadcrumbList)"
status: "todo"
area: "content"
agent: "@copywriter-seo"
priority: "low"
created_at: "2026-04-19"
due_date: null
started_at: null
completed_at: null
prd_refs: []
blocks: []
blocked_by: ["009", "010", "011"]
---

## Description

Implement JSON-LD structured data trên các trang chính để tăng SEO visibility. Ưu tiên Organization và WebSite trên homepage, BreadcrumbList trên các trang con.

## Acceptance Criteria

- [ ] `Organization` schema trên homepage (tên trường, URL, contactPoint)
- [ ] `WebSite` schema trên homepage (SearchAction nếu có search)
- [ ] `BreadcrumbList` trên /tai-lieu, /lich-thi, /thong-bao, /truong
- [ ] Validate qua Google Rich Results Test (không có lỗi)
- [ ] Document vào CONTENT_STRATEGY.md Structured Data section

## Technical Notes

- Implement bằng Next.js `<Script type="application/ld+json">` trong layout hoặc page
- Xem CONTENT_STRATEGY.md Technical SEO section

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-04-19 | human | Task created during onboarding |
