# Pappers API - Activity Domain Mapping for RNCP Validation

**Date**: 2025-10-03  
**Context**: Using Pappers API data to suggest/validate certification domains  
**Status**: ✅ **FEASIBLE - HIGH VALUE SOLUTION**

---

## 🎯 The Question

**Can we use Pappers API data to:**
1. Suggest relevant certification domains based on SIRET?
2. Validate that RNCP certifications match the company's activity?
3. Provide a better user experience during signup?

**Answer: YES!** ✅

---

## 📊 Available Pappers API Fields

### Currently Used Fields:
```typescript
{
  name: data.nom_entreprise || data.denomination,
  address: data.siege?.adresse_ligne_1,
  city: data.siege?.ville,
  postalCode: data.siege?.code_postal,
  sector: data.libelle_activite_principale || data.code_ape_entreprise
}
```

### Key Activity Fields Available:

#### 1. **`code_ape_entreprise`** (APE/NAF Code) ⭐
- **Format**: 5 characters (e.g., "85.59A", "62.01Z")
- **Description**: Official French activity classification code
- **Example**: 
  - `85.59A` = "Formation continue d'adultes"
  - `62.01Z` = "Programmation informatique"
  - `85.32Z` = "Enseignement secondaire technique ou professionnel"

#### 2. **`libelle_activite_principale`** ⭐⭐
- **Format**: Human-readable text
- **Description**: Full description of the main activity
- **Example**: 
  - "Formation continue d'adultes"
  - "Programmation informatique"
  - "Enseignement secondaire technique"

#### 3. **`code_naf`** (Same as APE)
- Alternative name for `code_ape_entreprise`

#### 4. **`activite_principale`** (if available)
- Detailed activity description

---

## 🔗 APE Code to Certification Domain Mapping

### Strategy: Map APE Codes to Relevant Certification Domains

The APE code system is **perfect** for this because:
- ✅ Official French classification
- ✅ Covers all economic activities
- ✅ Hierarchical structure (sections → divisions → groups → classes)
- ✅ Stable and well-documented

### APE Code Structure:

```
Section: Letter (A-U)
Division: 2 digits (01-99)
Group: 3 digits + letter (e.g., 85.5)
Class: 4 digits + letter (e.g., 85.59A)
```

**Example for Training Centers:**
- **Section P**: Education (85.XX.X)
- **Division 85**: Education
  - **85.5**: Other education
    - **85.59**: Other education n.e.c.
      - **85.59A**: Continuing vocational training
      - **85.59B**: Other education n.e.c.

---

## 💡 Implementation Strategy

### **Option 1: APE Code to Domain Mapping** ⭐ (Recommended)

Create a mapping table from APE codes to certification domains:

```typescript
// lib/data/ape-to-domains.ts

export const APE_TO_DOMAINS: Record<string, string[]> = {
  // Education & Training
  '85.59A': ['Informatique', 'Gestion', 'Commerce', 'Industrie', 'Santé', 'Éducation', 'Transport', 'Hôtellerie-Restauration', 'Bâtiment', 'Agriculture'],
  '85.59B': ['Informatique', 'Gestion', 'Commerce', 'Industrie', 'Santé', 'Éducation', 'Transport', 'Hôtellerie-Restauration', 'Bâtiment', 'Agriculture'],
  '85.32Z': ['Éducation', 'Industrie', 'Bâtiment'],
  
  // IT & Software
  '62.01Z': ['Informatique'],
  '62.02A': ['Informatique'],
  '62.02B': ['Informatique'],
  '62.09Z': ['Informatique'],
  '63.11Z': ['Informatique'],
  
  // Management & Consulting
  '70.22Z': ['Gestion', 'Commerce'],
  '69.20Z': ['Gestion'],
  '70.21Z': ['Gestion'],
  
  // Commerce & Sales
  '46.90Z': ['Commerce'],
  '47.91A': ['Commerce'],
  '47.91B': ['Commerce'],
  
  // Industry & Manufacturing
  '25.11Z': ['Industrie', 'Bâtiment'],
  '25.12Z': ['Industrie', 'Bâtiment'],
  '28.11Z': ['Industrie'],
  
  // Healthcare
  '86.10Z': ['Santé'],
  '86.21Z': ['Santé'],
  '86.22A': ['Santé'],
  '86.90A': ['Santé'],
  
  // Transport & Logistics
  '49.41A': ['Transport'],
  '49.41B': ['Transport'],
  '49.41C': ['Transport'],
  '52.29A': ['Transport'],
  
  // Hospitality & Catering
  '55.10Z': ['Hôtellerie-Restauration'],
  '55.20Z': ['Hôtellerie-Restauration'],
  '56.10A': ['Hôtellerie-Restauration'],
  '56.10B': ['Hôtellerie-Restauration'],
  '56.10C': ['Hôtellerie-Restauration'],
  '56.21Z': ['Hôtellerie-Restauration'],
  
  // Construction & Building
  '41.10A': ['Bâtiment'],
  '41.10B': ['Bâtiment'],
  '41.10C': ['Bâtiment'],
  '41.10D': ['Bâtiment'],
  '41.20A': ['Bâtiment'],
  '41.20B': ['Bâtiment'],
  '43.11Z': ['Bâtiment'],
  '43.21A': ['Bâtiment'],
  '43.21B': ['Bâtiment'],
  
  // Agriculture
  '01.11Z': ['Agriculture'],
  '01.12Z': ['Agriculture'],
  '01.13Z': ['Agriculture'],
  '01.21Z': ['Agriculture'],
  
  // Add more mappings as needed...
};

export function getSuggestedDomainsFromAPE(apeCode: string): string[] {
  // Direct match
  if (APE_TO_DOMAINS[apeCode]) {
    return APE_TO_DOMAINS[apeCode];
  }
  
  // Try matching by division (first 2 digits)
  const division = apeCode.substring(0, 2);
  const divisionMatches = Object.entries(APE_TO_DOMAINS)
    .filter(([code]) => code.startsWith(division))
    .flatMap(([_, domains]) => domains);
  
  if (divisionMatches.length > 0) {
    return [...new Set(divisionMatches)]; // Remove duplicates
  }
  
  // Default: return all domains (no restriction)
  return ['Informatique', 'Gestion', 'Commerce', 'Industrie', 'Santé', 'Éducation', 'Transport', 'Hôtellerie-Restauration', 'Bâtiment', 'Agriculture'];
}
```

---

### **Option 2: Text Analysis of `libelle_activite_principale`** 

Use keyword matching on the activity description:

```typescript
// lib/data/activity-keywords.ts

export const ACTIVITY_KEYWORDS_TO_DOMAINS: Record<string, string[]> = {
  // IT Keywords
  'informatique': ['Informatique'],
  'programmation': ['Informatique'],
  'développement': ['Informatique'],
  'logiciel': ['Informatique'],
  'numérique': ['Informatique'],
  'digital': ['Informatique'],
  'web': ['Informatique'],
  
  // Management Keywords
  'gestion': ['Gestion'],
  'management': ['Gestion'],
  'comptabilité': ['Gestion'],
  'finance': ['Gestion'],
  'ressources humaines': ['Gestion'],
  
  // Commerce Keywords
  'commerce': ['Commerce'],
  'vente': ['Commerce'],
  'marketing': ['Commerce'],
  'distribution': ['Commerce'],
  
  // Industry Keywords
  'industrie': ['Industrie'],
  'fabrication': ['Industrie'],
  'production': ['Industrie'],
  'usinage': ['Industrie'],
  
  // Healthcare Keywords
  'santé': ['Santé'],
  'médical': ['Santé'],
  'soins': ['Santé'],
  'paramédical': ['Santé'],
  
  // Education Keywords
  'formation': ['Éducation'],
  'enseignement': ['Éducation'],
  'éducation': ['Éducation'],
  'pédagogie': ['Éducation'],
  
  // Transport Keywords
  'transport': ['Transport'],
  'logistique': ['Transport'],
  'livraison': ['Transport'],
  
  // Hospitality Keywords
  'hôtel': ['Hôtellerie-Restauration'],
  'restaurant': ['Hôtellerie-Restauration'],
  'restauration': ['Hôtellerie-Restauration'],
  'cuisine': ['Hôtellerie-Restauration'],
  'hébergement': ['Hôtellerie-Restauration'],
  
  // Construction Keywords
  'bâtiment': ['Bâtiment'],
  'construction': ['Bâtiment'],
  'travaux': ['Bâtiment'],
  'maçonnerie': ['Bâtiment'],
  
  // Agriculture Keywords
  'agriculture': ['Agriculture'],
  'agricole': ['Agriculture'],
  'élevage': ['Agriculture'],
  'culture': ['Agriculture'],
};

export function getSuggestedDomainsFromActivity(activityLabel: string): string[] {
  const lowerActivity = activityLabel.toLowerCase();
  const suggestedDomains = new Set<string>();
  
  Object.entries(ACTIVITY_KEYWORDS_TO_DOMAINS).forEach(([keyword, domains]) => {
    if (lowerActivity.includes(keyword)) {
      domains.forEach(domain => suggestedDomains.add(domain));
    }
  });
  
  return Array.from(suggestedDomains);
}
```

---

### **Option 3: Hybrid Approach** ⭐⭐ (Best)

Combine both APE code and text analysis:

```typescript
// lib/services/domain-suggestion-service.ts

import { getSuggestedDomainsFromAPE } from '@/lib/data/ape-to-domains';
import { getSuggestedDomainsFromActivity } from '@/lib/data/activity-keywords';

export interface DomainSuggestion {
  domains: string[];
  confidence: 'high' | 'medium' | 'low';
  source: 'ape_code' | 'activity_text' | 'both' | 'default';
}

export function suggestDomainsFromPappersData(
  apeCode: string | null,
  activityLabel: string | null
): DomainSuggestion {
  const domainsFromAPE = apeCode ? getSuggestedDomainsFromAPE(apeCode) : [];
  const domainsFromText = activityLabel ? getSuggestedDomainsFromActivity(activityLabel) : [];
  
  // High confidence: Both sources agree
  if (domainsFromAPE.length > 0 && domainsFromText.length > 0) {
    const intersection = domainsFromAPE.filter(d => domainsFromText.includes(d));
    if (intersection.length > 0) {
      return {
        domains: intersection,
        confidence: 'high',
        source: 'both'
      };
    }
    
    // Medium confidence: Combine both sources
    const combined = [...new Set([...domainsFromAPE, ...domainsFromText])];
    return {
      domains: combined,
      confidence: 'medium',
      source: 'both'
    };
  }
  
  // Medium confidence: APE code only
  if (domainsFromAPE.length > 0) {
    return {
      domains: domainsFromAPE,
      confidence: 'medium',
      source: 'ape_code'
    };
  }
  
  // Low confidence: Activity text only
  if (domainsFromText.length > 0) {
    return {
      domains: domainsFromText,
      confidence: 'low',
      source: 'activity_text'
    };
  }
  
  // Default: No restriction (all domains available)
  return {
    domains: ['Informatique', 'Gestion', 'Commerce', 'Industrie', 'Santé', 'Éducation', 'Transport', 'Hôtellerie-Restauration', 'Bâtiment', 'Agriculture'],
    confidence: 'low',
    source: 'default'
  };
}
```

---

## 🎨 UI Implementation

### Update SIRET Autocomplete API:

```typescript
// app/api/siret/autocomplete/route.ts

import { suggestDomainsFromPappersData } from '@/lib/services/domain-suggestion-service';

const companyData = {
  name: data.nom_entreprise || data.denomination || 'Nom non disponible',
  address: data.siege?.adresse_ligne_1 || '',
  city: data.siege?.ville || '',
  postalCode: data.siege?.code_postal || '',
  sector: data.libelle_activite_principale || data.code_ape_entreprise || '',
  
  // NEW: Add domain suggestions
  apeCode: data.code_ape_entreprise || null,
  activityLabel: data.libelle_activite_principale || null,
  suggestedDomains: suggestDomainsFromPappersData(
    data.code_ape_entreprise,
    data.libelle_activite_principale
  )
};
```

### Update Center Profile Page:

```tsx
// app/profile/center/page.tsx

const handleSiretAutoComplete = async (siret: string) => {
  // ... existing code ...
  
  if (response.ok) {
    const data = await response.json();
    
    setFormData(prev => ({
      ...prev,
      establishmentName: data.name || '',
      address: data.address || '',
      city: data.city || '',
      postalCode: data.postalCode || '',
      sector: data.sector || ''
    }));
    
    // NEW: Pre-select suggested domains
    if (data.suggestedDomains?.domains) {
      setSelectedDomains(data.suggestedDomains.domains);
      setSuggestionConfidence(data.suggestedDomains.confidence);
    }
    
    setSiretValidated(true);
  }
};
```

### UI Display:

```tsx
{/* Domain Selection with Suggestions */}
<div className="space-y-2">
  <Label>Domaines de certification *</Label>
  
  {/* Show suggestion info if available */}
  {suggestionConfidence && (
    <Alert className={
      suggestionConfidence === 'high' ? 'border-green-500 bg-green-50' :
      suggestionConfidence === 'medium' ? 'border-blue-500 bg-blue-50' :
      'border-gray-500 bg-gray-50'
    }>
      <AlertDescription>
        {suggestionConfidence === 'high' && (
          <>
            ✅ <strong>Domaines suggérés</strong> basés sur votre code APE et activité
          </>
        )}
        {suggestionConfidence === 'medium' && (
          <>
            💡 <strong>Domaines suggérés</strong> basés sur votre activité déclarée
          </>
        )}
        {suggestionConfidence === 'low' && (
          <>
            ℹ️ Sélectionnez les domaines correspondant à votre activité
          </>
        )}
      </AlertDescription>
    </Alert>
  )}
  
  {/* Domain selection */}
  <Select onValueChange={handleDomainToggle}>
    <SelectTrigger>
      <SelectValue placeholder="Ajouter un domaine" />
    </SelectTrigger>
    <SelectContent>
      {CERTIFICATION_DOMAINS
        .filter(domain => !selectedDomains.includes(domain))
        .map((domain) => (
          <SelectItem key={domain} value={domain}>
            {domain}
            {/* Show checkmark if suggested */}
            {data.suggestedDomains?.domains.includes(domain) && ' ✓'}
          </SelectItem>
        ))}
    </SelectContent>
  </Select>
  
  {/* Selected domains */}
  {selectedDomains.length > 0 && (
    <div className="flex flex-wrap gap-2 mt-3">
      {selectedDomains.map((domain) => (
        <Badge 
          key={domain} 
          variant="secondary" 
          className={
            data.suggestedDomains?.domains.includes(domain)
              ? 'bg-green-100 text-green-800'
              : 'bg-[#e8faf5] text-[#0d4a70]'
          }
        >
          {domain}
          {data.suggestedDomains?.domains.includes(domain) && ' ✓'}
          <button
            type="button"
            onClick={() => removeDomain(domain)}
            className="ml-2 hover:text-red-500"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  )}
</div>
```

---

## 🎯 Benefits of This Approach

### 1. **Better User Experience**
- ✅ Domains auto-suggested based on company activity
- ✅ Reduces manual selection effort
- ✅ Guides users to relevant domains

### 2. **Data Quality**
- ✅ Domains aligned with actual business activity
- ✅ Reduces irrelevant domain selection
- ✅ Helps with RNCP validation later

### 3. **Validation Helper**
- ✅ Can flag mismatches (e.g., IT company selecting Agriculture)
- ✅ Provides context for admin validation
- ✅ Improves data consistency

### 4. **No Additional API Calls**
- ✅ Uses existing Pappers API data
- ✅ No extra cost
- ✅ No performance impact

---

## 🔄 Integration with RNCP Validation

### Combined Flow:

```
1. User enters SIRET
   ↓
2. Pappers API returns APE code + activity label
   ↓
3. System suggests relevant domains
   → "Informatique" for APE 62.01Z (IT company)
   ↓
4. User confirms/adjusts domain selection
   ↓
5. User checks "Je suis certificateur"
   ↓
6. User attaches RNCP certifications
   → e.g., RNCP37674 (Développeur web)
   ↓
7. System validates:
   ✅ RNCP domains match selected domains?
   ✅ RNCP domains align with APE code?
   ↓
8. Show warnings if mismatch detected:
   ⚠️ "Cette certification (Développeur web) ne correspond pas 
       à votre activité déclarée (Restauration - APE 56.10A)"
```

---

## 📊 Example Scenarios

### Scenario 1: IT Training Center
```
SIRET: 12345678901234
APE Code: 62.01Z (Programmation informatique)
Activity: "Programmation informatique"

Suggested Domains: ['Informatique'] ✅ High confidence
User attaches: RNCP37674 (Développeur web) ✅ Match!
Result: No warning, smooth validation
```

### Scenario 2: Multi-Domain Training Center
```
SIRET: 98765432109876
APE Code: 85.59A (Formation continue d'adultes)
Activity: "Formation continue d'adultes"

Suggested Domains: All domains ✅ Medium confidence
User selects: ['Informatique', 'Gestion', 'Commerce']
User attaches: RNCP37674, RNCP31114, RNCP35634
Result: All match, good validation
```

### Scenario 3: Mismatch Detection
```
SIRET: 11111111111111
APE Code: 56.10A (Restauration)
Activity: "Restauration traditionnelle"

Suggested Domains: ['Hôtellerie-Restauration'] ✅ High confidence
User attaches: RNCP37674 (Développeur web) ⚠️ Mismatch!

Warning: "⚠️ Cette certification (Informatique) ne correspond pas 
          à votre activité principale (Restauration). 
          Êtes-vous sûr d'être habilité à délivrer cette certification?"
```

---

## 🚀 Implementation Roadmap

### Phase 1: Basic APE Mapping (2-3 hours)
1. Create APE-to-domains mapping file
2. Update SIRET autocomplete API
3. Auto-suggest domains on SIRET validation
4. Test with various APE codes

### Phase 2: Text Analysis (1-2 hours)
5. Add activity keyword matching
6. Combine APE + text suggestions
7. Implement confidence scoring

### Phase 3: UI Enhancement (2 hours)
8. Show suggestion confidence in UI
9. Highlight suggested domains
10. Add helpful tooltips

### Phase 4: RNCP Validation (2 hours)
11. Cross-check RNCP domains with APE suggestions
12. Show warnings for mismatches
13. Log for admin review

**Total Time: 7-9 hours**

---

## ✅ Recommendation

**YES, implement this!** ⭐⭐⭐

**Why:**
1. ✅ Uses existing Pappers API data (no extra cost)
2. ✅ Significantly improves UX
3. ✅ Helps validate RNCP selections
4. ✅ Provides context for admin validation
5. ✅ Easy to implement (7-9 hours)
6. ✅ High value for data quality

**Start with Phase 1** (APE mapping) - it's the quickest win and provides immediate value!

---

## 📝 Next Steps

1. **Confirm approach**: Do you want to proceed with APE code mapping?
2. **Build mapping table**: I can create the complete APE-to-domains mapping
3. **Update API**: Modify SIRET autocomplete to return suggestions
4. **Update UI**: Show suggested domains with confidence indicators
5. **Test**: Validate with real SIRET numbers

Ready to implement? 🚀
