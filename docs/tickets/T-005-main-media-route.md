# T-005: Serve main image and video through a route
- Tipe: refactor
- Status: done
- Prioritas: P3
- Bergantung pada: T-004
- Sumber: review critic branch t-004-gallery-render, temuan 4
- Branch: t-005-main-media-route
- Plan: docs/superpowers/plans/2026-11-27-t-005-main-media-route.md
## Deskripsi
Gambar utama dan video proyek masih ditanam di HTML sebagai data URL, baik di `/projects` maupun `/projects/[id]`. Video bisa sampai 20 MB, jadi halaman bisa membengkak puluhan MB. Sajikan lewat route terpisah seperti gambar galeri.
## Kriteria penerimaan
- [x] HTML `/projects` dan `/projects/[id]` tidak memuat `data:image` atau `data:video`.
- [x] Gambar utama dan video dimuat dari route terpisah dengan `Content-Type` yang benar dan 404 bila tidak ada.
- [x] Query halaman tidak lagi mengambil kolom `image` dan `video` penuh.
- [x] Admin tetap bisa melihat dan menghapus gambar utama dan video.
## Di luar cakupan
Memindahkan penyimpanan ke object storage.
## Catatan teknis
Pola sama dengan `app/projects/[id]/images/[imageId]/route.ts` dan `parseImageDataUrl` di `lib/validate.ts`. Video perlu parser untuk `video/mp4` dan `video/webm`. File: `app/projects/page.tsx`, `app/projects/[id]/page.tsx`, `lib/projects.ts`, `app/admin/admin-actions.tsx`.
## Riwayat
- serve main project media through a route
