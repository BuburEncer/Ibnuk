# PRD — Portofolio "Ibnu Qayyim"

## Tujuan

Web portofolio pribadi untuk Ibnu Qayyim. Menampilkan kartu nama singkat (hero) dan daftar proyek terkurasi. Proyek dikelola sendiri lewat halaman admin sederhana.

Sumber inspirasi: `https://fauzanrahman.com/` (kartu bisnis minimal). Referensi visual: gambar `1*Ztc2Bv7nGECyHOnKT6sHew.png`.

## Non-goals

- Bukan platform multi-user. Hanya admin yang bisa upload proyek.
- Tidak ada blog, analytics, komentar, atau CMS penuh.
- Tidak ada fetch otomatis dari GitHub API. Daftar proyek dikurasi manual.
- Bukan toko / landing marketing kompleks.

## Users

- **Pengunjung** — melihat hero dan daftar proyek. Tidak login.
- **Admin (Ibnu)** — login satu password, kelola proyek (tambah/ubah/hapus).

## User stories

- Sebagai pengunjung, saya melihat nama, tagline, lokasi, email, dan tautan tiap saat.
- Sebagai pengunjung, saya klik "Projects" untuk melihat daftar proyek.
- Sebagai pengunjung, saya bisa membuka profil GitHub `github.com/BuburEncer`.
- Sebagai admin, saya bisa menambah proyek baru (judul, deskripsi, tech, tautan).
- Sebagai admin, saya bisa mengubah dan menghapus proyek.

## MVP scope vs later

**MVP**
- Halaman `/`: hero (nama, tagline, lokasi, email, tautan GitHub, tautan resume, tombol Projects).
- Halaman `/projects`: proyek pilihan dari DB, dikelompokkan ke AI/ML dan Software.
- Kartu proyek menampilkan judul, penjelasan singkat, stack, sumber, tautan, dan gambar lokal bila tersedia.
- Halaman `/admin`: password tunggal, CRUD proyek dengan sumber, kategori, dan path gambar.
- Tabel `projects` di PostgreSQL via Drizzle.

**Later**
- Deploy dua env (dev/prod) terpisah.

## Acceptance criteria

- [ ] `GET /` menampilkan hero berisi nama "Ibnu Qayyim", lokasi, email, tautan GitHub `github.com/BuburEncer`, dan tautan resume.
- [ ] `/projects` menampilkan proyek yang ada di DB, dikelompokkan menurut kategori, dengan gambar lokal bila tersedia.
- [ ] `/admin` menolak tanpa password benar; menerima dengan password benar (`ADMIN_PASSWORD`).
- [ ] admin bisa menambah, mengubah, menghapus proyek; perubahan tampil di `/projects`.
- [ ] struktur schema `projects` via Drizzle dengan migrasi.
- [ ] kegagalan DB menampilkan pesan lalu lintas, bukan error mentah.

## Constraints

- Deploy di Vercel. Database PostgreSQL terhosting (Vercel Postgres / Neon), tanpa Docker.
- Stack: Next.js (React 19, App Router), Drizzle ORM, PostgreSQL.
- Password admin via environment variable, bukan tabel user.

## Open questions

- Lokasi/tagline/email pasti: diisi saat build.

## Fitur: halaman detail proyek dengan galeri

### Masalah

Daftar `/projects` cuma muat satu gambar per proyek. Untuk proyek yang perlu dijelaskan lewat beberapa tangkapan layar (alur aplikasi, hasil model, Grad-CAM), satu gambar tidak cukup, dan pengunjung tidak tahu apa yang sedang dilihat di gambar itu.

### Tujuan

- Tiap proyek punya halaman sendiri di `/projects/[id]`.
- Halaman itu memuat beberapa gambar, masing-masing dengan keterangan.
- Admin bisa mengelola gambar galeri tanpa deploy ulang.

### Non-goals

- Mengatur ulang urutan gambar. Urutan mengikuti waktu upload. Untuk mengubahnya, hapus lalu upload lagi.
- Upload banyak file sekaligus.
- Lightbox, zoom, atau slider.
- Penyimpanan file di luar DB (Vercel Blob, S3).

### User stories

- Sebagai pengunjung, saya klik judul proyek di `/projects` lalu masuk ke halaman detailnya.
- Sebagai pengunjung, saya melihat gambar-gambar proyek beserta keterangan di bawah tiap gambar.
- Sebagai admin, saya menambah gambar galeri satu per satu, lengkap dengan keterangannya.
- Sebagai admin, saya mengubah keterangan atau menghapus gambar galeri.

### Acceptance criteria

- [ ] Judul tiap proyek di `/projects` adalah tautan ke `/projects/[id]`. Isi daftar lainnya tidak berubah.
- [ ] `/projects/[id]` menampilkan judul, teknologi, deskripsi, video, gambar utama, dan tautan proyek.
- [ ] `/projects/[id]` menampilkan gambar galeri urut dari yang paling lama diupload, tiap gambar dengan keterangannya.
- [ ] Gambar galeri dimuat terpisah (lazy), tidak ditanam di HTML halaman.
- [ ] `/projects/[id]` dengan id yang tidak ada mengembalikan 404.
- [ ] Kegagalan DB di halaman detail menampilkan pesan ramah, bukan error mentah.
- [ ] Admin bisa menambah gambar galeri (PNG, JPEG, WebP, GIF, maks 2 MB) dengan keterangan wajib.
- [ ] Gambar dengan tipe salah, lebih dari 2 MB, atau tanpa keterangan ditolak dengan pesan jelas.
- [ ] Admin bisa mengubah keterangan dan menghapus gambar galeri.
- [ ] Semua aksi galeri menolak password admin yang salah.
- [ ] Menghapus proyek ikut menghapus semua gambar galerinya.
