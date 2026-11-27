# T-003: Add gallery admin actions and UI
- Tipe: feature
- Status: done
- Prioritas: P2
- Bergantung pada: T-001
- Sumber: PRD, "Fitur: halaman detail proyek dengan galeri"
- Branch: t-003-gallery-admin
- Plan: docs/superpowers/plans/2026-11-27-t-003-gallery-admin.md
## Deskripsi
Admin bisa menambah gambar galeri dengan caption, mengubah caption, dan menghapus gambar, tanpa deploy ulang.
## Kriteria penerimaan
- [x] `addProjectImage` menyimpan gambar (PNG, JPEG, WebP, GIF, maks 2 MB) dengan caption wajib.
- [x] Tipe salah, file di atas 2 MB, file kosong, atau caption kosong ditolak dengan pesan jelas.
- [x] `updateProjectImageCaption` mengubah caption; caption kosong ditolak.
- [x] `deleteProjectImage` menghapus gambar.
- [x] Ketiga action menolak password admin yang salah.
- [x] Tiap proyek di `/admin` punya bagian Gallery: form tambah, form caption, dan tombol hapus per gambar.
## Di luar cakupan
Mengatur urutan, upload banyak file sekaligus, tampilan publik (T-004).
## Catatan teknis
`docs/design.md` > Server Actions dan Admin. Pakai ulang `readImage`, `fail()`, `checkPassword`. File: `app/actions/projects.ts`, `app/admin/`, `tests/project-actions.test.ts`. Thumbnail admin bisa sementara pakai data URL langsung sampai route T-004 ada.
## Riwayat
- add gallery admin actions and UI
