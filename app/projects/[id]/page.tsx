import Link from "next/link";
import { notFound } from "next/navigation";
import { collectSkills, getProject, parseProjectId } from "../../../lib/projects";
import { isImageDataUrl } from "../../../lib/validate";
import { platformLabel, orderedLinks } from "../../../lib/platform";
import ProjectImage from "../project-image";
import SkillIcon from "../skill-icon";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseProjectId((await params).id);
  if (id === null) notFound();
  const { project, failed } = await getProject(id);

  return (
    <main className="subpage projects-page">
      <Link className="back" href="/projects">
        Projects
      </Link>
      {failed ? (
        <p className="error" role="status">Could not load projects. Please try again later.</p>
      ) : !project ? (
        notFound()
      ) : (
        <article>
          <h1 className="title">{project.title}</h1>
          {project.technologies && (
            <p className="index-tech detail-tech">
              {collectSkills([project]).map((skill) => (
                <span key={skill} className="index-tech-item">
                  <SkillIcon skill={skill} />
                  {skill}
                </span>
              ))}
            </p>
          )}
          {project.video && <video className="index-video" controls src={project.video} />}
          {project.image && isImageDataUrl(project.image) && (
            <ProjectImage src={project.image} alt={`${project.title} project screenshot`} />
          )}
          {project.description && <p className="desc detail-desc">{project.description}</p>}
          <p className="detail-links">
            {orderedLinks([project.link, project.link2]).map((href) => (
              <a
                key={href}
                className="link"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {platformLabel(href)}
              </a>
            ))}
          </p>
        </article>
      )}
    </main>
  );
}
