# Functional Specifications: "My Certifications" Page
**SimplyJury Platform - Certification Management Module**

---

## 📋 Project Overview

This document specifies the functional requirements for implementing the "My Certifications" page within the SimplyJury platform. This page is exclusively accessible to training centers that have been flagged as "Certification Bodies" (certificateurs) during account creation.

**Target Users**: Certification bodies (RNCP/RS certified organizations)  
**Platform**: Next.js 14 + TypeScript + Supabase + Tailwind CSS  
**Design Reference**: Attached mockup file

---

## 🎯 Core Functionality

### User Access Control
- **Prerequisite**: Training center must have `is_certificateur: true` flag in `training_centers` table
- **Navigation**: "Mes certifications" menu item appears only for certified organizations
- **Authentication**: Standard Supabase auth + role-based access control
- **Data Access**: User must be linked to a training center with `is_certificateur = true`

### Page Purpose
Allow certification bodies to:
1. View and manage their linked RNCP certifications
2. Access certification-specific statistics and performance data
3. Add/link new certifications from France Compétences API
4. Find qualified juries for specific certifications
5. Monitor certification status and expiration dates

---

## 🔌 API Integration Requirements

### France Compétences API Integration
**Required Environment Variables:**
```env
# France Compétences API
FRANCE_COMPETENCES_API_BASE_URL=https://www.data.gouv.fr/api/1/datasets/
FRANCE_COMPETENCES_DATASET_ID=5fa5f2ce8b4c41709ee90a3d
FRANCE_COMPETENCES_API_KEY=your_api_key_if_required

# Alternative API endpoints
RNCP_API_BASE_URL=https://api.apprentissage.beta.gouv.fr/api/v1/
```

**API Endpoints to Integrate:**
1. **Search Certifications**: `GET /certifications/search?q={query}`
2. **Get Certification Details**: `GET /certifications/{rncp_code}`
3. **List Active Certifications**: `GET /certifications?status=active`

### Data Sources Mapping

#### 🌐 **FROM France Compétences API**
```typescript
interface FranceCompetencesCertification {
  code_rncp: string;           // e.g., "RNCP34826"
  intitule: string;            // Official certification title
  niveau_qualification: number; // 3-7 (CAP to Master level)
  date_fin_enregistrement: string; // ISO date format
  date_debut_validite: string;
  blocs_competences: Array<{
    numero_bloc: string;
    intitule: string;
    liste_competences: string;
  }>;
  domaines_activite: string[];
  specialites_formation: string[];
  certificateurs: Array<{
    siret: string;
    nom: string;
  }>;
  modalites_acces: string[];
}
```

#### 🏢 **FROM Internal Database (Supabase)**
```typescript
// Existing table: france_competence_certifications
interface FranceCompetenceCertification {
  id: number;
  training_center_id: number;
  fc_certification_id: string;
  title: string;
  code: string; // RNCP code
  level: string;
  domain: string;
  status: string;
  validity_start: string;
  validity_end: string;
  last_updated: string;
  created_at: string;
}

// New table needed: certification_stats
interface CertificationStats {
  id: number;
  france_competence_certification_id: number;
  year: number;
  candidates_count: number;
  successful_candidates: number;
  total_sessions: number;
  last_session_date: string;
  created_at: string;
  updated_at: string;
}
```

#### 🔢 **CALCULATED Data**
```typescript
interface ProcessedCertification {
  // From API
  ...FranceCompetencesCertification;
  
  // From Internal DB
  stats: CertificationStats;
  
  // Calculated fields
  status: 'active' | 'inactive' | 'expired';
  days_until_expiration: number;
  is_expired: boolean;
  simplified_domains: string[];
  competency_blocks_count: number;
}
```

---

## 🎨 UI Components Specifications

### Page Header
- **Title**: "Mes certifications"
- **Subtitle**: "Gérez vos certifications RNCP et trouvez des jurys qualifiés"
- **Badge**: "Centre Certificateur" with purple gradient background
- **User Info**: Organization name (e.g., "CNAM Conservatoire")

### Statistics Cards (Top Section)
Display 4 metrics cards:
1. **Active Certifications**: Count of non-expired certifications from `france_competence_certifications` where `validity_end > NOW()`
2. **Total Certifications**: Total count from `france_competence_certifications` for the training center
3. **Candidates This Year**: Sum from `certification_stats` where `year = CURRENT_YEAR`
4. **Success Rate**: Calculated as `(successful_candidates / candidates_count) * 100` averaged across all certifications

**Data Source**: Calculated from `france_competence_certifications` and `certification_stats` tables

### Action Buttons
- **Primary**: "Rattacher une certification" (opens modal)
- **Secondary**: "Exporter la liste" (CSV export)

### Filters Section
4 filter dropdowns:
1. **Search**: Text input for name/RNCP code
2. **Status**: All/Active/Inactive/Expired
3. **Level**: All/Level 3-7
4. **Domain**: All/Informatique/Management/Commerce/Industrie

### Certifications List
**Card Layout** for each certification:

#### Main Information
- **Icon**: Domain-based emoji (🎓📱🏭📈)
- **Title**: Certification official name
- **RNCP Code**: Small badge with code
- **Metadata**: Expiration date, candidates, success rate
- **Status Badge**: Visual indicator (green/red dot + text)

#### Tags Section
- **Level Tag**: Yellow background (e.g., "Niveau 6")
- **Domain Tags**: Purple background for main domain
- **Specialty Tags**: Green background for specializations

#### Competency Blocks
- **Collapsible Section**: "Blocs de compétences (X)"
- **Block Pills**: Small gray pills with competency block names

#### Action Buttons
- **Primary**: "🔍 Trouver des jurys" → Redirect to jury search with certification filter
- **Secondary**: "📊 Statistiques" → Show detailed stats modal
- **Secondary**: "⚙️ Gérer" → Certification management options

### Add Certification Modal
**Modal Components**:
1. **Search Input**: Real-time search in France Compétences API
2. **Search Results**: Dropdown with autocomplete suggestions
3. **Details Display**: Auto-populated fields when selection made
4. **Form Fields** (read-only after selection):
   - RNCP Code
   - Certification Name
   - Qualification Level
   - End Registration Date
5. **Action Buttons**: Cancel / "Rattacher la certification"

---

## 🗄️ Database Schema Requirements

### Supabase Tables

#### `france_competence_certifications` (existing table)
```sql
-- Already exists with the following structure:
CREATE TABLE france_competence_certifications (
  id SERIAL PRIMARY KEY,
  training_center_id INTEGER REFERENCES training_centers(id),
  fc_certification_id VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  code VARCHAR, -- RNCP code
  level VARCHAR,
  domain VARCHAR,
  status VARCHAR,
  validity_start DATE,
  validity_end DATE,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `certification_stats` (new table needed)
```sql
CREATE TABLE certification_stats (
  id SERIAL PRIMARY KEY,
  france_competence_certification_id INTEGER REFERENCES france_competence_certifications(id),
  year INTEGER NOT NULL,
  candidates_count INTEGER DEFAULT 0,
  successful_candidates INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  last_session_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(france_competence_certification_id, year)
);
```

#### `training_centers` (existing table - already has `is_certificateur`)
```sql
-- Already exists with is_certificateur BOOLEAN DEFAULT false
-- No changes needed
```

---

## 🔧 Technical Implementation Details

### State Management
```typescript
// Main page state
interface CertificationsPageState {
  certifications: ProcessedCertification[];
  loading: boolean;
  filters: {
    search: string;
    status: string;
    level: string;
    domain: string;
  };
  stats: {
    active_count: number;
    total_count: number;
    total_candidates: number;
    average_success_rate: number;
  };
  trainingCenterId: number; // Current user's training center ID
}

// Modal state
interface AddCertificationModalState {
  isOpen: boolean;
  searchQuery: string;
  searchResults: FranceCompetencesCertification[];
  selectedCertification: FranceCompetencesCertification | null;
  loading: boolean;
}
```

### API Service Functions
```typescript
// France Compétences API client
class FranceCompetencesAPI {
  static async searchCertifications(query: string): Promise<FranceCompetencesCertification[]>
  static async getCertificationByCode(rncp: string): Promise<FranceCompetencesCertification>
}

// Internal API functions
async function getTrainingCenterCertifications(trainingCenterId: number): Promise<FranceCompetenceCertification[]>
async function getCertificationStats(certificationId: number): Promise<CertificationStats[]>
async function linkCertification(trainingCenterId: number, certificationData: FranceCompetencesCertification): Promise<void>
async function getCurrentUserTrainingCenter(): Promise<{ id: number; is_certificateur: boolean }>
```

### Data Processing Logic
```typescript
function calculateCertificationStatus(endDate: string): 'active' | 'expired' {
  return new Date(endDate) > new Date() ? 'active' : 'expired';
}

function calculateDaysUntilExpiration(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function processSimplifiedDomains(domains: string[]): string[] {
  // Map complex domain names to simplified tags
  const domainMapping = {
    'Informatique et télécommunications': 'Informatique',
    'Commerce, vente, marketing': 'Commerce',
    // ... more mappings
  };
  return domains.map(d => domainMapping[d] || d);
}
```

---

## 📱 Responsive Design Requirements

### Breakpoints
- **Mobile**: < 768px → Single column layout, collapsible filters
- **Tablet**: 768px - 1024px → Two-column grid
- **Desktop**: > 1024px → Three-column grid

### Mobile Optimizations
- **Navigation**: Burger menu for sidebar
- **Cards**: Full-width certification cards
- **Modal**: Full-screen on mobile devices
- **Filters**: Collapsible section on mobile

---

## 🔐 Security & Permissions

### Access Control
- Only users linked to training centers with `is_certificateur: true` can access
- Users can only see certifications linked to their training center (`training_center_id`)
- API calls must include training center context and verify user ownership
- Row Level Security (RLS) policies should enforce training center ownership

### Data Validation
- RNCP codes must match France Compétences format
- Prevent duplicate certification links
- Validate certification is still active before linking

---

## 🧪 Testing Requirements

### Unit Tests
- Data processing functions
- API integration functions
- Status calculation logic

### Integration Tests
- France Compétences API connectivity
- Database operations
- Modal form submission flow

### E2E Tests
- Complete certification linking workflow
- Search and filtering functionality
- Responsive design on different devices

---

## 📊 Analytics & Monitoring

### Events to Track
- Certification search queries
- Successful certification links
- Filter usage patterns
- "Find Juries" button clicks
- Modal abandonment rates

### Performance Metrics
- API response times
- Page load performance
- Search result relevance

---

## 🚀 Deployment Checklist

### Environment Setup
- [ ] France Compétences API credentials configured
- [ ] Database tables created and migrated
- [ ] Supabase RLS policies updated
- [ ] Environment variables set in Vercel

### Feature Flags
- [ ] Certification body role detection
- [ ] Menu item conditional rendering
- [ ] API integration toggle (for fallback)

### Data Migration
- [ ] Create `certification_stats` table
- [ ] Verify existing training centers have correct `is_certificateur` flags
- [ ] Sample certification data imported to `france_competence_certifications`
- [ ] Statistics calculated for existing data in `certification_stats`
- [ ] RLS policies updated for new table

---

## 🔄 Future Enhancements

### Phase 2 Features
- Bulk certification import from spreadsheet
- Advanced analytics dashboard per certification
- Integration with jury recommendation engine
- Certification renewal reminder notifications
- Export detailed reports to PDF

### API Enhancements
- Real-time certification status updates
- Webhook integration with France Compétences
- Caching layer for frequently accessed certifications

---

**Implementation Priority**: High  
**Estimated Development Time**: 2-3 weeks  
**Dependencies**: France Compétences API access, Supabase schema updates

*This specification should be implemented following the existing SimplyJury design system and code patterns established in the platform.*