# T-002: Add project detail page linked from list
- Tipe: feature
- Status: done
- Prioritas: P2
- Bergantung pada: -
- Sumber: PRD, "Fitur: halaman detail proyek dengan galeri"
- Branch: t-002-project-detail-page
- Plan: docs/superpowers/plans/2026-11-27-t-002-project-detail-page.md
## Deskripsi
Tiap proyek punya halaman `/projects/[id]`. Judul di `/projects` jadi tautan ke halaman itu. Tampilan mengikuti tema situs.
## Kriteria penerimaan
- [x] Judul tiap proyek di `/projects` adalah tautan ke `/projects/[id]`. Isi daftar lainnya tidak berubah.
- [x] `/projects/[id]` menampilkan judul, teknologi, deskripsi, video, gambar utama, dan tautan proyek.
- [x] `/projects/[id]` dengan id tidak valid atau tidak ada mengembalikan 404.
- [x] Kegagalan DB menampilkan pesan ramah, bukan error mentah.
- [x] Tampilan memakai kelas dan token yang sudah ada di `app/globals.css`, tanpa warna atau font baru.
## Di luar cakupan
Galeri (T-004).
## Catatan teknis
`docs/design.md` > Route dan UI. File: `app/projects/[id]/page.tsx`, `app/projects/page.tsx`, `lib/projects.ts`, tes baru di `tests/`.
## Riwayat
- add project detail page linked from list
