# Desain halaman Projects

Referensi PRD: `docs/PRD.md`. Perubahan ini menambahkan kategori, gambar lokal, dan isi lengkap tiap proyek yang ditunda dari MVP. Proyek tetap dikurasi manual, sesuai non-goals PRD.

## Tujuan

Halaman `/projects` menampilkan proyek pilihan dari GitHub dan Kaggle, dikelompokkan menurut jenis proyek. Tiap proyek menampilkan judul, penjelasan singkat, stack yang dipakai, sumber, tautan, dan gambar bila tersedia.

## Data

Tabel `projects` mendapat tiga kolom nullable:

- `source`: `github` atau `kaggle`
- `category`: `ai` atau `software`
- `image_path`: path lokal di bawah `/projects/`, misalnya `/projects/fetal-plane.png`

Kolom `title`, `description`, `technologies`, dan `link` sudah ada dan dipakai apa adanya. `description` berisi penjelasan singkat proyek. `technologies` berisi stack, dipisah tanda koma. Admin memilih sumber dan kategori saat menambah atau mengubah proyek, lalu mengisi path gambar bila tersedia. Saat perubahan ini dirilis, baris lama tanpa kategori ditampilkan pada seksi `Lainnya` sampai admin mengelompokkannya. Item yang ditambahkan lewat admin wajib punya sumber dan kategori.

Server Action membatasi sumber dan kategori ke pilihan tersebut. Link yang diisi harus memakai URL HTTP atau HTTPS. Validasi `image_path` hanya menerima path di bawah `/projects/`; file gambar berada di `public/projects/`. Jika file hilang, kartu tetap tampil tanpa gambar.

## Bahasa visual

Halaman memakai bahasa visual kartu bisnis yang sama dengan hero di `/`: Cormorant Garamond, teks rata tengah, garis rambut, tanpa kotak, tanpa shadow, tanpa border radius. Motif ini dipilih karena kartu bisnis adalah identitas visual website ini. Mengulangnya di `/projects` menyatukan halaman dengan hero, sedangkan grid kotak bergaris dan shadow akan memutus kelanjutan visual itu.

Tiap proyek menjadi satu kartu HTML. Isi kartu dari atas:

1. Gambar proyek dengan rasio 16:9 dan `object-fit: cover`, hanya bila ada. Kartu tanpa gambar melompat langsung ke teks, tanpa kotak kosong.
2. Judul proyek, 34px, weight 700, rata tengah.
3. Penjelasan singkat, 18px, rata tengah, warna `#050505`.
4. Stack, 17px, italic, rata tengah, warna `#666`.
5. Sumber dan jenis item, 16px, rata tengah, warna `#666`. Tautan ke proyek memakai `text-decoration: underline`.

Kartu dipisah garis rambut `#eee` satu piksel, sejajar dengan motif kartu bisnis yang memakai garis sebagai pemisah. Judul seksi (AI/ML, Software, Lainnya) memakai 15px uppercase dengan letter-spacing lebar, di atas garis rambut penuh.

Palet: teks `#050505`, meta `#666`, garis rambut `#eee`, latar `#fff`, satu warna aksen `#b23a2e` untuk pesan DB gagal. Warna `#666` menggantikan `#777` yang ada sekarang karena `#777` di putih hanya 4.48:1 dan gagal WCAG AA untuk teks normal.

## Tampilan

Halaman `/projects` punya seksi AI/ML, Software, dan Lainnya untuk proyek lama tanpa kategori. Tiap seksi menampilkan daftar satu kolom, supaya motif kartu bisnis tetap terbaca. Untuk item AI/ML, gambar 16:9 tampil di atas teks bila tersedia. Proyek software memakai daftar teks sampai screenshot sendiri ditambahkan. Urutan item mengikuti `createdAt` yang sudah dipakai query.

Pada layar di atas 640px, margin dan ukuran judul memberi ruang seperti kartu bisnis utama. Di mobile, judul turun ke 26px, penjelasan ke 17px, padding kartu turun, dan tautan proyek punya tinggi sentuh minimal 44px. Tidak ada overflow horizontal di lebar mana pun.

Tidak ada sinkronisasi API, filter tab, toggle featured, atau halaman detail.

### Isi awal

AI/ML:

- Fetal Head Plane Classification Resnet50: Kaggle notebook, penjelasan plane USG otak janin, stack PyTorch, ResNet50, Grad-CAM.
- Real or Fake Faces with ViT: Kaggle notebook, penjelasan deteksi wajah AI-generated dengan Vision Transformer, stack Python, ViT, PyTorch.
- Resnet Implementation: Kaggle notebook, implementasi ResNet dari nol, stack Python, PyTorch.
- Fake Face Detector: GitHub, klasifikasi wajah AI-generated versus asli, stack Python, ViT, PyTorch.
- Fetal Head Classification: GitHub, klasifikasi plane kepala janin dengan ResNet50, stack Python, ResNet50, Grad-CAM.
- Realtime Pose Detection: GitHub, deteksi pose tubuh realtime, stack Python, YOLOv8, Streamlit.
- Fetal Head Ultrasound Raw Data: Kaggle dataset, data mentah USG kepala janin, stack Ultrasound.

Software:

- gameboost
- Aplikasi-Keuangan
- Pencatat-Meter
- notes-app-back-end
- Bookshelf-API
- ResepQu
- e-commerce
- Music-App

`genre-cnn` tidak dimasukkan karena belum selesai.

Seed mengisi `description` dengan penjelasan singkat dan `technologies` dengan stack. Untuk proyek software, isi dan stack belum dikonfirmasi, jadi deskripsi serta technologies dibiarkan kosong sampai pemilik mengisinya lewat `/admin`. Semua `image_path` bernilai null; pemilik menambahkan screenshot sendiri ke `public/projects/` lalu mengisi path lewat admin.

## State

- Daftar kosong: "Belum ada proyek."
- Database gagal: "Gagal memuat proyek. Coba lagi nanti." dengan warna `#b23a2e`. Kegagalan database tidak lagi disamarkan sebagai daftar kosong.
- Halaman ini render synchronously di server, jadi tidak ada state loading.

## Migrasi dan pengisian

Drizzle migration menambah tiga kolom nullable. Baris lama tanpa kategori tetap muncul di seksi `Lainnya`. Seed berada di `scripts/seed.mjs`, dijalankan dengan `npm run seed`, dan memakai `DATABASE_URL` aktif. Seed dijalankan terpisah dari `npm run migrate`, memeriksa link setiap item sebelum insert, serta melewati item yang link-nya sudah ada atau kosong. Seed tidak mengubah proyek yang sudah ada. Admin tetap dapat menyimpan proyek tanpa link.

Pemilik menjalankan seed terhadap database lokal saat setup. Untuk database produksi, tambahkan proyek lewat `/admin` setelah deploy. `public/projects/` harus ter-deploy bersama website. Seed hanya memasukkan metadata; tidak mengunduh gambar.

## Aksesibilitas

Semua tautan dapat dicapai lewat Tab dan diaktifkan dengan Enter. Indikator fokus memakai `outline: 2px solid #050505` dengan offset 2px. Rasio kontras teks dihitung terhadap latar putih dan memenuhi WCAG AA. Label sumber selalu berupa teks, bukan hanya warna.

## Pengujian

- Test validasi sumber, kategori, dan path gambar untuk nilai yang didukung dan tidak didukung.
- Test pengelompokan proyek AI/ML, Software, dan baris lama tanpa kategori.
- Test pemisahan state DB gagal dari daftar kosong.
- Jalankan `npm test` dan `npm run build`.
- Periksa `/projects` di desktop dan mobile. Pastikan gambar tidak menyebabkan overflow, kartu tanpa gambar tetap sejajar, dan tautan dapat dioperasikan dengan keyboard.
