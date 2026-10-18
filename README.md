# Portofolio Ibnu Qayyim

Portofolio pribadi: halaman hero, daftar proyek, admin satu-password.
Stack: Next.js 15, PostgreSQL, Drizzle ORM, TypeScript.

## Prasyarat

- Node.js 24+
- PostgreSQL sudah berjalan (pgAdmin bundle sudah termasuk server Postgres)

## Setup sekali

1. Edit `.env.local` (dan salin ke `.env` karena drizzle-kit baca `.env`):

```
DATABASE_URL=postgres://postgres:PASSWORD@localhost:5432/ibnuk
ADMIN_PASSWORD=pilih-password-admin
```

2. Install dependensi:

```bash
npm install
```

3. Siapkan database (buat DB `ibnuk` sekali via pgAdmin, lalu):

```bash
npm run migrate
```

## Menjalankan (dev)

```bash
npm run dev
```

Buka:

- http://localhost:3000 — halaman utama (hero)
- http://localhost:3000/projects — daftar proyek
- http://localhost:3000/admin — kelola proyek (tambah/ubah/hapus), pakai `ADMIN_PASSWORD`

## Perintah lain

```bash
npm run test       # unit tests (Vitest)
npm run build      # production build
npm run generate   # generate migrasi baru setelah ubah skema
npm run migrate    # terapkan migrasi
```

## Deploy ke Vercel

1. `vercel link`, lalu provision **Vercel Postgres**.
2. Set env di dashboard Vercel: `DATABASE_URL`, `ADMIN_PASSWORD`.
3. `vercel deploy --prod`. File `vercel.json` otomatis jalanin
   `next build && drizzle-kit migrate` → buat tabel `projects` di DB produksi.
