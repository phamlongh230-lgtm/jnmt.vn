---
id: "002"
title: "Setup Next.js project với đầy đủ tooling"
status: "todo"
area: "setup"
agent: "@backend-developer"
priority: "high"
created_at: "2026-04-19"
due_date: null
started_at: null
completed_at: null
prd_refs: ["FR-040", "FR-041", "FR-042"]
blocks: ["005", "006", "007", "008", "009", "010", "011", "012", "013"]
blocked_by: []
---

## Description

Khởi tạo Next.js project mới với TypeScript strict mode, Tailwind CSS, Prisma (kết nối PostgreSQL), ESLint, Prettier, và Vitest. Đây là nền tảng cho toàn bộ implementation sau. Đảm bảo `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm typecheck` đều hoạt động.

## Acceptance Criteria

- [ ] `npx create-next-app` với TypeScript, Tailwind, App Router, src/ directory
- [ ] Prisma configured, kết nối được PostgreSQL local qua `DATABASE_URL`
- [ ] ESLint + Prettier configured và chạy không có lỗi trên codebase mới
- [ ] Vitest configured (`pnpm test` chạy được)
- [ ] `.env.example` với tất cả biến cần thiết (không có giá trị thật)
- [ ] `pnpm dev` chạy và mở được localhost:3000
- [ ] `pnpm build` thành công
- [ ] `pnpm typecheck` pass
- [ ] README.md updated với đúng Node version nếu `.nvmrc` được tạo

## Technical Notes

- Dùng Next.js App Router (không phải Pages Router)
- TypeScript strict mode: `"strict": true` trong tsconfig
- Absolute imports từ `src/`
- Tham khảo CLAUDE.md để biết conventions về code style

## History

| Date | Agent / Human | Event |
|------|--------------|-------|
| 2026-04-19 | human | Task created during onboarding |
