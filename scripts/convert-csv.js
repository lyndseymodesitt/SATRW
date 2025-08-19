import fs from "fs";
import { parse } from "csv-parse/sync";

const INPUT = "src/data/questions.csv";
const OUTPUT = "src/data/questions.json";

if (!fs.existsSync(INPUT)) {
  console.error(`Could not find ${INPUT}. Please add your CSV there.`);
  process.exit(1);
}

const csv = fs.readFileSync(INPUT, "utf8");

// Parse CSV with headers
const rows = parse(csv, {
  columns: true,
  skip_empty_lines: true,
});

const letterToIndex = (val) => {
  const m = String(val || "").trim().toUpperCase();
  const idx = ["A", "B", "C", "D"].indexOf(m);
  if (idx === -1) {
    throw new Error(`Invalid "Correct Answer" value "${val}". Expected A/B/C/D.`);
  }
  return idx;
};

const clean = (s) => (s ?? "").toString().trim();

const data = rows.map((row, i) => {
  const moduleStr = String(row["Module"] || "").trim();
  let moduleNum;
  
  if (moduleStr === "Module 1") {
    moduleNum = 1;
  } else if (moduleStr === "Module 2") {
    moduleNum = 2;
  } else {
    throw new Error(`Row ${i + 2}: "Module" must be "Module 1" or "Module 2", got "${moduleStr}".`);
  }
  
  return {
    id: String(i + 1),
    module: moduleNum,
    stem: clean(row["Stem"]),
    choices: [
      clean(row["Choice A"]),
      clean(row["Choice B"]),
      clean(row["Choice C"]),
      clean(row["Choice D"]),
    ],
    correct: letterToIndex(row["Correct Answer"]),
    explanation: clean(row["Explanation"]),
  };
});

fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2));
console.log(`✅ Wrote ${OUTPUT} with ${data.length} questions.`);
