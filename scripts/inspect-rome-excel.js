/**
 * Script to inspect the ROME Excel file structure
 */

const XLSX = require('xlsx');
const path = require('path');

const EXCEL_FILE = path.join(__dirname, '../docs/ROME Arborescence Principale 24M06.xlsx');

try {
  const workbook = XLSX.readFile(EXCEL_FILE);
  
  console.log('\n📊 ROME Excel File Structure\n');
  console.log('='.repeat(80));
  
  console.log(`\n📄 Sheets found: ${workbook.SheetNames.length}\n`);
  
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n${index + 1}. Sheet: "${sheetName}"`);
    console.log('-'.repeat(80));
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`   Rows: ${data.length}`);
    
    if (data.length > 0) {
      console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
      console.log(`\n   Sample data (first row):`);
      console.log(JSON.stringify(data[0], null, 2));
      
      if (data.length > 1) {
        console.log(`\n   Sample data (second row):`);
        console.log(JSON.stringify(data[1], null, 2));
      }
    }
  });
  
  console.log('\n' + '='.repeat(80) + '\n');
  
} catch (error) {
  console.error('Error:', error.message);
}
