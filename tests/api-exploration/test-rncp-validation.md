# RNCP Validation Implementation - Testing Guide

## ✅ Implementation Complete

### Files Created/Modified:

1. **API Route**: `/app/api/certifications/validate/route.ts`
   - Validates RNCP codes against Mission Apprentissage API
   - Returns certification details (title, level, domain, active status)
   - Handles errors gracefully

2. **RNCP Input Component**: `/components/ui/rncp-input.tsx`
   - Real-time validation with debouncing (800ms)
   - Visual feedback (loading, success, error states)
   - Displays certification details when valid
   - Shows warnings for inactive certifications

3. **Updated Modal**: `/components/jury/structured-request-modal.tsx`
   - Replaced dropdown with RNCP input
   - Stores both RNCP code and certification title
   - Integrated validation

---

## 🧪 Testing Instructions

### Test 1: Valid RNCP Codes

Navigate to `/dashboard/search` and open the structured request modal.

**Test these valid codes:**
- `RNCP31114` - Développeur Web et Web Mobile
- `RNCP34838` - Concepteur Développeur d'Applications
- `RNCP36061` - Expert en Technologies de l'Information
- `RNCP35475` - Administrateur d'infrastructures sécurisées

**Expected behavior:**
1. Type the code (can be lowercase, will auto-uppercase)
2. After 800ms, validation starts (loading spinner)
3. Green checkmark appears
4. Certification details display in green box
5. Title, level, and domain shown

### Test 2: Invalid RNCP Codes

**Test these invalid codes:**
- `RNCP99999` - Non-existent code
- `RNC31114` - Missing P
- `31114` - Missing RNCP prefix
- `RNCP` - No number
- `ABC123` - Wrong format

**Expected behavior:**
1. Red X icon appears
2. Error message displays
3. Cannot submit form

### Test 3: Inactive Certifications

Some RNCP codes are no longer active. They will validate but show a warning.

**Expected behavior:**
1. Green checkmark (valid code)
2. Yellow warning box: "Cette certification n'est plus active"
3. Can still submit (warning, not error)

### Test 4: Form Validation

**Test empty submission:**
1. Leave RNCP field empty
2. Try to submit
3. Should show "Veuillez sélectionner une certification" error

**Test with valid RNCP:**
1. Enter valid RNCP code
2. Wait for validation
3. Fill other required fields
4. Submit should work

### Test 5: API Error Handling

**Simulate API timeout:**
- The API has a 10-second timeout
- If network is slow, should show timeout error

**Simulate API down:**
- If API returns 500, should show generic error message

---

## 🔍 Manual Testing Checklist

- [ ] RNCP input accepts text input
- [ ] Input auto-uppercases (rncp31114 → RNCP31114)
- [ ] Validation triggers after 800ms of typing
- [ ] Loading spinner shows during validation
- [ ] Valid code shows green checkmark
- [ ] Invalid code shows red X
- [ ] Certification details display correctly
- [ ] Inactive certification shows warning
- [ ] Form validation prevents empty submission
- [ ] Form validation prevents invalid RNCP
- [ ] Form submits successfully with valid RNCP
- [ ] Mobile responsive (test on small screen)
- [ ] Keyboard navigation works (Tab, Enter)

---

## 🐛 Common Issues & Solutions

### Issue: "Configuration API manquante"
**Solution**: Ensure `.env` file has:
```
MISSION_APPRENTISSAGE_API_TOKEN=your_token_here
```

### Issue: Validation never completes
**Solution**: 
1. Check browser console for errors
2. Verify API token is valid
3. Check network tab for API response

### Issue: "Code RNCP non trouvé" for valid codes
**Solution**:
1. Verify code format (RNCP + 3-5 digits)
2. Check if code exists in France Compétences database
3. Try a known valid code like RNCP31114

### Issue: Component doesn't render
**Solution**:
1. Check import path is correct
2. Verify all dependencies installed
3. Restart dev server

---

## 📊 API Response Examples

### Successful Validation (RNCP31114):
```json
{
  "valid": true,
  "code": "RNCP31114",
  "title": "Développeur web et web mobile",
  "level": "5",
  "domain": "Informatique et réseaux",
  "isActive": true,
  "endDate": null,
  "warning": null
}
```

### Invalid Code:
```json
{
  "error": "Code RNCP non trouvé",
  "message": "Ce code RNCP n'existe pas dans le référentiel"
}
```

### Format Error:
```json
{
  "error": "Format de code RNCP invalide",
  "message": "Le code doit être au format RNCP suivi de 3 à 5 chiffres (ex: RNCP31114)"
}
```

---

## 🚀 Next Steps

After testing:

1. **Monitor Usage**
   - Track which RNCP codes are most used
   - Identify validation errors
   - Check API response times

2. **Potential Enhancements**
   - Add recent/popular codes as suggestions
   - Cache validated codes client-side
   - Add "Don't know your RNCP?" help link
   - Implement RNCP code lookup by certification name

3. **Database Storage**
   - Store certification title with request
   - Create certifications reference table
   - Track certification usage statistics

---

## 📝 Notes

- **No file downloads needed** ✅
- **No periodic updates needed** ✅
- **Always up-to-date** (validates against live API) ✅
- **Simple implementation** (3 files, ~300 lines) ✅
- **Fast validation** (< 1 second typical) ✅

The implementation is complete and ready for testing!
