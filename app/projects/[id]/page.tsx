import Link from "next/link";
import { notFound } from "next/navigation";
import { collectSkills, getProject, listGallery, parseProjectId } from "../../../lib/projects";
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
  const [{ project, failed }, gallery] = await Promise.all([getProject(id), listGallery(id)]);

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
          {(gallery.failed || gallery.images.length > 0) && (
            <section className="project-section" aria-labelledby="gallery">
              <h2 className="project-section-title" id="gallery">Gallery</h2>
              {gallery.failed && (
                <p className="error" role="status">Could not load the gallery. Please try again later.</p>
              )}
              <ul className="gallery">
                {gallery.images.map((item) => (
                  <li key={item.id}>
                    <figure>
                      <img
                        src={`/projects/${project.id}/images/${item.id}`}
                        alt={item.caption}
                        loading="lazy"
                      />
                      <figcaption>{item.caption}</figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      )}
    </main>
  );
}
