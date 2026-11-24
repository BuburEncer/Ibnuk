"use client";
import { useTransition } from "react";
import { updateProject, deleteProject } from "../actions/projects";
import { isImageDataUrl } from "../../lib/validate";
import { platformKey } from "../../lib/platform";
import { LinkField } from "./link-field";
import { HiddenPassword } from "./password-context";

type Project = {
  id: number;
  title: string;
  description: string | null;
  technologies: string | null;
  link: string | null;
  link2: string | null;
  video: string | null;
  category: string | null;
  image: string | null;
};

export default function AdminActions({ project }: { project: Project }) {
  const [isPending, startTransition] = useTransition();

  function handleUpdate(formData: FormData) {
    startTransition(async () => {
      await updateProject(formData);
    });
  }

  function handleDelete(formData: FormData) {
    startTransition(async () => {
      await deleteProject(formData);
    });
  }

  return (
    <div className="admin-item">
      <details>
        <summary>
          <span className="admin-item-title">{project.title}</span>
          {project.technologies && <span className="small">{project.technologies}</span>}
        </summary>
        <form className="admin-form" action={handleUpdate}>
        <input type="hidden" name="id" value={project.id} />
        <HiddenPassword />
        <label>
          Title <input name="title" defaultValue={project.title} required />
        </label>
        <label>
          Description{" "}
          <textarea name="description" defaultValue={project.description ?? ""} />
        </label>
        <label>
          Technologies <input name="technologies" defaultValue={project.technologies ?? ""} />
        </label>
        <LinkField
          name="link"
          label="Link"
          initial={[project.link, project.link2].find((u) => u && platformKey(u) === "github") ?? ""}
        />
        <LinkField
          name="link2"
          label="Link 2 (optional)"
          initial={[project.link, project.link2].find((u) => u && platformKey(u) === "kaggle") ?? ""}
        />
        <label>
          Category
          <select
            name="category"
            defaultValue={project.category ?? "software"}
            required
          >
            <option value="ai">AI/ML</option>
            <option value="software">Software</option>
          </select>
        </label>
        <label>
          Image (optional, max 2 MB: PNG/JPEG/WebP/GIF)
          <input type="file" name="image" accept="image/png,image/jpeg,image/webp,image/gif" />
        </label>
        <label>
          Video (optional, max 20 MB: MP4/WebM)
          <input type="file" name="video" accept="video/mp4,video/webm" />
        </label>
        {project.video && <video className="admin-video" controls src={project.video} />}
        {project.video && (
          <label>
            <input type="checkbox" name="removeVideo" /> Remove video on save
          </label>
        )}
        {project.image && isImageDataUrl(project.image) && (
          <>
            <img className="project-image" src={project.image} alt="" />
            <label>
              <input type="checkbox" name="removeImage" /> Remove image
            </label>
          </>
        )}
        <button type="submit" disabled={isPending}>
          Update
        </button>
      </form>
      <form className="admin-form admin-delete" action={handleDelete}>
        <input type="hidden" name="id" value={project.id} />
        <label>
          Password{" "}
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            suppressHydrationWarning
            required
          />
        </label>
        <button className="danger" type="submit" disabled={isPending}>
          Delete
        </button>
        </form>
      </details>
    </div>
  );
}
