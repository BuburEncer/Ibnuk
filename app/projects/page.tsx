import { listProjects } from "../../lib/projects";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const all = await listProjects();
  if (all.length === 0) {
    return <p>Belum ada proyek.</p>;
  }
  return (
    <ul>
      {all.map((p) => (
        <li key={p.id}>
          <h2>{p.title}</h2>
          {p.description && <p>{p.description}</p>}
          {p.technologies && <p>{p.technologies}</p>}
          {p.link && <a href={p.link}>{p.link}</a>}
        </li>
      ))}
    </ul>
  );
}
