# T-001: Add project_images table and migration
- Tipe: chore
- Status: done
- Prioritas: P2
- Bergantung pada: -
- Sumber: PRD, "Fitur: halaman detail proyek dengan galeri"
- Branch: t-001-project-images-table
- Plan: docs/superpowers/plans/2026-11-27-t-001-project-images-table.md
## Deskripsi
Tambah tabel `project_images` untuk menyimpan gambar galeri beserta caption per proyek. Jadi fondasi untuk T-003 dan T-004.
## Kriteria penerimaan
- [x] `db/schema.ts` punya tabel `project_images` dengan kolom `id`, `project_id`, `image`, `caption`, `created_at`.
- [x] `project_id` wajib dan FK ke `projects.id` dengan `ON DELETE cascade`.
- [x] `image` dan `caption` wajib (not null).
- [x] Migrasi dihasilkan lewat `npm run generate` dan SQL-nya memuat `ON DELETE cascade`.
- [x] `tests/db.test.ts` mengecek tabel dan kolom baru.
## Di luar cakupan
Kolom urutan, action, UI.
## Catatan teknis
`docs/design.md` bagian "Fitur: halaman detail dan galeri" > Skema. File: `db/schema.ts`, `db/migrations/`, `tests/db.test.ts`.
## Riwayat
- add project_images table with cascade migration
