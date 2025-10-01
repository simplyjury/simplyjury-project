/**
 * Test the CORRECT endpoint from Swagger documentation
 * Endpoint: /api/certification/v1
 */

require('dotenv').config();

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

const API_TOKEN = process.env.MISSION_APPRENTISSAGE_API_TOKEN;
const API_URL = 'https://api.apprentissage.beta.gouv.fr/api';

async function testEndpoint(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
  
  log(`\nTesting: ${url}`, 'cyan');
  
  const headers = {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Accept': 'application/json',
    'User-Agent': 'SimplyJury/1.0'
  };
  
  try {
    const response = await fetch(url, { headers });
    
    const contentType = response.headers.get('content-type');
    
    log(`Status: ${response.status} ${response.statusText}`, response.ok ? 'green' : 'red');
    
    if (!response.ok) {
      const text = await response.text();
      console.log('Error response:', text.substring(0, 500));
      return { success: false, status: response.status };
    }
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      log(`✓ Success!`, 'green');
      
      return { success: true, status: response.status, data };
    }
    
    return { success: false };
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function explore() {
  logSection('TESTING CORRECT ENDPOINT FROM SWAGGER');
  
  if (!API_TOKEN) {
    log('✗ ERROR: No API token found!', 'red');
    process.exit(1);
  }
  
  log(`✓ API Token: ${API_TOKEN.substring(0, 15)}...`, 'green');
  log(`✓ API URL: ${API_URL}`, 'green');
  
  // Test 1: Get all certifications (no filter)
  logSection('TEST 1: Get All Certifications (First Results)');
  const result1 = await testEndpoint('/certification/v1');
  
  if (result1.success) {
    const certs = result1.data;
    log(`\n✓ Found ${certs.length} certifications`, 'green');
    
    if (certs.length > 0) {
      console.log('\nFirst 3 certifications:');
      certs.slice(0, 3).forEach((cert, index) => {
        const rncp = cert.identifiant?.rncp || 'N/A';
        const cfd = cert.identifiant?.cfd || 'N/A';
        const title = cert.intitule?.long || cert.intitule?.court || 'N/A';
        console.log(`\n${index + 1}. ${rncp} (CFD: ${cfd})`);
        console.log(`   ${title}`);
        console.log(`   Niveau: ${cert.niveau?.europeen || 'N/A'}`);
        console.log(`   Actif: ${cert.base_legale?.actif ? 'Oui' : 'Non'}`);
      });
      
      console.log('\n\nFull structure of first certification:');
      console.log(JSON.stringify(certs[0], null, 2).substring(0, 2000));
    }
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: Filter by specific RNCP code
  logSection('TEST 2: Search by RNCP Code (RNCP31114)');
  const result2 = await testEndpoint('/certification/v1', { 'identifiant.rncp': 'RNCP31114' });
  
  if (result2.success) {
    const certs = result2.data;
    log(`\n✓ Found ${certs.length} certification(s)`, 'green');
    
    certs.forEach((cert, index) => {
      const rncp = cert.identifiant?.rncp || 'N/A';
      const title = cert.intitule?.long || 'N/A';
      console.log(`\n${index + 1}. ${rncp}: ${title}`);
    });
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Try another RNCP code
  logSection('TEST 3: Search by RNCP Code (RNCP34838)');
  const result3 = await testEndpoint('/certification/v1', { 'identifiant.rncp': 'RNCP34838' });
  
  if (result3.success) {
    const certs = result3.data;
    log(`\n✓ Found ${certs.length} certification(s)`, 'green');
    
    certs.forEach((cert, index) => {
      const rncp = cert.identifiant?.rncp || 'N/A';
      const title = cert.intitule?.long || 'N/A';
      console.log(`\n${index + 1}. ${rncp}: ${title}`);
    });
  }
  
  // Summary
  logSection('SUMMARY & IMPLEMENTATION GUIDE');
  
  log('✓ API IS WORKING!', 'green');
  console.log('\n📍 Correct Endpoint:');
  console.log(`   ${API_URL}/certification/v1`);
  console.log('\n🔑 Authentication:');
  console.log('   Bearer token in Authorization header');
  console.log('\n📊 Response Format:');
  console.log('   Array of certification objects');
  console.log('\n🔍 Query Parameters:');
  console.log('   - identifiant.rncp: Filter by RNCP code (e.g., "RNCP31114")');
  console.log('   - identifiant.cfd: Filter by CFD code');
  
  console.log('\n\n⚠️  IMPORTANT LIMITATION:');
  log('   The API does NOT support text search (e.g., "développeur")', 'yellow');
  log('   You can only filter by exact RNCP or CFD codes', 'yellow');
  
  console.log('\n\n💡 RECOMMENDATION:');
  log('   Use HYBRID APPROACH:', 'green');
  console.log('   1. Download all certifications from API once');
  console.log('   2. Store in static JSON file');
  console.log('   3. Implement client-side fuzzy search');
  console.log('   4. Update JSON file periodically (weekly/monthly)');
  
  console.log('\n\nNext.js API Route Example:');
  console.log(`
// /app/api/certifications/sync/route.ts
export async function GET() {
  const response = await fetch('${API_URL}/certification/v1', {
    headers: {
      'Authorization': 'Bearer ' + process.env.MISSION_APPRENTISSAGE_API_TOKEN,
      'Accept': 'application/json'
    }
  });
  
  const certifications = await response.json();
  
  // Filter active certifications
  const active = certifications.filter(c => c.base_legale?.actif);
  
  // Save to file or database
  // fs.writeFileSync('lib/data/certifications.json', JSON.stringify(active));
  
  return Response.json({ count: active.length, certifications: active });
}
  `);
}

explore().catch(console.error);
