/**
 * Script de test : Validation APE vs RNCP
 * 
 * Test rapide de la logique de détection d'incohérence entre code APE et RNCP
 * 
 * Usage: node scripts/test-ape-rncp-validation.js
 */

// Mapping simplifié APE → Domaines
const APE_TO_DOMAINS = {
  // IT
  '62.01Z': ['Informatique'],
  '62.02A': ['Informatique'],
  '62.02B': ['Informatique'],
  
  // Formation générale
  '85.59A': ['Informatique', 'Gestion', 'Commerce', 'Industrie', 'Santé', 'Éducation', 'Transport', 'Hôtellerie-Restauration', 'Bâtiment', 'Agriculture'],
  '85.59B': ['Informatique', 'Gestion', 'Commerce', 'Industrie', 'Santé', 'Éducation', 'Transport', 'Hôtellerie-Restauration', 'Bâtiment', 'Agriculture'],
  
  // Gestion
  '70.22Z': ['Gestion', 'Commerce'],
  '69.20Z': ['Gestion'],
  
  // Restauration
  '56.10A': ['Hôtellerie-Restauration'],
  '56.10B': ['Hôtellerie-Restauration'],
  '56.10C': ['Hôtellerie-Restauration'],
  
  // Santé
  '86.10Z': ['Santé'],
  '86.90A': ['Santé'],
  
  // Bâtiment
  '41.10A': ['Bâtiment'],
  '43.11Z': ['Bâtiment']
};

// Mapping RNCP → Domaines (exemples)
const RNCP_TO_DOMAINS = {
  'RNCP37674': ['Informatique'], // Développeur web
  'RNCP38565': ['Santé', 'Éducation'], // Accompagnant éducatif petite enfance
  'RNCP31114': ['Informatique'], // Développeur web (ancien)
  'RNCP35634': ['Commerce', 'Gestion'] // Négociateur technico-commercial
};

// Fonction de détection d'incohérence
function detectMismatch(apeCode, rncpCode) {
  const apeDomains = APE_TO_DOMAINS[apeCode] || [];
  const rncpDomains = RNCP_TO_DOMAINS[rncpCode] || [];
  
  if (apeDomains.length === 0 || rncpDomains.length === 0) {
    return {
      hasMismatch: false,
      confidence: 'unknown',
      reason: 'Données insuffisantes'
    };
  }
  
  // Vérifier si au moins un domaine correspond
  const hasMatch = rncpDomains.some(domain => apeDomains.includes(domain));
  
  return {
    hasMismatch: !hasMatch,
    confidence: hasMatch ? 'high' : 'low',
    apeDomains,
    rncpDomains,
    reason: hasMatch 
      ? 'Domaines cohérents' 
      : `Aucun domaine en commun (APE: ${apeDomains.join(', ')} vs RNCP: ${rncpDomains.join(', ')})`
  };
}

// Cas de test
const testCases = [
  {
    name: '✅ CAS 1: IT company + IT certification (OK)',
    apeCode: '62.01Z',
    apeLabel: 'Programmation informatique',
    rncpCode: 'RNCP37674',
    rncpTitle: 'Développeur web et web mobile'
  },
  {
    name: '❌ CAS 2: IT company + Petite enfance (MISMATCH)',
    apeCode: '62.01Z',
    apeLabel: 'Programmation informatique',
    rncpCode: 'RNCP38565',
    rncpTitle: 'Accompagnant éducatif petite enfance'
  },
  {
    name: '✅ CAS 3: General training + Any certification (OK)',
    apeCode: '85.59A',
    apeLabel: 'Formation continue d\'adultes',
    rncpCode: 'RNCP38565',
    rncpTitle: 'Accompagnant éducatif petite enfance'
  },
  {
    name: '❌ CAS 4: Restaurant + IT certification (MISMATCH)',
    apeCode: '56.10A',
    apeLabel: 'Restauration traditionnelle',
    rncpCode: 'RNCP37674',
    rncpTitle: 'Développeur web et web mobile'
  }
];

// Exécution des tests
console.log('\n🧪 TEST DE VALIDATION APE vs RNCP\n');
console.log('='.repeat(80));

testCases.forEach((testCase, index) => {
  console.log(`\n${testCase.name}`);
  console.log('-'.repeat(80));
  console.log(`APE: ${testCase.apeCode} - ${testCase.apeLabel}`);
  console.log(`RNCP: ${testCase.rncpCode} - ${testCase.rncpTitle}`);
  
  const result = detectMismatch(testCase.apeCode, testCase.rncpCode);
  
  console.log(`\n📊 Résultat:`);
  console.log(`   Incohérence détectée: ${result.hasMismatch ? '⚠️  OUI' : '✅ NON'}`);
  console.log(`   Domaines APE: ${result.apeDomains?.join(', ') || 'N/A'}`);
  console.log(`   Domaines RNCP: ${result.rncpDomains?.join(', ') || 'N/A'}`);
  console.log(`   Raison: ${result.reason}`);
  
  if (result.hasMismatch) {
    console.log(`\n   ⚠️  ACTION RECOMMANDÉE:`);
    console.log(`   → Afficher un avertissement à l'utilisateur`);
    console.log(`   → Demander une justification`);
    console.log(`   → Marquer pour revue administrative`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('\n✅ Tests terminés!\n');
