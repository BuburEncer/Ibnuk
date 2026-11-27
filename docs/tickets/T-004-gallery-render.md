# T-004: Render gallery with lazy image route
- Tipe: feature
- Status: done
- Prioritas: P2
- Bergantung pada: T-001, T-003
- Sumber: PRD, "Fitur: halaman detail proyek dengan galeri"
- Branch: t-004-gallery-render
- Plan: docs/superpowers/plans/2026-11-27-t-004-gallery-render.md
## Deskripsi
Halaman detail menampilkan galeri gambar dengan caption. Gambar dimuat lewat route terpisah supaya HTML tetap ringan.
## Kriteria penerimaan
- [x] `GET /projects/[id]/images/[imageId]` mengirim byte gambar dengan `Content-Type` yang benar dan `Cache-Control` immutable.
- [x] Route mengembalikan 404 bila gambar tidak ada atau bukan milik proyek itu.
- [x] Pengurai data URL menolak string yang bukan data URL gambar.
- [x] `/projects/[id]` menampilkan galeri urut dari yang paling lama diupload, tiap gambar dengan caption.
- [x] Gambar galeri memakai `loading="lazy"` dan tidak ditanam di HTML.
- [x] Menghapus proyek ikut menghapus gambar galerinya (dicek manual sekali).
## Di luar cakupan
Lightbox, zoom, slider.
## Catatan teknis
`docs/design.md` > Route dan UI. File: `app/projects/[id]/images/[imageId]/route.ts`, `app/projects/[id]/page.tsx`, `lib/validate.ts` (pengurai), `app/globals.css` (`.gallery`). Thumbnail admin dari T-003 dialihkan ke route ini.
## Riwayat
- render project gallery with lazy image route
