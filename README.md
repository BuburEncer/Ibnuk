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

- Database lokal: jalankan `npm run migrate`, lalu `npm run seed` untuk mengisi metadata proyek pilihan.
- `DATABASE_URL` wajib menunjuk ke database target. Seed melewati link yang sudah ada dan tidak mengubah proyek yang sudah diedit.
- Setelah deploy, tambah proyek di `/admin`. Simpan screenshot milik sendiri di `public/projects/`, isi path `/projects/<nama-file>` lewat admin, lalu deploy ulang agar gambar ikut terbit.

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
npm run seed       # isi metadata pilihan; cek link mencegah duplikat
```

## Deploy ke Vercel

1. `vercel link`, lalu provision **Vercel Postgres**.
2. Set env di dashboard Vercel: `DATABASE_URL`, `ADMIN_PASSWORD`.
3. `vercel deploy --prod`. File `vercel.json` otomatis jalanin
   `next build && drizzle-kit migrate` → buat tabel `projects` di DB produksi.
