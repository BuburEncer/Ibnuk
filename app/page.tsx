import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Ibnu Qayyim</h1>
      <p>Software engineer.</p>
      <p>Jakarta, Indonesia.</p>
      <p>
        <a href="mailto:contact@ibnuqayyim.dev">Email</a>
      </p>
      <p>
        <a href="https://github.com/BuburEncer">GitHub</a>
      </p>
      <p>
        <a href="/resume.pdf">Resume</a>
      </p>
      <p>
        <Link href="/projects">Projects</Link>
      </p>
    </main>
  );
}
