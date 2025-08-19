const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");
const { parse } = require("csv-parse/sync");

const INPUT = "src/data/questions.csv";
const OUTPUTS = ["public/data/questions.json", "src/data/questions.json"];
for (const p of OUTPUTS) fs.mkdirSync(path.dirname(p), { recursive: true });

// Read file (UTF-8; fallback Win-1252 if mojibake detected)
const buf = fs.readFileSync(INPUT);
let csv = buf.toString("utf8");
if (/â€"|â€"|â€˜|â€™|â€œ|â€|Â|‚Äì|‚Äî/.test(csv)) {
  csv = iconv.decode(buf, "win1252");
  console.log("ℹ️ Detected Windows-1252 CSV; decoding accordingly.");
}

// Normalize headers (trim spaces, remove BOM, collapse multiple spaces, lower-case)
const normalizeKey = (k) => String(k || "")
  .replace(/^\uFEFF/, "")         // strip BOM
  .replace(/\s+/g, " ")
  .trim()
  .toLowerCase();

const rowsRaw = parse(csv, {
  columns: (header) => header.map(normalizeKey),
  skip_empty_lines: true,
  trim: true,
});

const rows = rowsRaw.map((r) => {
  // also normalize any weird keys that slipped through
  return Object.fromEntries(Object.entries(r).map(([k, v]) => [normalizeKey(k), v]));
});

// helper access by normalized name
const get = (row, name) => row[normalizeKey(name)];
const A2D = ["a","b","c","d"];

const fixMoji = (s) =>
  (s ?? "")
    .toString()
    .replace(/‚Äì|â€"/g, "-")
    .replace(/‚Äî|â€"/g, "-")
    .replace(/â€˜/g, "'").replace(/â€™/g, "'")
    .replace(/â€œ/g, '"').replace(/â€\u009d|â€\u009D|â€\x9d/g, '"')
    .replace(/\u00A0/g, " ");

const stripUnrenderableLatex = (s) => {
  let t = String(s || "");
  t = t.replace(/\\documentclass[\s\S]*?\\begin\{document\}/gi, "");
  t = t.replace(/\\end\{document\}[\s\S]*$/gi, "");
  t = t.replace(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/gi, "");
  t = t.replace(/\\begin\{axis\}[\s\S]*?\\end\{axis\}/gi, "");
  t = t.replace(/\\usepackage\{[^}]+\}/gi, "");
  t = t.replace(/\\pgfplotsset\{[^}]*\}/gi, "");
  return t.trim();
};

let figures = {};
try {
  figures = JSON.parse(fs.readFileSync("src/data/figures.json", "utf8"));
  console.log("ℹ️ Loaded figures.json mappings.");
} catch {}

const data = [];
const errors = [];

rows.forEach((row, i) => {
  const rowNum = i + 2; // header is row 1
  const id = (get(row, "id") || String(i + 1)).toString().trim();

  const moduleRaw = get(row, "module");
  const moduleNum = Number(String(moduleRaw || "").trim().replace(/^module\s+/i, ""));
  if (![1, 2].includes(moduleNum)) {
    errors.push(`Row ${rowNum}: "Module" must be 1 or 2; got "${moduleRaw}".`);
  }

  const stem = stripUnrenderableLatex(fixMoji(get(row, "stem")));
  const choices = [
    fixMoji(get(row, "choice a")),
    fixMoji(get(row, "choice b")),
    fixMoji(get(row, "choice c")),
    fixMoji(get(row, "choice d")),
  ];
  const correctLetter = String(get(row, "correct answer") || "").trim().toLowerCase();
  const correctIdx = A2D.indexOf(correctLetter);
  const explanation = stripUnrenderableLatex(fixMoji(get(row, "explanation")));

  if (!stem) errors.push(`Row ${rowNum}: "Stem" is empty.`);
  choices.forEach((c, j) => { if (!c) errors.push(`Row ${rowNum}: "Choice ${A2D[j].toUpperCase()}" is empty.`); });
  if (correctIdx === -1) errors.push(`Row ${rowNum}: "Correct Answer" must be A/B/C/D; got "${correctLetter}".`);

  const fig = figures[id] || {};
  const image = (get(row, "image") || fig.image || "").trim() || undefined;
  const alt = (get(row, "alt") || fig.alt || "").trim() || undefined;
  const caption = (get(row, "caption") || fig.caption || "").trim() || undefined;

  data.push({ id, module: moduleNum, stem, choices, correct: correctIdx, explanation, image, alt, caption });
});

if (errors.length) {
  console.error("❌ Data validation failed:\n" + errors.map(e => " - " + e).join("\n"));
  process.exit(1);
}

for (const p of OUTPUTS) fs.writeFileSync(p, JSON.stringify(data, null, 2));
console.log(`✅ Wrote ${OUTPUTS.join(" & ")} with ${data.length} questions.`);
