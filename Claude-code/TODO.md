# TODO / Backlog

> **Governor**: @project-manager — invoke for sprint planning, prioritization, and feature breakdown
> **Agents**: May add items to "Backlog" and move completed items to "Completed". Preserve section order. Never reorder items within a section — priority position is set by humans or @project-manager when explicitly asked.

---

## In Progress

*(none)*

---

## Up Next (prioritized)

- [ ] #001 — Thiết kế Prisma schema (trường, tài liệu, lịch thi, thông báo) [area: database] → [.tasks/001-prisma-schema.md](.tasks/001-prisma-schema.md)
- [ ] #002 — Setup Next.js project với TypeScript, Tailwind, Prisma, ESLint, Prettier [area: setup] → [.tasks/002-nextjs-setup.md](.tasks/002-nextjs-setup.md)
- [ ] #003 — Thiết kế UX/UI wireframe cho 4 trang chính (trường, tài liệu, lịch thi, thông báo) [area: design] → [.tasks/003-ux-wireframes.md](.tasks/003-ux-wireframes.md)
- [ ] #004 — Viết landing page copy + meta tags cho Homepage, /tai-lieu, /lich-thi [area: content] → [.tasks/004-landing-copy.md](.tasks/004-landing-copy.md)

---

## Backlog

- [ ] #005 — API Route: GET /api/documents (danh sách tài liệu, filter theo môn) [area: backend] → [.tasks/005-api-documents.md](.tasks/005-api-documents.md)
- [ ] #006 — API Route: GET /api/exams (lịch thi, filter theo tháng/môn) [area: backend] → [.tasks/006-api-exams.md](.tasks/006-api-exams.md)
- [ ] #007 — API Route: GET /api/announcements (danh sách thông báo) [area: backend] → [.tasks/007-api-announcements.md](.tasks/007-api-announcements.md)
- [ ] #008 — API Route: GET /api/school (thông tin trường) [area: backend] → [.tasks/008-api-school.md](.tasks/008-api-school.md)
- [ ] #009 — Frontend: Trang chủ (Homepage) với navigation và hero section [area: frontend] → [.tasks/009-page-homepage.md](.tasks/009-page-homepage.md)
- [ ] #010 — Frontend: Trang tài liệu học tập (/tai-lieu) [area: frontend] → [.tasks/010-page-documents.md](.tasks/010-page-documents.md)
- [ ] #011 — Frontend: Trang lịch thi (/lich-thi) [area: frontend] → [.tasks/011-page-exams.md](.tasks/011-page-exams.md)
- [ ] #012 — Frontend: Trang thông báo trường (/thong-bao) [area: frontend] → [.tasks/012-page-announcements.md](.tasks/012-page-announcements.md)
- [ ] #013 — Frontend: Trang thông tin trường (/truong) [area: frontend] → [.tasks/013-page-school.md](.tasks/013-page-school.md)
- [ ] #014 — PWA config: manifest.json, service worker, installable [area: frontend] → [.tasks/014-pwa-config.md](.tasks/014-pwa-config.md)
- [ ] #015 — Setup GitHub Actions CI (lint, typecheck, test) [area: infra] → [.tasks/015-github-actions.md](.tasks/015-github-actions.md)
- [ ] #016 — Deploy lên Render (web service + PostgreSQL) [area: infra] → [.tasks/016-render-deploy.md](.tasks/016-render-deploy.md)
- [ ] #017 — E2E tests cho 3 happy paths chính (xem tài liệu, lịch thi, thông báo) [area: qa] → [.tasks/017-e2e-tests.md](.tasks/017-e2e-tests.md)
- [ ] #018 — SEO: structured data (Organization, WebSite, BreadcrumbList) [area: content] → [.tasks/018-seo-structured-data.md](.tasks/018-seo-structured-data.md)

---

## Completed

- [x] #000 — Initial project setup và template configuration → [.tasks/000-initial-project-setup.md](.tasks/000-initial-project-setup.md)

---

## Item Format Guide

When adding new items, use this format:

```
- [ ] #NNN — Brief description of the task [area: frontend|backend|database|qa|docs|infra|design|content|setup] → [.tasks/NNN-short-title.md](.tasks/NNN-short-title.md)
```

Every TODO item must have a corresponding `.tasks/NNN-*.md` file. @project-manager creates both together.
