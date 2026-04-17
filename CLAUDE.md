# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See also: `replit.md` has the project overview (stack, features, deployment). This file covers the non-obvious pieces.

## Workspace layout

pnpm workspace monorepo. Packages (all under `@workspace/*`):

- `artifacts/jnmt-hub` — React 19 + Vite 7 frontend (the student portal UI)
- `artifacts/api-server` — Express 5 API, bundled to a single CJS via esbuild
- `artifacts/mockup-sandbox` — separate sandbox app
- `lib/db` — Drizzle schema + pg pool (exports `@workspace/db` and `@workspace/db/schema`)
- `lib/api-spec` — OpenAPI source of truth (`openapi.yaml`) + Orval codegen config
- `lib/api-zod` — **generated** Zod schemas (from OpenAPI)
- `lib/api-client-react` — **generated** React Query hooks (from OpenAPI)
- `scripts` — workspace tooling (tsx)

`pnpm-workspace.yaml` declares a `catalog:` for shared versions — when adding deps that already exist in the catalog, reference `"catalog:"` rather than pinning a version.

Package manager is enforced: the root `preinstall` hook refuses non-pnpm installs and deletes stray lockfiles.

## Common commands

Root:
- `pnpm run typecheck` — typechecks libs (tsc --build) then each app/script
- `pnpm run build` — typecheck + recursive build across all packages

Per-package (run via `pnpm --filter <name> run <script>`):
- `@workspace/jnmt-hub`: `dev` (Vite on 0.0.0.0), `build`, `serve`, `typecheck`
- `@workspace/api-server`: `dev` (builds then runs), `build` (esbuild → `dist/index.mjs`), `start`, `typecheck`
- `@workspace/db`: `push` (drizzle-kit push), `push-force` (for CI/CD)
- `@workspace/api-spec`: `codegen` — regenerates `api-zod` and `api-client-react` from `openapi.yaml`

There is **no test runner configured** in this repo; don't invent a `test` script.

## Codegen flow — important

`openapi.yaml` in `lib/api-spec` is the source of truth for API surface. After editing it, run:

```
pnpm --filter @workspace/api-spec run codegen
```

This regenerates `lib/api-zod` (Zod validators) and `lib/api-client-react` (React Query hooks). Don't hand-edit those packages — changes will be wiped.

The API server validates request bodies with `@workspace/api-zod`; the frontend consumes `@workspace/api-client-react`. Keep them in sync by always running codegen after OpenAPI edits.

## Build architecture quirks

- **API server** is bundled to a **single `.mjs` file** via `artifacts/api-server/build.mjs` (esbuild + esbuild-plugin-pino). Production start is `node artifacts/api-server/dist/index.mjs`. In production, this same process serves the built frontend from `artifacts/jnmt-hub/dist/public/` — there is no separate static host.
- **Frontend build output** goes to `dist/public/` (not the default `dist/`) so the API server can serve it.
- **esbuild platform overrides**: `pnpm-workspace.yaml` strips every esbuild/rollup/lightningcss/tailwind/expo platform binary except Linux x64 (Replit/Render target). If you develop on macOS/Windows, you may need to add your platform back or expect install issues.

## Deployment

`render.yaml` declares a web service + PostgreSQL. `render-build.sh` runs pnpm install → build → `db push-force`. Start command is the bundled API mjs. The API serves the SPA, so there's only one deployable.

## Frontend conventions

- **Styling**: Tailwind 4 + custom CSS variables (`--primary`, `--bg`, `--text`, …) in `index.css`. This is **not** the shadcn/HSL theme system even though `components.json` and many Radix primitives are present — don't assume `hsl(var(--foreground))` patterns work.
- **Dark mode**: toggled via `[data-theme="dark"]` attribute on `<html>` (not Tailwind's `dark:` class strategy).
- **Router**: `wouter` (not react-router).
- **i18n**: all UI text goes through `t(lang, "key")`; six locales. Don't hardcode user-facing strings.
- **Data fetching**: use the generated hooks from `@workspace/api-client-react` — don't write ad-hoc `fetch` calls for endpoints already in the OpenAPI spec.

## Auth

JWT-based (bcryptjs + jsonwebtoken, cookie-parser on the server). Users/messages tables live in `lib/db/src/schema`. The frontend has login/register modals driven by the generated hooks.
