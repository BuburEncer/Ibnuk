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
