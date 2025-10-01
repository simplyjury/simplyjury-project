/**
 * Download and analyze RNCP CSV data
 * Using the most recent CSV file from data.gouv.fr
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'bright');
  console.log('='.repeat(80) + '\n');
}

// CSV URL from data.gouv.fr (trying a confirmed older version)
const CSV_URL = 'https://static.data.gouv.fr/resources/repertoire-national-des-certifications-professionnelles-et-repertoire-specifique/20241213-023041/export-fiches-rncp-2024-12-13.csv';

async function downloadAndAnalyze() {
  logSection('DOWNLOADING RNCP CSV DATA');
  
  log('Downloading from:', 'cyan');
  console.log(CSV_URL);
  
  try {
    const response = await fetch(CSV_URL);
    
    if (!response.ok) {
      log(`✗ HTTP ${response.status}: ${response.statusText}`, 'red');
      return;
    }
    
    const csvText = await response.text();
    log(`✓ Downloaded ${(csvText.length / 1024).toFixed(2)} KB`, 'green');
    
    // Save to file
    const outputPath = path.join(__dirname, 'rncp-data-sample.csv');
    fs.writeFileSync(outputPath, csvText);
    log(`✓ Saved to: ${outputPath}`, 'green');
    
    // Analyze structure
    logSection('ANALYZING CSV STRUCTURE');
    
    const lines = csvText.split('\n');
    log(`Total lines: ${lines.length}`, 'cyan');
    
    // Parse header
    const header = lines[0].split(';');
    log(`\nColumns (${header.length}):`, 'yellow');
    header.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.trim()}`);
    });
    
    // Parse first few data rows
    logSection('SAMPLE DATA (First 5 certifications)');
    
    const certifications = [];
    
    for (let i = 1; i < Math.min(6, lines.length); i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(';');
      const cert = {};
      
      header.forEach((col, index) => {
        cert[col.trim()] = values[index] ? values[index].trim() : '';
      });
      
      certifications.push(cert);
      
      console.log(`\n${i}. Certification:`);
      Object.entries(cert).forEach(([key, value]) => {
        if (value && value.length < 100) {
          console.log(`   ${key}: ${value}`);
        }
      });
    }
    
    // Find certifications with "développeur" in title
    logSection('SEARCHING FOR "DÉVELOPPEUR" CERTIFICATIONS');
    
    const devCerts = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(';');
      const cert = {};
      
      header.forEach((col, index) => {
        cert[col.trim()] = values[index] ? values[index].trim() : '';
      });
      
      // Check if title contains "développeur"
      const titleCol = header.find(h => 
        h.toLowerCase().includes('intitule') || 
        h.toLowerCase().includes('titre') ||
        h.toLowerCase().includes('libelle')
      );
      
      const codeCol = header.find(h => 
        h.toLowerCase().includes('code') || 
        h.toLowerCase().includes('rncp')
      );
      
      if (titleCol && cert[titleCol] && cert[titleCol].toLowerCase().includes('développeur')) {
        devCerts.push({
          code: cert[codeCol] || 'N/A',
          title: cert[titleCol]
        });
      }
      
      if (devCerts.length >= 10) break; // Limit to 10 results
    }
    
    log(`Found ${devCerts.length} certifications with "développeur":`, 'green');
    devCerts.forEach((cert, index) => {
      console.log(`\n${index + 1}. ${cert.code}`);
      console.log(`   ${cert.title}`);
    });
    
    // Generate JSON structure for autocomplete
    logSection('RECOMMENDED JSON STRUCTURE FOR AUTOCOMPLETE');
    
    const jsonStructure = devCerts.slice(0, 5).map(cert => ({
      value: cert.code,
      label: `${cert.title} (${cert.code})`,
      title: cert.title,
      code: cert.code
    }));
    
    console.log(JSON.stringify(jsonStructure, null, 2));
    
    // Save JSON sample
    const jsonPath = path.join(__dirname, 'rncp-certifications-sample.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonStructure, null, 2));
    log(`\n✓ Saved JSON sample to: ${jsonPath}`, 'green');
    
    logSection('IMPLEMENTATION RECOMMENDATIONS');
    
    console.log('Based on the CSV analysis:');
    console.log('\n1. OPTION A: Static JSON File (Recommended for MVP)');
    console.log('   - Extract relevant certifications from CSV');
    console.log('   - Create a curated JSON file with ~100-200 common certifications');
    console.log('   - Implement client-side autocomplete with fuzzy search');
    console.log('   - Fast, no API dependencies, works offline');
    console.log('\n2. OPTION B: Backend API with CSV Data');
    console.log('   - Download CSV periodically (weekly/monthly)');
    console.log('   - Parse and store in database or JSON file');
    console.log('   - Create Next.js API route for search');
    console.log('   - More flexible, can update data easily');
    console.log('\n3. OPTION C: Mission Apprentissage API (Requires Registration)');
    console.log('   - Register at api.apprentissage.beta.gouv.fr');
    console.log('   - Get API key for authenticated access');
    console.log('   - Real-time data, always up-to-date');
    console.log('   - Depends on external service availability');
    
    log('\nMy recommendation: Start with OPTION A (Static JSON)', 'green');
    console.log('Then upgrade to OPTION B or C as needed.');
    
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    console.error(error);
  }
}

downloadAndAnalyze().catch(console.error);
