# T-005 main media route Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop embedding the main image and video as data URLs in page HTML; serve them from a route.

**Architecture:** `listProjects` and `getProject` select `hasImage`/`hasVideo` booleans instead of the full columns. A Route Handler at `app/projects/[id]/media/[kind]/route.ts` (`kind` = `image` | `video`) reads one column, parses the data URL and returns the bytes. Unlike gallery images, main media is replaced in place by `updateProject`, so the route uses `Cache-Control: no-cache` with a content ETag (304 on match) instead of a fixed max-age. Video supports single `Range` requests (206) because Safari will not play video without them.

**Tech Stack:** Next.js 15 Route Handlers, Drizzle ORM (`sql` for the boolean columns), Node `crypto`, Vitest.

**Spec:** `docs/tickets/T-005-main-media-route.md`; pattern from `docs/design.md` "Fitur: halaman detail dan galeri" > Route.

## Global Constraints

- Image types PNG/JPEG/WebP/GIF; video types MP4/WebM (same allowlists as upload).
- No new dependencies.
- Admin keeps preview and remove checkboxes for image and video.

## Review Focus

- Replacing a main image must show the new one on the next load. Pinned by ETag test (different bytes, different ETag) and `no-cache`.
- `Range` beyond the end or malformed must not crash: 416 or full 200. Pinned by route tests.
- Unknown `kind` (e.g. `title`) must 404 and never read an arbitrary column. Pinned by route test.
- Stored legacy value that is not a data URL must 404, not be served. Pinned by route test.

---

### Task 1: parseVideoDataUrl

**Files:** `lib/validate.ts`, `tests/validate.test.ts`.
**Produces:** `parseVideoDataUrl(value: string): { type: string; bytes: Buffer } | null`.

- [x] Failing tests (mp4/webm ok; image, html, missing base64 rejected), run FAIL, implement via shared helper with `parseImageDataUrl`, run PASS.

### Task 2: media route

**Files:** create `app/projects/[id]/media/[kind]/route.ts`; test `tests/media-route.test.ts`.

- [x] Failing tests: image 200 with type, `no-cache`, `nosniff`, ETag; matching `If-None-Match` 304 with no body; video `Range: bytes=0-3` 206 with `Content-Range` and 4 bytes; open range `bytes=4-`; range past end 416; unknown kind 404 without query; bad id 404; null or non-data-URL column 404; DB error 503.
- [x] Implement, run PASS.

### Task 3: pages and admin use the route

**Files:** `lib/projects.ts`, `app/projects/page.tsx`, `app/projects/[id]/page.tsx`, `app/admin/admin-actions.tsx`; tests `tests/projects-page.test.ts`, `tests/ui-states.test.ts`.

- [x] Failing source checks: `lib/projects.ts` list/get queries select `hasImage`/`hasVideo` and not `select()` of all columns; pages and admin reference `/media/image` and `/media/video` and no longer `project.image`/`project.video`.
- [x] Implement; `npm run test`, `npx tsc --noEmit`, `npm run build` pass.
- [x] Browser check on a throwaway project (upload image + generated mp4 header bytes via admin): page HTML has no `data:image`/`data:video`, image renders, video request returns 206 on range, replacing the image changes the ETag; delete test project; screenshots 1280 and 390.
- [x] Close ticket, commit `serve main project media through a route`.
