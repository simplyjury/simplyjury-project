# Analysis: Domain Selection Based on RNCP Certifications

**Date**: 2025-10-03  
**Request**: Replace hardcoded domain selection with RNCP-based domain selection for training centers  
**Status**: ✅ **FEASIBLE - MEDIUM COMPLEXITY**

---

## 📋 Current Situation

### Current Implementation (Center Signup)
**File**: `/app/profile/center/page.tsx`

**Current Flow:**
1. Center enters SIRET number
2. Pappers API auto-fills: name, address, city, postal code, sector
3. Qualiopi API checks certification status
4. **User manually selects from hardcoded domain list:**
   ```typescript
   const CERTIFICATION_DOMAINS = [
     'Informatique', 'Gestion', 'Commerce', 'Industrie',
     'Santé', 'Éducation', 'Transport', 'Hôtellerie-Restauration',
     'Bâtiment', 'Agriculture'
   ];
   ```
5. User checks "isCertificateur" checkbox if applicable
6. Profile is created

**Problem**: Domains are generic and not linked to actual RNCP certifications the center is authorized to deliver.

---

## 🎯 Desired Implementation

### New Flow (RNCP-Based Domains)

**For Certificateurs (isCertificateur = true):**
1. Center enters SIRET
2. Auto-fill basic info (existing)
3. **Center attaches RNCP certifications** (already implemented!)
4. **System extracts domains from RNCP certifications**
5. **User selects only from extracted domains**
6. Profile is created with validated domains

**For Non-Certificateurs:**
- Keep current hardcoded list OR
- Allow manual selection with disclaimer

---

## 🔍 Technical Analysis

### ✅ What We Already Have

1. **RNCP Certification System** (Fully Implemented)
   - RNCP input component with validation
   - API to attach certifications to centers
   - Database storage with full certification details in JSONB
   - Mission Apprentissage API integration

2. **Domain Data in RNCP Response**
   The `certification_details` JSONB field contains rich domain information:
   
   ```json
   {
     "domaines": {
       "nsf": {
         "rncp": [
           {
             "code": "326t",
             "intitule": "326t : Programmation, mise en place de logiciels"
           }
         ]
       },
       "rome": {
         "rncp": [
           {
             "code": "M1805",
             "intitule": "Études et développement informatique"
           }
         ]
       },
       "formacodes": {
         "rncp": [
           {
             "code": "31090",
             "intitule": "Développement web"
           },
           {
             "code": "46357",
             "intitule": "Qualité web"
           }
         ]
       }
     },
     "blocs_competences": {
       "rncp": [
         {
           "code": "RNCP37674BC02",
           "intitule": "Développer la partie back-end d'une application web..."
         },
         {
           "code": "RNCP37674BC01",
           "intitule": "Développer la partie front-end d'une application web..."
         }
       ]
     }
   }
   ```

3. **Database Schema**
   - `france_competence_certifications` table with `certification_details` JSONB
   - GIN index for efficient JSONB queries
   - Relationship: `training_centers` ←→ `france_competence_certifications`

---

## 🏗️ Implementation Strategy

### **OPTION 1: Sequential Flow (Recommended)** ⭐

**Complexity**: Medium  
**Time Estimate**: 4-6 hours  
**User Experience**: Best

#### Flow:
```
1. User enters SIRET → Auto-fill basic info
   ↓
2. User checks "Je suis certificateur" checkbox
   ↓
3. IF certificateur:
   → Show RNCP attachment section
   → User attaches 1+ RNCP certifications
   → System extracts domains from certifications
   → User selects from extracted domains only
   ↓
4. ELSE (not certificateur):
   → Show hardcoded domain list
   → User selects manually
   ↓
5. Complete profile creation
```

#### Implementation Steps:

**Step 1: Modify Signup Flow** (2 hours)
- Add RNCP attachment section to `/app/profile/center/page.tsx`
- Show/hide based on `isCertificateur` checkbox
- Reuse existing `AddCertificationModal` component
- Store attached certifications in component state

**Step 2: Extract Domains from RNCP** (1 hour)
```typescript
// New utility function
function extractDomainsFromCertifications(certifications: any[]): string[] {
  const domains = new Set<string>();
  
  certifications.forEach(cert => {
    const details = cert.certification_details;
    
    // Extract from NSF codes (most relevant)
    details?.domaines?.nsf?.rncp?.forEach((nsf: any) => {
      domains.add(nsf.intitule);
    });
    
    // Extract from formacodes (specific skills)
    details?.domaines?.formacodes?.rncp?.forEach((fc: any) => {
      domains.add(fc.intitule);
    });
    
    // Extract from blocs de compétences
    details?.blocs_competences?.rncp?.forEach((bloc: any) => {
      domains.add(bloc.intitule);
    });
  });
  
  return Array.from(domains).sort();
}
```

**Step 3: Update Domain Selection UI** (1 hour)
```typescript
// Conditional domain source
const availableDomains = formData.isCertificateur && attachedCertifications.length > 0
  ? extractDomainsFromCertifications(attachedCertifications)
  : CERTIFICATION_DOMAINS; // Fallback to hardcoded

// Update Select component to use availableDomains
<Select onValueChange={handleDomainToggle}>
  <SelectContent>
    {availableDomains.filter(d => !selectedDomains.includes(d)).map(domain => (
      <SelectItem key={domain} value={domain}>
        {domain}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Step 4: Save Certifications with Profile** (1 hour)
- Modify `/api/profile/center` POST endpoint
- Accept `certifications` array in request body
- Create training center first
- Then attach certifications to center
- Transaction to ensure atomicity

**Step 5: Validation & Testing** (1 hour)
- Ensure at least 1 certification if certificateur
- Validate domain selection matches RNCP domains
- Test edge cases (no certifications, invalid RNCP, etc.)

---

### **OPTION 2: Post-Creation Flow (Simpler)**

**Complexity**: Low  
**Time Estimate**: 2-3 hours  
**User Experience**: Good (2-step process)

#### Flow:
```
1. User completes profile with hardcoded domains (existing flow)
   ↓
2. Profile created, redirect to dashboard
   ↓
3. IF certificateur:
   → Show onboarding modal: "Attach your certifications"
   → User attaches RNCP certifications
   → System updates domains based on certifications
   ↓
4. User can manage certifications in /dashboard/certifications
```

#### Pros:
- ✅ Simpler implementation
- ✅ Doesn't change existing signup flow
- ✅ Certifications managed in dedicated page

#### Cons:
- ❌ Two-step process (less streamlined)
- ❌ Initial domains might be incorrect
- ❌ Requires domain update logic

---

### **OPTION 3: Hybrid Approach (Most Flexible)**

**Complexity**: Medium-High  
**Time Estimate**: 6-8 hours  
**User Experience**: Excellent

#### Features:
1. **During Signup**: Allow both RNCP-based AND manual domain selection
2. **RNCP Domains**: Auto-extracted and pre-selected
3. **Manual Override**: User can add/remove domains
4. **Validation**: Warn if selected domains don't match RNCP
5. **Post-Creation**: Can update via certification management page

#### Implementation:
- Combine Option 1 + Option 2
- Add domain validation logic
- Show warnings for mismatches
- Allow flexibility for edge cases

---

## 📊 Data Mapping Strategy

### Domain Extraction Priority

**1. NSF Codes (Nomenclature des Spécialités de Formation)**
- Most relevant for training domains
- Example: `"326t : Programmation, mise en place de logiciels"`
- **Use as primary source**

**2. Formacodes**
- Specific skill areas
- Example: `"Développement web"`, `"Qualité web"`
- **Use as secondary source**

**3. Blocs de Compétences**
- Competency blocks
- Example: `"Développer la partie back-end d'une application web..."`
- **Use for detailed granularity** (optional)

**4. ROME Codes**
- Job market codes
- Less relevant for certification domains
- **Skip or use as tertiary source**

### Domain Normalization

**Challenge**: API returns specific domains, but we need broader categories

**Solution**: Create a mapping table

```typescript
// Domain mapping from specific to general
const DOMAIN_MAPPING: Record<string, string> = {
  // Informatique
  'Programmation, mise en place de logiciels': 'Informatique',
  'Développement web': 'Informatique',
  'Sécurité informatique': 'Informatique',
  
  // Commerce
  'Logiciel gestion de contenu e-commerce': 'Commerce',
  'Techniques de commercialisation': 'Commerce',
  
  // Add more mappings...
};

function normalizeToGeneralDomain(specificDomain: string): string {
  return DOMAIN_MAPPING[specificDomain] || specificDomain;
}
```

**Alternative**: Use both specific AND general domains
- Store specific domains from RNCP
- Display general categories in UI
- Map between them for search/filtering

---

## 🔒 Security & Validation

### Validation Rules

1. **Certificateur Validation**
   ```typescript
   if (formData.isCertificateur) {
     if (attachedCertifications.length === 0) {
       throw new Error('Les certificateurs doivent attacher au moins une certification RNCP');
     }
     
     if (selectedDomains.length === 0) {
       throw new Error('Sélectionnez au moins un domaine de certification');
     }
     
     // Validate domains match RNCP
     const rncpDomains = extractDomainsFromCertifications(attachedCertifications);
     const invalidDomains = selectedDomains.filter(d => !rncpDomains.includes(d));
     
     if (invalidDomains.length > 0) {
       console.warn('Domains not in RNCP:', invalidDomains);
       // Allow but log warning
     }
   }
   ```

2. **Data Integrity**
   - Ensure certifications are saved before profile creation
   - Use database transactions
   - Rollback if any step fails

3. **RNCP Validation**
   - Verify RNCP codes are valid (already implemented)
   - Check certification is active
   - Prevent duplicate certifications

---

## 🎨 UI/UX Considerations

### User Flow Enhancements

**1. Progressive Disclosure**
```
☐ Je suis certificateur
   ↓ (if checked)
   [Show RNCP attachment section]
   
   "Attachez vos certifications RNCP pour sélectionner automatiquement 
    vos domaines de compétences"
   
   [+ Ajouter une certification RNCP]
   
   Certifications attachées:
   ✓ RNCP37674 - Développeur web et web mobile
   ✓ RNCP38565 - Accompagnant éducatif petite enfance
   
   Domaines extraits:
   • Programmation, mise en place de logiciels
   • Développement web
   • Sécurité informatique
   • Accompagnement éducatif
   
   [Sélectionner les domaines →]
```

**2. Visual Feedback**
- Show extracted domains with checkmarks
- Highlight RNCP-validated domains
- Warn if manual domain added (not in RNCP)

**3. Help Text**
```
💡 Les domaines sont automatiquement extraits de vos certifications RNCP.
   Cela garantit que vous ne proposez que des formations pour lesquelles 
   vous êtes habilité.
```

---

## 🚧 Challenges & Solutions

### Challenge 1: Domain Granularity Mismatch
**Problem**: RNCP domains are very specific, UI needs broader categories

**Solutions**:
- **A**: Create mapping table (specific → general)
- **B**: Use both levels (specific for validation, general for display)
- **C**: Let users select from specific domains, group in UI

**Recommendation**: Option B (dual-level system)

### Challenge 2: Timing of Certification Attachment
**Problem**: When to attach certifications in signup flow?

**Solutions**:
- **A**: During signup (Option 1) - Best UX, more complex
- **B**: After signup (Option 2) - Simpler, two-step process
- **C**: Optional during signup (Option 3) - Most flexible

**Recommendation**: Option A for certificateurs, Option B as fallback

### Challenge 3: Non-Certificateur Centers
**Problem**: What domains do they select?

**Solutions**:
- **A**: Keep hardcoded list (current behavior)
- **B**: Allow free text input (risky)
- **C**: Use RNCP database for suggestions (complex)

**Recommendation**: Option A (hardcoded list for non-certificateurs)

### Challenge 4: Existing Centers
**Problem**: Centers already created with hardcoded domains

**Solutions**:
- **Migration Script**: Update existing certificateurs
- **Prompt**: Ask to update domains on next login
- **Gradual**: Update as they attach certifications

**Recommendation**: Gradual update + migration script for active certificateurs

---

## 📈 Complexity Assessment

### Development Complexity: **MEDIUM** (6/10)

**Easy Parts** (Already Done):
- ✅ RNCP certification system exists
- ✅ API integration working
- ✅ Data storage in place
- ✅ UI components available

**Medium Parts** (Need Implementation):
- 🔨 Domain extraction logic
- 🔨 UI flow modification
- 🔨 Validation rules
- 🔨 API endpoint updates

**Complex Parts** (Require Careful Design):
- 🔧 Domain normalization/mapping
- 🔧 Transaction management
- 🔧 Migration for existing data
- 🔧 Edge case handling

### Time Estimates

| Task | Option 1 | Option 2 | Option 3 |
|------|----------|----------|----------|
| Domain extraction logic | 1h | 1h | 1h |
| UI modifications | 2h | 1h | 3h |
| API updates | 1h | 0.5h | 1.5h |
| Validation | 1h | 0.5h | 1.5h |
| Testing | 1h | 0.5h | 2h |
| **Total** | **6h** | **3.5h** | **9h** |

---

## ✅ Recommended Approach

### **OPTION 1: Sequential Flow** ⭐

**Why:**
1. ✅ Best user experience (single flow)
2. ✅ Ensures data accuracy from start
3. ✅ Leverages existing RNCP system
4. ✅ Clear validation rules
5. ✅ Medium complexity (manageable)

### Implementation Roadmap

**Phase 1: Core Implementation** (4-6 hours)
1. Add RNCP attachment to signup flow
2. Implement domain extraction
3. Update domain selection UI
4. Modify API endpoint

**Phase 2: Polish & Validation** (2-3 hours)
5. Add validation rules
6. Improve error handling
7. Add help text & tooltips
8. Test edge cases

**Phase 3: Migration** (1-2 hours)
9. Create migration script for existing centers
10. Update documentation
11. Deploy gradually

**Total Time: 7-11 hours**

---

## 🎯 Success Criteria

### Functional Requirements
- ✅ Certificateurs can only select RNCP-validated domains
- ✅ Non-certificateurs use hardcoded list
- ✅ Domains accurately reflect attached certifications
- ✅ Validation prevents invalid domain selection
- ✅ Existing centers can update domains

### Technical Requirements
- ✅ Domain extraction from JSONB efficient (< 100ms)
- ✅ Transaction safety for profile + certifications
- ✅ Proper error handling and rollback
- ✅ Database queries optimized

### UX Requirements
- ✅ Clear flow for certificateurs
- ✅ Helpful guidance and tooltips
- ✅ Visual feedback for RNCP-validated domains
- ✅ Smooth signup experience (< 5 minutes)

---

## 📝 Next Steps

### Immediate Actions

1. **Decide on Option** (You choose: 1, 2, or 3)
2. **Review domain mapping strategy** (specific vs general)
3. **Confirm UI flow** (when to attach certifications)

### Development Tasks (If Option 1 chosen)

1. Create domain extraction utility
2. Modify signup page UI
3. Update API endpoint
4. Add validation logic
5. Test thoroughly
6. Create migration script
7. Deploy

---

## 🎉 Conclusion

**Feasibility**: ✅ **YES - Definitely Possible**

**Complexity**: 🟡 **MEDIUM**
- Not trivial, but very doable
- Leverages existing infrastructure
- Clear implementation path

**Value**: 🟢 **HIGH**
- Ensures data accuracy
- Better user experience
- Validates center capabilities
- Aligns with RNCP standards

**Recommendation**: **PROCEED with Option 1**
- Best balance of UX and complexity
- Builds on existing RNCP system
- Provides immediate value
- Manageable development effort

**Estimated Total Time**: 7-11 hours (including testing & migration)

---

## 📞 Questions to Answer

Before starting implementation:

1. **Domain Level**: Use specific RNCP domains or map to general categories?
2. **Non-Certificateurs**: Keep hardcoded list or different approach?
3. **Existing Centers**: Migration strategy? Force update or gradual?
4. **Validation**: Strict (RNCP only) or flexible (allow manual)?
5. **UI Flow**: Attach certifications during signup or after?

Once these are decided, implementation can proceed smoothly! 🚀
