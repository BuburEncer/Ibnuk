# Projects GitHub and Kaggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update `/projects` to show curated GitHub and Kaggle projects with descriptions, technology stacks, source links, and local images when available, grouped into AI/ML, Software, and legacy sections.

**Architecture:** Add nullable `source`, `category`, and `image_path` fields to existing `projects` table. Keep current server component and Server Action flow; validate admin inputs, seed chosen metadata locally, and serve owner-supplied images from `public/projects/`. Render one-column project entries in the same centered Cormorant Garamond and hairline style as the hero. Each entry shows description and stack from existing columns.

**Tech Stack:** Next.js 15, React 19, TypeScript, Drizzle ORM 0.36, PostgreSQL, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-22-projects-github-kaggle-design.md`

## Global Constraints

- Keep Server Components querying PostgreSQL directly; admin writes stay in Server Actions.
- Keep dependencies unchanged.
- Keep `ADMIN_PASSWORD` server-side and preserve existing friendly DB error handling.
- `source` values: `github`, `kaggle`; `category` values: `ai`, `software`.
- `image_path` must be null or a path under `/projects/`; files live in `public/projects/`.
- Use owner-supplied screenshots only; do not copy Kaggle or GitHub preview imagery.
- Do not fetch GitHub/Kaggle APIs or remote images at runtime.
- Do not add `genre-cnn` or copy example Kaggle/GitHub screenshots.

## Review Focus

- Legacy DB rows with null category remain visible in `Lainnya`; they must not disappear.
- Missing or malformed image files/paths must not break card rendering or permit paths outside `/projects/`.
- Missing link must remain valid for admin-created projects; seed skips entries without links.
- Invalid source/category values must fail validation before DB writes.
- Duplicate seed run must leave curated records unchanged and create no duplicates.

## File map

- `db/schema.ts`, `db/migrations/`: nullable metadata columns.
- `lib/validate.ts`, `tests/validate.test.ts`: source, category, image path validation.
- `lib/projects.ts`, `tests/projects.test.ts`: group rows and retain legacy records.
- `app/actions/projects.ts`: persist validated metadata.
- `app/admin/page.tsx`, `app/admin/admin-actions.tsx`: source/category controls and optional image path.
- `app/projects/page.tsx`, `app/globals.css`: grouped single-column project entries, matching hero typography and hairline dividers, with local images.
- `scripts/seed.mjs`, `package.json`: local idempotent metadata seed.
- `README.md`: migration, seed, local images, production admin entry flow.
- `public/projects/`: initially no image assets; owner may add own screenshots later.
- `docs/PRD.md`, `docs/design.md`: reflect approved categories and local image-path decision.
- `docs/superpowers/specs/2026-10-22-projects-github-kaggle-design.md`: approved design input.

---

### Task 1: Add project metadata schema and migration

**Files:**
- Modify: `db/schema.ts`
- Create: `db/migrations/0001_*.sql` (generate with existing Drizzle CLI)
- Modify: `db/migrations/meta/_journal.json`, generated snapshot

**Interfaces:**
- Produces nullable `projects.source`, `projects.category`, `projects.imagePath` columns. Existing rows keep null values.

- [ ] **Step 1: Add nullable columns to Drizzle schema**

```ts
source: text("source"),
category: text("category"),
imagePath: text("image_path"),
```

- [ ] **Step 2: Generate migration**

Run: `npm run generate`
Expected: new migration adds three nullable text columns; no table rewrite or destructive statement.

- [ ] **Step 3: Review generated SQL**

Run: `git diff -- db/schema.ts db/migrations`
Expected: migration contains only `ALTER TABLE ... ADD COLUMN` statements and valid metadata updates.

- [ ] **Step 4: Verify test suite**

Run: `npm test`
Expected: existing tests pass.

### Task 2: Validate project metadata and grouping

**Files:**
- Modify: `lib/validate.ts`
- Modify: `tests/validate.test.ts`
- Modify: `lib/projects.ts`
- Modify: `tests/projects.test.ts`

**Interfaces:**
- Produces `isValidProjectSource(value: string): boolean`, `isValidProjectCategory(value: string): boolean`, `isValidProjectImagePath(value: string): boolean`.
- Produces `groupProjects(projects)` returning `{ ai, software, other }`; `other` holds null or unknown categories.

- [ ] **Step 1: Add failing allowlist tests**

```ts
it("accepts only supported project sources", () => {
  expect(isValidProjectSource("github")).toBe(true);
  expect(isValidProjectSource("kaggle")).toBe(true);
  expect(isValidProjectSource("https://evil.test")).toBe(false);
});

it("accepts only supported categories", () => {
  expect(isValidProjectCategory("ai")).toBe(true);
  expect(isValidProjectCategory("software")).toBe(true);
  expect(isValidProjectCategory("admin")).toBe(false);
});

it("allows only local project image paths", () => {
  expect(isValidProjectImagePath("/projects/demo.png")).toBe(true);
  expect(isValidProjectImagePath("https://example.test/demo.png")).toBe(false);
  expect(isValidProjectImagePath("/projects/../secret.png")).toBe(false);
});
```

- [ ] **Step 2: Run focused validation tests**

Run: `npx vitest run tests/validate.test.ts`
Expected: FAIL because allowlist functions do not exist.

- [ ] **Step 3: Implement allowlist functions**

```ts
export function isValidProjectSource(value: string): boolean {
  return value === "github" || value === "kaggle";
}

export function isValidProjectCategory(value: string): boolean {
  return value === "ai" || value === "software";
}

export function isValidProjectImagePath(value: string): boolean {
  return value.startsWith("/projects/") &&
    !value.includes("..") &&
    !/[?#\\]/.test(value);
}
```

- [ ] **Step 4: Add grouping tests**

```ts
it("groups projects by category and retains legacy rows", () => {
  const rows = [
    { category: "ai", title: "AI" },
    { category: "software", title: "App" },
    { category: null, title: "Legacy" },
  ];
  expect(groupProjects(rows)).toEqual({
    ai: [rows[0]],
    software: [rows[1]],
    other: [rows[2]],
  });
});
```

- [ ] **Step 5: Implement grouping and run focused tests**

Run: `npx vitest run tests/validate.test.ts tests/projects.test.ts`
Expected: PASS.

### Task 3: Persist source/category/image path in admin

**Files:**
- Modify: `app/actions/projects.ts`
- Modify: `app/admin/page.tsx`
- Modify: `app/admin/admin-actions.tsx`

**Interfaces:**
- Admin create/update forms submit `source`, `category`, and optional `imagePath` under form field name `imagePath`.
- New records require supported source/category. Existing legacy records may still be edited; require selections before update.

- [ ] **Step 1: Add source/category selects and optional image-path input to create form**

Create form values:

```tsx
<select name="source" required defaultValue="github">
  <option value="github">GitHub</option>
  <option value="kaggle">Kaggle</option>
</select>
<select name="category" required defaultValue="software">
  <option value="ai">AI/ML</option>
  <option value="software">Software</option>
</select>
<input name="imagePath" placeholder="/projects/nama-gambar.png" />
```

- [ ] **Step 2: Add same controls to update form**

Use current project values as defaults; if either value is null, default to `software` and `github` for form display.

- [ ] **Step 3: Validate values before DB writes**

Read values as strings; reject unsupported source/category or invalid non-empty image path with existing `invalid` response. Persist empty image path as `null`. Preserve title, link, password, and friendly DB failure behavior.

- [ ] **Step 4: Run tests and TypeScript build**

Run: `npm test && npm run build`
Expected: PASS; no TypeScript errors.

### Task 4: Render grouped responsive project cards

**Files:**
- Modify: `app/projects/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Page queries existing `listProjects()`, groups with `groupProjects`, and renders AI/ML, Software, and Lainnya sections.
- Card image uses local `image_path`; browser hides it if image load fails.

- [ ] **Step 1: Render category sections**

Use heading labels `AI/ML`, `Software`, `Lainnya`. Preserve empty-state behavior when all groups are empty. Show legacy section only when it has rows.

- [ ] **Step 2: Add card content**

Render title, short description, technologies stack, source/type label, optional image, and link. Use the same centered Cormorant Garamond voice and hairline separators as the business-card hero. Keep one column; image above text when present. Do not render arbitrary `image_path` outside validated `/projects/` paths. Use `img` with `aspect-ratio: 16 / 9; object-fit: cover; width: 100%`; hide failed images with a small client component only if required by React event-handler restrictions in Server Components.

- [ ] **Step 3: Add responsive CSS**

Use one column at all widths to match the business-card motif. Reduce title and body sizes on mobile. Preserve keyboard focus styles and readable contrast. Cards without images have no empty media region.

- [ ] **Step 4: Run test and build checks**

Run: `npm test && npm run build`
Expected: PASS; existing `/projects` page still renders from server-side DB query.

### Task 5: Add idempotent curated metadata seed

**Files:**
- Create: `scripts/seed.mjs`
- Modify: `package.json`

**Interfaces:**
- `npm run seed` runs `scripts/seed.mjs` using existing `postgres` package and active `DATABASE_URL`.
- Export `projectEntries` and `seedProjects(sql, entries?)` for tests. `seedProjects` returns inserted row count.
- Seed rows have unique project links, source/category, verified descriptions, tech labels, and null image paths.
- Seed descriptions contain item type labels such as `Notebook` or `Dataset`; no `type` column is added.

- [ ] **Step 1: Add seed command**

Add script entry:

```json
"seed": "node scripts/seed.mjs"
```

- [ ] **Step 2: Define curated entries**

Include seven AI/ML items: three Kaggle notebooks, `fake-face-detector`, `fetal-head-classification`, `realtime-pose-detection`, and Kaggle dataset `ibnuqayyim/raw-data`. Include eight software items: `gameboost`, `Aplikasi-Keuangan`, `Pencatat-Meter`, `notes-app-back-end`, `Bookshelf-API`, `ResepQu`, `e-commerce`, `Music-App`. Do not include `genre-cnn`. Use verified source URLs. For software items, leave descriptions and technologies empty because content is not confirmed; admin can fill them later. For AI/ML items, use spec descriptions and stacks only where verified. Set all image paths to null; owner can add screenshots to `public/projects/` later. Seed descriptions identify Kaggle notebook and dataset items.

- [ ] **Step 3: Implement idempotent insert by link**

For each entry with a non-empty link, check whether `projects.link` already has that value. Insert only when absent. Skip entries without links. Do not overwrite edited rows. Close Postgres client in `finally`.

- [ ] **Step 4: Add a runnable duplicate check**

Run: `npm run seed && npm run seed`
Expected: second run reports no inserted rows and leaves record count unchanged. Run only against a local database.

### Task 6: Document setup, update docs, final verification

**Files:**
- Modify: `README.md`
- Modify: `docs/PRD.md`
- Modify: `docs/design.md`
- Modify: `docs/superpowers/specs/2026-10-22-projects-github-kaggle-design.md`

- [ ] **Step 1: Document schema migration and seed order**

README setup says run `npm run migrate`, then `npm run seed` against local DB. Production data is entered through `/admin`; do not instruct seed against production.

- [ ] **Step 2: Document local images**

Explain adding owner-supplied screenshot files under `public/projects/`, setting `/projects/<filename>` in admin, and deploying those files. Note missing image renders as text card.

- [ ] **Step 3: Align PRD and design docs**

Remove deferred category/image entries; document AI/ML and Software grouping and local `image_path`. Keep unrelated later work unchanged.

- [ ] **Step 4: Run final checks**

Run: `npm test && npm run build`
Expected: all tests pass; production build succeeds.

- [ ] **Step 5: Inspect changes**

Run: `git diff --check && git status --short`
Expected: no whitespace errors; unrelated user changes in `.gitignore`, `app/globals.css`, `app/page.tsx`, and `.claude/` remain untouched.
