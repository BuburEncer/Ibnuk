import { listProjects } from "../../lib/projects";
import { createProject } from "../actions/projects";
import AdminActions from "./admin-actions";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Password salah atau data tidak valid.",
  dbfailure: "Gagal menyimpan. Coba lagi.",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const all = await listProjects();
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
          Password <input name="password" type="password" required />
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
        <label>
          Tautan <input name="link" />
        </label>
        <button type="submit">Simpan</button>
      </form>

      <h2 className="subtitle">Proyek ({all.length})</h2>
      <ul>
        {all.map((p) => (
          <li key={p.id}>
            <AdminActions project={p} />
          </li>
        ))}
      </ul>
    </main>
  );
}
