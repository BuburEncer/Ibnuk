# CLAUDE.md

Personal portfolio for Ibnu Qayyim. Minimalist hero, curated projects list, single-password admin.

## Stack

- Next.js 15 (App Router, React 19), TypeScript
- PostgreSQL (Vercel Postgres / Neon), Drizzle ORM
- Vitest for unit tests

## Commands

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run test` — unit tests
- `npm run generate` — Drizzle migration generate
- `npm run migrate` — apply migrations

## Folder structure

```
app/
  page.tsx            # hero
  projects/page.tsx   # curated project list
  admin/              # password-protected CRUD
  lib/                # db.ts, auth.ts, project utils
  actions/            # Server Actions
db/
  schema.ts           # projects table
  migrations/
```

## Conventions

- Server Components query DB directly. No client fetch layer.
- Admin writes via Server Actions, guarded by `ADMIN_PASSWORD` env.
- Password compared server-side only. Never shipped to client.
- Project listing seeded/curated manually via admin. No GitHub API.
- Validation server-side: non-empty title, URL format for link.
- DB failure shows friendly message, never raw error.

## Rules

- `.env` gitignored. Provide `.env.example`. Secrets only via env.
- Summary/review on full diff before finishing branch.
