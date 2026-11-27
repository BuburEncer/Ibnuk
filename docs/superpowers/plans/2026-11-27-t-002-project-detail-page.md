# T-002 project detail page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/projects/[id]` and link each title in `/projects` to it.

**Architecture:** Server Component queries the DB directly (project convention). `lib/projects.ts` gains a pure `parseProjectId` and a `getProject` that returns `{ project, failed }` like `listProjects`. `SkillIcon` moves out of `app/projects/page.tsx` so both pages share it (Next page files may not export extra components).

**Tech Stack:** Next.js 15 App Router, Drizzle ORM, Vitest.

**Spec:** `docs/design.md` "Fitur: halaman detail dan galeri" > Route and UI; ticket `docs/tickets/T-002-project-detail-page.md`.

## Global Constraints

- No new colors, fonts or tokens; reuse classes from `app/globals.css`.
- DB failure shows "Could not load projects. Please try again later.", never a raw error.
- No gallery yet (T-004).

## Review Focus

- `id` like `abc`, `0`, `-1`, `1.5`, `01x` or a number above int4 range must 404, not throw a DB error. Pinned by `parseProjectId` tests.
- Unknown numeric id must 404. Pinned by the page source check for `notFound()`.

---

### Task 1: parseProjectId and getProject

**Files:**
- Modify: `lib/projects.ts`
- Test: `tests/projects.test.ts`

**Interfaces:**
- Produces: `parseProjectId(raw: string): number | null`, `getProject(id: number): Promise<{ project: Project | null; failed: boolean }>`.

- [x] **Step 1: Write the failing test**

```ts
describe("parseProjectId", () => {
  it("accepts positive integers", () => {
    expect(parseProjectId("1")).toBe(1);
    expect(parseProjectId("42")).toBe(42);
  });
  it.each(["", "0", "-1", "1.5", "abc", "01x", " 1", "2147483648"])(
    "rejects %j",
    (raw) => expect(parseProjectId(raw)).toBeNull(),
  );
});
```

- [x] **Step 2: Run it, expect FAIL** (`npx vitest run tests/projects.test.ts`)

- [x] **Step 3: Implement**

```ts
const MAX_SERIAL = 2147483647;

export function parseProjectId(raw: string): number | null {
  if (!/^[1-9]\d*$/.test(raw)) return null;
  const id = Number(raw);
  return id <= MAX_SERIAL ? id : null;
}

export async function getProject(
  id: number,
): Promise<{ project: Project | null; failed: boolean }> {
  try {
    const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return { project: row ?? null, failed: false };
  } catch (e) {
    console.error("getProject failed:", e);
    return { project: null, failed: true };
  }
}
```

- [x] **Step 4: Run it, expect PASS**

### Task 2: detail page and list link

**Files:**
- Create: `app/projects/skill-icon.tsx` (moved `SkillIcon`)
- Create: `app/projects/[id]/page.tsx`
- Modify: `app/projects/page.tsx`
- Test: `tests/projects-page.test.ts`

- [x] **Step 1: Write the failing test** (source checks, same style as existing page test)

```ts
test("list titles link to the detail page", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../app/projects/page.tsx", import.meta.url), "utf8");
  expect(source).toMatch(/href=\{`\/projects\/\$\{project\.id\}`\}/);
});

test("detail page 404s unknown ids and hides DB errors", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../app/projects/[id]/page.tsx", import.meta.url), "utf8");
  expect(source).toContain("parseProjectId");
  expect(source).toContain("notFound()");
  expect(source).toContain("Could not load projects. Please try again later.");
});
```

- [x] **Step 2: Run it, expect FAIL**
- [x] **Step 3: Move `SkillIcon` to `app/projects/skill-icon.tsx`, wrap list title in `<Link>`, write `app/projects/[id]/page.tsx`** reusing `.subpage.projects-page`, `.back`, `.title`, `.index-tech`, `.desc`, `.project-image`, `.index-video`, `.link`.
- [x] **Step 4: Run tests + `npx tsc --noEmit`, expect PASS**
- [x] **Step 5: Browser check with `playwright-cli`**: `/projects` title link works, `/projects/<id>` renders, `/projects/abc` and `/projects/999999` show 404, no console errors besides favicon.
- [x] **Step 6: Close ticket and commit**

```bash
git add lib/projects.ts tests/projects.test.ts tests/projects-page.test.ts app/projects/page.tsx app/projects/skill-icon.tsx "app/projects/[id]/page.tsx" docs/tickets/T-002-project-detail-page.md docs/tickets/INDEX.md docs/superpowers/plans/2026-11-27-t-002-project-detail-page.md
git commit -m "add project detail page linked from list"
```
