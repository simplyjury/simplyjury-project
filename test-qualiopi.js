// Test script to check Qualiopi CSV download
const fetch = require('node-fetch');

async function testQualiopiDownload() {
  try {
    console.log('Testing Qualiopi CSV download...');
    
    // Try the original data.gouv.fr URL
    const response = await fetch('https://www.data.gouv.fr/api/1/datasets/r/745a5413-d2b5-4d61-b743-8b0ace68083b');
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    if (response.status === 302) {
      const location = response.headers.get('location');
      console.log('Redirected to:', location);
      
      // Follow redirect
      const redirectResponse = await fetch(location);
      console.log('Redirect response status:', redirectResponse.status);
      
      const text = await redirectResponse.text();
      const lines = text.split('\n');
      console.log('First 5 lines:');
      lines.slice(0, 5).forEach((line, i) => console.log(`${i + 1}: ${line}`));
      
      // Check if it contains Qualiopi data
      const hasQualiopi = text.includes('qualiopi') || text.includes('Qualiopi') || text.includes('QUALIOPI');
      console.log('Contains Qualiopi data:', hasQualiopi);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testQualiopiDownload();
