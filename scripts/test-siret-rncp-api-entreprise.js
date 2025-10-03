/**
 * Script de test : Vérification SIRET → RNCP via API Entreprise
 * 
 * Ce script vérifie si un SIRET est habilité à délivrer une certification RNCP
 * en utilisant l'API Entreprise (données officielles France Compétences)
 * 
 * Prérequis:
 * - Token API Entreprise (obtenu sur api.gouv.fr)
 * - Node.js avec fetch (Node 18+) ou installer node-fetch
 * 
 * Usage: 
 * 1. Remplacer VOTRE_TOKEN par votre token API Entreprise
 * 2. node scripts/test-siret-rncp-api-entreprise.js
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_ENTREPRISE_TOKEN = process.env.API_ENTREPRISE_TOKEN || 'VOTRE_TOKEN_ICI';
const API_BASE_URL = 'https://entreprise.api.gouv.fr/v3';

// Cas de test
const TEST_CASES = [
  {
    name: 'Test 1: Centre IT avec certification IT',
    siret: '13002526500013', // Exemple (à remplacer par un vrai SIRET)
    rncpCodes: ['RNCP37674'], // Développeur web
    expectedResult: 'should_match'
  },
  {
    name: 'Test 2: Centre IT avec certification Petite enfance',
    siret: '13002526500013',
    rncpCodes: ['RNCP38565'], // Accompagnant éducatif petite enfance
    expectedResult: 'should_mismatch'
  }
];

// ============================================================================
// FONCTIONS API
// ============================================================================

/**
 * Vérifie si un SIRET est certifié Qualiopi
 */
async function checkQualiopi(siret) {
  const url = `${API_BASE_URL}/organisations/${siret}/qualiopi`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_ENTREPRISE_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return { certified: false, message: 'Non certifié Qualiopi ou SIRET non trouvé' };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      certified: data.data?.qualiopi_certified || false,
      details: data.data,
      message: data.data?.qualiopi_certified ? 'Certifié Qualiopi ✓' : 'Non certifié Qualiopi'
    };
  } catch (error) {
    return {
      certified: false,
      error: error.message,
      message: `Erreur: ${error.message}`
    };
  }
}

/**
 * Récupère les certifications (RNCP/RS) habilitées pour un SIRET
 */
async function getCertifications(siret) {
  const url = `${API_BASE_URL}/organisations/${siret}/certifications`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_ENTREPRISE_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return { certifications: [], message: 'Aucune certification trouvée' };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extraire les codes RNCP de la réponse
    const rncpCodes = [];
    if (data.data?.certifications) {
      data.data.certifications.forEach(cert => {
        if (cert.code && cert.code.startsWith('RNCP')) {
          rncpCodes.push(cert.code);
        }
      });
    }
    
    return {
      certifications: rncpCodes,
      fullData: data.data,
      message: rncpCodes.length > 0 
        ? `${rncpCodes.length} certification(s) trouvée(s)` 
        : 'Aucune certification RNCP trouvée'
    };
  } catch (error) {
    return {
      certifications: [],
      error: error.message,
      message: `Erreur: ${error.message}`
    };
  }
}

/**
 * Vérifie si un SIRET est habilité pour un code RNCP spécifique
 */
async function verifyRNCPAuthorization(siret, rncpCode) {
  console.log(`\n🔍 Vérification: ${siret} → ${rncpCode}`);
  console.log('─'.repeat(80));
  
  // Étape 1: Vérifier Qualiopi
  console.log('\n📋 Étape 1: Vérification Qualiopi...');
  const qualiopiResult = await checkQualiopi(siret);
  console.log(`   ${qualiopiResult.message}`);
  
  if (!qualiopiResult.certified) {
    console.log('   ⚠️  Attention: Non certifié Qualiopi (peut limiter les financements CPF)');
  }
  
  // Étape 2: Récupérer les certifications habilitées
  console.log('\n📋 Étape 2: Récupération des certifications habilitées...');
  const certsResult = await getCertifications(siret);
  console.log(`   ${certsResult.message}`);
  
  if (certsResult.certifications.length > 0) {
    console.log('\n   Certifications RNCP trouvées:');
    certsResult.certifications.forEach(code => {
      console.log(`   - ${code}`);
    });
  }
  
  // Étape 3: Vérifier la correspondance
  console.log('\n📋 Étape 3: Vérification de l\'habilitation...');
  const isAuthorized = certsResult.certifications.includes(rncpCode);
  
  if (isAuthorized) {
    console.log(`   ✅ AUTORISÉ: Le SIRET ${siret} est habilité pour ${rncpCode}`);
  } else {
    console.log(`   ❌ NON AUTORISÉ: Le SIRET ${siret} n'est PAS habilité pour ${rncpCode}`);
    console.log(`   ⚠️  MISMATCH DÉTECTÉ - Action recommandée:`);
    console.log(`      → Afficher un avertissement à l'utilisateur`);
    console.log(`      → Demander une justification`);
    console.log(`      → Marquer pour validation administrative`);
  }
  
  return {
    siret,
    rncpCode,
    isAuthorized,
    qualiopiCertified: qualiopiResult.certified,
    authorizedCertifications: certsResult.certifications,
    hasMismatch: !isAuthorized
  };
}

// ============================================================================
// EXÉCUTION DES TESTS
// ============================================================================

async function runTests() {
  console.log('\n🧪 TEST DE VÉRIFICATION SIRET → RNCP via API Entreprise\n');
  console.log('='.repeat(80));
  
  // Vérifier le token
  if (API_ENTREPRISE_TOKEN === 'VOTRE_TOKEN_ICI') {
    console.log('\n❌ ERREUR: Token API Entreprise non configuré!');
    console.log('\n📝 Pour obtenir un token:');
    console.log('   1. Aller sur https://api.gouv.fr/');
    console.log('   2. Créer un compte');
    console.log('   3. Demander l\'accès à l\'API Entreprise');
    console.log('   4. Définir la variable d\'environnement:');
    console.log('      export API_ENTREPRISE_TOKEN="votre_token"');
    console.log('\n⚠️  Note: L\'API Entreprise nécessite une justification d\'usage');
    console.log('   (service public, mission d\'intérêt général, etc.)');
    console.log('\n');
    return;
  }
  
  const results = [];
  
  for (const testCase of TEST_CASES) {
    console.log(`\n\n📌 ${testCase.name}`);
    console.log('='.repeat(80));
    
    for (const rncpCode of testCase.rncpCodes) {
      const result = await verifyRNCPAuthorization(testCase.siret, rncpCode);
      results.push(result);
      
      // Pause entre les requêtes pour respecter les rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Résumé
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 RÉSUMÉ DES TESTS\n');
  
  const authorized = results.filter(r => r.isAuthorized).length;
  const mismatches = results.filter(r => r.hasMismatch).length;
  
  console.log(`Total de vérifications: ${results.length}`);
  console.log(`✅ Autorisés: ${authorized}`);
  console.log(`❌ Non autorisés (mismatches): ${mismatches}`);
  
  if (mismatches > 0) {
    console.log('\n⚠️  ATTENTION: Des incohérences ont été détectées!');
    console.log('   Ces cas nécessitent une validation manuelle.');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Tests terminés!\n');
}

// ============================================================================
// FONCTION UTILITAIRE: Test d'un SIRET spécifique
// ============================================================================

/**
 * Fonction utilitaire pour tester un SIRET et RNCP spécifiques
 * Usage: testSpecific('13002526500013', 'RNCP37674')
 */
async function testSpecific(siret, rncpCode) {
  console.log('\n🔬 TEST SPÉCIFIQUE\n');
  console.log('='.repeat(80));
  
  const result = await verifyRNCPAuthorization(siret, rncpCode);
  
  console.log('\n' + '='.repeat(80));
  console.log('\n📋 Résultat:');
  console.log(JSON.stringify(result, null, 2));
  console.log('\n');
  
  return result;
}

// ============================================================================
// POINT D'ENTRÉE
// ============================================================================

// Exécuter les tests
runTests().catch(error => {
  console.error('\n❌ Erreur lors de l\'exécution des tests:', error);
  process.exit(1);
});

// Exporter les fonctions pour usage externe
module.exports = {
  checkQualiopi,
  getCertifications,
  verifyRNCPAuthorization,
  testSpecific
};
