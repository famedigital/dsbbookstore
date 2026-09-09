import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const covers = [
  {
    slug: "introduction-to-dzongkha",
    title: "Introduction to\nDzongkha",
    accent: "#c9a227",
    bg: "#0b3d91",
  },
  {
    slug: "a-short-history-of-bhutan",
    title: "A Short History\nof Bhutan",
    accent: "#e8d5a3",
    bg: "#1a3a2a",
  },
  {
    slug: "folk-tales-from-the-himalayas",
    title: "Folk Tales from\nthe Himalayas",
    accent: "#f0d789",
    bg: "#5c2a1a",
  },
  {
    slug: "mathematics-for-class-vii",
    title: "Mathematics\nfor Class VII",
    accent: "#9fd4ff",
    bg: "#12355b",
  },
  {
    slug: "environmental-studies-bhutan",
    title: "Environmental\nStudies: Bhutan",
    accent: "#b7e4c7",
    bg: "#1b4332",
  },
  {
    slug: "travellers-guide-to-thimphu",
    title: "Traveller's Guide\nto Thimphu",
    accent: "#ffd6a5",
    bg: "#3d2c08",
  },
  {
    slug: "buddhist-philosophy-for-beginners",
    title: "Buddhist Philosophy\nfor Beginners",
    accent: "#e0aaff",
    bg: "#2d1b4e",
  },
  {
    slug: "bhutanese-cuisine-at-home",
    title: "Bhutanese Cuisine\nat Home",
    accent: "#ffb4a2",
    bg: "#6b2d1a",
  },
  {
    slug: "english-grammar-workbook",
    title: "English Grammar\nWorkbook",
    accent: "#a8dadc",
    bg: "#1d3557",
  },
  {
    slug: "legends-of-the-thunder-dragon",
    title: "Legends of the\nThunder Dragon",
    accent: "#ffe66d",
    bg: "#0d1b2a",
  },
  {
    slug: "civic-education-kingdom-of-bhutan",
    title: "Civic Education:\nKingdom of Bhutan",
    accent: "#caf0f8",
    bg: "#023e8a",
  },
  {
    slug: "mountain-flora-of-bhutan",
    title: "Mountain Flora\nof Bhutan",
    accent: "#95d5b2",
    bg: "#081c15",
  },
];

function escapeXml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

mkdirSync(resolve("public/covers"), { recursive: true });

for (const cover of covers) {
  const lines = cover.title.split("\n");
  const text = lines
    .map(
      (line, i) =>
        `<tspan x="50" dy="${i === 0 ? 0 : 1.2}em">${escapeXml(line)}</tspan>`,
    )
    .join("");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${cover.bg}"/>
      <stop offset="100%" stop-color="#05080f"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1200" fill="url(#g)"/>
  <rect x="48" y="48" width="704" height="1104" fill="none" stroke="${cover.accent}" stroke-opacity="0.45" stroke-width="2"/>
  <circle cx="640" cy="180" r="70" fill="${cover.accent}" fill-opacity="0.18"/>
  <text x="80" y="160" fill="${cover.accent}" font-family="Georgia, 'Times New Roman', serif" font-size="28" letter-spacing="0.28em">DSB</text>
  <text x="50" y="520" text-anchor="middle" fill="#f7f4ec" font-family="Georgia, 'Times New Roman', serif" font-size="54" font-weight="600" transform="translate(350 0)">
    ${text}
  </text>
  <text x="80" y="1080" fill="${cover.accent}" fill-opacity="0.85" font-family="Georgia, 'Times New Roman', serif" font-size="24">DSB Publication</text>
</svg>
`;

  writeFileSync(resolve(`public/covers/${cover.slug}.svg`), svg);
  console.log(`wrote ${cover.slug}.svg`);
}
