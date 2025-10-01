# Database Ready for Certification Storage ✅

**Date**: 2025-10-01  
**Status**: Migration Applied Successfully

---

## ✅ Database Schema Confirmed

The `france_competence_certifications` table is **ready** to store certifications for training centers.

### Table Structure

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | integer | NO | Primary key |
| `training_center_id` | integer | YES | FK to training_centers |
| `fc_certification_id` | varchar(50) | NO | France Compétences ID |
| `title` | varchar(500) | NO | Certification title |
| `code` | varchar(50) | YES | RNCP code (e.g., RNCP31114) |
| `level` | varchar(50) | YES | European level (e.g., "5") |
| `domain` | varchar(200) | YES | Domain/sector |
| `status` | varchar(50) | YES | Active/Inactive |
| `validity_start` | date | YES | Start date |
| `validity_end` | date | YES | Expiration date |
| **`certification_details`** | **jsonb** | **YES** | **Complete API response** |
| `last_updated` | timestamp | YES | Last sync timestamp |
| `created_at` | timestamp | YES | Creation timestamp |

---

## 🆕 New Field Added

### `certification_details` (JSONB)

**Purpose**: Store the complete certification details from Mission Apprentissage API

**Contains**:
- Blocs de compétences (competency blocks)
- Detailed domain information (NSF, ROME codes)
- Certification type and nature
- Certificateurs (certifying bodies)
- Convention collectives
- Full metadata from API

**Example Structure**:
```json
{
  "identifiant": {
    "rncp": "RNCP31114",
    "cfd": "50022137"
  },
  "intitule": {
    "rncp": "Développeur web et web mobile",
    "niveau": {
      "rncp": {
        "europeen": "5"
      }
    }
  },
  "blocs_competences": {
    "rncp": [
      {
        "code": "RNCP31114BC01",
        "intitule": "Développer la partie front-end d'une application web",
        "competences": [...]
      },
      {
        "code": "RNCP31114BC02",
        "intitule": "Développer la partie back-end d'une application web",
        "competences": [...]
      }
    ]
  },
  "domaines": {
    "nsf": {...},
    "rome": {...},
    "formacodes": {...}
  },
  "type": {
    "certificateurs_rncp": [...],
    "voie_acces": {...}
  }
}
```

---

## 🔗 Relationships

```
training_centers (1) ──→ (N) france_competence_certifications
                              │
                              └──→ (N) certification_stats
```

- One training center can have **multiple certifications**
- Each certification can have **multiple yearly statistics**
- Cascade delete: If training center is deleted, certifications are deleted

---

## 📊 Index Created

**GIN Index** on `certification_details` for fast JSONB queries:
```sql
CREATE INDEX idx_france_competence_certifications_details 
ON france_competence_certifications USING gin (certification_details);
```

This allows efficient queries like:
```sql
-- Find certifications with specific bloc de compétences
SELECT * FROM france_competence_certifications
WHERE certification_details @> '{"blocs_competences": {"rncp": [{"code": "RNCP31114BC01"}]}}';

-- Find certifications by domain
SELECT * FROM france_competence_certifications
WHERE certification_details->'domaines'->'nsf'->'rncp' @> '[{"code": "326t"}]';
```

---

## 🚀 Ready for Implementation

The database is now ready for the user story:

### User Story: En tant que centre certificateur, je peux rattacher des certifications RNCP

**Workflow**:
1. ✅ **Search** - User searches RNCP code (already implemented)
2. ✅ **Validate** - API validates code and returns details (already implemented)
3. ✅ **Display** - Show certification details including blocs de compétences
4. ✅ **Save** - Store in `france_competence_certifications` table

**Data to Store**:
```typescript
{
  training_center_id: number,
  fc_certification_id: string,  // RNCP code
  title: string,                 // From API
  code: string,                  // RNCP code
  level: string,                 // European level
  domain: string,                // Primary domain
  status: 'active' | 'inactive', // From API
  validity_start: Date,          // From API
  validity_end: Date,            // From API
  certification_details: {       // Complete API response
    identifiant: {...},
    intitule: {...},
    blocs_competences: {...},
    domaines: {...},
    type: {...},
    // ... all other API fields
  }
}
```

---

## 📝 Next Steps

1. **Create API Route**: `/api/certifications/attach`
   - Accepts RNCP code
   - Fetches full details from Mission Apprentissage API
   - Stores in database

2. **Create Modal Component**: "Rattacher une certification"
   - RNCP input (reuse existing component)
   - Display blocs de compétences
   - Confirmation and save

3. **Create Management Page**: List attached certifications
   - Display all certifications for training center
   - Show details, blocs de compétences
   - Remove/update certifications

---

## ✅ Summary

- ✅ Database schema confirmed and enhanced
- ✅ JSONB field added for complete API data storage
- ✅ Index created for efficient queries
- ✅ Schema file updated
- ✅ Ready for certification attachment feature implementation

**The database is fully prepared for storing certifications with all their details including blocs de compétences!**
