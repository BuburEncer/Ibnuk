"use client";
import {
  addProjectImage,
  deleteProjectImage,
  updateProjectImageCaption,
} from "../actions/projects";
import { HiddenPassword } from "./password-context";

type GalleryImage = { id: number; caption: string };

export default function GalleryAdmin({
  projectId,
  images,
}: {
  projectId: number;
  images: GalleryImage[];
}) {
  return (
    <section className="admin-gallery">
      <h3 className="project-section-title">Gallery ({images.length})</h3>
      <ul className="admin-list">
        {images.map((img) => (
          <li key={img.id} className="admin-gallery-item">
            <img
              className="project-image"
              src={`/projects/${projectId}/images/${img.id}`}
              alt=""
              loading="lazy"
            />
            <form className="admin-form" action={updateProjectImageCaption}>
              <input type="hidden" name="id" value={img.id} />
              <HiddenPassword />
              <label>
                Caption <input name="caption" defaultValue={img.caption} required />
              </label>
              <button type="submit">Save caption</button>
            </form>
            <form className="admin-form" action={deleteProjectImage}>
              <input type="hidden" name="id" value={img.id} />
              <HiddenPassword />
              <button className="danger" type="submit">
                Delete image
              </button>
            </form>
          </li>
        ))}
      </ul>
      <form className="admin-form" action={addProjectImage}>
        <input type="hidden" name="projectId" value={projectId} />
        <HiddenPassword />
        <label>
          Image (max 2 MB: PNG/JPEG/WebP/GIF)
          <input
            type="file"
            name="image"
            accept="image/png,image/jpeg,image/webp,image/gif"
            required
          />
        </label>
        <label>
          Caption <input name="caption" required />
        </label>
        <button type="submit">Add image</button>
      </form>
    </section>
  );
}
