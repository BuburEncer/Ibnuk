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
- `video` text, nullable (data URL base64 hasil upload, maks 20 MB, tipe MP4/WebM)
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
- **Gambar base64 di Postgres, bukan file lokal atau hotlink**: Vercel menghapus `public/` tiap deploy, dan storage eksternal butuh API key. Satu kolom teks per media. Batas 2 MB untuk gambar, 20 MB untuk video; bila media mulai besar, pindah ke object storage.
- **Media disajikan lewat route, bukan data URL di HTML**: data URL membuat ukuran halaman tumbuh bersama media (satu video 20 MB jadi sekitar 27 MB HTML). Halaman hanya menerima tanda `hasImage`/`hasVideo` dan memuat byte dari route. Lihat bagian "Media utama proyek".
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
- `route.ts`: `GET` ambil satu baris dengan `project_id` dan `id` yang cocok. Data URL diurai jadi `Content-Type` dan byte, dikirim dengan `Cache-Control: public, max-age=3600` dan `X-Content-Type-Options: nosniff`. Cache dibatasi satu jam supaya gambar yang dihapus tidak terus tersaji dari cache browser atau proxy. Tidak ditemukan → 404. DB gagal → 503 dengan pesan singkat.
- `/projects`: judul dibungkus `<Link href="/projects/[id]">`. Bagian lain tetap.

Gambar lewat route terpisah, bukan ditanam di HTML, supaya ukuran halaman tidak tumbuh dengan jumlah gambar (10 gambar × 2 MB base64 ≈ 27 MB HTML).

### UI

Ikut tema situs yang sudah ada di `app/globals.css`. Tidak ada token, font, atau warna baru.

- Token yang dipakai: latar `#ffffff`, teks `#050505`, teks sekunder `#666`, garis `1px solid #eee`, font Cormorant Garamond, outline fokus `2px solid #050505`.
- Kerangka halaman: `main.subpage.projects-page` (lebar maks 45rem), tautan `.back` ke `/projects`, judul `.title` di tengah.
- Bagian atas memakai kelas daftar yang sama: `.index-tech` untuk teknologi, `.desc` untuk deskripsi, `.project-image` untuk gambar utama, `.index-video` untuk video, `.link` untuk tautan GitHub/Kaggle.
- Tautan GitHub dan Kaggle tampil sebagai logo saja (dari `simple-icons`, sudah terpasang), lewat `app/projects/platform-link.tsx`. Komponen ini dipakai di daftar dan di halaman detail. Nama platform tetap ada di `aria-label` dan `title`. Area klik minimal 44px. Logo Kaggle berupa wordmark tipis, jadi `viewBox`-nya dipotong supaya terbaca. Host lain tetap tampil sebagai teks "Open project".
- Galeri di bawah judul seksi `.project-section-title` bertuliskan "Gallery". Galeri berupa slider seperti feed Instagram: satu gambar selebar kolom per slide. Di layar sentuh, slide digeser dengan swipe (`scroll-snap` native). Di desktop ada tombol panah ‹ ›, dan titik di bawah menunjukkan posisi serta bisa diklik. Komponennya `app/projects/gallery-carousel.tsx`, client component kecil tanpa dependency. Tinggi gambar seragam (28rem, 22rem di mobile) dengan `object-fit: contain`, jadi screenshot HP dan desktop tidak terpotong. Track diberi `tabIndex={0}` agar bisa digulir dengan keyboard. Caption di bawah gambar: miring, `#666`, ukuran 1.0625rem, sama dengan teks teknologi.
- Kelas galeri: `.gallery-carousel`, `.gallery`, `.gallery-arrow`, `.gallery-dots`.
- Mobile: `.projects-page` diberi `min-width: 0` supaya lebar carousel tidak ikut melebarkan halaman.
- Judul di `/projects` memakai `<Link>` dengan gaya tautan global (garis bawah saat hover/fokus), tanpa warna baru.

### Server Actions

Tiga action baru di `app/actions/projects.ts`, semuanya cek `checkPassword` dulu:

- `addProjectImage`: `projectId`, file `image`, `caption`. Pakai ulang `readImage` (batas 2 MB, magic bytes). File kosong atau caption kosong → `invalid`.
- `updateProjectImageCaption`: `id`, `caption`. Caption kosong → `invalid`.
- `deleteProjectImage`: `id`.

Caption wajib, maksimal 500 karakter; pelanggaran memberi `error=caption` dengan pesan sendiri. Error lain memakai `fail()` yang sudah ada (redirect ke `/admin?error=...`). Sukses → redirect ke `/admin`. Tanpa `revalidatePath` karena halaman publik memakai `force-dynamic`; tambahkan bila flag itu dihapus.

### Admin

Tiap item proyek di `/admin` dapat bagian Gallery: daftar thumbnail (pakai route gambar) dengan form caption dan tombol hapus, lalu satu form tambah (file + caption). Password diambil dari `password-context.tsx` seperti form lain.

### Testing

TDD, Vitest, pola yang sama dengan `tests/project-actions.test.ts`:

- Action galeri: tambah sukses, tolak password salah, tolak caption kosong, tolak tipe salah dan file di atas 2 MB, ubah caption, hapus.
- Fungsi pengurai data URL untuk route gambar: hasilkan tipe dan byte yang benar, tolak string yang bukan data URL gambar.
- Halaman detail: id tidak valid → `notFound`.

Cascade dicek manual sekali lewat migrasi SQL yang dihasilkan (`ON DELETE cascade` ada di DDL).

## Media utama proyek

Referensi: `docs/tickets/T-005-main-media-route.md`. Melengkapi route galeri di bagian sebelumnya untuk gambar utama dan video di tabel `projects`.

### Query

`listProjects` dan `getProject` memilih kolom tetap lewat `projectFields` di `lib/projects.ts`. Kolom `image` dan `video` tidak ikut; sebagai gantinya ada `hasImage` dan `hasVideo`, dihitung dengan regex Postgres yang memakai allowlist tipe yang sama dengan parser route. Jadi tanda bernilai true hanya bila route memang akan menyajikan medianya. Tipe `Project` diturunkan dari hasil query, tidak ditulis ulang. Halaman publik dan admin tidak pernah menerima byte media.

Preview di `/projects`: kalau proyek tidak punya gambar utama maupun video, daftar memakai gambar galeri pertama lewat route galeri. Query hanya mengambil `coverImageId` (subquery `id` terkecil di `project_images`), bukan byte gambar. Di subquery, kolom ditulis `"projects"."id"` secara eksplisit karena Drizzle merender `${projects.id}` tanpa nama tabel, sehingga kolom itu terikat ke `project_images.id` dan hasilnya selalu null. Di daftar, `.projects-list .project-image` memakai `object-fit: contain` dengan latar `#f6f6f6`, jadi screenshot HP tidak terpotong. Halaman detail dan admin tetap memakai `cover`.

### Route

```
app/projects/[id]/media/[kind]/route.ts    # kind = image | video
```

- `kind` di luar `image` dan `video` → 404 tanpa query, jadi route tidak bisa dipakai membaca kolom lain.
- Satu kolom dibaca, lalu diurai dengan `parseImageDataUrl` atau `parseVideoDataUrl` (`lib/validate.ts`, satu helper `parseDataUrl` bersama). Nilai kosong, bukan data URL, atau tipe di luar allowlist → 404. DB gagal → 503 dengan pesan singkat.
- Header: `Content-Type` dari data URL, `X-Content-Type-Options: nosniff`, `Accept-Ranges: bytes`, `Cache-Control: no-cache`, dan `ETag` dari hash SHA-256 isi file.
- `If-None-Match` cocok → 304 tanpa body.
- `Range: bytes=a-b` atau `bytes=a-` → 206 dengan `Content-Range`. Satu potongan maksimal 2 MiB; ujung yang melewati batas itu atau melewati file dipotong. Awal yang melewati file → 416.
- Tanpa `Range`, atau Range yang tidak bisa diurai atau multi-range → file utuh dengan 200, dikirim sebagai stream.

### Keputusan

- **`no-cache` + ETag, bukan `max-age`**: berbeda dengan gambar galeri, media utama diganti di tempat oleh `updateProject`. `max-age` akan menyajikan gambar lama setelah diganti. Dengan ETag, browser tetap bertanya tiap kali tetapi cukup menerima 304 bila isi sama.
- **Range satu potong ditangani sendiri**: Safari tidak memutar video tanpa respons 206, dan Route Handler Next.js tidak menanganinya otomatis. Multi-range jarang dipakai pemutar video, jadi dilewati.
- **Potongan 2 MiB dan stream untuk 200**: Vercel menolak respons non-stream di atas 4.5 MB (`FUNCTION_PAYLOAD_TOO_LARGE`). Pemutar membuka video dengan `bytes=0-`, jadi tanpa batas potongan video di atas 4.5 MB tidak bisa diputar setelah deploy. Pemutar otomatis meminta potongan berikutnya. Respons 200 tanpa Range dikirim sebagai `ReadableStream`, yang tidak kena batas itu.
- **Byte tetap dibaca utuh dari DB per request**: untuk Range sekalipun, seluruh data URL dibaca lalu dipotong. Cukup untuk video maks 20 MB dan lalu lintas portofolio. Bila beban naik, pindah ke object storage.

### Testing

`tests/media-route.test.ts` memanggil `GET` dengan DB tiruan: header, 304, 206/416, `kind` asing, id tidak valid, nilai lama yang bukan data URL, gambar di kolom video, dan 503. `tests/validate.test.ts` menguji `parseVideoDataUrl`. Source check di `tests/projects-page.test.ts` memastikan query memakai tanda `hasImage`/`hasVideo` dan halaman memakai route.
