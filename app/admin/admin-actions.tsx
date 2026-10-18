"use client";
import { useTransition } from "react";
import { updateProject, deleteProject } from "../actions/projects";

type Project = {
  id: number;
  title: string;
  description: string | null;
  technologies: string | null;
  link: string | null;
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
    <div style={{ border: "1px solid #ccc", padding: "8px", margin: "8px 0" }}>
      <form action={handleUpdate}>
        <input type="hidden" name="id" value={project.id} />
        <label>
          Password <input name="password" type="password" required />
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
        <button type="submit" disabled={isPending}>
          Ubah
        </button>
      </form>
      <form action={handleDelete}>
        <input type="hidden" name="id" value={project.id} />
        <label>
          Password <input name="password" type="password" required />
        </label>
        <button type="submit" disabled={isPending}>
          Hapus
        </button>
      </form>
    </div>
  );
}
