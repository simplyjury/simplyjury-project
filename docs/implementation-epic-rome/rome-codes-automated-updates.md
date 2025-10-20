# ROME Codes - Automated Updates from Official Source

## 📋 Overview

This document explains how ROME codes are automatically fetched from the **official France Travail Open Data portal** and kept up-to-date.

---

## 🎯 Solution: JSON File + Automated Fetch Script

### **Architecture:**

```
France Travail Open Data (data.gouv.fr)
  ↓ (HTTPS download)
Official ROME Excel File
  ↓ (Script extraction)
/lib/data/rome-codes.json
  ↓ (API reads)
Search API (/api/rome/search)
  ↓ (Autocomplete)
User Interface
```

### **Benefits:**

✅ **Official Source**: Data comes directly from France Travail  
✅ **Automated**: One command to fetch latest data  
✅ **No Database**: Simple JSON file, version-controlled  
✅ **Fast**: In-memory cache, < 10ms search  
✅ **Maintainable**: Easy to update when new codes are released  
✅ **Reliable**: No external API calls during search  

---

## 📥 Official Data Source

### **Source:**
- **Portal**: https://www.data.gouv.fr/datasets/repertoire-operationnel-des-metiers-et-des-emplois-rome/
- **Publisher**: France Travail (formerly Pôle Emploi)
- **License**: Open Data (Licence Ouverte / Open License)
- **Format**: Excel (.xlsx)
- **Update Frequency**: As needed by France Travail (typically 1-2 times per year)

### **Direct Download URL:**
```
https://www.data.gouv.fr/api/1/datasets/r/88342be1-06b8-4ab6-8ce9-83e117d21346
```

This URL is **stable** and maintained by the French government.

---

## 🔄 How to Fetch/Update ROME Codes

### **Step 1: Install Dependencies**

```bash
npm install xlsx
```

### **Step 2: Run the Fetch Script**

```bash
node scripts/fetch-rome-codes-from-open-data.js
```

### **What Happens:**

1. ✅ Downloads latest Excel file from data.gouv.fr
2. ✅ Extracts ROME codes from column E
3. ✅ Validates format (letter + 4 digits)
4. ✅ Saves to `/lib/data/rome-codes.json`
5. ✅ Shows statistics and sample data
6. ✅ Cleans up temporary files

### **Expected Output:**

```
🔄 Fetching latest ROME codes from France Travail Open Data
================================================================================

📍 Source: data.gouv.fr (Official France Travail Open Data)

📥 Downloading from: https://www.data.gouv.fr/api/1/datasets/r/...
✅ Download complete

📊 Extracting ROME codes from Excel...
📄 Using sheet: "Arborescence"
📊 Total rows: 550

✅ Extracted 531 ROME codes

📋 Sample codes (first 10):
   A1101 - Conduite d'engins agricoles et forestiers
   A1201 - Bûcheronnage et élagage
   A1202 - Entretien des espaces naturels
   ...

📊 Distribution by category:
   A: 45 codes (Agriculture)
   B: 23 codes (Arts)
   C: 18 codes (Artisanat)
   D: 67 codes (Commerce)
   E: 24 codes (Communication)
   F: 58 codes (Construction)
   G: 42 codes (Hôtellerie)
   H: 51 codes (Industrie)
   I: 29 codes (Installation)
   J: 31 codes (Santé)
   K: 48 codes (Services)
   L: 12 codes (Spectacle)
   M: 61 codes (Support entreprise)
   N: 22 codes (Transport)

✅ Saved to: /lib/data/rome-codes.json
📊 Total codes: 531
🧹 Cleaned up temporary files

================================================================================

✅ ROME codes successfully fetched and saved!

💡 You can now use these codes in your application.
💡 Run this script periodically to get the latest updates.
```

---

## 📁 Generated JSON File Structure

### **Location:** `/lib/data/rome-codes.json`

### **Format:**

```json
{
  "version": "latest",
  "fetchedAt": "2025-10-17T15:54:00.000Z",
  "source": "France Travail Open Data (data.gouv.fr)",
  "sourceUrl": "https://www.data.gouv.fr/datasets/repertoire-operationnel-des-metiers-et-des-emplois-rome/",
  "totalCodes": 531,
  "codes": [
    {
      "code": "A1101",
      "label": "Conduite d'engins agricoles et forestiers",
      "categoryCode": "A11"
    },
    {
      "code": "D1202",
      "label": "Coiffure",
      "categoryCode": "D12"
    },
    {
      "code": "M1805",
      "label": "Études et développement informatique",
      "categoryCode": "M18"
    }
    // ... 528 more codes
  ]
}
```

---

## 🔍 How Search Works

### **API Endpoint:** `/api/rome/search?q=coiffeur&limit=10`

### **Implementation:**

1. **Load JSON file** (cached in memory for 1 hour)
2. **Search** in both `code` and `label` fields
3. **Filter** matching results
4. **Limit** to requested number
5. **Return** with metadata (version, last updated)

### **Performance:**

- ⚡ **< 10ms** response time
- 💾 **In-memory cache** (1 hour TTL)
- 🔍 **Case-insensitive** search
- 📊 **531 codes** searchable

### **Example Searches:**

- `coiffeur` → D1202 - Coiffure
- `développeur` → M1805 - Études et développement informatique
- `M18` → All IT codes (M1801, M1805, M1806, etc.)
- `comptable` → M1203 - Comptabilité

---

## 🔄 Update Schedule

### **When to Update:**

1. **Manual Check**: Visit https://www.data.gouv.fr/datasets/repertoire-operationnel-des-metiers-et-des-emplois-rome/
2. **Look for**: "Dernière mise à jour" (Last update) date
3. **If newer**: Run the fetch script

### **Recommended Frequency:**

- ✅ **Quarterly** (every 3 months)
- ✅ **After France Travail announcements**
- ✅ **When users report missing codes**

### **Automated Updates (Optional):**

You can set up a **cron job** or **GitHub Action** to run the script automatically:

```yaml
# .github/workflows/update-rome-codes.yml
name: Update ROME Codes

on:
  schedule:
    - cron: '0 0 1 * *'  # First day of each month
  workflow_dispatch:  # Manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install xlsx
      - run: node scripts/fetch-rome-codes-from-open-data.js
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: "chore: update ROME codes from France Travail Open Data"
          file_pattern: lib/data/rome-codes.json
```

---

## 🛠️ Troubleshooting

### **Problem: "ROME codes JSON file not found"**

**Solution:**
```bash
node scripts/fetch-rome-codes-from-open-data.js
```

### **Problem: "Cannot find module 'xlsx'"**

**Solution:**
```bash
npm install xlsx
```

### **Problem: "Download failed"**

**Possible causes:**
- Network issue
- data.gouv.fr is down
- URL has changed

**Solution:**
1. Check https://www.data.gouv.fr/datasets/repertoire-operationnel-des-metiers-et-des-emplois-rome/
2. Verify the download URL is still valid
3. Update the URL in the script if needed

### **Problem: "No ROME codes found"**

**Possible causes:**
- Excel file structure has changed
- Wrong column for ROME codes

**Solution:**
1. Run: `node scripts/inspect-rome-excel.js`
2. Check which column contains ROME codes
3. Update `ROME_CODE_COL` in the fetch script

---

## 📊 Data Quality

### **Validation:**

- ✅ Format: 1 letter + 4 digits (e.g., M1805)
- ✅ Unique codes only
- ✅ Non-empty labels
- ✅ Sorted alphabetically

### **Statistics:**

- **Total codes**: ~531 (as of 2024)
- **Categories**: 14 (A-N)
- **Most codes**: D (Commerce) with 67 codes
- **Least codes**: L (Spectacle) with 12 codes

---

## 🔗 Resources

- **Official Portal**: https://www.data.gouv.fr/datasets/repertoire-operationnel-des-metiers-et-des-emplois-rome/
- **France Travail**: https://www.francetravail.org/opendata/
- **ROME 4.0 API**: https://francetravail.io/produits-partages/catalogue/rome-4-0-metiers
- **Fetch Script**: `/scripts/fetch-rome-codes-from-open-data.js`
- **Search API**: `/app/api/rome/search/route.ts`
- **UI Component**: `/components/ui/rome-search-input.tsx`

---

## ✅ Summary

### **What We Built:**

1. ✅ **Automated fetch script** from official source
2. ✅ **JSON file storage** (version-controlled)
3. ✅ **Fast search API** (in-memory cache)
4. ✅ **No database needed** (simpler architecture)
5. ✅ **Easy updates** (one command)

### **How to Use:**

1. **First time**: `node scripts/fetch-rome-codes-from-open-data.js`
2. **Search works**: Autocomplete uses JSON file
3. **Update**: Run script again when needed
4. **Deploy**: JSON file is committed to git

### **Maintenance:**

- 🔄 Run fetch script quarterly
- 📊 Check data.gouv.fr for updates
- ✅ Commit updated JSON file
- 🚀 Deploy (automatic with git)

---

**Last Updated:** October 17, 2025  
**Data Source:** France Travail Open Data (data.gouv.fr)  
**ROME Version:** Latest from official portal
