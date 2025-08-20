const fs = require("fs");

// Read the CSV file
const csvContent = fs.readFileSync("src/data/questions.csv", "utf8");

// Function to properly parse CSV with multiline fields
function parseCSVWithMultiline(csvText) {
  const lines = csvText.split('\n');
  const result = [];
  let currentRow = [];
  let inQuotedField = false;
  let currentField = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (!inQuotedField) {
      // Not in a quoted field, check if this line starts a new row
      if (line.trim() === '') continue;
      
      // Check if this line contains unquoted commas (new row)
      const commaCount = (line.match(/,/g) || []).length;
      if (commaCount >= 6) { // Assuming 8 columns: Stem, Choice A, B, C, D, Correct Answer, Explanation, Module
        // This is a new row
        if (currentRow.length > 0) {
          result.push(currentRow);
        }
        currentRow = line.split(',').map(field => field.trim());
        continue;
      }
    }
    
    // Check for quoted fields
    let charIndex = 0;
    while (charIndex < line.length) {
      const char = line[charIndex];
      
      if (char === '"') {
        if (inQuotedField) {
          // End of quoted field
          inQuotedField = false;
          currentField += '"';
        } else {
          // Start of quoted field
          inQuotedField = true;
          currentField += '"';
        }
      } else if (inQuotedField) {
        // Inside quoted field, add character
        currentField += char;
      } else if (char === ',') {
        // Field separator
        currentRow.push(currentField.trim());
        currentField = '';
      } else {
        // Regular character
        currentField += char;
      }
      
      charIndex++;
    }
    
    if (inQuotedField) {
      // Still in quoted field, add newline and continue
      currentField += '\n';
    } else {
      // End of line, add the last field
      if (currentField.trim()) {
        currentRow.push(currentField.trim());
      }
      
      // If we have a complete row, add it
      if (currentRow.length >= 8) {
        result.push(currentRow);
        currentRow = [];
        currentField = '';
      }
    }
  }
  
  // Add the last row if it exists
  if (currentRow.length > 0) {
    result.push(currentRow);
  }
  
  return result;
}

// Parse the CSV
const rows = parseCSVWithMultiline(csvContent);

// Write the fixed CSV
let fixedCSV = 'Stem,Choice A,Choice B,Choice C,Choice D,Correct Answer,Explanation,Module\n';

rows.forEach(row => {
  if (row.length >= 8) {
    const fixedRow = row.map(field => {
      // Escape quotes and wrap in quotes if needed
      const escaped = field.replace(/"/g, '""');
      return `"${escaped}"`;
    });
    fixedCSV += fixedRow.join(',') + '\n';
  }
});

// Write the fixed CSV
fs.writeFileSync("src/data/questions-fixed.csv", fixedCSV);
console.log("✅ Fixed CSV written to src/data/questions-fixed.csv");

// Also update the original file
fs.writeFileSync("src/data/questions.csv", fixedCSV);
console.log("✅ Original CSV file updated");

// Show some statistics
console.log(`📊 Processed ${rows.length} rows`);
console.log(`🔍 Found ${rows.filter(r => r.length >= 8).length} complete rows`);
