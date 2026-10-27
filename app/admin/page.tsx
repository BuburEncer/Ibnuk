import { listProjects } from "../../lib/projects";
import { createProject } from "../actions/projects";
import AdminActions from "./admin-actions";
import { LinkField } from "./link-field";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Password salah atau data tidak valid.",
  dbfailure: "Gagal menyimpan. Coba lagi.",
  "image-too-large": "Gambar terlalu besar. Maksimal 2 MB.",
  "image-type": "Format gambar tidak didukung. Pakai PNG, JPEG, WebP, atau GIF.",
  "video-too-large": "Video terlalu besar. Maksimal 20 MB.",
  "video-type": "Format video tidak didukung. Pakai MP4 atau WebM.",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { projects: all, failed } = await listProjects();
  return (
    <main className="subpage">
      <a className="back" href="/">
        Beranda
      </a>
      <h1 className="title">Admin</h1>
      {error && <p className="error">{ERROR_MESSAGES[error] ?? "Terjadi kesalahan."}</p>}

      <h2 className="subtitle">Tambah proyek</h2>
      <form className="admin-form" action={createProject}>
        <label>
          Password <input name="password" type="password" autoComplete="current-password" suppressHydrationWarning required />
        </label>
        <label>
          Judul <input name="title" required />
        </label>
        <label>
          Deskripsi <textarea name="description" />
        </label>
        <label>
          Teknologi <input name="technologies" />
        </label>
        <LinkField name="link" label="Tautan" />
        <LinkField name="link2" label="Tautan 2 (opsional)" />
        <label>
          Gambar (opsional, maks 2 MB: PNG/JPEG/WebP/GIF)
          <input type="file" name="image" accept="image/png,image/jpeg,image/webp,image/gif" />
        </label>
        <label>
          Video (opsional, maks 20 MB: MP4/WebM)
          <input type="file" name="video" accept="video/mp4,video/webm" />
        </label>
        <label>
          Kategori
          <select name="category" defaultValue="software" required>
            <option value="ai">AI/ML</option>
            <option value="software">Software</option>
          </select>
        </label>
        <button type="submit">Simpan</button>
      </form>

      <h2 className="subtitle">Proyek ({all.length})</h2>
      {failed && (
        <p className="error" role="status">Gagal memuat daftar proyek. Coba lagi nanti.</p>
      )}
      <ul className="admin-list">
        {all.map((p) => (
          <li key={p.id}>
            <AdminActions project={p} />
          </li>
        ))}
      </ul>
    </main>
  );
}
