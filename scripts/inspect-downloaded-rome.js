/**
 * Inspect the downloaded ROME Excel file structure
 */

const XLSX = require('xlsx');
const path = require('path');

const EXCEL_FILE = path.join(__dirname, '../temp-rome.xlsx');

try {
  const workbook = XLSX.readFile(EXCEL_FILE);
  
  console.log('\n📊 Downloaded ROME Excel File Structure\n');
  console.log('='.repeat(80));
  
  console.log(`\n📄 Sheets found: ${workbook.SheetNames.length}\n`);
  
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n${index + 1}. Sheet: "${sheetName}"`);
    console.log('-'.repeat(80));
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`   Total rows: ${data.length}`);
    
    if (data.length > 0) {
      console.log(`\n   First 3 rows (all columns):\n`);
      for (let i = 0; i < Math.min(3, data.length); i++) {
        const row = data[i];
        console.log(`   Row ${i + 1}:`);
        row.forEach((cell, colIndex) => {
          const colLetter = String.fromCharCode(65 + colIndex); // A, B, C, etc.
          console.log(`      ${colLetter} (col ${colIndex}): ${cell || '(empty)'}`);
        });
        console.log('');
      }
      
      // Look for ROME code pattern in any column
      console.log(`   Searching for ROME code patterns...\n`);
      for (let i = 0; i < Math.min(20, data.length); i++) {
        const row = data[i];
        row.forEach((cell, colIndex) => {
          if (cell && typeof cell === 'string') {
            const romePattern = /^[A-Z]\d{4}$/;
            if (romePattern.test(cell.trim())) {
              const colLetter = String.fromCharCode(65 + colIndex);
              console.log(`   ✅ Found ROME code "${cell}" in column ${colLetter} (${colIndex}) at row ${i + 1}`);
            }
          }
        });
      }
    }
  });
  
  console.log('\n' + '='.repeat(80) + '\n');
  
} catch (error) {
  console.error('Error:', error.message);
}
