# JNMT Student Hub

## Overview

Vietnamese international school student portal (전남미래국제고등학교 / Jeonnam Future International High School). Features chat, translation/dictionary, schedule, and campus map. pnpm workspace monorepo using TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 19 + Vite 7 + Tailwind CSS 4
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT (bcryptjs + jsonwebtoken)
- **Validation**: Zod, drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle for API), Vite (frontend)

## Architecture

- `artifacts/jnmt-hub/` — React frontend (Vite)
- `artifacts/api-server/` — Express API server
- `lib/db/` — Drizzle ORM schema + connection (users, messages tables)
- `lib/api-spec/` — OpenAPI spec + codegen config
- `lib/api-zod/` — Generated Zod schemas
- `lib/api-client-react/` — Generated React Query hooks

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/db run push-force` — push DB schema (force, for CI/CD)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Deployment (Render)

- `render.yaml` — Render Blueprint (web service + PostgreSQL database)
- `render-build.sh` — Build script: installs pnpm, builds frontend + API, pushes DB schema
- Start command: `NODE_ENV=production node artifacts/api-server/dist/index.mjs`
- In production, API server serves static frontend from `artifacts/jnmt-hub/dist/public/`

## Frontend Features

- Multi-language support (Vietnamese, English, Korean, Japanese, Chinese, French)
- Dark/light theme toggle
- Pages: Home, Dictionary, Schedule, Chat, Map
- JWT auth with login/register modals

## CSS

- Uses custom CSS variables (`--primary`, `--bg`, `--text`, etc.) — NOT shadcn/HSL theme system
- Dark mode via `[data-theme="dark"]` attribute

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
