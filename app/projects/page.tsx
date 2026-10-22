import Link from "next/link";
import { groupProjects, listProjects } from "../../lib/projects";
import { isValidProjectImagePath } from "../../lib/validate";
import ProjectImage from "./project-image";

export const dynamic = "force-dynamic";

function ProjectList({
  projects,
}: {
  projects: Awaited<ReturnType<typeof listProjects>>["projects"];
}) {
  return (
    <ul className="projects-list">
      {projects.map((project) => (
        <li key={project.id}>
          {project.imagePath && isValidProjectImagePath(project.imagePath) && (
            <ProjectImage
              src={project.imagePath}
              alt={`${project.title} project screenshot`}
            />
          )}
          <h2>{project.title}</h2>
          {project.description && <p className="desc">{project.description}</p>}
          {project.technologies && <p className="tech">{project.technologies}</p>}
          <p className="project-source">
            {project.source === "github"
              ? "GitHub"
              : project.source === "kaggle"
                ? "Kaggle"
                : ""}
          </p>
          {project.link && (
            <a className="link" href={project.link} target="_blank" rel="noopener noreferrer">
              Buka proyek
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function ProjectsPage() {
  const { projects, failed } = await listProjects();
  const groups = groupProjects(projects);

  return (
    <main className="subpage projects-page">
      <Link className="back" href="/">
        Beranda
      </Link>
      <h1 className="title">Projects</h1>
      {failed ? (
        <p className="error" role="status">Gagal memuat proyek. Coba lagi nanti.</p>
      ) : projects.length === 0 ? (
        <p className="empty">Belum ada proyek.</p>
      ) : (
        <>
          {groups.ai.length > 0 && (
            <section className="project-section" aria-labelledby="ai-projects">
              <h2 className="project-section-title" id="ai-projects">AI/ML</h2>
              <ProjectList projects={groups.ai} />
            </section>
          )}
          {groups.software.length > 0 && (
            <section className="project-section" aria-labelledby="software-projects">
              <h2 className="project-section-title" id="software-projects">Software</h2>
              <ProjectList projects={groups.software} />
            </section>
          )}
          {groups.other.length > 0 && (
            <section className="project-section" aria-labelledby="other-projects">
              <h2 className="project-section-title" id="other-projects">Lainnya</h2>
              <ProjectList projects={groups.other} />
            </section>
          )}
        </>
      )}
    </main>
  );
}
