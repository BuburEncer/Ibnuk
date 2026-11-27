# T-004 gallery render Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the gallery on `/projects/[id]`, loading each image lazily from its own route.

**Architecture:** `parseImageDataUrl` in `lib/validate.ts` turns a stored data URL into `{ type, bytes }`. A Route Handler at `app/projects/[id]/images/[imageId]/route.ts` reads one row matching both ids and returns the bytes with an immutable cache header. The detail page queries only `id` and `caption` and renders `<figure>` + `<img loading="lazy">`. The admin thumbnail switches to the same route.

**Tech Stack:** Next.js 15 Route Handlers, Drizzle ORM, Vitest.

**Spec:** `docs/design.md` "Fitur: halaman detail dan galeri" > Route and UI; ticket `docs/tickets/T-004-gallery-render.md`.

## Global Constraints

- Gallery order: oldest first (`ORDER BY id`).
- Image bytes never embedded in page HTML.
- Only `.gallery` and `.gallery figcaption` are new CSS; caption italic `#666`, 1.0625rem.
- DB failure on the detail page shows the friendly message.

## Review Focus

- Image id that exists but belongs to another project must 404. Pinned by the route `where` on both ids (source check) and browser check.
- Non-numeric `id`/`imageId` must 404 without a DB query. Pinned by reusing `parseProjectId`.
- Stored value that is not an image data URL (e.g. `data:text/html`) must not be served. Pinned by `parseImageDataUrl` tests.
- Gallery query failure must not hide the rest of the page. Pinned by `listGallery` returning `[]` on error, logged.

---

### Task 1: parseImageDataUrl

**Files:** Modify `lib/validate.ts`; Test `tests/validate.test.ts`.

**Produces:** `parseImageDataUrl(value: string): { type: string; bytes: Buffer } | null`.

- [x] Step 1: failing tests (png/jpeg ok with correct bytes; `data:text/html;base64,...`, `data:image/svg+xml;base64,...`, plain string, missing base64 marker all null).
- [x] Step 2: run, expect FAIL.
- [x] Step 3: implement with one regex `^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$`.
- [x] Step 4: run, expect PASS.

### Task 2: image route, gallery on detail page, admin thumbnail

**Files:**
- Create: `app/projects/[id]/images/[imageId]/route.ts`
- Modify: `lib/projects.ts` (`listGallery(projectId)` returns `{ id, caption }[]`)
- Modify: `app/projects/[id]/page.tsx`, `app/admin/gallery-admin.tsx`, `app/globals.css`
- Test: `tests/projects-page.test.ts`

- [x] Step 1: failing source checks: route uses `parseImageDataUrl`, `parseProjectId`, filters on both `projectImages.projectId` and `projectImages.id`, sets `immutable`; detail page uses `listGallery`, `loading="lazy"`, `<figcaption>`; admin thumbnail uses `/images/` route, no `img.image`.
- [x] Step 2: run, expect FAIL.
- [x] Step 3: implement.
- [x] Step 4: `npm run test`, `npx tsc --noEmit` pass.
- [x] Step 5: browser check (throwaway `ADMIN_PASSWORD`): add 2 images via admin, detail page shows both in order with captions, image response headers correct, `/projects/<other>/images/<id>` 404; delete a project with gallery rows on a throwaway project to confirm cascade; clean test data; screenshots 1280 and 390.
- [x] Step 6: close ticket, commit `render project gallery with lazy image route`.
