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
    description: "Classifies fetal head ultrasound images into several planes using transfer learning on ResNet50. Grad-CAM helps explain the model's predictions.",
    technologies: "Python, PyTorch",
    link: "https://github.com/BuburEncer/fetal-head-classification",
    link2: "https://www.kaggle.com/code/ibnuqayyim/fetal-head-plane-classification-resnet50",
    source: "github",
    category: "ai",
    image: null,
  },
  {
    title: "Fake Face Detector",
    description: "Tells AI-generated faces from real ones with ViT-Base/16, compared against a CNN baseline.",
    technologies: "Python, PyTorch, torchvision, scikit-learn",
    link: "https://github.com/BuburEncer/fake-face-detector",
    link2: "https://www.kaggle.com/code/ibnuqayyim/real-or-fake-faces-with-vit",
    source: "github",
    category: "ai",
    image: null,
  },
  {
    title: "Realtime Pose Detection",
    description: "Web app that detects and classifies body poses live from the camera.",
    technologies: "Python, Streamlit, YOLOv8-pose, streamlit-webrtc, OpenCV",
    link: "https://github.com/BuburEncer/realtime-pose-detection",
    source: "github",
    category: "ai",
    image: null,
  },
  {
    title: "Water Meter Recorder",
    description: "Web app for recording water meter readings. It scans the customer QR code and reads the meter serial number with OCR.",
    technologies: "Python, Flask, React, Vite, MySQL, OpenCV, Tesseract",
    link: "https://github.com/BuburEncer/Pencatat-Meter",
    source: "github",
    category: "software",
    image: null,
  },
  {
    title: "Finance Tracker",
    description: "Mobile app for tracking income and expenses, managing accounts and viewing transaction reports.",
    technologies: "React Native, Expo, Node.js, Express, MySQL",
    link: "https://github.com/BuburEncer/Aplikasi-Keuangan",
    source: "github",
    category: "software",
    image: null,
  },
  {
    title: "4231",
    description: "Football news and standings portal with an admin panel, plus a companion mobile app.",
    technologies: "React, Redux, Tailwind CSS, Node.js, Express, MySQL, React Native, Expo",
    link: "https://github.com/BuburEncer/433",
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
