/**
 * Find Swagger/OpenAPI documentation
 */

require('dotenv').config();

const API_TOKEN = process.env.MISSION_APPRENTISSAGE_API_TOKEN;
const API_URL = process.env.MISSION_APPRENTISSAGE_API_URL || 'https://api.apprentissage.beta.gouv.fr';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testUrl(url, useAuth = false) {
  log(`\nTesting: ${url}`, 'cyan');
  
  const headers = {
    'Accept': 'application/json, text/html',
    'User-Agent': 'SimplyJury/1.0'
  };
  
  if (useAuth && API_TOKEN) {
    headers['Authorization'] = `Bearer ${API_TOKEN}`;
  }
  
  try {
    const response = await fetch(url, { headers });
    const contentType = response.headers.get('content-type');
    
    log(`Status: ${response.status}`, response.ok ? 'green' : 'red');
    log(`Content-Type: ${contentType}`, 'yellow');
    
    if (response.ok) {
      const text = await response.text();
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const json = JSON.parse(text);
          log('✓ Valid JSON', 'green');
          
          // Check if it's OpenAPI/Swagger spec
          if (json.openapi || json.swagger) {
            log('✓✓✓ FOUND OPENAPI SPEC!', 'green');
            console.log('\nOpenAPI Version:', json.openapi || json.swagger);
            console.log('Title:', json.info?.title);
            console.log('Description:', json.info?.description);
            
            if (json.paths) {
              console.log('\nAvailable endpoints:');
              Object.keys(json.paths).slice(0, 20).forEach(path => {
                const methods = Object.keys(json.paths[path]).join(', ').toUpperCase();
                console.log(`  ${methods} ${path}`);
              });
            }
            
            return { success: true, spec: json };
          }
          
          return { success: true, json };
        } catch (e) {
          log('✗ Invalid JSON', 'red');
        }
      } else if (contentType && contentType.includes('text/html')) {
        // Check for Swagger UI or links to API docs
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('swagger') || lowerText.includes('openapi')) {
          log('✓ Page mentions Swagger/OpenAPI', 'green');
          
          // Look for API spec URLs
          const specMatches = text.match(/https?:\/\/[^\s"'<>]+\.(json|yaml|yml)/gi);
          if (specMatches) {
            log('\nFound potential spec URLs:', 'yellow');
            specMatches.forEach(url => console.log(`  ${url}`));
          }
        }
      }
    }
    
    return { success: false };
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return { success: false };
  }
}

async function explore() {
  console.log('='.repeat(80));
  log('SEARCHING FOR SWAGGER/OPENAPI DOCUMENTATION', 'cyan');
  console.log('='.repeat(80));
  
  if (!API_TOKEN) {
    log('\n⚠️  No API token found - testing without auth', 'yellow');
  } else {
    log(`\n✓ Using API token: ${API_TOKEN.substring(0, 15)}...`, 'green');
  }
  
  const urlsToTest = [
    // OpenAPI spec URLs
    { url: `${API_URL}/api-docs`, auth: false },
    { url: `${API_URL}/api-docs/swagger.json`, auth: false },
    { url: `${API_URL}/swagger.json`, auth: false },
    { url: `${API_URL}/openapi.json`, auth: false },
    { url: `${API_URL}/api/swagger.json`, auth: false },
    { url: `${API_URL}/api/v1/swagger.json`, auth: false },
    { url: `${API_URL}/docs/swagger.json`, auth: false },
    { url: `${API_URL}/api-docs`, auth: true },
    { url: `${API_URL}/swagger.json`, auth: true },
    
    // Swagger UI URLs
    { url: `${API_URL}/swagger`, auth: false },
    { url: `${API_URL}/swagger-ui`, auth: false },
    { url: `${API_URL}/api-docs`, auth: false },
    { url: `${API_URL}/docs`, auth: false },
    { url: `${API_URL}/documentation`, auth: false },
    
    // With auth
    { url: `${API_URL}/swagger`, auth: true },
    { url: `${API_URL}/docs`, auth: true },
    { url: `${API_URL}/documentation`, auth: true }
  ];
  
  for (const test of urlsToTest) {
    await testUrl(test.url, test.auth);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n' + '='.repeat(80));
  log('RECOMMENDATION', 'yellow');
  console.log('='.repeat(80));
  console.log('\nPlease visit these URLs in your browser while logged in:');
  console.log('1. https://api.apprentissage.beta.gouv.fr/fr/documentation-technique');
  console.log('2. https://api.apprentissage.beta.gouv.fr/fr/explorer');
  console.log('3. Your account dashboard');
  console.log('\nLook for:');
  console.log('- Swagger UI interface');
  console.log('- List of available endpoints');
  console.log('- Example API calls');
  console.log('- "Try it out" buttons');
}

explore().catch(console.error);
