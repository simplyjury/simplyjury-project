# UPDATED: Mission Apprentissage API - Authentication Required ✅

**Date**: 2025-10-01  
**Status**: ✅ **API EXISTS - REQUIRES REGISTRATION**  
**Update**: You were correct! The API requires authentication via registration.

---

## 🎯 Key Discovery

The Mission Apprentissage API **DOES EXIST** and **IS FUNCTIONAL**, but requires:

1. **Account Registration** at: https://api.apprentissage.beta.gouv.fr/fr/compte/profil
2. **API Token (Jeton d'accès)** obtained after registration
3. **Authentication** for API calls

---

## 📍 Important URLs

### Registration & Access
- **Main Portal**: https://api.apprentissage.beta.gouv.fr
- **Account/Registration**: https://api.apprentissage.beta.gouv.fr/fr/compte/profil (Click "Se connecter / S'inscrire")
- **API Explorer**: https://api.apprentissage.beta.gouv.fr/fr/explorer
- **Technical Documentation (Swagger)**: https://api.apprentissage.beta.gouv.fr/fr/documentation-technique

### Certifications API
- **Documentation**: https://api.apprentissage.beta.gouv.fr/fr/explorer/certifications
- **Endpoint**: `/api/v1/certifications` (requires authentication)
- **Update Frequency**: Daily ("TOUS LES JOURS")

---

## 🔑 Registration Process

### Step 1: Create Account
1. Visit: https://api.apprentissage.beta.gouv.fr/fr/compte/profil
2. Click "Se connecter / S'inscrire" (Login / Register)
3. Complete registration form
4. Verify email (if required)

### Step 2: Obtain API Token
1. Log into your account
2. Navigate to profile/settings
3. Generate API token ("Obtenir un jeton d'accès")
4. Copy and securely store the token

### Step 3: Test API Access
1. Use token in API requests
2. Consult Swagger documentation for endpoint details
3. Test with certifications endpoint

---

## 🔧 API Implementation Approach

### Authentication Method

Based on standard practices, the API likely uses one of these methods:

**Option A: Bearer Token (Most Common)**
```bash
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
  https://api.apprentissage.beta.gouv.fr/api/v1/certifications
```

**Option B: API Key Header**
```bash
curl -H "X-API-Key: YOUR_API_TOKEN" \
  https://api.apprentissage.beta.gouv.fr/api/v1/certifications
```

**Option C: Query Parameter**
```bash
curl https://api.apprentissage.beta.gouv.fr/api/v1/certifications?api_key=YOUR_API_TOKEN
```

The Swagger documentation will specify the exact method.

---

## 📋 Updated Implementation Plan

### OPTION A: Live API with Authentication (RECOMMENDED NOW) ✅

**Pros:**
- ✅ Real-time, always up-to-date data
- ✅ Official source from France Compétences
- ✅ Daily updates
- ✅ Complete certification database
- ✅ No manual maintenance required

**Cons:**
- ⏳ Requires registration (1-2 days approval?)
- 🔐 Need to manage API credentials securely
- 📡 External dependency (API availability)
- 🚦 Potential rate limiting

**Implementation Steps:**

1. **Register for API Access** (You do this)
   - Visit https://api.apprentissage.beta.gouv.fr/fr/compte/profil
   - Complete registration
   - Obtain API token
   - Check Swagger docs for endpoint details

2. **Store API Credentials Securely** (30 minutes)
   ```env
   # .env.local
   MISSION_APPRENTISSAGE_API_KEY=your_token_here
   MISSION_APPRENTISSAGE_API_URL=https://api.apprentissage.beta.gouv.fr
   ```

3. **Create Next.js API Proxy Route** (1 hour)
   ```
   /app/api/certifications/search/route.ts
   ```
   - Proxy requests to Mission Apprentissage API
   - Add caching (Redis or in-memory)
   - Handle rate limiting
   - Error handling with fallback

4. **Implement Autocomplete Component** (2 hours)
   - Same as before (Headless UI + debouncing)
   - Call your Next.js API route
   - Loading states
   - Error handling

5. **Testing** (1 hour)
   - Test search functionality
   - Test with various queries
   - Test error scenarios
   - Performance testing

**Total Time: 4-5 hours** (after API access granted)

---

### OPTION B: Hybrid Approach (BEST OF BOTH WORLDS) ⭐

**Combine Static JSON + Live API**

**How it works:**
1. Start with static JSON (immediate implementation)
2. Register for API access in parallel
3. Once API access granted, add live API as enhancement
4. Use static JSON as fallback if API fails

**Benefits:**
- ✅ Launch feature immediately (no waiting)
- ✅ Upgrade to live API when ready
- ✅ Fallback if API is down
- ✅ Best user experience

**Implementation:**
```typescript
// lib/services/certification-service.ts
import staticCertifications from '@/lib/data/certifications.json';

export async function searchCertifications(query: string) {
  try {
    // Try live API first
    if (process.env.MISSION_APPRENTISSAGE_API_KEY) {
      const response = await fetch('/api/certifications/search?q=' + query);
      if (response.ok) {
        return await response.json();
      }
    }
  } catch (error) {
    console.error('API failed, using static data', error);
  }
  
  // Fallback to static data
  return searchStaticCertifications(query);
}
```

---

## 🚀 Recommended Action Plan

### Immediate Actions (Today)

1. **Register for API Access**
   - Visit: https://api.apprentissage.beta.gouv.fr/fr/compte/profil
   - Complete registration form
   - Note: May require approval (check email for confirmation)

2. **While Waiting for Approval**
   - Implement static JSON solution (Option A from original plan)
   - This allows you to launch the feature immediately
   - Users can start using autocomplete today

### After API Access Granted (1-3 days)

3. **Review Swagger Documentation**
   - Check exact endpoint paths
   - Verify authentication method
   - Check rate limits
   - Review response structure

4. **Implement API Integration**
   - Create Next.js API proxy route
   - Add authentication
   - Implement caching
   - Test thoroughly

5. **Deploy Hybrid Solution**
   - Keep static JSON as fallback
   - Use live API as primary source
   - Monitor performance and errors

---

## 🔒 Security Best Practices

### API Key Management

1. **Never commit API keys to git**
   ```gitignore
   .env.local
   .env.production
   ```

2. **Use environment variables**
   ```typescript
   const API_KEY = process.env.MISSION_APPRENTISSAGE_API_KEY;
   if (!API_KEY) {
     throw new Error('API key not configured');
   }
   ```

3. **Server-side only**
   - Never expose API key to client
   - Always proxy through Next.js API routes
   - Use server components or API routes

4. **Rotate keys regularly**
   - Set reminder to rotate every 6 months
   - Have backup key ready for zero-downtime rotation

---

## 📊 Expected Response Structure

Based on the documentation, the certifications API likely returns:

```json
{
  "certifications": [
    {
      "identifiant": {
        "cfd": "50022137",
        "rncp": "RNCP37537",
        "rncp_anterieur_2019": false
      },
      "intitule": {
        "long": "Développeur Web et Web Mobile",
        "court": "Dev Web"
      },
      "niveau": {
        "europeen": "5",
        "formation_diplome": "III"
      },
      "domaine": "Informatique et réseaux",
      "date_creation": "2021-01-01",
      "actif": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1234
  }
}
```

(Exact structure will be confirmed in Swagger docs)

---

## 🎯 Success Metrics

### Phase 1: Static JSON (Week 1)
- ✅ Feature deployed
- ✅ Users can search certifications
- ✅ Form submissions work

### Phase 2: Live API Integration (Week 2-3)
- ✅ API access granted
- ✅ Live API integrated
- ✅ Caching implemented
- 📊 API response time < 500ms
- 📊 Cache hit rate > 80%

### Phase 3: Monitoring (Ongoing)
- 📊 API uptime > 99%
- 📊 Fallback usage < 1%
- 📊 User satisfaction with search
- 📊 Reduction in "Autre certification" usage

---

## ❓ Questions to Answer After Registration

Once you have API access, check:

1. **Authentication Method**: Bearer token? API key header? Query param?
2. **Rate Limits**: Requests per minute/hour/day?
3. **Search Parameters**: What query parameters are supported?
4. **Response Format**: Exact JSON structure?
5. **Pagination**: How to handle large result sets?
6. **Filtering**: Can we filter by domain, level, active status?
7. **Caching**: Are there cache headers? Can we cache responses?
8. **Error Codes**: What errors can occur? How to handle them?

---

## 📝 Next Steps Summary

### You Need To Do:
1. ✅ **Register at**: https://api.apprentissage.beta.gouv.fr/fr/compte/profil
2. ✅ **Obtain API token** from your account
3. ✅ **Share token with me** (securely - via environment variable)
4. ✅ **Review Swagger docs** to understand endpoint details

### I Will Do:
1. ⏳ **Implement static JSON solution** (while waiting for API access)
2. ⏳ **Create API proxy route** (once you have token)
3. ⏳ **Build autocomplete component**
4. ⏳ **Integrate into modal**
5. ⏳ **Test and deploy**

---

## 🎉 Conclusion

**You were absolutely right!** The API does exist and requires authentication. This is actually **BETTER** than the static approach because:

1. ✅ Always up-to-date data (daily updates)
2. ✅ Complete certification database
3. ✅ No manual maintenance
4. ✅ Official source

**Recommended approach**: 
- Start with static JSON today (launch feature immediately)
- Register for API access in parallel
- Upgrade to live API when access is granted
- Keep static as fallback

This gives you the best of both worlds: immediate launch + future-proof solution.

---

**Ready to proceed?** Let me know once you've registered and I'll implement the solution!
