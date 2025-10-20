/**
 * Script to find RNCP certifications by ROME code
 * 
 * This script searches for RNCP certifications that match specific ROME codes
 * to help test the ROME code validation feature.
 * 
 * Usage: node scripts/find-rncp-by-rome.js
 */

const API_URL = 'https://api.apprentissage.beta.gouv.fr/api';
const API_TOKEN = process.env.MISSION_APPRENTISSAGE_API_TOKEN;

// ROME codes for our test jury
const TEST_ROME_CODES = {
  'D1202': 'Coiffeur / Coiffeuse',
  'M1803': 'Directeur / Directrice des systèmes d\'information'
};

async function searchRNCPByRomeCode(romeCode) {
  console.log(`\n🔍 Searching RNCP certifications for ROME code: ${romeCode}`);
  console.log('─'.repeat(80));
  
  try {
    // Search for certifications with this ROME code
    const response = await fetch(
      `${API_URL}/certification/v1?domaines.rome.rncp.code=${romeCode}`,
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Accept': 'application/json',
          'User-Agent': 'SimplyJury/1.0'
        },
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      console.log(`❌ API Error: ${response.status}`);
      return [];
    }

    const certifications = await response.json();
    
    if (!certifications || certifications.length === 0) {
      console.log(`ℹ️  No certifications found for ROME code ${romeCode}`);
      return [];
    }

    console.log(`✅ Found ${certifications.length} certification(s)`);
    
    // Filter for active certifications only
    const activeCerts = certifications.filter(cert => 
      cert.periode_validite?.rncp?.actif === true
    );
    
    console.log(`📊 Active certifications: ${activeCerts.length}`);
    
    // Display results
    activeCerts.slice(0, 5).forEach((cert, index) => {
      console.log(`\n${index + 1}. ${cert.identifiant?.rncp || 'N/A'}`);
      console.log(`   Titre: ${cert.intitule?.rncp || 'N/A'}`);
      console.log(`   Niveau: ${cert.intitule?.niveau?.rncp?.europeen || 'N/A'}`);
      console.log(`   Actif: ${cert.periode_validite?.rncp?.actif ? '✅' : '❌'}`);
      console.log(`   Fin: ${cert.periode_validite?.rncp?.fin_enregistrement || 'N/A'}`);
      
      // Show all ROME codes for this certification
      const romeCodes = cert.domaines?.rome?.rncp || [];
      if (romeCodes.length > 0) {
        console.log(`   ROME codes:`);
        romeCodes.forEach(rome => {
          console.log(`     - ${rome.code}: ${rome.intitule}`);
        });
      }
    });
    
    return activeCerts;
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return [];
  }
}

async function main() {
  console.log('\n🎯 RNCP CERTIFICATION FINDER BY ROME CODE\n');
  console.log('='.repeat(80));
  
  if (!API_TOKEN) {
    console.log('\n❌ ERROR: MISSION_APPRENTISSAGE_API_TOKEN not set!');
    console.log('\nPlease set the environment variable:');
    console.log('  export MISSION_APPRENTISSAGE_API_TOKEN="your_token_here"');
    console.log('\n');
    return;
  }
  
  const results = {};
  
  for (const [romeCode, label] of Object.entries(TEST_ROME_CODES)) {
    console.log(`\n\n📌 Testing ROME Code: ${romeCode} - ${label}`);
    console.log('='.repeat(80));
    
    const certs = await searchRNCPByRomeCode(romeCode);
    results[romeCode] = certs;
    
    // Wait between requests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 SUMMARY\n');
  
  for (const [romeCode, label] of Object.entries(TEST_ROME_CODES)) {
    const certs = results[romeCode] || [];
    console.log(`${romeCode} (${label}):`);
    console.log(`  Found ${certs.length} active certification(s)`);
    
    if (certs.length > 0) {
      console.log(`  Examples:`);
      certs.slice(0, 3).forEach(cert => {
        console.log(`    - ${cert.identifiant?.rncp}: ${cert.intitule?.rncp}`);
      });
    }
    console.log('');
  }
  
  console.log('='.repeat(80));
  console.log('\n✅ Search complete!\n');
}

// Run the search
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
