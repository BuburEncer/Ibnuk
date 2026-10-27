import Link from "next/link";
import { groupProjects, getProjectListState, listProjects } from "../../lib/projects";
import { isImageDataUrl } from "../../lib/validate";
import { platformLabel } from "../../lib/platform";
import ProjectImage from "./project-image";

export const dynamic = "force-dynamic";

function ProjectList({
  projects,
  startIndex,
}: {
  projects: Awaited<ReturnType<typeof listProjects>>["projects"];
  startIndex: number;
}) {
  return (
    <ul className="projects-list index-list">
      {projects.map((project, i) => (
        <li key={project.id}>
          <details>
            <summary>
              <span className="index-num">
                {String(startIndex + i).padStart(2, "0")}
              </span>
              <span className="index-title">{project.title}</span>
              {project.technologies && (
                <span className="index-tech">{project.technologies}</span>
              )}
            </summary>
            <div className="index-body">
              {project.image && isImageDataUrl(project.image) && (
                <ProjectImage
                  src={project.image}
                  alt={`${project.title} project screenshot`}
                />
              )}
              {project.description && <p className="desc">{project.description}</p>}
            </div>
          </details>
          <p className="index-links">
            {[project.link, project.link2].filter(Boolean).map((href) => (
              <a
                key={href}
                className="link"
                href={href as string}
                target="_blank"
                rel="noopener noreferrer"
              >
                {platformLabel(href as string)}
              </a>
            ))}
          </p>
        </li>
      ))}
    </ul>
  );
}

export default async function ProjectsPage() {
  const result = await listProjects();
  const state = getProjectListState(result);
  const groups = groupProjects(result.projects);

  return (
    <main className="subpage projects-page">
      <Link className="back" href="/">
        Beranda
      </Link>
      <h1 className="title">Projects</h1>
      {state === "error" ? (
        <p className="error" role="status">Gagal memuat proyek. Coba lagi nanti.</p>
      ) : state === "empty" ? (
        <p className="empty">Belum ada proyek.</p>
      ) : (
        <>
          {groups.ai.length > 0 && (
            <section className="project-section" aria-labelledby="ai-projects">
              <h2 className="project-section-title" id="ai-projects">AI/ML</h2>
              <ProjectList projects={groups.ai} startIndex={1} />
            </section>
          )}
          {groups.software.length > 0 && (
            <section className="project-section" aria-labelledby="software-projects">
              <h2 className="project-section-title" id="software-projects">Software</h2>
              <ProjectList
                projects={groups.software}
                startIndex={groups.ai.length + 1}
              />
            </section>
          )}
          {groups.other.length > 0 && (
            <section className="project-section" aria-labelledby="other-projects">
              <h2 className="project-section-title" id="other-projects">Lainnya</h2>
              <ProjectList
                projects={groups.other}
                startIndex={groups.ai.length + groups.software.length + 1}
              />
            </section>
          )}
        </>
      )}
    </main>
  );
}
