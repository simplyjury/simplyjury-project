/**
 * France Compétences Open Data Explorer
 * Testing direct access to RNCP data via data.gouv.fr
 */

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

async function testEndpoint(url, description) {
  log(`\nTesting: ${description}`, 'yellow');
  log(`URL: ${url}`, 'cyan');
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SimplyJury-API-Explorer/1.0'
      }
    });
    
    if (!response.ok) {
      log(`✗ HTTP ${response.status}: ${response.statusText}`, 'red');
      return { success: false, status: response.status };
    }
    
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      log(`✓ Success!`, 'green');
      return { success: true, data };
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
  logSection('FRANCE COMPÉTENCES OPEN DATA EXPLORATION');
  
  const successfulEndpoints = [];
  
  // Test 1: data.gouv.fr API
  logSection('TEST 1: data.gouv.fr API for RNCP Data');
  
  const dataGouvTests = [
    {
      url: 'https://www.data.gouv.fr/api/1/datasets/repertoire-national-des-certifications-professionnelles-et-repertoire-specifique/',
      desc: 'RNCP Dataset metadata'
    },
    {
      url: 'https://www.data.gouv.fr/api/1/datasets/search/?q=rncp',
      desc: 'Search RNCP datasets'
    }
  ];
  
  for (const test of dataGouvTests) {
    const result = await testEndpoint(test.url, test.desc);
    if (result.success) {
      successfulEndpoints.push({ ...test, result });
      
      // Show structure
      if (result.data) {
        console.log('\nResponse structure:');
        log(`Keys: ${Object.keys(result.data).join(', ')}`, 'cyan');
        
        if (result.data.resources) {
          log(`\nFound ${result.data.resources.length} resources:`, 'green');
          result.data.resources.forEach((resource, index) => {
            console.log(`\n  ${index + 1}. ${resource.title || resource.description || 'Untitled'}`);
            console.log(`     Format: ${resource.format}`);
            console.log(`     URL: ${resource.url}`);
            if (resource.filesize) {
              console.log(`     Size: ${(resource.filesize / 1024 / 1024).toFixed(2)} MB`);
            }
          });
        }
        
        if (result.data.data && Array.isArray(result.data.data)) {
          log(`\nFound ${result.data.data.length} datasets`, 'green');
          result.data.data.slice(0, 3).forEach((dataset, index) => {
            console.log(`\n  ${index + 1}. ${dataset.title}`);
            console.log(`     ID: ${dataset.id}`);
            if (dataset.resources && dataset.resources.length > 0) {
              console.log(`     Resources: ${dataset.resources.length}`);
              console.log(`     First resource URL: ${dataset.resources[0].url}`);
            }
          });
        }
      }
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Test 2: Direct CSV/JSON resources
  logSection('TEST 2: Known RNCP Data Resources');
  
  const directResources = [
    {
      url: 'https://www.data.gouv.fr/fr/datasets/r/dcf5a0cd-9a6c-4ca4-9eef-7c18e2d40e5d',
      desc: 'RNCP Active Certifications (CSV)'
    },
    {
      url: 'https://www.data.gouv.fr/fr/datasets/r/f1f5f2f3-3f3f-4f3f-9f3f-3f3f3f3f3f3f',
      desc: 'Alternative RNCP resource'
    }
  ];
  
  for (const test of directResources) {
    const result = await testEndpoint(test.url, test.desc);
    if (result.success) {
      successfulEndpoints.push({ ...test, result });
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Test 3: France Compétences website API
  logSection('TEST 3: France Compétences Website API');
  
  const fcTests = [
    {
      url: 'https://www.francecompetences.fr/api/certifications',
      desc: 'Certifications API'
    },
    {
      url: 'https://www.francecompetences.fr/api/rncp',
      desc: 'RNCP API'
    },
    {
      url: 'https://www.francecompetences.fr/recherche/rncp',
      desc: 'RNCP Search'
    }
  ];
  
  for (const test of fcTests) {
    const result = await testEndpoint(test.url, test.desc);
    if (result.success) {
      successfulEndpoints.push({ ...test, result });
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  logSection('SUMMARY & RECOMMENDATIONS');
  
  if (successfulEndpoints.length === 0) {
    log('No direct API access found!', 'red');
    console.log('\nThis means:');
    console.log('1. Mission Apprentissage API requires registration/authentication');
    console.log('2. France Compétences data is available as downloadable files, not live API');
    console.log('3. You need to either:');
    console.log('   a) Register for Mission Apprentissage API access');
    console.log('   b) Download and host RNCP data yourself');
    console.log('   c) Use a static list of common certifications');
  } else {
    log(`Found ${successfulEndpoints.length} working endpoint(s)!`, 'green');
    console.log('\n');
    
    successfulEndpoints.forEach((endpoint, index) => {
      console.log(`${index + 1}. ${endpoint.desc}`);
      log(`   URL: ${endpoint.url}`, 'cyan');
      console.log('');
    });
  }
  
  logSection('ALTERNATIVE SOLUTION: Static Certification List');
  
  console.log('Given the API limitations, I recommend:');
  console.log('\n1. START WITH A CURATED LIST:');
  console.log('   - Create a static JSON file with common certifications');
  console.log('   - Include RNCP codes, titles, and domains');
  console.log('   - Implement client-side autocomplete');
  console.log('\n2. FUTURE ENHANCEMENT:');
  console.log('   - Register for Mission Apprentissage API access');
  console.log('   - Or periodically download and update RNCP data');
  console.log('   - Or integrate with France Compétences when they provide API');
  console.log('\n3. HYBRID APPROACH:');
  console.log('   - Use static list for autocomplete');
  console.log('   - Allow "Autre certification" for unlisted ones');
  console.log('   - Collect user input to expand your list over time');
}

explore().catch(console.error);
