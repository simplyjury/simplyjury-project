/**
 * Fetch ROME codes from France Travail Open Data
 * 
 * This script downloads the latest ROME codes from the official
 * data.gouv.fr portal and saves them to a JSON file.
 * 
 * Source: https://www.data.gouv.fr/datasets/repertoire-operationnel-des-metiers-et-des-emplois-rome/
 * 
 * Usage: node scripts/fetch-rome-codes-from-open-data.js
 * 
 * Requirements: npm install xlsx node-fetch
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const XLSX = require('xlsx');

// Official France Travail Open Data URL for ROME arborescence
// This URL is stable and maintained by France Travail
const ROME_EXCEL_URL = 'https://www.data.gouv.fr/api/1/datasets/r/88342be1-06b8-4ab6-8ce9-83e117d21346';

const OUTPUT_FILE = path.join(__dirname, '../lib/data/rome-codes.json');
const TEMP_EXCEL_FILE = path.join(__dirname, '../temp-rome.xlsx');

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading from: ${url}`);
    
    const file = fs.createWriteStream(destPath);
    
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, destPath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('✅ Download complete\n');
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

function extractRomeCodesFromExcel(excelPath) {
  console.log('📊 Extracting ROME codes from Excel...\n');
  
  const workbook = XLSX.readFile(excelPath);
  
  // The ROME codes are in the second sheet (Arbo Principale)
  // First sheet is usually "Définition" which we don't need
  let sheetName = workbook.SheetNames.find(name => 
    name.toLowerCase().includes('arbo') ||
    name.toLowerCase().includes('principale')
  ) || workbook.SheetNames[1] || workbook.SheetNames[0];
  
  console.log(`📄 Using sheet: "${sheetName}"`);
  
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { 
    header: 1,
    defval: ''
  });
  
  console.log(`📊 Total rows: ${data.length}\n`);
  
  // ROME codes are split across columns A, B, C
  // Column A: Letter (e.g., "A")
  // Column B: First 2 digits (e.g., "11")
  // Column C: Last 2 digits (e.g., "01")
  // Combined: "A1101"
  // Column D: Label/description
  
  const romeCodes = [];
  const seenCodes = new Set();
  
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    if (!row || row.length < 4) continue;
    
    const colA = row[0];  // Letter
    const colB = row[1];  // First 2 digits
    const colC = row[2];  // Last 2 digits  
    const label = row[3]; // Description
    
    // Concatenate to form ROME code
    if (colA && colB && colC) {
      const code = `${colA}${colB}${colC}`.trim();
      const romePattern = /^[A-Z]\d{4}$/;
      
      if (romePattern.test(code) && !seenCodes.has(code)) {
        seenCodes.add(code);
        
        romeCodes.push({
          code: code,
          label: label ? label.toString().trim() : code,
          categoryCode: code.substring(0, 3)
        });
      }
    }
  }
  
  // Sort by code
  romeCodes.sort((a, b) => a.code.localeCompare(b.code));
  
  return romeCodes;
}

async function fetchAndSaveRomeCodes() {
  console.log('\n🔄 Fetching latest ROME codes from France Travail Open Data\n');
  console.log('='.repeat(80));
  console.log('\n📍 Source: data.gouv.fr (Official France Travail Open Data)\n');
  
  try {
    // Step 1: Download the Excel file
    await downloadFile(ROME_EXCEL_URL, TEMP_EXCEL_FILE);
    
    // Step 2: Extract ROME codes
    const romeCodes = extractRomeCodesFromExcel(TEMP_EXCEL_FILE);
    
    console.log(`\n✅ Extracted ${romeCodes.length} ROME codes\n`);
    
    if (romeCodes.length === 0) {
      throw new Error('No ROME codes found in the downloaded file');
    }
    
    // Show sample
    console.log('📋 Sample codes (first 10):\n');
    romeCodes.slice(0, 10).forEach(rome => {
      console.log(`   ${rome.code} - ${rome.label}`);
    });
    console.log('   ...\n');
    
    // Show statistics
    const categories = {};
    romeCodes.forEach(rome => {
      const cat = rome.code.charAt(0);
      categories[cat] = (categories[cat] || 0) + 1;
    });
    
    console.log('📊 Distribution by category:\n');
    Object.entries(categories).sort().forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} codes`);
    });
    
    // Step 3: Save to JSON
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const jsonOutput = {
      version: 'latest',
      fetchedAt: new Date().toISOString(),
      source: 'France Travail Open Data (data.gouv.fr)',
      sourceUrl: 'https://www.data.gouv.fr/datasets/repertoire-operationnel-des-metiers-et-des-emplois-rome/',
      totalCodes: romeCodes.length,
      codes: romeCodes
    };
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(jsonOutput, null, 2), 'utf8');
    
    console.log(`\n✅ Saved to: ${OUTPUT_FILE}`);
    console.log(`📊 Total codes: ${romeCodes.length}`);
    
    // Step 4: Clean up temp file
    fs.unlinkSync(TEMP_EXCEL_FILE);
    console.log('🧹 Cleaned up temporary files\n');
    
    console.log('='.repeat(80));
    console.log('\n✅ ROME codes successfully fetched and saved!\n');
    console.log('💡 You can now use these codes in your application.');
    console.log('💡 Run this script periodically to get the latest updates.\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    // Keep temp file on error for debugging
    if (fs.existsSync(TEMP_EXCEL_FILE)) {
      console.log(`\n💡 Temp file kept for inspection: ${TEMP_EXCEL_FILE}`);
      console.log('   You can delete it manually after debugging.\n');
    }
    
    if (error.message.includes('Cannot find module')) {
      console.error('\n💡 Install required packages:');
      console.error('   npm install xlsx');
    }
    
    process.exit(1);
  }
}

// Run the fetch
fetchAndSaveRomeCodes();
