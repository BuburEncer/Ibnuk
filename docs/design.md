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
  projects/page.tsx # daftar proyek
  admin/            # halaman kelola proyek
  lib/db.ts         # koneksi Drizzle
  lib/auth.ts       # cek password admin
db/
  schema.ts         # tabel projects
  migrations/       # migrasi Drizzle
```

## Skema DB

Tabel tunggal `projects`:

- `id` serial PK
- `title` text, wajib
- `description` text
- `technologies` text (string comma-separated)
- `link` text (URL proyek/repo)
- `created_at` timestamp

## Alur data

- `/` dan `/projects`: Server Component query Drizzle → render. Proyek kosong → tampil pesan kosong.
- `/admin`: form. Submit → Server Action validasi password (`ADMIN_PASSWORD` env) lalu insert/update/delete.
- Password salah → tolak dengan pesan. Benar → redirect `/projects` setelah aksi.

## Validasi dan error handling

- Semua field proyek divalidasi server-side (non-empty title, URL format untuk link).
- Kegagalan DB → pesan ramah, bukan stack trace.
- Password tidak pernah dikirim ke client; dibandingkan di server.

## Testing

TDD pada:
- Schema Drizzle (kolom, tipe).
- Cek password admin (benar/salah).
- Util CRUD proyek (insert/update/delete).

Unit test via Vitest. Pengujian E2E manual.

## Keputusan kunci

- **Server Components, bukan client fetch**: lebih sedikit kode, tanpa state casing. Skala portofolio kecil.
- **Server Actions, bukan REST API**: tanpa boilerplate route handler. Cukup untuk admin tunggal.
- **Drizzle bukan Prisma**: lebih tipis, hasil bundle kecil, ramah serverless.
- **Password tunggal, bukan user accounts**: satu admin. YAGNI auth penuh.
- **Daftar proyek dikurasi manual**: tanpa GitHub API fetch. Stabil, terkontrol.

## Yang sengaja ditunda (ponytail)

- Thumbnail/gambar proyek. Tambah kolom `image_url` saat butuh.
- Halaman proyek detail. Cantumkan link saja saat MVP.
- Rate limiting / lockout admin. Tambah bila admin diekspos publik.
