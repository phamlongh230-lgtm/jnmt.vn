---
id: "014"
title: "PWA config: manifest, service worker, installable"
status: "todo"
area: "frontend"
agent: "@frontend-developer"
priority: "normal"
created_at: "2026-04-19"
due_date: null
started_at: null
completed_at: null
prd_refs: ["FR-040"]
blocks: []
blocked_by: ["002", "009"]
---

## Description

Configure jnmt.vn như một Progressive Web App: web manifest, service worker để cache static assets, và icons để installable trên mobile.

## Acceptance Criteria

- [ ] `manifest.json` với name, icons, theme_color, display: standalone
- [ ] Service worker cache static assets (next-pwa hoặc tương đương)
- [ ] App installable trên Chrome mobile (Add to Home Screen)
- [ ] Lighthouse PWA audit ≥ 3/3 installability criteria
- [ ] App icon 192x192 và 512x512

## Technical Notes

- Dùng `next-pwa` package hoặc Next.js built-in PWA support nếu có trong version đang dùng
- Icons cần được tạo — placeholder icons OK cho MVP

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-04-19 | human | Task created during onboarding |
