<!--
DOCUMENT METADATA
Owner: @systems-architect
Update trigger: System architecture changes, new integrations, component additions
Update scope:
  @systems-architect: Entire document
  @frontend-developer: May append to "Frontend Architecture" (never overwrite)
  @backend-developer: May append to "Backend Architecture" (never overwrite)
Read by: All agents. Always read before making implementation decisions.
For design tokens, component specs, and UX flows see DESIGN_SYSTEM.md (@ui-ux-designer).
-->

# System Architecture

> Last updated: 2026-04-19
> Version: 1.0.0

---

## Overview

jnmt.vn là một Next.js full-stack application sử dụng App Router, kết hợp Server Components cho SEO và performance với Client Components cho interactivity. API được xây dựng bằng Next.js Route Handlers, kết nối với PostgreSQL qua Prisma ORM.

Ứng dụng được triển khai như một monolith trên Render (web service + PostgreSQL), phục vụ cả SSR HTML lẫn API từ cùng một process. Kiến trúc đơn giản này phù hợp với quy mô hiện tại của dự án (first project, single developer).

```
  [Browser / Mobile PWA]
         │
         ▼
  [Next.js App — Render]
    ├── App Router (SSR pages)
    ├── API Route Handlers
    └── Static Assets
         │
         ▼
  [PostgreSQL — Render]
```

---

## Tech Stack

| Layer | Technology | Version | Why Chosen |
|-------|-----------|---------|------------|
| Frontend | Next.js | latest | SSR/SSG, App Router, full-stack trong một framework |
| Language | TypeScript | latest | Type safety, tốt cho học tập |
| Styling | Tailwind CSS | latest | Utility-first, nhanh prototyping |
| Backend | Next.js Route Handlers | — | Không cần server riêng, đơn giản hóa stack |
| Database | PostgreSQL | 15 | Reliable, free tier trên Render |
| ORM | Prisma | latest | Type-safe queries, migration tooling tốt |
| Auth | [TBD] | — | Chưa quyết định — xem Open Questions trong PRD |
| Hosting | Render | — | Free tier, đơn giản deploy |
| CI/CD | GitHub Actions | — | Tích hợp tốt với GitHub |
| PWA | next-pwa hoặc tương đương | — | Service worker, installable |

---

## System Components

### Frontend Architecture

**Routing**: Next.js App Router — pages defined in `src/app/`

**State management**: React Query cho server state; React Context hoặc Zustand cho client state nhỏ

**Component structure**:
```
src/components/
  ui/           # Primitive UI elements (Button, Input, Card...)
  features/     # Feature-specific composite components
  layouts/      # Page layout wrappers
```

**Data fetching pattern**: Server Components cho initial data load (SEO-friendly), Client Components + React Query cho mutations và real-time updates

---

### Backend Architecture

**API style**: REST — Next.js Route Handlers trong `src/app/api/`

**Middleware stack**:
1. Authentication — validates session trên protected routes
2. Request validation — validates body với Zod schemas
3. Error handler — formats errors trước khi trả về client

**Service layer pattern**: Thin route handlers gọi service functions trong `src/lib/services/`

---

### Infrastructure

**Environments**:
| Environment | URL | Branch | Notes |
|-------------|-----|--------|-------|
| Production | https://jnmt.vn | `main` | Auto-deploy trên Render |
| Local | `localhost:3000` | any | `pnpm dev` |

**CI/CD**: GitHub Actions — chạy lint, typecheck, unit tests trên mỗi PR. Deploy tự động trên Render khi merge vào `main`.

---

## Data Flow

### Xem tài liệu học tập

```
1. User truy cập /tai-lieu
2. Server Component fetch danh sách tài liệu từ PostgreSQL qua Prisma
3. HTML được render server-side và gửi cho browser
4. User click vào tài liệu → Client Component fetch chi tiết qua API Route
5. File được hiển thị hoặc download
```

### Xem lịch thi

```
1. User truy cập /lich-thi
2. Server Component fetch lịch thi theo tháng hiện tại
3. Client Component cho phép user chọn tháng/môn lọc
4. Filter trigger API call → trả về lịch thi mới
```

---

## Design system and UX

The canonical **design system** (tokens, typography, spacing, component inventory, interaction patterns) and **UX flow summaries** live in [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md). That file is owned by @ui-ux-designer. Other agents: read-only — do not edit it unless you are @ui-ux-designer.

---

## Security Architecture

**Authentication model**: [TBD — xem Open Questions trong PRD]

**Authorization**: Admin-only routes cho upload tài liệu và đăng thông báo

**Data protection**:
- HTTPS bắt buộc (Render enforce)
- Không lưu thông tin nhạy cảm của học sinh trong v1

---

## Performance Considerations

- Server Components render HTML trên server — giảm JS bundle size
- Prisma query caching cho dữ liệu ít thay đổi (thông tin trường)
- Next.js Image optimization tự động
- PWA Service Worker cache static assets

---

## Known Constraints and Technical Debt

| Item | Impact | Plan |
|------|--------|------|
| Auth chưa quyết định | Admin panel bị block | Quyết định trước khi implement backend |
| File storage chưa quyết định | Tài liệu học tập bị block | Chọn giữa Render disk, S3, hoặc Google Drive |
| Single developer | Velocity thấp hơn | Ưu tiên features thiết yếu của v1 |
