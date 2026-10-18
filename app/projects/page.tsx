import Link from "next/link";
import { listProjects } from "../../lib/projects";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const all = await listProjects();
  return (
    <main className="subpage">
      <Link className="back" href="/">
        Beranda
      </Link>
      <h1 className="title">Projects</h1>
      {all.length === 0 ? (
        <p className="empty">Belum ada proyek.</p>
      ) : (
        <ul className="projects-list">
          {all.map((p) => (
            <li key={p.id}>
              <h2>{p.title}</h2>
              {p.description && <p className="desc">{p.description}</p>}
              {p.technologies && <p className="tech">{p.technologies}</p>}
              {p.link && (
                <a className="link" href={p.link}>
                  {p.link}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
