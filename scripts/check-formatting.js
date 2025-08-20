const fs = require("fs");
const { parse } = require("csv-parse/sync");

const csv = fs.readFileSync("src/data/questions.csv", "utf8");
const rows = parse(csv, { columns: true, skip_empty_lines: true });

const SUSPECT = /(\*|__|\\_|_[A-Za-z]|\\textit\{|<\/?em>)/;
const MOJI = /[ÂÃâ]|‚Ä|Ã¢â‚¬/;
const INVIS = /[\u00A0\u2007\u2009\u200A\u202F\uFEFF]/;

function show(ctx, max = 60) {
  ctx = String(ctx);
  return ctx.length <= max ? ctx : ctx.slice(0, max) + "…";
}

function codepoints(s) {
  return Array.from(s).map(ch => `\\u${ch.codePointAt(0).toString(16).toUpperCase().padStart(4,"0")}`).join(" ");
}

let issues = 0;

rows.forEach((row, i) => {
  const n = i + 2; // header = row 1
  ["Stem","Choice A","Choice B","Choice C","Choice D","Explanation"].forEach(col => {
    const val = row[col] ?? "";
    if (!val) return;

    const hits = [];
    if (SUSPECT.test(val)) hits.push("emphasis (*, _, \\_, __, <em>, \\textit)");
    if (MOJI.test(val)) hits.push("mojibake (Â/Ã/â)");
    if (INVIS.test(val)) hits.push("invisible space (NBSP/thin/BOM)");

    if (hits.length) {
      issues++;
      console.log(`Row ${n} [${col}]: ${hits.join(", ")}`);
      console.log("  Text:", show(val));
      // show a small window of codepoints for deep debug
      console.log("  Codes:", show(codepoints(val), 160));
    }
  });
});

if (!issues) console.log("✅ No obvious emphasis/mojibake/invisible-space issues found.");
else console.log(`\nFound ${issues} field(s) with potential issues. Fix in CSV or sanitize in converter.`);
