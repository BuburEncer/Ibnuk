# T-002: Add project detail page linked from list
- Tipe: feature
- Status: todo
- Prioritas: P2
- Bergantung pada: -
- Sumber: PRD, "Fitur: halaman detail proyek dengan galeri"
- Branch: t-002-project-detail-page
- Plan: -
## Deskripsi
Tiap proyek punya halaman `/projects/[id]`. Judul di `/projects` jadi tautan ke halaman itu. Tampilan mengikuti tema situs.
## Kriteria penerimaan
- [ ] Judul tiap proyek di `/projects` adalah tautan ke `/projects/[id]`. Isi daftar lainnya tidak berubah.
- [ ] `/projects/[id]` menampilkan judul, teknologi, deskripsi, video, gambar utama, dan tautan proyek.
- [ ] `/projects/[id]` dengan id tidak valid atau tidak ada mengembalikan 404.
- [ ] Kegagalan DB menampilkan pesan ramah, bukan error mentah.
- [ ] Tampilan memakai kelas dan token yang sudah ada di `app/globals.css`, tanpa warna atau font baru.
## Di luar cakupan
Galeri (T-004).
## Catatan teknis
`docs/design.md` > Route dan UI. File: `app/projects/[id]/page.tsx`, `app/projects/page.tsx`, `lib/projects.ts`, tes baru di `tests/`.
## Riwayat
