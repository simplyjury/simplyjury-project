/**
 * Test API Documentation and Registration Pages
 * Check if there's a way to register for API access
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

async function testUrl(url, description) {
  log(`\nTesting: ${description}`, 'yellow');
  log(`URL: ${url}`, 'cyan');
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json, text/html',
        'User-Agent': 'SimplyJury-API-Explorer/1.0'
      }
    });
    
    const contentType = response.headers.get('content-type');
    log(`Status: ${response.status} ${response.statusText}`, response.ok ? 'green' : 'red');
    log(`Content-Type: ${contentType}`, 'cyan');
    
    if (response.ok) {
      const text = await response.text();
      
      // Check if it's JSON
      if (contentType && contentType.includes('application/json')) {
        try {
          const json = JSON.parse(text);
          log('✓ Valid JSON response', 'green');
          console.log('\nResponse preview:');
          console.log(JSON.stringify(json, null, 2).substring(0, 1000));
          
          // Look for API key mentions
          const jsonStr = JSON.stringify(json).toLowerCase();
          if (jsonStr.includes('api') && (jsonStr.includes('key') || jsonStr.includes('token') || jsonStr.includes('auth'))) {
            log('\n⚠️  Response mentions API key/token/auth!', 'yellow');
          }
          
          return { success: true, type: 'json', data: json };
        } catch (e) {
          log('✗ Invalid JSON', 'red');
        }
      }
      
      // Check if it's HTML
      if (contentType && contentType.includes('text/html')) {
        log('✓ HTML page found', 'green');
        
        // Look for key terms in HTML
        const lowerText = text.toLowerCase();
        const keywords = {
          'api key': lowerText.includes('api key') || lowerText.includes('api-key') || lowerText.includes('apikey'),
          'authentication': lowerText.includes('authentication') || lowerText.includes('authentification'),
          'register': lowerText.includes('register') || lowerText.includes('inscription') || lowerText.includes('s\'inscrire'),
          'login': lowerText.includes('login') || lowerText.includes('connexion') || lowerText.includes('se connecter'),
          'documentation': lowerText.includes('documentation') || lowerText.includes('docs'),
          'swagger': lowerText.includes('swagger') || lowerText.includes('openapi'),
          'token': lowerText.includes('token') || lowerText.includes('bearer'),
          'authorization': lowerText.includes('authorization') || lowerText.includes('authorisation')
        };
        
        console.log('\nKeywords found in HTML:');
        Object.entries(keywords).forEach(([key, found]) => {
          if (found) {
            log(`  ✓ ${key}`, 'green');
          } else {
            log(`  ✗ ${key}`, 'red');
          }
        });
        
        // Extract title
        const titleMatch = text.match(/<title>(.*?)<\/title>/i);
        if (titleMatch) {
          log(`\nPage title: "${titleMatch[1]}"`, 'cyan');
        }
        
        // Look for API endpoints in HTML
        const endpointMatches = text.match(/\/api\/[a-z0-9\/\-_]+/gi);
        if (endpointMatches) {
          const uniqueEndpoints = [...new Set(endpointMatches)].slice(0, 10);
          log('\nAPI endpoints found in HTML:', 'yellow');
          uniqueEndpoints.forEach(ep => console.log(`  ${ep}`));
        }
        
        return { success: true, type: 'html', keywords, preview: text.substring(0, 500) };
      }
      
      return { success: true, type: 'other', preview: text.substring(0, 500) };
    }
    
    return { success: false, status: response.status };
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function testWithApiKey() {
  logSection('TESTING WITH DUMMY API KEY');
  
  const testEndpoints = [
    'https://api.apprentissage.beta.gouv.fr/api/v1/certifications',
    'https://catalogue.apprentissage.education.gouv.fr/api/v1/certifications'
  ];
  
  const authHeaders = [
    { name: 'Authorization: Bearer', value: 'Bearer test-api-key-123' },
    { name: 'X-API-Key', value: 'test-api-key-123' },
    { name: 'Api-Key', value: 'test-api-key-123' }
  ];
  
  for (const endpoint of testEndpoints) {
    log(`\nTesting endpoint: ${endpoint}`, 'yellow');
    
    for (const auth of authHeaders) {
      log(`  With ${auth.name}`, 'cyan');
      
      try {
        const headers = {
          'Accept': 'application/json',
          'User-Agent': 'SimplyJury-API-Explorer/1.0'
        };
        
        if (auth.name.startsWith('Authorization')) {
          headers['Authorization'] = auth.value;
        } else {
          headers[auth.name] = auth.value;
        }
        
        const response = await fetch(endpoint, { headers });
        
        if (response.status === 401) {
          log(`    ✓ 401 Unauthorized - API KEY REQUIRED!`, 'green');
        } else if (response.status === 403) {
          log(`    ✓ 403 Forbidden - API KEY REQUIRED!`, 'green');
        } else {
          log(`    Status: ${response.status}`, 'cyan');
        }
      } catch (error) {
        log(`    Error: ${error.message}`, 'red');
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
}

async function explore() {
  logSection('MISSION APPRENTISSAGE - DOCUMENTATION & REGISTRATION CHECK');
  
  const urlsToTest = [
    {
      url: 'https://api.apprentissage.beta.gouv.fr',
      desc: 'Main API homepage'
    },
    {
      url: 'https://api.apprentissage.beta.gouv.fr/docs',
      desc: 'API documentation'
    },
    {
      url: 'https://api.apprentissage.beta.gouv.fr/documentation',
      desc: 'Alternative docs path'
    },
    {
      url: 'https://api.apprentissage.beta.gouv.fr/swagger',
      desc: 'Swagger documentation'
    },
    {
      url: 'https://api.apprentissage.beta.gouv.fr/api-docs',
      desc: 'API docs alternative'
    },
    {
      url: 'https://api.apprentissage.beta.gouv.fr/register',
      desc: 'Registration page'
    },
    {
      url: 'https://api.apprentissage.beta.gouv.fr/signup',
      desc: 'Signup page'
    },
    {
      url: 'https://api.apprentissage.beta.gouv.fr/login',
      desc: 'Login page'
    },
    {
      url: 'https://catalogue.apprentissage.education.gouv.fr',
      desc: 'Catalogue homepage'
    },
    {
      url: 'https://catalogue.apprentissage.education.gouv.fr/docs',
      desc: 'Catalogue documentation'
    },
    {
      url: 'https://tables-correspondances.apprentissage.beta.gouv.fr',
      desc: 'Tables Correspondances homepage'
    },
    {
      url: 'https://mission-apprentissage.gitbook.io',
      desc: 'GitBook documentation (mentioned in docs)'
    },
    {
      url: 'https://mission-apprentissage.gitbook.io/api',
      desc: 'GitBook API docs'
    }
  ];
  
  const results = [];
  
  for (const test of urlsToTest) {
    const result = await testUrl(test.url, test.desc);
    if (result.success) {
      results.push({ ...test, result });
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Test with API key headers
  await testWithApiKey();
  
  // Summary
  logSection('SUMMARY & CONCLUSIONS');
  
  const htmlPages = results.filter(r => r.result.type === 'html');
  const jsonResponses = results.filter(r => r.result.type === 'json');
  
  log(`Found ${htmlPages.length} HTML pages`, 'cyan');
  log(`Found ${jsonResponses.length} JSON responses`, 'cyan');
  
  const pagesWithAuth = htmlPages.filter(r => 
    r.result.keywords && (
      r.result.keywords['api key'] || 
      r.result.keywords['authentication'] ||
      r.result.keywords['token'] ||
      r.result.keywords['authorization']
    )
  );
  
  const pagesWithRegistration = htmlPages.filter(r =>
    r.result.keywords && (
      r.result.keywords['register'] ||
      r.result.keywords['login']
    )
  );
  
  if (pagesWithAuth.length > 0) {
    log('\n✓ AUTHENTICATION MENTIONED ON:', 'green');
    pagesWithAuth.forEach(page => {
      console.log(`  - ${page.desc}: ${page.url}`);
    });
  }
  
  if (pagesWithRegistration.length > 0) {
    log('\n✓ REGISTRATION/LOGIN FOUND ON:', 'green');
    pagesWithRegistration.forEach(page => {
      console.log(`  - ${page.desc}: ${page.url}`);
    });
  }
  
  logSection('RECOMMENDATION');
  
  if (pagesWithAuth.length > 0 || pagesWithRegistration.length > 0) {
    log('✓ API LIKELY REQUIRES AUTHENTICATION', 'green');
    console.log('\nNext steps:');
    console.log('1. Visit the pages above to find registration process');
    console.log('2. Register for an API key');
    console.log('3. Re-test endpoints with proper authentication');
  } else {
    log('⚠️  NO CLEAR AUTHENTICATION MECHANISM FOUND', 'yellow');
    console.log('\nPossible reasons:');
    console.log('1. API has been deprecated/moved');
    console.log('2. Documentation is outdated');
    console.log('3. Registration process is not public');
    console.log('4. Need to contact Mission Apprentissage directly');
  }
}

explore().catch(console.error);
