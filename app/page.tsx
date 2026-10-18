import Link from "next/link";

export default function Home() {
  return (
    <main className="card-page">
      <svg
        className="business-card"
        viewBox="0 0 720 411"
        role="img"
        aria-label="Kartu bisnis Ibnu Qayyim"
      >
        <a href="tel:+6287798125255" aria-label="Telepon Ibnu Qayyim">
          <text x="28" y="20" fontSize="26" fontWeight="500">
            (+62) 877 9812 5255
          </text>
        </a>

        <text x="600" y="18" fontSize="26" fontWeight="600" textAnchor="middle">
          Sriwijaya University
        </text>
        <text x="600" y="38" fontSize="15" fontWeight="500" textAnchor="middle">
          Computer Science | GPA: 3.93/4.00
        </text>

        <a href="https://www.linkedin.com/in/ibnu-qayyim/" target="_blank" rel="noopener" aria-label="Profil LinkedIn Ibnu Qayyim">
          <text x="360" y="185" fontSize="48" fontWeight="700" textAnchor="middle">
            Ibnu Qayyim Al Jauziyah
          </text>
        </a>
        <a href="mailto:ibn.ibnuqayyim@gmail.com" aria-label="Email Ibnu Qayyim">
          <text x="360" y="215" fontSize="24" fontWeight="400" textAnchor="middle">
            ibn.ibnuqayyim@gmail.com
          </text>
        </a>

        <text x="360" y="360" fontSize="18" fontWeight="400" textAnchor="middle">
          <tspan>Palembang, Indonesia | </tspan>
          <Link href="/projects">
            <tspan fontWeight="700">Projects</tspan>
          </Link>
          <tspan> | </tspan>
          <a href="https://github.com/BuburEncer" target="_blank" rel="noopener">
            <tspan fontWeight="700">GitHub</tspan>
          </a>
          <tspan> | </tspan>
          <a href="/resume.pdf">
            <tspan fontWeight="700">Resume</tspan>
          </a>
        </text>
      </svg>
    </main>
  );
}
