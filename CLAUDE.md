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

### Routing
There is **no URL router** (wouter is not used). Page navigation is handled entirely by `activePage` state in `AppContext` (`src/context/AppContext.tsx`). To navigate: call `setActivePage("pagename")`. New pages must be registered in the `CurrentPage` switch in `App.tsx`.

### Styling
- **Design system**: iOS-style Liquid Glass (`src/index.css`). Glass utility classes: `glass`, `glass-panel`, `glass-nav`, `glass-btn`, `glass-input`, `glass-bottom`, `glass-hero`.
- **Color palette**: Primary `#e879a0` (pink), Secondary `#38bdf8` (sky blue). CSS variables: `--primary`, `--primary-dark`, `--secondary`, `--bg`, `--bg-secondary`, `--text`, `--text2`, `--border`.
- **Tailwind 4** + custom CSS variables — this is **not** the shadcn/HSL theme system. Don't use `hsl(var(--foreground))` patterns.
- **Dark mode**: toggled via `[data-theme="dark"]` attribute on `<html>`.

### i18n
All UI text goes through `t(lang, "key")`. Six locales: `vi` (preloaded), `ko`, `en`, `mn`, `kk`, `ru` (lazy-loaded). Translation files live in `src/lib/translations/`. When adding a new feature, add keys to **all 6** translation files — the `t()` function falls back to `vi` if a key is missing, which silently hides missing translations.

### Data fetching
Use the generated hooks from `@workspace/api-client-react` — don't write ad-hoc `fetch` calls for endpoints already in the OpenAPI spec.

### Global animation components
Two components are mounted globally in `AppContent` (`App.tsx`):
- `MeshBackground` — 6 animated floating blobs (the coloured background)
- `AnimationEffects` — ripple on click, 3D card tilt, cursor glow, scroll reveal

These use CSS classes `mesh-blob` and `ripple-ring` defined in `index.css`.

### Adding a new page
1. Create `src/pages/MyPage.tsx`
2. Lazy-import it in `App.tsx` and add a `case "mypage"` to `CurrentPage`
3. Add `{ page: "mypage", icon: "…", key: "mykey", color: "…" }` to `ALL_PINNABLE` in `HomePage.tsx`
4. Optionally add to a `TOOL_GROUPS` group in `Navbar.tsx`
5. Add i18n keys for all 6 locales

## Auth

JWT-based (bcryptjs + jsonwebtoken, cookie-parser on the server). Users/messages tables live in `lib/db/src/schema`. The frontend has login/register modals driven by the generated hooks. Token is stored via `src/lib/auth.ts` and injected into API calls via `setAuthTokenGetter`.
