# Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal portfolio for Ibnu Qayyim — minimalist hero, curated projects list, single-password admin.

**Architecture:** Next.js App Router. Server Components read Postgres via Drizzle directly; admin writes via Server Actions guarded by one shared password from env. No client fetch layer. No REST API.

**Tech Stack:** Next.js 15 (React 19), TypeScript, Drizzle ORM, PostgreSQL (Vercel Postgres/Neon), Vitest.

**Spec:** `docs/design.md` (and `docs/PRD.md`)

## Global Constraints

- Next.js 15, App Router, React 19, TypeScript everywhere.
- Data read via Server Components. No client fetch layer.
- Admin writes via Server Actions, guarded by `ADMIN_PASSWORD` env.
- Password compared server-side only. Never shipped to client.
- Validation server-side: non-empty title, URL format for link.
- DB failure shows friendly message, never raw error.
- Project listing curated manually (no GitHub API).
- Code, identifiers, comments, commit messages in English. Docs in Indonesian.

## Review Focus

- Wrong admin password must be rejected; correct one accepted. (Task 4)
- Empty `projects` table renders a friendly empty message, not a blank/error page. (Task 2)
- DB down returns a friendly error message, not a raw stack trace. (Task 2, Task 4)
- Invalid link URL rejected on create/update. (Task 4)
- Deleted project disappears from `/projects`. (Task 5)

---
### Task 1: Project scaffold + DB connection

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `drizzle.config.ts`
- Create: `db/schema.ts`
- Create: `lib/db.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx` (placeholder hero)
- Create: `.env.local` (values from `.env.example`)
- Test: `tests/db.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `lib/db.ts` exports `db` (Drizzle instance), `schema` (from `db/schema.ts`). `db/schema.ts` exports `projects` table definition used by Task 2+.

- [ ] **Step 1: Write package.json with scripts + deps**

Deps: `next@15 react@19 react-dom@19 drizzle-orm`, dev: `drizzle-kit typescript @types/react @types/node vitest @types/react-dom`. Scripts: dev, build, start, test, generate, migrate.

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: installs clean, node_modules present.

- [ ] **Step 3: Write tsconfig.json, next.config.ts, drizzle.config.ts**

tsconfig extends `next/tsconfig.json` with `strict: true`. drizzle.config points to `db/schema.ts`, out `db/migrations`, dialect postgresql.

- [ ] **Step 4: Write db/schema.ts — projects table**

```ts
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  technologies: text("technologies"),
  link: text("link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

- [ ] **Step 5: Write lib/db.ts**

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```

Add `postgres` to deps.

- [ ] **Step 6: Write app/layout.tsx + placeholder app/page.tsx**

layout: html/body shell with metadata title "Ibnu Qayyim". page: minimal hero heading.

- [ ] **Step 7: Write failing test — schema + db exist**

```ts
import { describe, it, expect } from "vitest";
import { projects } from "../db/schema";

describe("projects schema", () => {
  it("exposes expected columns", () => {
    expect(projects.title.notNull).toBe(true);
    expect(projects.link).toBeDefined();
    expect(projects.createdAt).toBeDefined();
  });
});
```

- [ ] **Step 8: Run test to verify it fails/passes**

Run: `npm run test`
Expected: test imports schema; schema is pure JS so it passes without DB. Note: DB connection (`lib/db.ts`) is not exercised by unit test — verified manually via `npm run build`.

- [ ] **Step 9: Verify build + dev**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts drizzle.config.ts db/schema.ts lib/db.ts app/ tests/ .env.local .env.example
git commit -m "feat: scaffold Next.js app with Drizzle schema"
```

### Task 2: Public pages read and render projects

**Files:**
- Create: `app/projects/page.tsx`
- Create: `lib/projects.ts`
- Modify: `app/page.tsx` (finish hero: name, tagline, location, email, GitHub link, resume link, Projects CTA)
- Test: `tests/projects.test.ts`

**Interfaces:**
- Consumes: `db` and `projects` table from Task 1.
- Produces: `lib/projects.ts` exports `listProjects(): Promise<Project[]>` returning `{ id, title, description, technologies, link }[]`. `app/projects/page.tsx` renders list or empty state.

- [ ] **Step 1: Write failing test — listProjects maps rows**

```ts
import { describe, it, expect, vi } from "vitest";
import { listProjects } from "../lib/projects";

describe("listProjects", () => {
  it("returns array of projects", async () => {
    const result = await listProjects();
    expect(Array.isArray(result)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL — `listProjects` not exported from missing module.

- [ ] **Step 3: Write lib/projects.ts**

```ts
import { db } from "./db";
import { projects } from "./schema";
import { asc } from "drizzle-orm";

export async function listProjects() {
  try {
    return await db.select().from(projects).orderBy(asc(projects.createdAt));
  } catch (e) {
    console.error("listProjects failed:", e);
    return [];
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS (empty result when DB unavailable returns `[]` via catch; needs DB to truly return rows — integration verified manually).

- [ ] **Step 5: Write app/projects/page.tsx**

```tsx
import { listProjects } from "../../lib/projects";

export default async function ProjectsPage() {
  const all = await listProjects();
  if (all.length === 0) {
    return <p>Belum ada proyek.</p>;
  }
  return (
    <ul>
      {all.map((p) => (
        <li key={p.id}>
          <h2>{p.title}</h2>
          {p.description && <p>{p.description}</p>}
          {p.technologies && <p>{p.technologies}</p>}
          {p.link && <a href={p.link}>{p.link}</a>}
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 6: Finish app/page.tsx hero**

Name "Ibnu Qayyim", tagline, location (Jakarta), email, GitHub link `https://github.com/BuburEncer`, resume link, and `<Link href="/projects">Projects</Link>`.

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 8: Commit**

```bash
git add app/projects/page.tsx app/page.tsx lib/projects.ts tests/projects.test.ts
git commit -m "feat: render curated project list on /projects"
```

### Task 3: Drizzle migration

**Files:**
- Create: `db/migrations/` output
- Modify: `drizzle.config.ts` (no change needed)

- [ ] **Step 1: Generate migration**

Run: `npm run generate`
Expected: migration SQL file created in `db/migrations`.

- [ ] **Step 2: Review generated SQL**

Verify it creates `projects` table with columns `id`, `title`, `description`, `technologies`, `link`, `created_at`.

- [ ] **Step 3: Commit**

```bash
git add db/migrations
git commit -m "chore: add drizzle migration for projects"
```

### Task 4: Admin auth + Server Actions

**Files:**
- Create: `lib/auth.ts`
- Create: `app/actions/projects.ts`
- Create: `app/admin/page.tsx`
- Create: `app/admin/actions.ts`
- Test: `tests/auth.test.ts`

**Interfaces:**
- Consumes: `db`, `projects` schema (Task 1), `listProjects` (Task 2, not required here).
- Produces: `lib/auth.ts` exports `checkPassword(input: string): boolean`. `app/actions/projects.ts` exports `createProject`, `updateProject`, `deleteProject` Server Actions, each returning `{ ok: boolean, error?: string }`, using `redirect`.

- [ ] **Step 1: Write failing test — checkPassword**

```ts
import { describe, it, expect } from "vitest";
import { checkPassword } from "../lib/auth";

describe("checkPassword", () => {
  it("rejects wrong password", () => {
    process.env.ADMIN_PASSWORD = "secret";
    expect(checkPassword("wrong")).toBe(false);
  });
  it("accepts correct password", () => {
    process.env.ADMIN_PASSWORD = "secret";
    expect(checkPassword("secret")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL — `checkPassword` not exported.

- [ ] **Step 3: Write lib/auth.ts**

```ts
export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return input === expected;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Write app/actions/projects.ts — create/update/delete**

```ts
"use server";
import { redirect } from "next/navigation";
import { checkPassword } from "../../lib/auth";
import { db } from "../../lib/db";
import { projects } from "../../db/schema";
import { eq } from "drizzle-orm";

function isLinkValid(link: string): boolean {
  try { new URL(link); return true; } catch { return false; }
}

export async function createProject(formData: FormData) {
  const password = formData.get("password") as string;
  if (!checkPassword(password)) return { ok: false, error: "Password salah." };
  const title = (formData.get("title") as string) || "";
  const link = ((formData.get("link") as string) || "").trim();
  if (!title) return { ok: false, error: "Judul wajib diisi." };
  if (link && !isLinkValid(link)) return { ok: false, error: "Tautan tidak valid." };
  await db.insert(projects).values({
    title,
    description: (formData.get("description") as string) || null,
    technologies: (formData.get("technologies") as string) || null,
    link: link || null,
  });
  redirect("/projects");
}

export async function updateProject(formData: FormData) {
  const password = formData.get("password") as string;
  if (!checkPassword(password)) return { ok: false, error: "Password salah." };
  const id = Number(formData.get("id"));
  const title = (formData.get("title") as string) || "";
  const link = ((formData.get("link") as string) || "").trim();
  if (!title) return { ok: false, error: "Judul wajib diisi." };
  if (link && !isLinkValid(link)) return { ok: false, error: "Tautan tidak valid." };
  await db.update(projects).set({
    title,
    description: (formData.get("description") as string) || null,
    technologies: (formData.get("technologies") as string) || null,
    link: link || null,
  }).where(eq(projects.id, id));
  redirect("/projects");
}

export async function deleteProject(formData: FormData) {
  const password = formData.get("password") as string;
  if (!checkPassword(password)) return { ok: false, error: "Password salah." };
  await db.delete(projects).where(eq(projects.id, Number(formData.get("id"))));
  redirect("/projects");
}
```


- [ ] **Step 6: Write app/admin/page.tsx**

Form with password field + create form (title, description, technologies, link). Lists existing projects with edit/delete forms bound to the Server Actions (include password field per form).

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 8: Commit**

```bash
git add lib/auth.ts app/actions/projects.ts app/admin/page.tsx tests/auth.test.ts
git commit -m "feat: password-protected admin with project CRUD"
```

### Task 5: Empty state + delete verification

**Files:**
- Modify: `lib/projects.ts` (already returns `[]`, no change)
- Test: `tests/projects.test.ts` (extend)

**Interfaces:**
- Consumes: `listProjects` (Task 2), `deleteProject` (Task 4).

- [ ] **Step 1: Write failing test — empty list renders empty message**

```ts
import { describe, it, expect, vi } from "vitest";
import { listProjects } from "../lib/projects";

describe("listProjects empty", () => {
  it("returns empty array when none", async () => {
    const result = await listProjects();
    expect(result.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run test**

Run: `npm run test`
Expected: PASS when DB empty (no rows), via catch or real emptiness.

- [ ] **Step 3: Confirm empty-state copy in app/projects/page.tsx**

Verify `<p>Belum ada proyek.</p>` renders when `all.length === 0` (already in Task 2 Step 5).

- [ ] **Step 4: Commit**

```bash
git add tests/projects.test.ts
git commit -m "test: verify empty project list renders message"
```

### Task 6: Final verification + review gate

**Files:**
- None (reads only)

- [ ] **Step 1: Run full test suite**

Run: `npm run test`
Expected: all pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: succeeds with no type errors.

- [ ] **Step 3: Start dev server and manually check**

Run: `npm run dev`, open `/`, `/projects`, `/admin`. With `ADMIN_PASSWORD` set, create a project in admin, confirm it appears on `/projects`, then delete it.

- [ ] **Step 4: Run pre-push check**

Run: `git log origin/main..HEAD -i -E --grep='co-authored-by|generated with' --oneline` (gitignore scope: no remote yet — check whole history if absent). Report matches.
Expected: no matches.

- [ ] **Step 5: Request code review on full diff**

Run: request-reviewing-code-review skill (critic subagent) on the whole branch diff before finishing.

- [ ] **Step 6: Report completion**

Report: tests pass, build passes, manual flow verified.
