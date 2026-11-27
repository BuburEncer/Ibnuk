# Desain — Portofolio "Ibnu Qayyim"

Referensi: `docs/PRD.md`. Berisi HOW. Tidak mengulang isi PRD.

## Stack dan versi

| Bagian | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 15 (React 19, App Router) | Vercel-native. API routes serverless bawaan. Satu codebase. |
| Database | PostgreSQL terhosting (Vercel Postgres) | Sesuai permintaan. Tanpa Docker, tanpa install lokal. |
| ORM | Drizzle ORM | Tipis, typed, kerja dengan serverless. |
| Bahasa | TypeScript | Jenis aman untuk schema + komponen. |

## Arsitektur

Next.js App Router. Halaman dibaca via Server Component langsung ke DB, tanpa lapisan fetch client. Admin pakai Server Actions. Tidak ada REST API terpisah.

```
app/
  page.tsx          # hero
  projects/page.tsx # daftar proyek per kategori
  projects/project-image.tsx # gambar lokal dengan fallback saat gagal dimuat
  admin/            # halaman kelola proyek
  lib/db.ts         # koneksi Drizzle
  lib/auth.ts       # cek password admin
db/
  schema.ts         # tabel projects
  migrations/       # migrasi Drizzle
scripts/
  seed.mjs          # seed metadata proyek pilihan ke DB lokal
```

## Skema DB

Tabel tunggal `projects`:

- `id` serial PK
- `title` text, wajib
- `description` text (penjelasan singkat proyek)
- `technologies` text (stack, string comma-separated)
- `link` text (URL proyek/repo)
- `source` text, nullable (`github` atau `kaggle`)
- `category` text, nullable (`ai` atau `software`)
- `image` text, nullable (data URL base64 hasil upload, maks 2 MB, tipe PNG/JPEG/WebP/GIF)
- `created_at` timestamp

Kolom metadata nullable supaya baris lama tetap valid. Baris tanpa `category` tampil di seksi `Lainnya`.

## Alur data

- `/` dan `/projects`: Server Component query Drizzle → render. Proyek kosong → tampil pesan kosong. Kegagalan DB → pesan "Gagal memuat proyek", dibedakan dari daftar kosong.
- `/admin`: form. Submit → Server Action validasi password (`ADMIN_PASSWORD` env) lalu insert/update/delete.
- Password salah → tolak dengan pesan. Benar → redirect `/projects` setelah aksi.
- `npm run seed`: isi metadata proyek pilihan ke DB lokal. Skip entri yang link-nya sudah ada.

## Validasi dan error handling

- Semua field proyek divalidasi server-side (non-empty title, URL format untuk link, allowlist source dan category). Gambar: allowlist tipe PNG/JPEG/WebP/GIF, cek magic bytes, batas 2 MB.
- Kegagalan DB → pesan ramah, bukan stack trace.
- Password tidak pernah dikirim ke client; dibandingkan di server.

## Testing

TDD pada:
- Schema Drizzle (kolom, tipe).
- Cek password admin (benar/salah).
- Util CRUD proyek (insert/update/delete).
- Validasi source, category, dan upload gambar (tipe, ukuran, magic bytes).
- Pengelompokan proyek per kategori.
- Seed idempoten (link unik, tanpa duplikat).

Unit test via Vitest. Pengujian E2E manual.

## Keputusan kunci

- **Server Components, bukan client fetch**: lebih sedikit kode, tanpa state casing. Skala portofolio kecil.
- **Server Actions, bukan REST API**: tanpa boilerplate route handler. Cukup untuk admin tunggal.
- **Drizzle bukan Prisma**: lebih tipis, hasil bundle kecil, ramah serverless.
- **Password tunggal, bukan user accounts**: satu admin. YAGNI auth penuh.
- **Daftar proyek dikurasi manual**: tanpa GitHub API fetch. Stabil, terkontrol.
- **Gambar base64 di Postgres, bukan file lokal atau hotlink**: Vercel menghapus `public/` tiap deploy, dan storage eksternal butuh API key. Satu kolom teks, tanpa route handler. Batas 2 MB; bila gambar mulai besar, pindah ke object storage.
- **Satu kolom daftar, bukan grid kartu**: bahasa visual kartu bisnis di `/` diteruskan, halaman menyatu dengan hero.

## Yang sengaja ditunda (ponytail)

- Rate limiting / lockout admin. Tambah bila admin diekspos publik.

## Fitur: halaman detail dan galeri

Referensi: bagian "Fitur: halaman detail proyek dengan galeri" di `docs/PRD.md`. Stack tetap, tidak ada dependency baru.

### Skema

Tabel baru `project_images`:

- `id` serial PK
- `project_id` integer, wajib, FK ke `projects.id` dengan `ON DELETE CASCADE`
- `image` text, wajib (data URL base64, aturan sama dengan `projects.image`)
- `caption` text, wajib
- `created_at` timestamp

Cascade di DB, jadi `deleteProject` tidak perlu kode tambahan. Urutan galeri `ORDER BY id`, tanpa kolom urutan karena pengaturan urutan masuk non-goal.

### Route

```
app/projects/[id]/page.tsx                     # halaman detail
app/projects/[id]/images/[imageId]/route.ts    # kirim byte satu gambar galeri
```

- `page.tsx`: Server Component. `id` bukan bilangan bulat positif atau proyek tidak ditemukan → `notFound()`. Query proyek, lalu query galeri tanpa kolom `image` (hanya `id`, `caption`). Tiap gambar dirender `<figure>` + `<img loading="lazy" src=".../images/[imageId]">` + `<figcaption>`. DB gagal → pesan ramah yang sama dengan `/projects`.
- `route.ts`: `GET` ambil satu baris dengan `project_id` dan `id` yang cocok. Data URL diurai jadi `Content-Type` dan byte, dikirim dengan `Cache-Control: public, max-age=31536000, immutable`. Aman di-cache lama karena gambar tidak pernah diubah di tempat; edit hanya menyentuh caption. Tidak ditemukan → 404.
- `/projects`: judul dibungkus `<Link href="/projects/[id]">`. Bagian lain tetap.

Gambar lewat route terpisah, bukan ditanam di HTML, supaya ukuran halaman tidak tumbuh dengan jumlah gambar (10 gambar × 2 MB base64 ≈ 27 MB HTML).

### UI

Ikut tema situs yang sudah ada di `app/globals.css`. Tidak ada token, font, atau warna baru.

- Token yang dipakai: latar `#ffffff`, teks `#050505`, teks sekunder `#666`, garis `1px solid #eee`, font Cormorant Garamond, outline fokus `2px solid #050505`.
- Kerangka halaman: `main.subpage.projects-page` (lebar maks 45rem), tautan `.back` ke `/projects`, judul `.title` di tengah.
- Bagian atas memakai kelas daftar yang sama: `.index-tech` untuk teknologi, `.desc` untuk deskripsi, `.project-image` untuk gambar utama, `.index-video` untuk video, `.link` untuk tautan GitHub/Kaggle.
- Galeri di bawah judul seksi `.project-section-title` bertuliskan "Gallery". Tiap gambar satu kolom penuh, rasio asli (tanpa crop), dipisah garis `#eee` seperti baris daftar. Caption di bawah gambar: miring, `#666`, ukuran 1.0625rem, sama dengan teks teknologi.
- Kelas baru hanya `.gallery` dan `.gallery figcaption`, beberapa baris CSS.
- Mobile: satu kolom sudah responsif, gambar `width: 100%`. Tidak ada breakpoint baru.
- Judul di `/projects` memakai `<Link>` dengan gaya tautan global (garis bawah saat hover/fokus), tanpa warna baru.

### Server Actions

Tiga action baru di `app/actions/projects.ts`, semuanya cek `checkPassword` dulu:

- `addProjectImage`: `projectId`, file `image`, `caption`. Pakai ulang `readImage` (batas 2 MB, magic bytes). File kosong atau caption kosong → `invalid`.
- `updateProjectImageCaption`: `id`, `caption`. Caption kosong → `invalid`.
- `deleteProjectImage`: `id`.

Error memakai `fail()` yang sudah ada (redirect ke `/admin?error=...`). Sukses → `revalidatePath` untuk `/projects/[id]` lalu redirect ke `/admin`, sama seperti action proyek.

### Admin

Tiap item proyek di `/admin` dapat bagian Gallery: daftar thumbnail (pakai route gambar) dengan form caption dan tombol hapus, lalu satu form tambah (file + caption). Password diambil dari `password-context.tsx` seperti form lain.

### Testing

TDD, Vitest, pola yang sama dengan `tests/project-actions.test.ts`:

- Action galeri: tambah sukses, tolak password salah, tolak caption kosong, tolak tipe salah dan file di atas 2 MB, ubah caption, hapus.
- Fungsi pengurai data URL untuk route gambar: hasilkan tipe dan byte yang benar, tolak string yang bukan data URL gambar.
- Halaman detail: id tidak valid → `notFound`.

Cascade dicek manual sekali lewat migrasi SQL yang dihasilkan (`ON DELETE cascade` ada di DDL).
