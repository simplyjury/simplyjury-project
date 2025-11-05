# RNCP Validation Fallback - Rollback Procedure

## Overview
This document describes how to rollback the France Compétences fallback implementation if issues arise.

## What Was Changed

### Files Modified:
1. **`app/api/certifications/validate/route.ts`** - Added fallback logic
2. **`lib/utils/france-competences-fallback.ts`** - New fallback utility (NEW FILE)
3. **`package.json`** - Added cheerio dependency

### Backup Created:
- **`app/api/certifications/validate/route.ts.backup`** - Original validation route

## Rollback Steps

### Option 1: Quick Rollback (Restore from Backup)

```bash
# Navigate to project root
cd /Users/cedrickerbidi/simplyjury

# Restore the original validation route
cp app/api/certifications/validate/route.ts.backup app/api/certifications/validate/route.ts

# Restart the dev server
# Press Ctrl+C in the terminal running `pnpm dev`
# Then run: pnpm dev
```

### Option 2: Manual Rollback (Remove Fallback Logic)

If you want to keep the file but disable the fallback:

1. Open `app/api/certifications/validate/route.ts`
2. Remove this import:
   ```typescript
   import { fetchFromFranceCompetences } from '@/lib/utils/france-competences-fallback';
   ```
3. Replace the fallback logic (lines ~141-160) with the original:
   ```typescript
   // No certifications found
   if (!certifications || certifications.length === 0) {
     return NextResponse.json(
       { 
         error: 'Code RNCP non trouvé',
         message: 'Ce code RNCP n\'existe pas dans le référentiel'
       },
       { status: 404 }
     );
   }
   ```

### Option 3: Complete Cleanup (Remove All Changes)

```bash
# Restore original route
cp app/api/certifications/validate/route.ts.backup app/api/certifications/validate/route.ts

# Remove fallback utility file
rm lib/utils/france-competences-fallback.ts

# Remove cheerio dependency (optional)
pnpm remove cheerio

# Restart dev server
```

## Verification After Rollback

Test that the original behavior is restored:

```bash
# Test with RNCP39417 (should return 404)
curl "http://localhost:3000/api/certifications/validate?code=RNCP39417"

# Expected response:
# {"error":"Code RNCP non trouvé","message":"Ce code RNCP n'existe pas dans le référentiel"}
```

## Files to Keep

Even after rollback, you may want to keep these files for future reference:
- `lib/utils/france-competences-fallback.ts` - The fallback implementation
- `app/api/certifications/validate/route.ts.backup` - The original backup
- `scripts/test-rncp39417.js` - Test script
- `docs/ROLLBACK-RNCP-FALLBACK.md` - This document

## Re-enabling the Fallback

If you rollback and later want to re-enable the fallback:

```bash
# The modified version is in git history or you can:
# 1. Keep a copy of the working route.ts before rollback
# 2. Or restore from git: git checkout HEAD -- app/api/certifications/validate/route.ts
```

## Support

If you encounter issues during rollback:
1. Check that the backup file exists: `ls -la app/api/certifications/validate/route.ts.backup`
2. Verify the server restarts successfully after changes
3. Clear Next.js cache if needed: `rm -rf .next`
4. Check server logs for errors

## Implementation Date
October 30, 2025

## Status
✅ Tested and working
- RNCP39417 successfully validates via fallback
- Returns: "Formateur concepteur pédagogique", Level 2, Active
