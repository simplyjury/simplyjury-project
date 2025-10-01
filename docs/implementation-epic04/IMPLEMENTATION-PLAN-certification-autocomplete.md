# Implementation Plan: Certification Autocomplete

**Feature**: Replace static dropdown with autocomplete for certifications  
**Location**: Structured Request Modal (`/dashboard/search`)  
**Status**: Ready to Implement  
**Approach**: Static JSON with Client-Side Search

---

## Summary of API Exploration

After testing all documented endpoints:
- ❌ Mission Apprentissage API requires authentication (no public access)
- ❌ Catalogue Apprentissage returns 401/404 errors
- ❌ France Compétences has no public API
- ✅ Data available as CSV downloads from data.gouv.fr (not live API)

**Decision**: Implement static JSON approach with curated certification list.

---

## Implementation Steps

### Phase 1: Create Certification Data (30 minutes)

**File**: `/lib/data/certifications.json`

Create a comprehensive list of French certifications focusing on:
- IT and Digital (primary use case)
- Business and Management
- Other common professional certifications

**Structure**:
```json
[
  {
    "code": "RNCP31114",
    "title": "Développeur Web et Web Mobile",
    "level": "5",
    "domain": "Informatique et réseaux",
    "active": true
  }
]
```

### Phase 2: Install Dependencies (5 minutes)

```bash
pnpm add fuse.js @headlessui/react
```

- **fuse.js**: Fuzzy search library for autocomplete
- **@headlessui/react**: Accessible Combobox component

### Phase 3: Create Search Utility (30 minutes)

**File**: `/lib/utils/certification-search.ts`

Implement:
- Fuzzy search with fuse.js
- Search by code, title, and keywords
- Return top 10 results
- Handle empty queries

### Phase 4: Create Autocomplete Component (1-2 hours)

**File**: `/components/ui/certification-autocomplete.tsx`

Features:
- Headless UI Combobox integration
- Debounced search (300ms)
- Loading states
- Empty states
- Keyboard navigation
- Mobile-friendly
- Matches existing design system

### Phase 5: Update Structured Request Modal (30 minutes)

**File**: `/components/jury/structured-request-modal.tsx`

Changes:
- Replace `<select>` with `<CertificationAutocomplete>`
- Keep "Autre certification" option
- Maintain existing validation
- Update form state handling

### Phase 6: Testing (30 minutes)

Test:
- Search functionality (various queries)
- Keyboard navigation
- Mobile responsiveness
- Form submission with selected certification
- "Autre certification" fallback
- Validation errors

---

## Detailed Implementation

### 1. Certification Data File

**Location**: `/lib/data/certifications.json`

**Content**: 100+ certifications covering:
- Informatique et réseaux (20+)
- Management et gestion (15+)
- Commerce et vente (10+)
- Ressources humaines (10+)
- Marketing et communication (10+)
- Other domains (35+)

### 2. Search Utility

**Location**: `/lib/utils/certification-search.ts`

```typescript
import Fuse from 'fuse.js';
import certificationsData from '@/lib/data/certifications.json';

export interface Certification {
  code: string;
  title: string;
  level: string;
  domain: string;
  active: boolean;
}

const fuse = new Fuse<Certification>(certificationsData, {
  keys: [
    { name: 'code', weight: 2 },
    { name: 'title', weight: 3 },
    { name: 'domain', weight: 1 }
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2
});

export function searchCertifications(query: string, limit: number = 10): Certification[] {
  if (!query || query.trim().length < 2) {
    return certificationsData.filter(c => c.active).slice(0, limit);
  }
  
  const results = fuse.search(query.trim());
  return results
    .filter(result => result.item.active)
    .map(result => result.item)
    .slice(0, limit);
}

export function getCertificationByCode(code: string): Certification | undefined {
  return certificationsData.find(c => c.code === code);
}
```

### 3. Autocomplete Component

**Location**: `/components/ui/certification-autocomplete.tsx`

Key features:
- Combobox from Headless UI
- Debounced search
- Custom styling matching brand guidelines
- Accessible (ARIA labels, keyboard nav)
- Loading indicator
- "Autre certification" always visible

### 4. Modal Integration

**Changes to**: `/components/jury/structured-request-modal.tsx`

Replace lines 208-227 (certification dropdown) with:
```tsx
<CertificationAutocomplete
  value={formData.certificationType}
  onChange={(value) => handleInputChange('certificationType', value)}
  error={errors.certificationType}
/>
```

---

## Benefits of This Approach

### 1. **User Experience**
- ✅ Fast autocomplete (no network latency)
- ✅ Fuzzy search (handles typos)
- ✅ Keyboard navigation
- ✅ Mobile-friendly

### 2. **Technical**
- ✅ No external API dependencies
- ✅ Works offline
- ✅ No rate limiting
- ✅ Predictable performance

### 3. **Maintenance**
- ✅ Easy to update (edit JSON file)
- ✅ Can track user input for improvements
- ✅ Can upgrade to live API later without UI changes

### 4. **Business**
- ✅ Immediate implementation (no API registration wait)
- ✅ No ongoing API costs
- ✅ Full control over data

---

## Future Enhancements

### Short Term (1-2 months)
1. **Track "Autre certification" usage**
   - Log when users select this option
   - Collect certification names they enter
   - Use data to expand static list

2. **Add certification categories**
   - Group by domain in dropdown
   - Add domain filter

3. **Add certification details**
   - Show level (5, 6, 7, 8)
   - Show domain
   - Add tooltip with more info

### Medium Term (3-6 months)
1. **Periodic updates**
   - Download RNCP CSV quarterly
   - Parse and update JSON file
   - Automated script for updates

2. **Admin interface**
   - Allow admins to add/edit certifications
   - Approve user-suggested certifications
   - Manage certification metadata

### Long Term (6+ months)
1. **Live API integration**
   - Monitor Mission Apprentissage API status
   - Register for API access when available
   - Implement as enhancement (not replacement)
   - Keep static list as fallback

2. **Machine learning**
   - Suggest certifications based on jury expertise
   - Predict certification from session description
   - Auto-categorize user-entered certifications

---

## Testing Checklist

### Functional Testing
- [ ] Search returns relevant results
- [ ] Fuzzy search handles typos
- [ ] Empty query shows popular certifications
- [ ] "Autre certification" always visible
- [ ] Selected certification populates form
- [ ] Form validation works
- [ ] Form submission includes certification

### UX Testing
- [ ] Debouncing works (no lag)
- [ ] Loading states display correctly
- [ ] Empty states display correctly
- [ ] Keyboard navigation works (Tab, Enter, Escape, Arrow keys)
- [ ] Click outside closes dropdown
- [ ] Selected value displays correctly

### Responsive Testing
- [ ] Works on mobile (320px+)
- [ ] Works on tablet (768px+)
- [ ] Works on desktop (1024px+)
- [ ] Touch interactions work
- [ ] Dropdown doesn't overflow screen

### Accessibility Testing
- [ ] Screen reader compatible
- [ ] ARIA labels present
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard-only navigation works

### Performance Testing
- [ ] Search completes in <100ms
- [ ] No memory leaks
- [ ] Handles 1000+ certifications
- [ ] Debouncing prevents excessive renders

---

## Rollback Plan

If issues arise:
1. Keep old dropdown code commented
2. Feature flag to toggle between dropdown/autocomplete
3. Can revert in <5 minutes

---

## Success Metrics

### Immediate (Week 1)
- ✅ Feature deployed without errors
- ✅ Users can search and select certifications
- ✅ Form submissions work correctly

### Short Term (Month 1)
- 📊 % of users using search vs "Autre certification"
- 📊 Average time to select certification (should decrease)
- 📊 Most searched certification terms
- 📊 User feedback on autocomplete

### Long Term (Quarter 1)
- 📊 Reduction in "Autre certification" usage
- 📊 Increase in structured request completions
- 📊 User satisfaction scores

---

## Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| 1. Create certification data | 30 min | None |
| 2. Install dependencies | 5 min | None |
| 3. Create search utility | 30 min | Phase 1, 2 |
| 4. Create autocomplete component | 2 hours | Phase 2, 3 |
| 5. Update modal | 30 min | Phase 4 |
| 6. Testing | 30 min | Phase 5 |
| **Total** | **4-5 hours** | |

---

## Ready to Implement?

All exploration is complete. The implementation plan is ready.

**Next step**: Shall I proceed with the implementation?

1. ✅ Create certification data file
2. ✅ Install dependencies
3. ✅ Build autocomplete component
4. ✅ Integrate into modal
5. ✅ Test and deploy

Let me know if you'd like me to start implementing!
