# jnmt.vn

> Nền tảng hỗ trợ học sinh THPT tại trường 전남미래국제고등학교 — tra cứu thông tin trường, tài liệu học tập, lịch thi và thông báo.

---

## Overview

jnmt.vn là dự án đầu tay được xây dựng bởi học sinh trường 전남미래국제고등학교 (Jeonnam Future International High School). Nền tảng tập trung toàn bộ tài nguyên học tập vào một nơi duy nhất, giúp học sinh THPT không còn phải tìm kiếm rải rác trên nhiều nguồn khác nhau.

Học sinh có thể tra cứu thông tin trường, tìm tài liệu học tập theo môn, xem lịch thi cập nhật và nhận thông báo từ trường — tất cả đều được tối ưu cho thiết bị di động và hỗ trợ đầy đủ tiếng Việt.

Dự án được triển khai dưới dạng PWA (Progressive Web App), cho phép học sinh cài đặt và sử dụng như một ứng dụng native ngay trên điện thoại.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js, TypeScript | App Router |
| Styling | Tailwind CSS | |
| Backend | Next.js API Routes | |
| Database | PostgreSQL | Hosted on Render |
| ORM | Prisma | |
| Auth | [TBD] | |
| Hosting | Render | Web service + PostgreSQL |
| CI/CD | GitHub Actions | |

---

## Getting Started

### Prerequisites

- Node.js (xem `.nvmrc` nếu có)
- pnpm
- PostgreSQL (local hoặc Render)

### Installation

```bash
# Clone repository
git clone https://github.com/[org]/jnmt.vn.git
cd jnmt.vn

# Install dependencies
pnpm install

# Copy biến môi trường
cp .env.example .env.local
# Điền các giá trị cần thiết vào .env.local
```

### Running Locally

```bash
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

### Running Tests

```bash
# Unit tests
pnpm test

# E2E tests (cần dev server đang chạy)
pnpm test:e2e

# Type checking
pnpm typecheck
```

---

## Project Structure

```
jnmt.vn/
├── src/
│   ├── app/              # Next.js App Router pages và layouts
│   ├── components/       # Shared UI components
│   └── lib/              # Utilities, helpers, shared logic
├── tests/
│   └── e2e/              # Playwright E2E tests
├── docs/
│   ├── user/             # Tài liệu người dùng
│   └── technical/        # Kiến trúc, API, database docs
├── .claude/agents/       # Claude Code specialist agents
├── public/               # Static assets
├── prisma/               # Prisma schema và migrations
├── PRD.md                # Product requirements (source of truth)
├── TODO.md               # Project backlog
└── CLAUDE.md             # Claude AI instructions
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Auth secret key |
| `NEXTAUTH_URL` | Yes | App base URL (e.g., https://jnmt.vn) |

Xem `.env.example` để biết tất cả biến môi trường khả dụng.

---

## Deployment

Ứng dụng deploy tự động qua GitHub Actions khi merge vào `main`.

- **Production**: https://jnmt.vn

Manual deployment:
```bash
pnpm build
```

---

## License

MIT
