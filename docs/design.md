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

- Halaman proyek detail. Cantumkan link saja saat MVP.
- Rate limiting / lockout admin. Tambah bila admin diekspos publik.
