import { listProjectImages, listProjects } from "../../lib/projects";
import { createProject } from "../actions/projects";
import AdminActions from "./admin-actions";
import { LinkField } from "./link-field";
import { PasswordProvider, PasswordInput } from "./password-context";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Wrong password or invalid data.",
  dbfailure: "Could not save. Please try again.",
  "image-too-large": "Image is too large. Maximum 2 MB.",
  "image-type": "Unsupported image format. Use PNG, JPEG, WebP or GIF.",
  "video-too-large": "Video is too large. Maximum 20 MB.",
  "video-type": "Unsupported video format. Use MP4 or WebM.",
  caption: "Caption is required (max 500 characters).",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [{ projects: all, failed }, gallery] = await Promise.all([
    listProjects(),
    listProjectImages(),
  ]);
  return (
    <main className="subpage">
      <a className="back" href="/">
        Home
      </a>
      <h1 className="title">Admin</h1>
      {error && <p className="error">{ERROR_MESSAGES[error] ?? "Something went wrong."}</p>}

      <PasswordProvider>
        <h2 className="subtitle">Add project</h2>
        <form className="admin-form" action={createProject}>
          <PasswordInput />
          <label>
            Title <input name="title" required />
          </label>
          <label>
            Description <textarea name="description" />
          </label>
          <label>
            Technologies <input name="technologies" />
          </label>
          <LinkField name="link" label="Link" />
          <LinkField name="link2" label="Link 2 (optional)" />
          <label>
            Image (optional, max 2 MB: PNG/JPEG/WebP/GIF)
            <input type="file" name="image" accept="image/png,image/jpeg,image/webp,image/gif" />
          </label>
          <label>
            Video (optional, max 20 MB: MP4/WebM)
            <input type="file" name="video" accept="video/mp4,video/webm" />
          </label>
          <label>
            Category
            <select name="category" defaultValue="software" required>
              <option value="ai">AI/ML</option>
              <option value="software">Software</option>
            </select>
          </label>
          <button type="submit">Save</button>
        </form>

        <h2 className="subtitle">Projects ({all.length})</h2>
        {failed && (
          <p className="error" role="status">Could not load the project list. Please try again later.</p>
        )}
        {gallery.failed && (
          <p className="error" role="status">
            Could not load the gallery. Images are not lost; reload before adding them again.
          </p>
        )}
        <ul className="admin-list">
          {all.map((p) => (
            <li key={p.id}>
              <AdminActions project={p} images={gallery.images.filter((img) => img.projectId === p.id)} />
            </li>
          ))}
        </ul>
      </PasswordProvider>
    </main>
  );
}
