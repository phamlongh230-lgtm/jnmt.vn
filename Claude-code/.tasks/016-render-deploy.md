---
id: "016"
title: "Deploy lên Render (web service + PostgreSQL)"
status: "todo"
area: "infra"
agent: "@cicd-engineer"
priority: "normal"
created_at: "2026-04-19"
due_date: null
started_at: null
completed_at: null
prd_refs: []
blocks: []
blocked_by: ["002", "001", "015"]
---

## Description

Deploy jnmt.vn lên Render: tạo web service kết nối với PostgreSQL, configure environment variables, và setup auto-deploy từ `main` branch.

## Acceptance Criteria

- [ ] Render web service tạo và deploy thành công
- [ ] Render PostgreSQL instance tạo và kết nối với web service
- [ ] `DATABASE_URL` và các env vars khác configured trong Render dashboard
- [ ] `prisma migrate deploy` chạy thành công khi deploy
- [ ] Auto-deploy khi push vào `main`
- [ ] https://jnmt.vn (hoặc render subdomain) accessible

## Technical Notes

- Render free tier có cold start — acceptable cho v1
- Build command: `pnpm build`
- Start command: `node .next/standalone/server.js` (cần Next.js standalone output)
- Xem ADR-001 về lý do chọn Render

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-04-19 | human | Task created during onboarding |
