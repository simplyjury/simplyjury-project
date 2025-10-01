# RNCP Search Filter Implementation - Jury Centers Page

**Date**: 2025-10-01  
**Status**: ✅ **COMPLETE**

---

## 🎯 Feature Overview

Added the ability for juries to search training centers by RNCP certification code on the `/dashboard/jury/centres` page. The implementation includes an extensible filter system that can accommodate future search types (e.g., domain search).

---

## 📋 What Was Implemented

### 1. **UI Updates** - Filter Type Selector

**File**: `/app/(dashboard)/dashboard/jury/centres/page.tsx`

#### Changes:
- ✅ Added `SearchFilterType` type: `'name' | 'rncp' | 'domain'`
- ✅ Added filter state management with `searchFilter` state
- ✅ Implemented dropdown selector using shadcn/ui `Select` component
- ✅ Dynamic placeholder text based on selected filter
- ✅ Helper text for RNCP search explaining the feature
- ✅ Mobile-responsive layout (stacked on mobile, side-by-side on desktop)
- ✅ "Domain" option shown as disabled with "bientôt" (coming soon) label

#### UI Features:
```tsx
// Filter options
- Par nom (default)
- Par code RNCP (active)
- Par domaine (disabled - future feature)
```

#### Visual Design:
- Filter icon in dropdown trigger
- Responsive flex layout (column on mobile, row on desktop)
- Helper text appears when RNCP filter is selected
- Maintains brand consistency with existing design

---

### 2. **API Updates** - RNCP Search Logic

**File**: `/app/api/centers/route.ts`

#### Changes:
- ✅ Added `searchType` query parameter handling
- ✅ Implemented RNCP-specific database query with JOIN
- ✅ Uses `france_competence_certifications` table for RNCP lookup
- ✅ Case-insensitive RNCP code matching
- ✅ Distinct results (prevents duplicate centers)
- ✅ Maintains security (no confidential data exposed)
- ✅ Debug logging for RNCP searches

#### Query Logic:
```typescript
// RNCP Search Flow:
1. Extract searchType parameter ('name' or 'rncp')
2. If RNCP:
   - Convert search term to uppercase
   - INNER JOIN with france_competence_certifications
   - Match against both 'code' and 'fc_certification_id' fields
   - Use selectDistinct to avoid duplicates
3. If Name (default):
   - Search in center name, city, region (existing logic)
```

#### Database Query:
```sql
-- RNCP search joins training centers with certifications
SELECT DISTINCT
  tc.id, tc.name, tc.city, tc.region, ...
FROM training_centers tc
LEFT JOIN users u ON tc.user_id = u.id
INNER JOIN france_competence_certifications fcc 
  ON tc.id = fcc.training_center_id
WHERE 
  u.user_type = 'centre' 
  AND u.validation_status = 'validated'
  AND (
    fcc.code ILIKE '%RNCP37674%' 
    OR fcc.fc_certification_id ILIKE '%RNCP37674%'
  )
```

---

## 🔍 How It Works

### User Flow:

1. **Jury navigates to** `/dashboard/jury/centres`
2. **Selects filter type** from dropdown:
   - "Par nom" (default)
   - "Par code RNCP"
3. **Enters search term**:
   - For RNCP: `RNCP37674`
   - For Name: `CNAM`
4. **System searches** based on filter type:
   - RNCP: Finds centers offering that certification
   - Name: Finds centers by name/city/region
5. **Results display** matching centers

### Example Searches:

**RNCP Search:**
- Input: `RNCP37674`
- Result: Shows "CNAM CONSERVATOIRE NATIONAL DES ARTS ET METIERS" (has this certification)
- Empty result: Centers without this certification won't appear

**Name Search:**
- Input: `CNAM`
- Result: Shows all centers with "CNAM" in name, city, or region

---

## 🗄️ Database Structure

### Tables Used:

1. **`training_centers`** - Center information
2. **`users`** - User validation status
3. **`france_competence_certifications`** - RNCP certifications attached to centers

### Relationships:
```
training_centers (1) ←→ (N) france_competence_certifications
training_centers (1) ←→ (1) users
```

### Key Fields:
- `france_competence_certifications.code` - RNCP code (e.g., "RNCP37674")
- `france_competence_certifications.fc_certification_id` - Alternative ID field
- `france_competence_certifications.training_center_id` - FK to training_centers

---

## 🧪 Testing

### Test Data Available:
```
Center: CNAM CONSERVATOIRE NATIONAL DES ARTS ET METIERS (ID: 2)
Certifications:
  - RNCP37674: "Développeur web et web mobile"
  - RNCP38565: "Accompagnant éducatif petite enfance"

Other Centers (no certifications):
  - Centre de formation bidon (ID: 3)
  - Pastel formation (ID: 4)
  - THOMAS CHARLYNE FORMATION (ID: 9)
```

### Test Cases:

#### Test 1: RNCP Search - Valid Code
1. Select "Par code RNCP" filter
2. Enter: `RNCP37674`
3. **Expected**: Shows CNAM center only
4. **Verify**: Other centers don't appear

#### Test 2: RNCP Search - Partial Code
1. Select "Par code RNCP" filter
2. Enter: `37674` (without RNCP prefix)
3. **Expected**: Shows CNAM center (partial match works)

#### Test 3: RNCP Search - Non-existent Code
1. Select "Par code RNCP" filter
2. Enter: `RNCP99999`
3. **Expected**: "Aucun centre trouvé" message

#### Test 4: Name Search - Still Works
1. Select "Par nom" filter
2. Enter: `CNAM`
3. **Expected**: Shows CNAM center (name search unchanged)

#### Test 5: Switch Between Filters
1. Enter search term with "Par nom"
2. Switch to "Par code RNCP"
3. **Expected**: Re-fetches with new filter type

#### Test 6: Empty Search
1. Select any filter
2. Leave search empty
3. **Expected**: Shows all validated centers

---

## 🎨 UI/UX Features

### Filter Selector:
- **Icon**: Filter icon in trigger
- **Width**: 192px (sm:w-48) on desktop
- **Mobile**: Full width, stacks above search input
- **Options**: 
  - ✅ Par nom (active)
  - ✅ Par code RNCP (active)
  - 🔒 Par domaine (disabled, coming soon)

### Search Input:
- **Dynamic placeholder** changes based on filter
- **Responsive**: Flex-1 to fill remaining space
- **Search icon**: Left-aligned in input

### Helper Text:
- **Appears**: Only when RNCP filter selected
- **Content**: "💡 Recherchez les centres qui proposent une certification spécifique..."
- **Style**: Small, gray text below search bar

### Layout:
```
Mobile:
┌─────────────────────┐
│ [Filter Dropdown]   │
│ [Search Input    🔍]│
│ 💡 Helper text      │
└─────────────────────┘

Desktop:
┌────────────────────────────────────┐
│ [Filter] [Search Input        🔍] │
│ 💡 Helper text                     │
└────────────────────────────────────┘
```

---

## 🔒 Security

- ✅ **Authentication required** - Jury users only
- ✅ **Validation check** - Only validated juries can search
- ✅ **No confidential data** - Email/phone excluded from results
- ✅ **SQL injection safe** - Uses Drizzle ORM parameterized queries
- ✅ **Case-insensitive** - Uses ILIKE for flexible matching

---

## 🚀 Future Enhancements

### Domain Search (Planned):
The infrastructure is ready for adding domain-based search:

1. **UI**: Already has disabled "Par domaine" option
2. **API**: Can add another conditional branch:
```typescript
else if (search.trim() && searchType === 'domain') {
  // Search in certification_domains array field
  // or join with certification_domains table
}
```

3. **Database**: 
   - Option A: Use `training_centers.certification_domains` array field
   - Option B: Create proper domain taxonomy and join

---

## 📊 Performance Considerations

### Database Indexes:
- ✅ `france_competence_certifications.training_center_id` - FK index exists
- ✅ `france_competence_certifications.code` - Consider adding index for faster RNCP searches
- ✅ `france_competence_certifications.fc_certification_id` - Consider adding index

### Query Optimization:
- Uses `selectDistinct` to prevent duplicates
- INNER JOIN ensures only centers with certifications appear in RNCP search
- LEFT JOIN for users maintains all centers in name search

### Suggested Index (Optional):
```sql
CREATE INDEX idx_fcc_code ON france_competence_certifications(code);
CREATE INDEX idx_fcc_fc_id ON france_competence_certifications(fc_certification_id);
```

---

## 📝 Code Changes Summary

### Files Modified:
1. `/app/(dashboard)/dashboard/jury/centres/page.tsx` (+60 lines)
2. `/app/api/centers/route.ts` (+50 lines, refactored query logic)

### New Imports:
```typescript
// page.tsx
import { Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// route.ts
import { franceCompetenceCertifications } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
```

### New Types:
```typescript
type SearchFilterType = 'name' | 'rncp' | 'domain';
```

---

## ✅ Completion Checklist

- ✅ UI filter selector implemented
- ✅ Dynamic placeholders working
- ✅ API endpoint handles RNCP search
- ✅ Database query with JOIN working
- ✅ Test data verified in database
- ✅ Mobile-responsive design
- ✅ Helper text for RNCP search
- ✅ Future domain filter prepared
- ✅ Security maintained
- ✅ Debug logging added
- ✅ Documentation complete

---

## 🎉 Result

Juries can now search for training centers by:
1. **Name/City/Region** (existing functionality)
2. **RNCP Code** (new feature) ✨
3. **Domain** (coming soon - UI ready)

The implementation is **production-ready**, **extensible**, and follows the existing codebase patterns.

---

## 📞 Support

### Troubleshooting:

**Issue**: RNCP search returns no results
- **Check**: Does the center have certifications attached?
- **Query**: 
```sql
SELECT * FROM france_competence_certifications 
WHERE training_center_id = [CENTER_ID];
```

**Issue**: Filter dropdown not appearing
- **Check**: shadcn/ui Select component installed
- **Verify**: Import paths are correct

**Issue**: Search not triggering
- **Check**: Browser console for API errors
- **Verify**: User is validated jury

---

**Status**: ✅ **READY FOR PRODUCTION**
