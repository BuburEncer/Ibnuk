# T-003 gallery admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin can add a gallery image with caption, edit a caption and delete an image.

**Architecture:** Three Server Actions in `app/actions/projects.ts` reuse `checkPassword`, `readImage` and `fail()`. `/admin` loads all gallery rows once (`listProjectImages`) and passes each project's rows to a gallery block inside its admin item. Thumbnails use the data URL directly until T-004 adds the image route.

**Tech Stack:** Next.js 15 Server Actions, Drizzle ORM, Vitest.

**Spec:** `docs/design.md` "Fitur: halaman detail dan galeri" > Server Actions and Admin; ticket `docs/tickets/T-003-gallery-admin.md`.

## Global Constraints

- Images: PNG/JPEG/WebP/GIF, max 2 MB, magic bytes checked (existing `readImage`).
- Caption required, trimmed.
- Every action checks `ADMIN_PASSWORD` before any DB call.
- No new colors or fonts; reuse `.admin-form`, `.project-image`, `.danger`.

## Review Focus

- Wrong password must not touch the DB, even with a valid file. Pinned by the wrong-password tests.
- Whitespace-only caption must be rejected. Pinned by the `"   "` caption tests.
- `projectId`/`id` like `abc`, `0` or `1.5` rejected before DB. Pinned by the id tests.
- Password check runs before reading the uploaded file. Pinned by asserting no insert on wrong password with a valid PNG.

---

### Task 1: gallery Server Actions

**Files:**
- Modify: `app/actions/projects.ts`
- Test: `tests/gallery-actions.test.ts` (new; own mocks so `checkPassword` can return false)

**Interfaces:**
- Consumes: `projectImages` from `db/schema.ts` (T-001).
- Produces: `addProjectImage(formData)`, `updateProjectImageCaption(formData)`, `deleteProjectImage(formData)`. Form fields: `password`, `projectId`, `image`, `caption`, `id`. Success redirects to `/admin`.

- [x] Step 1: Write failing tests (add success, wrong password, empty/whitespace caption, missing file, bad id, wrong type, over 2 MB; update caption success, empty caption, wrong password; delete success, wrong password, bad id).
- [x] Step 2: Run `npx vitest run tests/gallery-actions.test.ts`, expect FAIL (actions not exported).
- [x] Step 3: Implement the three actions with a shared `positiveId` helper.
- [x] Step 4: Run the test file, expect PASS.

### Task 2: admin gallery UI

**Files:**
- Modify: `lib/projects.ts` (`listProjectImages`)
- Create: `app/admin/gallery-admin.tsx`
- Modify: `app/admin/page.tsx`, `app/admin/admin-actions.tsx`, `app/globals.css`
- Test: `tests/ui-states.test.ts`

- [x] Step 1: Write failing source check: `app/admin/gallery-admin.tsx` uses the three actions and `HiddenPassword`, caption input is `required`.
- [x] Step 2: Run, expect FAIL.
- [x] Step 3: Add `listProjectImages`, `GalleryAdmin`, wire into admin item.
- [x] Step 4: `npm run test` and `npx tsc --noEmit` pass.
- [x] Step 5: Browser check with `playwright-cli` on `/admin` (needs `npm run migrate` applied to the dev DB): add, edit caption, delete; screenshots at 1280 and 390.
- [x] Step 6: Close ticket and commit `add gallery admin actions and UI`.
