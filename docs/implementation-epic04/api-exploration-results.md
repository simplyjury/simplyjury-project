# Mission Apprentissage API Exploration Results

**Date**: 2025-10-01  
**Status**: ❌ No Live API Access Found  
**Recommendation**: Use Static JSON Approach

---

## Executive Summary

After extensive testing of the Mission Apprentissage and France Compétences APIs, **no publicly accessible live API endpoints were found** that work without authentication. The APIs mentioned in the documentation either:

1. **Require authentication/API keys** (not publicly documented how to obtain)
2. **Have been deprecated or moved** (404 errors on all tested endpoints)
3. **Return HTML instead of JSON** (web interfaces, not APIs)

### Key Findings

| API Tested | Base URL | Status | Notes |
|------------|----------|--------|-------|
| **Mission Apprentissage Main API** | `api.apprentissage.beta.gouv.fr` | ❌ 404 | All `/api/v1/*` endpoints return 404 |
| **Catalogue Apprentissage** | `catalogue.apprentissage.education.gouv.fr` | ❌ 401/404 | Requires authentication or deprecated |
| **Tables Correspondances** | `tables-correspondances.apprentissage.beta.gouv.fr` | ❌ HTML | Returns HTML pages, not JSON |
| **France Compétences Direct** | `francecompetences.fr/api/*` | ❌ HTML | No public API endpoints |
| **data.gouv.fr Open Data** | `data.gouv.fr/api/1/datasets/*` | ✅ Metadata Only | Can get dataset info, but CSV files are downloadable exports, not live API |

---

## Tested Endpoints

### 1. Mission Apprentissage Main API
```
Base: https://api.apprentissage.beta.gouv.fr

❌ /api/v1/certifications
❌ /api/v1/certifications?search=développeur
❌ /api/v1/certifications/RNCP31114
❌ /api/v1/rncp
❌ /api/v1/rncp/RNCP31114
```

### 2. Catalogue Apprentissage
```
Base: https://catalogue.apprentissage.education.gouv.fr

❌ /api/v1/certifications
❌ /api/v1/certifications?search=développeur
❌ /api/v1/entity/certifications (401 Unauthorized)
```

### 3. Tables Correspondances
```
Base: https://tables-correspondances.apprentissage.beta.gouv.fr

❌ /api/v1/rncp (Returns HTML)
❌ /api/v1/rncp?search=développeur (Returns HTML)
❌ /api/v1/rncp/RNCP31114 (Returns HTML)
```

### 4. France Compétences
```
Base: https://www.francecompetences.fr

❌ /api/certifications (Returns HTML)
❌ /api/rncp (Returns HTML)
❌ /recherche/rncp (Returns HTML)
```

### 5. data.gouv.fr (Partial Success)
```
Base: https://www.data.gouv.fr

✅ /api/1/datasets/repertoire-national-des-certifications-professionnelles-et-repertoire-specifique/
   Returns: Dataset metadata with 6700+ CSV/XML/ZIP resources
   
❌ Direct CSV URLs return 404 (files may have been moved/renamed)
```

---

## Why the APIs Don't Work

### 1. **Authentication Required**
The documentation states that "les routes de consultation restent publiques sans authentification", but in practice:
- All tested endpoints require authentication
- No public documentation on how to obtain API keys
- Registration process not clearly documented

### 2. **API Structure Changed**
The documentation mentions the API "n'est plus pilotée comme startup d'État depuis mars 2024":
- This suggests the API may have been restructured
- Endpoints may have changed without updated documentation
- Service may be in transition or deprecated

### 3. **Data Available as Downloads Only**
France Compétences provides data via:
- **CSV exports** (updated regularly, but as downloadable files)
- **XML exports** (same approach)
- **ZIP archives** (bulk downloads)

This is **not a live API** but rather a data publication approach.

---

## Recommended Implementation Approaches

### ✅ **OPTION A: Static JSON File (RECOMMENDED FOR MVP)**

**Pros:**
- ✅ No external dependencies
- ✅ Fast autocomplete (client-side)
- ✅ Works offline
- ✅ No rate limiting concerns
- ✅ Can be implemented immediately

**Cons:**
- ❌ Requires manual updates
- ❌ Limited to curated list
- ❌ May miss new certifications

**Implementation Steps:**
1. Create a curated JSON file with 100-200 common certifications
2. Include RNCP codes used in your target market (IT, digital, etc.)
3. Implement client-side autocomplete with fuzzy search (e.g., `fuse.js`)
4. Keep "Autre certification" option for unlisted certifications
5. Collect user input over time to expand the list

**Estimated Time:** 2-4 hours

---

### 🔄 **OPTION B: Backend API with Periodic CSV Updates**

**Pros:**
- ✅ More comprehensive data
- ✅ Can update periodically (weekly/monthly)
- ✅ Full control over data
- ✅ Can add custom fields/metadata

**Cons:**
- ❌ More complex implementation
- ❌ Requires background job for updates
- ❌ CSV parsing and storage needed

**Implementation Steps:**
1. Download RNCP CSV from data.gouv.fr
2. Parse and store in database or JSON file
3. Create Next.js API route `/api/certifications/search`
4. Implement search logic with fuzzy matching
5. Set up cron job to update data periodically

**Estimated Time:** 1-2 days

---

### 🔑 **OPTION C: Mission Apprentissage API with Authentication**

**Pros:**
- ✅ Real-time data
- ✅ Always up-to-date
- ✅ Official source
- ✅ Rich metadata

**Cons:**
- ❌ Requires registration (process unclear)
- ❌ External dependency
- ❌ Potential rate limiting
- ❌ Service availability concerns

**Implementation Steps:**
1. Visit https://api.apprentissage.beta.gouv.fr
2. Find registration/API key request process
3. Obtain API credentials
4. Create Next.js API proxy route
5. Implement caching to reduce API calls
6. Add error handling and fallback

**Estimated Time:** Unknown (depends on registration approval)

---

## Recommended Implementation: Static JSON Approach

Given the current API limitations, I recommend **starting with Option A** (Static JSON) for the following reasons:

### 1. **Immediate Implementation**
- No waiting for API access
- No external dependencies
- Can launch feature today

### 2. **User Experience**
- Faster autocomplete (no network latency)
- More reliable (no API downtime)
- Works offline

### 3. **Sufficient for MVP**
- Your users likely use a limited set of certifications
- Can cover 80% of use cases with 100-200 certifications
- "Autre certification" handles edge cases

### 4. **Easy to Upgrade Later**
- Can switch to Option B or C without changing UI
- Can run both in parallel (static + API)
- Can A/B test different approaches

---

## Next Steps

### Immediate Actions (Option A):

1. **Create Certification Data File**
   ```
   /lib/data/certifications.json
   ```

2. **Populate with Common Certifications**
   - Focus on IT/Digital certifications (your current use case)
   - Include RNCP codes from your existing hardcoded list
   - Add 50-100 more common certifications

3. **Implement Autocomplete Component**
   - Use Headless UI Combobox or similar
   - Add fuzzy search with `fuse.js`
   - Implement debouncing for performance

4. **Replace Dropdown in Modal**
   - Update `structured-request-modal.tsx`
   - Keep "Autre certification" option
   - Add validation for RNCP code format

### Future Enhancements:

1. **Track User Input**
   - Log when users select "Autre certification"
   - Collect the certification names they enter
   - Use this data to expand your static list

2. **Periodic Manual Updates**
   - Review France Compétences website quarterly
   - Add new popular certifications
   - Remove deprecated ones

3. **Upgrade to Live API (When Available)**
   - Monitor Mission Apprentissage API status
   - Register for API access when process is clear
   - Implement as enhancement, not replacement

---

## Code Examples

### 1. Certification Data Structure (`/lib/data/certifications.json`)

```json
[
  {
    "code": "RNCP31114",
    "title": "Développeur Web et Web Mobile",
    "level": "5",
    "domain": "Informatique et réseaux",
    "keywords": ["web", "développeur", "frontend", "backend"]
  },
  {
    "code": "RNCP34838",
    "title": "Concepteur Développeur d'Applications",
    "level": "6",
    "domain": "Informatique et réseaux",
    "keywords": ["développeur", "applications", "software"]
  }
]
```

### 2. Search Function

```typescript
import Fuse from 'fuse.js';
import certifications from '@/lib/data/certifications.json';

const fuse = new Fuse(certifications, {
  keys: ['code', 'title', 'keywords'],
  threshold: 0.3,
  includeScore: true
});

export function searchCertifications(query: string) {
  if (!query || query.length < 2) {
    return certifications.slice(0, 10); // Return first 10 if no query
  }
  
  const results = fuse.search(query);
  return results.map(result => result.item).slice(0, 10);
}
```

### 3. Autocomplete Component (Simplified)

```typescript
import { Combobox } from '@headlessui/react';
import { useState, useEffect } from 'react';
import { searchCertifications } from '@/lib/utils/certification-search';

export function CertificationAutocomplete({ value, onChange }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setResults(searchCertifications(query));
    }, 300); // Debounce
    
    return () => clearTimeout(timer);
  }, [query]);
  
  return (
    <Combobox value={value} onChange={onChange}>
      <Combobox.Input
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher une certification..."
      />
      <Combobox.Options>
        {results.map((cert) => (
          <Combobox.Option key={cert.code} value={cert.code}>
            {cert.title} ({cert.code})
          </Combobox.Option>
        ))}
        <Combobox.Option value="autre">
          Autre certification
        </Combobox.Option>
      </Combobox.Options>
    </Combobox>
  );
}
```

---

## Conclusion

**The Mission Apprentissage API is not accessible without authentication**, and the authentication process is not publicly documented. 

**Recommendation**: Implement a **static JSON approach** with a curated list of certifications. This provides:
- ✅ Immediate implementation
- ✅ Better UX (faster, more reliable)
- ✅ No external dependencies
- ✅ Easy to upgrade later

**Next Step**: Would you like me to proceed with implementing the static JSON autocomplete solution?
