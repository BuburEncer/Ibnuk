import postgres from "postgres";
import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";

function loadEnvFile() {
  if (process.env.DATABASE_URL) return;
  if (typeof process.loadEnvFile !== "function") return;
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    process.loadEnvFile(file);
    if (process.env.DATABASE_URL) return;
  }
}

const SOURCES = new Set(["github", "kaggle"]);
const CATEGORIES = new Set(["ai", "software"]);

function assertValidProject(project) {
  if (
    !project.title ||
    !project.link ||
    !SOURCES.has(project.source) ||
    !CATEGORIES.has(project.category) ||
    !/^https?:\/\//.test(project.link)
  ) {
    throw new Error(`Invalid curated project: ${JSON.stringify(project)}`);
  }
}

export const projectEntries = [
  {
    title: "Fetal Head Plane Classification Resnet50",
    description: "Notebook: klasifikasi plane kepala janin pada citra ultrasound.",
    technologies: "Python, PyTorch, ResNet50, Grad-CAM",
    link: "https://www.kaggle.com/code/ibnuqayyim/fetal-head-plane-classification-resnet50",
    source: "kaggle",
    category: "ai",
    imagePath: null,
  },
  {
    title: "Real or Fake Faces with ViT",
    description: "Notebook: klasifikasi wajah AI-generated dan wajah asli.",
    technologies: "Python, ViT, PyTorch",
    link: "https://www.kaggle.com/code/ibnuqayyim/real-or-fake-faces-with-vit",
    source: "kaggle",
    category: "ai",
    imagePath: null,
  },
  {
    title: "Resnet Implementation",
    description: "Notebook: implementasi dan evaluasi arsitektur ResNet.",
    technologies: "Python, PyTorch",
    link: "https://www.kaggle.com/code/ibnuqayyim/resnet-implementation",
    source: "kaggle",
    category: "ai",
    imagePath: null,
  },
  {
    title: "Fake Face Detector",
    description: "Klasifikasi wajah AI-generated dan wajah asli menggunakan Vision Transformer.",
    technologies: "Python, ViT, PyTorch",
    link: "https://github.com/BuburEncer/fake-face-detector",
    source: "github",
    category: "ai",
    imagePath: null,
  },
  {
    title: "Fetal Head Classification",
    description: "Klasifikasi plane kepala janin dengan transfer learning ResNet50 dan Grad-CAM.",
    technologies: "Python, ResNet50, Grad-CAM",
    link: "https://github.com/BuburEncer/fetal-head-classification",
    source: "github",
    category: "ai",
    imagePath: null,
  },
  {
    title: "Realtime Pose Detection",
    description: "Deteksi dan klasifikasi pose tubuh manusia secara realtime dari kamera.",
    technologies: "Python, YOLOv8, Streamlit",
    link: "https://github.com/BuburEncer/realtime-pose-detection",
    source: "github",
    category: "ai",
    imagePath: null,
  },
  {
    title: "Fetal Head Ultrasound Raw Data",
    description: "Dataset: citra ultrasound kepala janin.",
    technologies: "Ultrasound",
    link: "https://www.kaggle.com/datasets/ibnuqayyim/raw-data",
    source: "kaggle",
    category: "ai",
    imagePath: null,
  },
  ...[
    ["gameboost", "https://github.com/BuburEncer/gameboost"],
    ["Aplikasi-Keuangan", "https://github.com/BuburEncer/Aplikasi-Keuangan"],
    ["Pencatat-Meter", "https://github.com/BuburEncer/Pencatat-Meter"],
    ["notes-app-back-end", "https://github.com/BuburEncer/notes-app-back-end"],
    ["Bookshelf-API", "https://github.com/BuburEncer/Bookshelf-API"],
    ["ResepQu", "https://github.com/BuburEncer/ResepQu"],
    ["e-commerce", "https://github.com/BuburEncer/e-commerce"],
    ["Music-App", "https://github.com/BuburEncer/Music-App"],
  ].map(([title, link]) => ({
    title,
    description: null,
    technologies: null,
    link,
    source: "github",
    category: "software",
    imagePath: null,
  })),
];

export async function seedProjects(sql, entries = projectEntries) {
  let inserted = 0;
  for (const project of entries) {
    if (!project.link) continue;
    assertValidProject(project);
    const existing = await sql`SELECT id FROM projects WHERE link = ${project.link} LIMIT 1`;
    if (existing.length) continue;
    await sql`
      INSERT INTO projects (title, description, technologies, link, source, category, image_path)
      VALUES (${project.title}, ${project.description}, ${project.technologies}, ${project.link}, ${project.source}, ${project.category}, ${project.imagePath})
    `;
    inserted++;
  }
  return inserted;
}

async function main() {
  loadEnvFile();
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const sql = postgres(process.env.DATABASE_URL);
  try {
    const inserted = await seedProjects(sql);
    console.log(`Seeded ${inserted} projects.`);
  } finally {
    await sql.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error("Project seed failed.", error);
    process.exitCode = 1;
  });
}
