/**
 * Test Mission Apprentissage API with Authentication
 * Reads token from environment variables
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
const API_URL = process.env.MISSION_APPRENTISSAGE_API_URL || 'https://api.apprentissage.beta.gouv.fr';

async function testEndpoint(endpoint, authMethod, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
  
  log(`Testing: ${endpoint}`, 'cyan');
  log(`Auth: ${authMethod}`, 'yellow');
  
  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'SimplyJury/1.0'
  };
  
  // Add authentication based on method
  if (authMethod === 'Bearer') {
    headers['Authorization'] = `Bearer ${API_TOKEN}`;
  } else if (authMethod === 'X-API-Key') {
    headers['X-API-Key'] = API_TOKEN;
  } else if (authMethod === 'Api-Key') {
    headers['Api-Key'] = API_TOKEN;
  }
  
  try {
    const response = await fetch(url, { headers });
    
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      log(`✗ HTTP ${response.status}: ${response.statusText}`, 'red');
      
      if (response.status === 401) {
        log('  → Authentication failed - wrong auth method or invalid token', 'yellow');
      } else if (response.status === 403) {
        log('  → Forbidden - token may not have required permissions', 'yellow');
      }
      
      return { success: false, status: response.status };
    }
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      log(`✓ Success! Status: ${response.status}`, 'green');
      
      return { success: true, status: response.status, data, headers: Object.fromEntries(response.headers) };
    } else {
      log(`✗ Not JSON: ${contentType}`, 'yellow');
      const text = await response.text();
      return { success: false, contentType, preview: text.substring(0, 200) };
    }
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function explore() {
  logSection('MISSION APPRENTISSAGE API - AUTHENTICATED TESTS');
  
  // Check if token is present
  if (!API_TOKEN) {
    log('✗ ERROR: No API token found!', 'red');
    console.log('\nPlease add to your .env file:');
    console.log('MISSION_APPRENTISSAGE_API_TOKEN=your_token_here');
    console.log('MISSION_APPRENTISSAGE_API_URL=https://api.apprentissage.beta.gouv.fr');
    process.exit(1);
  }
  
  log(`✓ API Token found (${API_TOKEN.substring(0, 10)}...)`, 'green');
  log(`✓ API URL: ${API_URL}`, 'green');
  
  const successfulEndpoints = [];
  
  // Test different authentication methods
  const authMethods = ['Bearer', 'X-API-Key', 'Api-Key'];
  
  // Test certifications endpoint
  logSection('TEST 1: Certifications Endpoint');
  
  const certEndpoints = [
    { path: '/api/v1/certifications', params: {} },
    { path: '/api/v1/certifications', params: { limit: 5 } },
    { path: '/api/v1/certifications', params: { search: 'développeur' } },
    { path: '/api/certifications', params: {} },
    { path: '/certifications', params: {} }
  ];
  
  for (const endpoint of certEndpoints) {
    for (const authMethod of authMethods) {
      log(`\n${endpoint.path}`, 'bright');
      const result = await testEndpoint(endpoint.path, authMethod, endpoint.params);
      
      if (result.success) {
        successfulEndpoints.push({ ...endpoint, authMethod, result });
        
        // Show data structure
        console.log('\nResponse structure:');
        if (Array.isArray(result.data)) {
          log(`  Type: Array with ${result.data.length} items`, 'cyan');
          if (result.data.length > 0) {
            log(`  First item keys: ${Object.keys(result.data[0]).join(', ')}`, 'cyan');
            console.log('\nFirst certification:');
            console.log(JSON.stringify(result.data[0], null, 2));
          }
        } else if (result.data.certifications) {
          log(`  Type: Object with 'certifications' array (${result.data.certifications.length} items)`, 'cyan');
          if (result.data.certifications.length > 0) {
            log(`  First item keys: ${Object.keys(result.data.certifications[0]).join(', ')}`, 'cyan');
            console.log('\nFirst certification:');
            console.log(JSON.stringify(result.data.certifications[0], null, 2));
          }
          if (result.data.pagination) {
            console.log('\nPagination:');
            console.log(JSON.stringify(result.data.pagination, null, 2));
          }
        } else {
          log(`  Type: Object`, 'cyan');
          log(`  Keys: ${Object.keys(result.data).join(', ')}`, 'cyan');
          console.log('\nFull response:');
          console.log(JSON.stringify(result.data, null, 2).substring(0, 1000));
        }
        
        // Found working endpoint, no need to test other auth methods for this endpoint
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  // Test search with query
  if (successfulEndpoints.length > 0) {
    logSection('TEST 2: Search Functionality');
    
    const workingAuth = successfulEndpoints[0].authMethod;
    const workingPath = successfulEndpoints[0].path;
    
    const searchQueries = [
      { q: 'développeur', desc: 'Search: développeur' },
      { q: 'web', desc: 'Search: web' },
      { q: 'RNCP31114', desc: 'Search by RNCP code' }
    ];
    
    for (const query of searchQueries) {
      log(`\n${query.desc}`, 'yellow');
      const result = await testEndpoint(workingPath, workingAuth, { search: query.q, limit: 3 });
      
      if (result.success) {
        const items = Array.isArray(result.data) ? result.data : result.data.certifications || [];
        log(`  Found ${items.length} results`, 'green');
        
        items.forEach((cert, index) => {
          const code = cert.identifiant?.rncp || cert.code || cert.rncp || 'N/A';
          const title = cert.intitule?.long || cert.intitule || cert.title || cert.titre || 'N/A';
          console.log(`  ${index + 1}. ${code}: ${title}`);
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Summary
  logSection('SUMMARY');
  
  if (successfulEndpoints.length === 0) {
    log('✗ No successful endpoints found!', 'red');
    console.log('\nPossible issues:');
    console.log('1. Invalid API token');
    console.log('2. Token not activated yet');
    console.log('3. Different endpoint structure');
    console.log('\nPlease check:');
    console.log('- Your account dashboard for token status');
    console.log('- Swagger documentation for correct endpoints');
  } else {
    log(`✓ Found ${successfulEndpoints.length} working endpoint(s)!`, 'green');
    console.log('\n');
    
    const best = successfulEndpoints[0];
    log('RECOMMENDED CONFIGURATION:', 'bright');
    console.log(`\nEndpoint: ${API_URL}${best.path}`);
    console.log(`Authentication: ${best.authMethod}`);
    console.log(`Parameters: ${JSON.stringify(best.params)}`);
    
    console.log('\n\nExample curl command:');
    if (best.authMethod === 'Bearer') {
      console.log(`curl -H "Authorization: Bearer YOUR_TOKEN" \\`);
    } else {
      console.log(`curl -H "${best.authMethod}: YOUR_TOKEN" \\`);
    }
    console.log(`  "${API_URL}${best.path}?limit=10"`);
    
    console.log('\n\nNext.js API Route example:');
    console.log(`
const response = await fetch('${API_URL}${best.path}', {
  headers: {
    '${best.authMethod === 'Bearer' ? 'Authorization' : best.authMethod}': '${best.authMethod === 'Bearer' ? 'Bearer ' : ''}' + process.env.MISSION_APPRENTISSAGE_API_TOKEN,
    'Accept': 'application/json'
  }
});
const data = await response.json();
    `);
  }
}

explore().catch(console.error);
