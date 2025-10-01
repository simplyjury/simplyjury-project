/**
 * Catalogue Apprentissage API Explorer
 * Testing alternative endpoints mentioned in documentation
 */

const APIS = {
  catalogue: 'https://catalogue.apprentissage.education.gouv.fr',
  tables: 'https://tables-correspondances.apprentissage.beta.gouv.fr',
  main: 'https://api.apprentissage.beta.gouv.fr'
};

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

async function testEndpoint(baseUrl, endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${baseUrl}${endpoint}${queryString ? '?' + queryString : ''}`;
  
  log(`Testing: ${url}`, 'cyan');
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SimplyJury-API-Explorer/1.0'
      }
    });
    
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      log(`✗ HTTP ${response.status}: ${response.statusText}`, 'red');
      return { success: false, status: response.status };
    }
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      log(`✓ Success! Status: ${response.status}`, 'green');
      return { success: true, status: response.status, data };
    } else {
      log(`✗ Not JSON: ${contentType}`, 'yellow');
      return { success: false, contentType };
    }
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function explore() {
  logSection('CATALOGUE & TABLES CORRESPONDANCES API EXPLORATION');
  
  const successfulEndpoints = [];
  
  // Test Catalogue API
  logSection('TEST 1: Catalogue Apprentissage API');
  const catalogueTests = [
    { endpoint: '/api/v1/certifications', params: {}, desc: 'List certifications' },
    { endpoint: '/api/v1/certifications', params: { search: 'développeur' }, desc: 'Search certifications' },
    { endpoint: '/api/v1/certifications', params: { query: 'développeur' }, desc: 'Query certifications' },
    { endpoint: '/api/v1/certifications', params: { intitule: 'développeur' }, desc: 'Intitule search' },
    { endpoint: '/api/v1/entity/certifications', params: { search: 'web' }, desc: 'Entity certifications' },
    { endpoint: '/api/certifications', params: { search: 'développeur' }, desc: 'Certifications (no v1)' }
  ];
  
  for (const test of catalogueTests) {
    log(`\n${test.desc}:`, 'yellow');
    const result = await testEndpoint(APIS.catalogue, test.endpoint, test.params);
    if (result.success) {
      successfulEndpoints.push({ api: 'catalogue', ...test, result });
      
      // Show structure
      if (result.data) {
        console.log('\nResponse structure:');
        if (Array.isArray(result.data)) {
          log(`  Array with ${result.data.length} items`, 'cyan');
          if (result.data.length > 0) {
            log(`  Sample keys: ${Object.keys(result.data[0]).join(', ')}`, 'cyan');
            console.log('\nFirst item sample:');
            console.log(JSON.stringify(result.data[0], null, 2).substring(0, 500));
          }
        } else if (result.data.certifications) {
          log(`  Object with certifications array (${result.data.certifications.length} items)`, 'cyan');
          if (result.data.certifications.length > 0) {
            log(`  Sample keys: ${Object.keys(result.data.certifications[0]).join(', ')}`, 'cyan');
          }
        } else {
          log(`  Object keys: ${Object.keys(result.data).join(', ')}`, 'cyan');
        }
      }
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Test Tables Correspondances API
  logSection('TEST 2: Tables Correspondances API');
  const tablesTests = [
    { endpoint: '/api/v1/rncp', params: {}, desc: 'List RNCP' },
    { endpoint: '/api/v1/rncp', params: { search: 'développeur' }, desc: 'Search RNCP' },
    { endpoint: '/api/v1/rncp', params: { intitule: 'développeur' }, desc: 'RNCP by intitule' },
    { endpoint: '/api/v1/rncp/RNCP31114', params: {}, desc: 'Specific RNCP code' },
    { endpoint: '/api/correspondances', params: { search: 'développeur' }, desc: 'Correspondances search' }
  ];
  
  for (const test of tablesTests) {
    log(`\n${test.desc}:`, 'yellow');
    const result = await testEndpoint(APIS.tables, test.endpoint, test.params);
    if (result.success) {
      successfulEndpoints.push({ api: 'tables', ...test, result });
      
      if (result.data) {
        console.log('\nResponse structure:');
        if (Array.isArray(result.data)) {
          log(`  Array with ${result.data.length} items`, 'cyan');
          if (result.data.length > 0) {
            log(`  Sample keys: ${Object.keys(result.data[0]).join(', ')}`, 'cyan');
          }
        } else {
          log(`  Object keys: ${Object.keys(result.data).join(', ')}`, 'cyan');
        }
      }
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Test main API with different paths
  logSection('TEST 3: Main API Alternative Paths');
  const mainTests = [
    { endpoint: '/api/certifications', params: { search: 'développeur' }, desc: 'Certifications (no v1)' },
    { endpoint: '/certifications', params: { search: 'développeur' }, desc: 'Certifications (root)' },
    { endpoint: '/api/rncp', params: { search: 'développeur' }, desc: 'RNCP (no v1)' }
  ];
  
  for (const test of mainTests) {
    log(`\n${test.desc}:`, 'yellow');
    const result = await testEndpoint(APIS.main, test.endpoint, test.params);
    if (result.success) {
      successfulEndpoints.push({ api: 'main', ...test, result });
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  logSection('SUMMARY');
  
  if (successfulEndpoints.length === 0) {
    log('No successful endpoints found!', 'red');
    console.log('\nPossible reasons:');
    console.log('1. API requires authentication/API key');
    console.log('2. API has been deprecated or moved');
    console.log('3. Different endpoint structure than expected');
    console.log('\nNext steps:');
    console.log('- Visit https://api.apprentissage.beta.gouv.fr for documentation');
    console.log('- Check https://catalogue.apprentissage.education.gouv.fr/docs');
    console.log('- Consider using France Compétences open data instead');
  } else {
    log(`Found ${successfulEndpoints.length} working endpoint(s)!`, 'green');
    console.log('\n');
    
    successfulEndpoints.forEach((endpoint, index) => {
      console.log(`${index + 1}. [${endpoint.api.toUpperCase()}] ${endpoint.desc}`);
      log(`   URL: ${APIS[endpoint.api]}${endpoint.endpoint}`, 'cyan');
      if (Object.keys(endpoint.params).length > 0) {
        log(`   Params: ${JSON.stringify(endpoint.params)}`, 'cyan');
      }
      
      if (index === 0) {
        log('\n   Full Response Sample:', 'yellow');
        console.log(JSON.stringify(endpoint.result.data, null, 2).substring(0, 1500));
        log('   ... (truncated)\n', 'yellow');
      }
      console.log('');
    });
    
    log('RECOMMENDED IMPLEMENTATION:', 'green');
    const best = successfulEndpoints[0];
    console.log(`\nUse: ${APIS[best.api]}${best.endpoint}`);
    console.log(`Params: ${JSON.stringify(best.params)}`);
  }
}

explore().catch(console.error);
