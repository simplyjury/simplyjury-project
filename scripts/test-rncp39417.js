/**
 * Test script for RNCP39417 validation with fallback
 */

async function testRNCP39417() {
  console.log('🧪 Testing RNCP39417 validation...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/certifications/validate?code=RNCP39417');
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    
    console.log('\n📦 Response data:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.valid) {
      console.log('\n✅ SUCCESS: RNCP39417 validated!');
      console.log('   Title:', data.title);
      console.log('   Source:', data.source || 'mission_apprentissage');
    } else {
      console.log('\n❌ FAILED: RNCP39417 not found');
      console.log('   Error:', data.error);
      console.log('   Message:', data.message);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

testRNCP39417();
