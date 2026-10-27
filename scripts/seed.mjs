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
    (project.link2 && !/^https?:\/\//.test(project.link2)) ||
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
    description: "Klasifikasi citra USG kepala janin ke beberapa plane dengan transfer learning ResNet50; Grad-CAM membantu menjelaskan prediksi model.",
    technologies: "Python, PyTorch, ResNet50, Grad-CAM",
    link: "https://github.com/BuburEncer/fetal-head-classification",
    link2: "https://www.kaggle.com/code/ibnuqayyim/fetal-head-plane-classification-resnet50",
    source: "github",
    category: "ai",
    image: null,
  },
  {
    title: "Fake Face Detector",
    description: "Klasifikasi gambar wajah buatan AI dan wajah asli dengan ViT-Base/16, dibandingkan dengan baseline CNN.",
    technologies: "Python, PyTorch, torchvision, timm, scikit-learn",
    link: "https://github.com/BuburEncer/fake-face-detector",
    link2: "https://www.kaggle.com/code/ibnuqayyim/real-or-fake-faces-with-vit",
    source: "github",
    category: "ai",
    image: null,
  },
  {
    title: "Realtime Pose Detection",
    description: "Aplikasi web yang mendeteksi dan mengklasifikasikan pose tubuh langsung dari kamera.",
    technologies: "Python, Streamlit, YOLOv8-pose, streamlit-webrtc, OpenCV",
    link: "https://github.com/BuburEncer/realtime-pose-detection",
    source: "github",
    category: "ai",
    image: null,
  },
  {
    title: "Fetal Head Ultrasound Raw Data",
    description: "Dataset citra ultrasound kepala janin untuk klasifikasi plane kepala.",
    technologies: "Ultrasound",
    link: "https://www.kaggle.com/datasets/ibnuqayyim/raw-data",
    source: "kaggle",
    category: "ai",
    image: null,
  },
  {
    title: "Pencatat Meter",
    description: "Aplikasi web untuk mencatat pembacaan meter air dengan pemindaian QR pelanggan dan OCR nomor seri meter.",
    technologies: "Python, Flask, React, Vite, MySQL, OpenCV, Tesseract",
    link: "https://github.com/BuburEncer/Pencatat-Meter",
    source: "github",
    category: "software",
    image: null,
  },
  {
    title: "Aplikasi Keuangan",
    description: "Aplikasi mobile untuk mencatat pemasukan dan pengeluaran, mengelola rekening, serta melihat laporan transaksi.",
    technologies: "React Native, Expo, Node.js, Express, MySQL",
    link: "https://github.com/BuburEncer/Aplikasi-Keuangan",
    source: "github",
    category: "software",
    image: null,
  },
];

export async function seedProjects(sql, entries = projectEntries) {
  let inserted = 0;
  for (const project of entries) {
    if (!project.link) continue;
    assertValidProject(project);
    const existing = await sql`SELECT id FROM projects WHERE link = ${project.link} OR link2 = ${project.link} LIMIT 1`;
    if (existing.length) continue;
    await sql`
      INSERT INTO projects (title, description, technologies, link, link2, source, category, image)
      VALUES (${project.title}, ${project.description}, ${project.technologies}, ${project.link}, ${project.link2 || null}, ${project.source}, ${project.category}, ${project.image})
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
