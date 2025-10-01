/**
 * Mission Apprentissage API Explorer
 * 
 * This script tests various endpoints to discover:
 * - Available certification search endpoints
 * - Query parameters
 * - Response structure
 * - RNCP code format
 */

const BASE_URL = 'https://api.apprentissage.beta.gouv.fr';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

async function testEndpoint(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
  
  logInfo(`Testing: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SimplyJury-API-Explorer/1.0'
      }
    });
    
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      logError(`HTTP ${response.status}: ${response.statusText}`);
      return { success: false, status: response.status, error: response.statusText };
    }
    
    if (!contentType || !contentType.includes('application/json')) {
      logError(`Unexpected content type: ${contentType}`);
      const text = await response.text();
      return { success: false, error: 'Not JSON', preview: text.substring(0, 200) };
    }
    
    const data = await response.json();
    logSuccess(`Success! Status: ${response.status}`);
    
    return { success: true, status: response.status, data, headers: Object.fromEntries(response.headers) };
  } catch (error) {
    logError(`Request failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function exploreAPI() {
  logSection('MISSION APPRENTISSAGE API EXPLORATION');
  
  // Test 1: API Root/Health
  logSection('TEST 1: API Root & Health Check');
  const rootTests = [
    { endpoint: '/', desc: 'Root endpoint' },
    { endpoint: '/health', desc: 'Health check' },
    { endpoint: '/api', desc: 'API base' },
    { endpoint: '/api/v1', desc: 'API v1 base' }
  ];
  
  for (const test of rootTests) {
    log(`\nTesting ${test.desc}:`, 'yellow');
    await testEndpoint(test.endpoint);
  }
  
  // Test 2: Certifications Endpoints
  logSection('TEST 2: Certifications Search Endpoints');
  const certEndpoints = [
    { endpoint: '/api/v1/certifications', params: {}, desc: 'List certifications' },
    { endpoint: '/api/v1/certifications', params: { search: 'développeur' }, desc: 'Search: développeur' },
    { endpoint: '/api/v1/certifications', params: { query: 'développeur' }, desc: 'Query: développeur' },
    { endpoint: '/api/v1/certifications', params: { title: 'développeur' }, desc: 'Title: développeur' },
    { endpoint: '/api/v1/certifications', params: { intitule: 'développeur' }, desc: 'Intitule: développeur' },
    { endpoint: '/api/v1/certifications/search', params: { q: 'développeur' }, desc: 'Search endpoint with q param' },
    { endpoint: '/api/v1/certifications/search', params: { search: 'développeur' }, desc: 'Search endpoint with search param' },
    { endpoint: '/api/v1/rncp', params: { search: 'développeur' }, desc: 'RNCP endpoint' },
    { endpoint: '/api/v1/certification', params: { search: 'développeur' }, desc: 'Certification (singular)' }
  ];
  
  const successfulEndpoints = [];
  
  for (const test of certEndpoints) {
    log(`\nTesting ${test.desc}:`, 'yellow');
    const result = await testEndpoint(test.endpoint, test.params);
    
    if (result.success) {
      successfulEndpoints.push({ ...test, result });
      
      // Show sample data structure
      if (result.data) {
        console.log('\nResponse structure:');
        if (Array.isArray(result.data)) {
          log(`  Type: Array with ${result.data.length} items`, 'cyan');
          if (result.data.length > 0) {
            log('  First item keys:', 'cyan');
            console.log('  ', Object.keys(result.data[0]).join(', '));
          }
        } else if (result.data.results) {
          log(`  Type: Object with 'results' array (${result.data.results.length} items)`, 'cyan');
          if (result.data.results.length > 0) {
            log('  First result keys:', 'cyan');
            console.log('  ', Object.keys(result.data.results[0]).join(', '));
          }
        } else {
          log('  Type: Object', 'cyan');
          log('  Keys:', 'cyan');
          console.log('  ', Object.keys(result.data).join(', '));
        }
      }
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Test 3: Specific RNCP Code Lookup
  logSection('TEST 3: RNCP Code Lookup');
  const rncpCodes = ['RNCP31114', 'RNCP34838', 'RNCP36061'];
  
  for (const code of rncpCodes) {
    log(`\nLooking up ${code}:`, 'yellow');
    const tests = [
      { endpoint: `/api/v1/certifications/${code}`, params: {} },
      { endpoint: '/api/v1/certifications', params: { code } },
      { endpoint: '/api/v1/certifications', params: { rncp: code } },
      { endpoint: `/api/v1/rncp/${code}`, params: {} }
    ];
    
    for (const test of tests) {
      const result = await testEndpoint(test.endpoint, test.params);
      if (result.success) {
        successfulEndpoints.push({ ...test, result, desc: `RNCP lookup: ${code}` });
        break; // Found working endpoint, move to next code
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Test 4: Alternative API endpoints mentioned in docs
  logSection('TEST 4: Alternative Endpoints from Documentation');
  const altEndpoints = [
    { endpoint: '/api/v1/entity/certifications', params: { search: 'web' }, desc: 'Entity certifications' },
    { endpoint: '/api/v1/france-competences', params: { search: 'web' }, desc: 'France Compétences direct' },
    { endpoint: '/api/v1/referentiel/certifications', params: { search: 'web' }, desc: 'Referentiel certifications' }
  ];
  
  for (const test of altEndpoints) {
    log(`\nTesting ${test.desc}:`, 'yellow');
    const result = await testEndpoint(test.endpoint, test.params);
    if (result.success) {
      successfulEndpoints.push({ ...test, result });
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  logSection('SUMMARY OF SUCCESSFUL ENDPOINTS');
  
  if (successfulEndpoints.length === 0) {
    logError('No successful endpoints found!');
    logInfo('The API might be using different paths or require authentication.');
    logInfo('Try visiting https://api.apprentissage.beta.gouv.fr/docs for documentation');
  } else {
    logSuccess(`Found ${successfulEndpoints.length} working endpoint(s)!\n`);
    
    successfulEndpoints.forEach((endpoint, index) => {
      console.log(`${index + 1}. ${endpoint.desc}`);
      log(`   Endpoint: ${endpoint.endpoint}`, 'cyan');
      if (Object.keys(endpoint.params).length > 0) {
        log(`   Params: ${JSON.stringify(endpoint.params)}`, 'cyan');
      }
      
      // Show detailed structure for first successful endpoint
      if (index === 0 && endpoint.result.data) {
        log('\n   Detailed Response Structure:', 'yellow');
        console.log(JSON.stringify(endpoint.result.data, null, 2).substring(0, 1000));
        if (JSON.stringify(endpoint.result.data).length > 1000) {
          log('   ... (truncated)', 'yellow');
        }
      }
      console.log('');
    });
  }
  
  // Recommendations
  logSection('RECOMMENDATIONS FOR IMPLEMENTATION');
  
  if (successfulEndpoints.length > 0) {
    log('Based on the exploration, here are the recommendations:', 'green');
    console.log('\n1. Use the first successful endpoint for your autocomplete');
    console.log('2. Implement debouncing (300-500ms) to avoid excessive requests');
    console.log('3. Cache results client-side for repeated searches');
    console.log('4. Create a Next.js API route as proxy for better control');
    console.log('5. Handle rate limiting gracefully with retry logic');
  } else {
    log('Next steps:', 'yellow');
    console.log('\n1. Visit https://api.apprentissage.beta.gouv.fr/docs');
    console.log('2. Check if API requires registration/authentication');
    console.log('3. Look for Swagger/OpenAPI documentation');
    console.log('4. Consider using catalogue.apprentissage.education.gouv.fr instead');
  }
  
  logSection('EXPLORATION COMPLETE');
}

// Run the exploration
exploreAPI().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
