import Link from "next/link";
import { collectSkills, groupProjects, getProjectListState, listProjects } from "../../lib/projects";
import { orderedLinks } from "../../lib/platform";
import PlatformLink from "./platform-link";
import ProjectImage from "./project-image";
import SkillIcon from "./skill-icon";

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
          <div className="index-head">
            <span className="index-num">
              {String(startIndex + i).padStart(2, "0")}
            </span>
            <Link className="index-title" href={`/projects/${project.id}`}>
              {project.title}
            </Link>
            {project.technologies && (
              <span className="index-tech">
                {collectSkills([project]).map((skill) => (
                  <span key={skill} className="index-tech-item">
                    <SkillIcon skill={skill} />
                    {skill}
                  </span>
                ))}
              </span>
            )}
          </div>
          <div className="index-body">
            {project.hasVideo && (
              <video
                className="index-video"
                controls
                preload="metadata"
                src={`/projects/${project.id}/media/video`}
              />
            )}
            {project.hasImage ? (
              <ProjectImage
                src={`/projects/${project.id}/media/image`}
                alt={`${project.title} project screenshot`}
              />
            ) : (
              project.coverImageId !== null &&
              !project.hasVideo && (
                <ProjectImage
                  src={`/projects/${project.id}/images/${project.coverImageId}`}
                  alt={`${project.title} project screenshot`}
                />
              )
            )}
            {project.description && <p className="desc">{project.description}</p>}
          </div>
          <p className="index-links">
            {orderedLinks([project.link, project.link2]).map((href) => (
              <PlatformLink key={href} href={href} />
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
  const skills = collectSkills(result.projects);

  return (
    <main className="subpage projects-page">
      <Link className="back" href="/">
        Home
      </Link>
      <h1 className="title">Projects</h1>
      {state === "error" ? (
        <p className="error" role="status">Could not load projects. Please try again later.</p>
      ) : state === "empty" ? (
        <p className="empty">No projects yet.</p>
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
              <h2 className="project-section-title" id="other-projects">Other</h2>
              <ProjectList
                projects={groups.other}
                startIndex={groups.ai.length + groups.software.length + 1}
              />
            </section>
          )}
          {skills.length > 0 && (
            <section className="project-section" aria-labelledby="skills">
              <h2 className="project-section-title" id="skills">Skills &amp; Technologies</h2>
              <ul className="skills-list">
                {skills.map((skill) => (
                  <li key={skill}>
                    <SkillIcon skill={skill} />
                    {skill}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  );
}
