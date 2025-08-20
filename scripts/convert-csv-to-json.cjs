const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");
const { parse } = require("csv-parse/sync");

const INPUT = "src/data/questions.csv";
const OUTPUTS = ["public/data/questions.json", "src/data/questions.json"];
for (const p of OUTPUTS) fs.mkdirSync(path.dirname(p), { recursive: true });

// ---------- read & decode ----------
const buf = fs.readFileSync(INPUT);
let csv = buf.toString("utf8");

// 1) If file looks like Win-1252, decode from win1252
if (/â€"|â€"|â€˜|â€™|â€œ|â€|Â|‚Äì|‚Äî|Ã—|â‰¥|â‰¤|Â°|Âµ|Î¼|â†'|â†"|Â²|Â³/.test(csv)) {
  csv = iconv.decode(buf, "win1252");
  console.log("ℹ️ Detected Windows-1252 CSV; decoding accordingly.");
}

// 2) If text looks double-encoded (Ã¢â‚¬…, â€šÃ„Ã¬, etc.), repair by latin1→utf8
//    Example: "24â€šÃ„Ã¬48" (should be "24–48")
if (/Ã¢â‚¬|â€šÃ„|ÃƒÂ|Ã‚Â/.test(csv)) {
  csv = iconv.decode(iconv.encode(csv, "latin1"), "utf8");
  console.log("ℹ️ Repaired double-encoded UTF-8 (latin1→utf8).");
}

// ---------- parsing with forgiving headers ----------
const normalizeKey = (k) =>
  String(k || "").replace(/^\uFEFF/, "").replace(/\s+/g, " ").trim().toLowerCase();

const rowsRaw = parse(csv, {
  columns: (h) => h.map(normalizeKey),
  skip_empty_lines: true,
  trim: true,
});
const rows = rowsRaw.map((r) =>
  Object.fromEntries(Object.entries(r).map(([k, v]) => [normalizeKey(k), v]))
);
const get = (row, name) => row[normalizeKey(name)];
const A2D = ["a", "b", "c", "d"];

// ---------- helpers ----------

// Expand mojibake / symbol fixes
const fixMoji = (s) =>
  String(s ?? "")
    .replace(/‚Äì|â€"/g, "–")      // en dash
    .replace(/‚Äî|â€"/g, "—")      // em dash
    .replace(/â€šÃ„Ã¬/g, "–")      // en dash, ultra-mojibake variant
    .replace(/Ã¢â‚¬â€œ/g, "–")      // another common variant
    .replace(/Ã¢â‚¬â€\x9d|Ã¢â‚¬â€º/g, "—") // em dash variants (safe extra)
    .replace(/â€˜/g, "'").replace(/â€™/g, "'")
    .replace(/â€œ/g, "\"").replace(/â€\u009d|â€\u009D|â€\x9d/g, "\"")
    .replace(/Ã—/g, "×").replace(/Ã·/g, "÷")
    .replace(/Â°/g, "°").replace(/Â·/g, "·")
    .replace(/â€¦/g, "…").replace(/â€¢/g, "•")
    .replace(/Î¼|Âµ/g, "μ")
    .replace(/Â²/g, "²").replace(/Â³/g, "³")
    .replace(/â‰¥/g, "≥").replace(/â‰¤/g, "≤").replace(/â‰ˆ/g, "≈")
    .replace(/âˆ'/g, "−")          // true minus
    .replace(/â†'/g, "↑").replace(/â†"/g, "↓")
    .replace(/Â(?=[$€£°²³¼½¾%])/g, "") // stray 'Â' before symbols
    .replace(/\u00A0/g, " ");      // nbsp → space

// Decode a few named & numeric HTML entities if they slipped in
const decodeHtmlEntities = (s) =>
  String(s || "")
    .replace(/&(mdash|ndash|hellip|middot|times|divide|deg|ge|le|bull);/g,
             (m) => ({ "&mdash;":"—","&ndash;":"–","&hellip;":"…","&middot;":"·","&times;":"×","&divide;":"÷","&deg;":"°","&ge;":"≥","&le;":"≤","&bull;":"•"}[m] || m))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

// Inline any {"markdown":"..."} blobs that appear inside cells
function inlineMarkdownObjects(text) {
  let t = String(text || "");
  const re = /\{[^{}]*?(['"])markdown\1\s*:\s*(['"])((?:\\.|(?!\2).)*)\2[^{}]*?\}/g;
  return t.replace(re, (_, _q1, quote, body) =>
    body.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\r/g, "").replace(/\\(['"\\])/g, "$1")
  );
}

// Escape emphasis markers sitting *inside* words so Markdown won't italicize "perstudent"
const escapeAccidentalMarkdown = (s) =>
  String(s || "")
    // a*b → a\*b (but leaves list bullets like "* item" alone)
    .replace(/(\w)\*(\w)/g, "$1\\\\*$2")
    // a_b → a\_b
    .replace(/(\w)_(\w)/g, "$1\\\\_$2");

// Count obvious mojibake markers
const mojoScore = (s) => (String(s).match(/[ÃÂ]|â.|‚Ä|Ã¢â‚¬/g) || []).length;

// Try to repair double/triple-encoded text per-field
function repairMojibake(s) {
  const orig = String(s ?? "");
  if (!/[ÃÂ]|â.|‚Ä|Ã¢â‚¬/.test(orig)) return orig;
  const attempt = iconv.decode(iconv.encode(orig, "latin1"), "utf8");
  return mojoScore(attempt) < mojoScore(orig) ? attempt : orig;
}

// Normalize numeric ranges: 24 <garbage> 48  →  24–48
function normalizeRanges(s) {
  return String(s ?? "").replace(
    /(\d+)\s*(?:—|–|−|–|—|‚Äì|â€"|Ã¢â‚¬â€œ|â€šÃ„Ã¬|[\uFFFD?]{1,6})\s*(\d+)/g,
    "$1–$2"
  );
}

// Replace visible blanks: \_  or \\_  or ____  (but NOT inside words)
function normalizeBlanks(s) {
  let t = String(s || "");
  // one or two backslashes before underscore, surrounded by space/punct
  t = t.replace(
    /(^|[\s([{<>"''])\\{1,2}_(?=[\s)\]}>.,;:!?'"'"']|$)/g,
    '$1<span class="blank"></span>'
  );
  // runs of 2+ underscores surrounded by space/punct
  t = t.replace(
    /(^|[\s([{<>"''])_{2,}(?=[\s)\]}>.,;:!?'"'"']|$)/g,
    '$1<span class="blank"></span>'
  );
  return t;
}

function renderableBlanks(s) {
  return String(s ?? "")
    .replace(/(^|[\s([{<>"''])\\{1,2}_(?=[\s)\]}>.,;:!?'"'"']|$)/g, '$1<span class="blank"></span>')
    .replace(/(^|[\s([{<>"''])\\{1,2}_(?=[\s)\]}>.,;:!?'"'"']|$)/g, '$1<span class="blank"></span>');
}

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

// FINAL normalize: make sure normalizeBlanks is LAST
const normalize = (s) =>
  normalizeBlanks(
    normalizeRanges(
      repairMojibake(
        decodeHtmlEntities(
          fixMoji(
            inlineMarkdownObjects(s)
          )
        )
      )
    )
  ).trim();

// optional figures merge
let figures = {};
try { figures = JSON.parse(fs.readFileSync("src/data/figures.json", "utf8")); }
catch { /* ok if missing */ }

// ---------- transform ----------
const data = [];
const errors = [];

rows.forEach((row, i) => {
  const rowNum = i + 2;
  const id = (get(row, "id") || String(i + 1)).toString().trim();

  const moduleNum = Number(String(get(row, "module") || "").trim().replace(/^module\s+/i, ""));
  if (![1, 2].includes(moduleNum)) {
    errors.push(`Row ${rowNum}: "Module" must be 1 or 2; got "${get(row, "module")}".`);
  }

  const stem = normalize(get(row, "stem"));
  const explanation = normalize(get(row, "explanation"));

  const choices = [
    normalize(get(row, "choice a")),
    normalize(get(row, "choice b")),
    normalize(get(row, "choice c")),
    normalize(get(row, "choice d")),
  ];

  const letter = String(get(row, "correct answer") || "").trim().toLowerCase();
  const correct = A2D.indexOf(letter);

  if (!stem) errors.push(`Row ${rowNum}: "Stem" is empty.`);
  choices.forEach((c, j) => { if (!c) errors.push(`Row ${rowNum}: "Choice ${A2D[j].toUpperCase()}" is empty.`); });
  if (correct === -1) errors.push(`Row ${rowNum}: "Correct Answer" must be A/B/C/D; got "${letter}".`);

  const fig = figures[id] || {};
  const image   = normalize(get(row, "image")   || fig.image   || "") || undefined;
  const alt     = normalize(get(row, "alt")     || fig.alt     || "") || undefined;
  const caption = normalize(get(row, "caption") || fig.caption || "") || undefined;

  // Parse chart data if present
  let chart = undefined;
  const rawChart = get(row, "chart");
  if (rawChart) {
    try { chart = JSON.parse(String(rawChart)); } catch { /* ignore bad JSON */ }
  }

  data.push({ id, module: moduleNum, stem, choices, correct, explanation, image, alt, caption, chart });
});

if (errors.length) {
  console.error("❌ Data validation failed:\n" + errors.map(e => " - " + e).join("\n"));
  process.exit(1);
}

for (const p of OUTPUTS) fs.writeFileSync(p, JSON.stringify(data, null, 2));
console.log(`✅ Wrote ${OUTPUTS.join(" & ")} with ${data.length} questions.`);
