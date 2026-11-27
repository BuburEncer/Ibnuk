# T-003: Add gallery admin actions and UI
- Tipe: feature
- Status: todo
- Prioritas: P2
- Bergantung pada: T-001
- Sumber: PRD, "Fitur: halaman detail proyek dengan galeri"
- Branch: t-003-gallery-admin
- Plan: -
## Deskripsi
Admin bisa menambah gambar galeri dengan caption, mengubah caption, dan menghapus gambar, tanpa deploy ulang.
## Kriteria penerimaan
- [ ] `addProjectImage` menyimpan gambar (PNG, JPEG, WebP, GIF, maks 2 MB) dengan caption wajib.
- [ ] Tipe salah, file di atas 2 MB, file kosong, atau caption kosong ditolak dengan pesan jelas.
- [ ] `updateProjectImageCaption` mengubah caption; caption kosong ditolak.
- [ ] `deleteProjectImage` menghapus gambar.
- [ ] Ketiga action menolak password admin yang salah.
- [ ] Tiap proyek di `/admin` punya bagian Gallery: form tambah, form caption, dan tombol hapus per gambar.
## Di luar cakupan
Mengatur urutan, upload banyak file sekaligus, tampilan publik (T-004).
## Catatan teknis
`docs/design.md` > Server Actions dan Admin. Pakai ulang `readImage`, `fail()`, `checkPassword`. File: `app/actions/projects.ts`, `app/admin/`, `tests/project-actions.test.ts`. Thumbnail admin bisa sementara pakai data URL langsung sampai route T-004 ada.
## Riwayat
