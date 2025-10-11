# F3-7: Training Center Details Page for Jurys

## Overview
Implementation of a detailed profile page for training centers, accessible to jury users from the centers directory. This page displays comprehensive information about a training center while maintaining confidentiality of contact information.

## Feature Description
When a jury user clicks the "Voir profil" button on a training center card in the directory (`/dashboard/jury/centres`), they are redirected to a detailed profile page showing:
- Complete center information (excluding confidential contact details)
- RNCP certifications (for certificateur centers)
- Certification domains
- Qualiopi status
- Center description and additional metadata

## User Story
**As a** jury professional  
**I want to** view the complete profile of a training center  
**So that** I can better understand their expertise and certifications before contacting them

## Technical Implementation

### 1. API Endpoint
**File:** `/app/api/centers/[id]/route.ts`

**Route:** `GET /api/centers/:id`

**Authentication:** 
- Requires authenticated user
- User must have `user_type='jury'`

**Response Structure:**
```json
{
  "center": {
    "id": 1,
    "name": "Centre de Formation Example",
    "siret": "12345678901234",
    "address": "123 Rue Example",
    "city": "Paris",
    "postalCode": "75001",
    "region": "Île-de-France",
    "isCertificateur": true,
    "certificationDomains": ["Informatique", "Commerce"],
    "qualiopiCertified": true,
    "qualiopiStatus": "certified",
    "sector": "Numérique",
    "website": "https://example.com",
    "description": "Description du centre...",
    "logoUrl": "https://...",
    "createdAt": "2024-01-01T00:00:00Z",
    "userValidationStatus": "validated"
  },
  "certifications": [
    {
      "id": 1,
      "fcCertificationId": "FC123",
      "title": "Développeur web et web mobile",
      "code": "RNCP37674",
      "level": "Niveau 5",
      "domain": "Informatique",
      "status": "ACTIVE",
      "validityStart": "2023-01-01",
      "validityEnd": "2028-12-31",
      "approvalStatus": "approved"
    }
  ]
}
```

**Data Exclusions (Confidential):**
- `email` - Center email address
- `phone` - Center phone number
- `contact_person_name` - Contact person's name
- `contact_person_role` - Contact person's role
- `contact_person_email` - Contact person's email
- `contact_person_phone` - Contact person's phone

**Database Queries:**
1. **Center Details Query:**
   - Joins `training_centers` with `users` table
   - Filters by center ID and validated status
   - Excludes confidential contact information

2. **Certifications Query (if certificateur):**
   - Fetches from `france_competence_certifications` table
   - Only returns approved certifications
   - Includes RNCP code, title, level, domain, and validity dates

**Logo Handling:**
- Generates signed URLs for center logos from Supabase storage
- 1-hour expiry for security
- Fallback to initials if logo unavailable

### 2. Profile Detail Page
**File:** `/app/(dashboard)/dashboard/jury/centres/[id]/page.tsx`

**Route:** `/dashboard/jury/centres/:id`

**Page Sections:**

#### Header Section
- **Logo Display:** 24x24 rounded logo or initials fallback
- **Center Name:** Large heading with brand color
- **Badges:**
  - Qualiopi certification badge (green)
  - Certificateur badge (blue)
- **Location:** Full address with MapPin icon
- **Website:** Clickable link with Globe icon
- **SIRET:** Displayed with Building icon
- **Sector:** Badge display

#### Description Section
- Full center description in a card
- Preserves whitespace formatting

#### Certification Domains Section
- Displays all certification domains as badges
- Responsive flex layout

#### RNCP Certifications Section
**Visibility:** Only shown if `isCertificateur === true`

**For Each Certification:**
- Title (bold, brand color)
- Code (badge format)
- Level
- Domain
- Status badge (green for ACTIVE)
- Validity dates with calendar icon

**Empty State:** "Aucune certification RNCP attachée pour le moment"

#### Additional Information Section
Grid layout with:
- Qualiopi status (certified/not certified)
- Center type (certificateur/formation)
- Member since date
- Profile validation status

#### Contact Note
Blue alert box reminding users to use the "Contacter" button from the directory

**UI Components Used:**
- `Button` - Back button and navigation
- `Card`, `CardContent`, `CardHeader`, `CardTitle` - Content sections
- `Badge` - Status indicators and tags
- `Alert`, `AlertDescription` - Information messages
- Lucide icons: `MapPin`, `Building`, `Globe`, `CheckCircle`, `ArrowLeft`, `Calendar`, `Award`, `ShieldCheck`

### 3. Navigation Update
**File:** `/app/(dashboard)/dashboard/jury/centres/page.tsx`

**Modified Function:**
```typescript
const handleViewProfile = (center: TrainingCenter) => {
  // Navigate to center profile detail page
  window.location.href = `/dashboard/jury/centres/${center.id}`;
};
```

**Button Location:** Each center card in the directory grid

### 4. Route Protection
**File:** `/middleware.ts`

**Protection Mechanism:**
- All routes under `/dashboard` are protected (line 10)
- New route `/dashboard/jury/centres/[id]` automatically inherits protection
- Requires valid session cookie
- Verifies JWT token
- Checks user is not deactivated

**No additional middleware configuration required**

## Database Schema

### Tables Used

#### `training_centers`
**Columns Retrieved:**
- `id`, `name`, `siret`
- `address`, `city`, `postal_code`, `region`
- `is_certificateur`, `certification_domains`
- `qualiopi_certified`, `qualiopi_status`
- `sector`, `website`, `description`
- `logo_url`, `created_at`

**Columns Excluded (Confidential):**
- `email`, `phone`
- `contact_person_name`, `contact_person_role`
- `contact_person_email`, `contact_person_phone`

#### `users`
**Columns Retrieved:**
- `validation_status` (for verification)

#### `france_competence_certifications`
**Columns Retrieved:**
- `id`, `fc_certification_id`, `title`, `code`
- `level`, `domain`, `status`
- `validity_start`, `validity_end`
- `approval_status`

**Filter:** Only `approval_status = 'approved'`

## Security Considerations

### Access Control
1. **Authentication Required:** User must be logged in
2. **Role Verification:** Only users with `user_type='jury'` can access
3. **Center Validation:** Only validated centers (`validation_status='validated'`) are accessible
4. **Certification Approval:** Only approved certifications are displayed

### Data Privacy
1. **Confidential Data Exclusion:**
   - Email addresses not exposed
   - Phone numbers not exposed
   - Contact person names not exposed
   - Contact person details not exposed

2. **Secure Logo Access:**
   - Signed URLs with 1-hour expiry
   - Prevents unauthorized access to storage bucket

3. **Error Handling:**
   - 401 for unauthenticated requests
   - 403 for non-jury users
   - 404 for non-existent or non-validated centers

## User Experience

### Loading States
- Spinner with "Chargement du profil..." message
- Prevents interaction during data fetch

### Error States
- Clear error messages in Alert component
- Back button to return to directory
- Handles 404, 403, and 500 errors gracefully

### Navigation
- **Back Button:** Returns to `/dashboard/jury/centres`
- **Breadcrumb Context:** Clear navigation path
- **Contact Reminder:** Alert box guides users back to directory for contacting

### Responsive Design
- **Mobile-First:** Optimized for mobile devices
- **Flexible Layouts:** Grid and flex layouts adapt to screen size
- **Card-Based Design:** Consistent with application patterns

## Testing Scenarios

### Functional Tests
1. ✅ Jury user can view validated center profile
2. ✅ Non-jury user receives 403 error
3. ✅ Unauthenticated user redirected to sign-in
4. ✅ Invalid center ID returns 404
5. ✅ Non-validated center returns 404
6. ✅ Certificateur centers show RNCP certifications
7. ✅ Non-certificateur centers hide RNCP section
8. ✅ Only approved certifications are displayed
9. ✅ Logo displays correctly or falls back to initials
10. ✅ Back button navigates to directory

### Security Tests
1. ✅ Confidential data (emails, phones, names) not exposed in API response
2. ✅ Confidential data not rendered in UI
3. ✅ Signed URLs expire after 1 hour
4. ✅ Center user cannot access endpoint (403)
5. ✅ Admin user cannot access endpoint (403)

### UI/UX Tests
1. ✅ Page loads within acceptable time
2. ✅ Loading spinner displays during fetch
3. ✅ Error messages are clear and actionable
4. ✅ Responsive layout works on mobile, tablet, desktop
5. ✅ All badges and icons display correctly
6. ✅ Dates formatted in French locale
7. ✅ Empty states display when no data available

## Files Created/Modified

### Created Files
1. `/app/api/centers/[id]/route.ts` - API endpoint
2. `/app/(dashboard)/dashboard/jury/centres/[id]/page.tsx` - Profile page component

### Modified Files
1. `/app/(dashboard)/dashboard/jury/centres/page.tsx` - Updated handleViewProfile function

### No Changes Required
1. `/middleware.ts` - Existing protection covers new route

## Dependencies
- Next.js App Router (dynamic routes)
- Drizzle ORM (database queries)
- Supabase Storage (logo signed URLs)
- shadcn/ui components
- Lucide React icons

## Future Enhancements
1. **Rating Display:** Show center's average rating from completed sessions
2. **Session History:** Display number of successful collaborations
3. **Availability Calendar:** Show center's preferred session dates
4. **Direct Messaging:** Add "Message" button for direct communication
5. **Bookmark Feature:** Allow juries to save favorite centers
6. **Print/Export:** Generate PDF of center profile
7. **Share Profile:** Generate shareable link for center profile

## Related Features
- **F3-2:** Page recherche jury (jury search for centers)
- **F3-4:** Voir Profil and Contacter Modal (contact functionality)
- **F2-15:** Logo CRUD for training centers (logo management)
- **Epic 02:** Center profile management features

## Changelog

### Version 1.0 (2025-10-11)
- Initial implementation
- API endpoint with confidential data exclusion
- Profile detail page with RNCP certifications
- Navigation from centers directory
- Automatic route protection via middleware
