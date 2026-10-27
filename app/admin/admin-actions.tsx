"use client";
import { useTransition } from "react";
import { updateProject, deleteProject } from "../actions/projects";
import { isImageDataUrl } from "../../lib/validate";

type Project = {
  id: number;
  title: string;
  description: string | null;
  technologies: string | null;
  link: string | null;
  link2: string | null;
  video: string | null;
  source: string | null;
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
        <label>
          Password <input name="password" type="password" autoComplete="current-password" suppressHydrationWarning required />
        </label>
        <label>
          Judul <input name="title" defaultValue={project.title} required />
        </label>
        <label>
          Deskripsi{" "}
          <textarea name="description" defaultValue={project.description ?? ""} />
        </label>
        <label>
          Teknologi <input name="technologies" defaultValue={project.technologies ?? ""} />
        </label>
        <label>
          Tautan <input name="link" defaultValue={project.link ?? ""} />
        </label>
        <label>
          Tautan 2 (opsional) <input name="link2" defaultValue={project.link2 ?? ""} />
        </label>
        <label>
          Sumber
          <select
            name="source"
            defaultValue={project.source ?? "github"}
            required
          >
            <option value="github">GitHub</option>
            <option value="kaggle">Kaggle</option>
          </select>
        </label>
        <label>
          Kategori
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
          Gambar (opsional, maks 2 MB: PNG/JPEG/WebP/GIF)
          <input type="file" name="image" accept="image/png,image/jpeg,image/webp,image/gif" />
        </label>
        <label>
          Video (opsional, maks 20 MB: MP4/WebM)
          <input type="file" name="video" accept="video/mp4,video/webm" />
        </label>
        {project.video && <video className="admin-video" controls src={project.video} />}
        {project.video && (
          <label>
            <input type="checkbox" name="removeVideo" /> Hapus video saat disimpan
          </label>
        )}
        {project.image && isImageDataUrl(project.image) && (
          <>
            <img className="project-image" src={project.image} alt="" />
            <label>
              <input type="checkbox" name="removeImage" /> Hapus gambar
            </label>
          </>
        )}
        <button type="submit" disabled={isPending}>
          Ubah
        </button>
      </form>
      <form className="admin-form admin-delete" action={handleDelete}>
        <input type="hidden" name="id" value={project.id} />
        <label>
          Password <input name="password" type="password" autoComplete="current-password" suppressHydrationWarning required />
        </label>
        <button className="danger" type="submit" disabled={isPending}>
          Hapus
        </button>
        </form>
      </details>
    </div>
  );
}
