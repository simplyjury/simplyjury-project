# Social Network URLs Configuration - Implementation Summary

## Overview
Implemented a complete system for admins to configure social network URLs (LinkedIn, YouTube, Instagram) that are displayed in the homepage footer.

## Database Changes

### Migration Applied
- **Table**: `system_settings`
- **New Columns**:
  - `linkedin_url` (VARCHAR 500)
  - `youtube_url` (VARCHAR 500)
  - `instagram_url` (VARCHAR 500)

### Schema Update
Updated `/lib/db/schema.ts` to include the new fields in the `systemSettings` table definition.

## Backend Implementation

### Service Layer
**File**: `/lib/services/system-settings-service.ts`

Added new method:
- `updateSocialNetworkUrls()` - Updates social network URLs with admin authorization check

### API Endpoints

#### Admin Endpoint
**File**: `/app/api/admin/social-networks/route.ts`
- **GET**: Retrieves current social network URLs (admin only)
- **POST**: Updates social network URLs with validation (admin only)
- **Validation**: Ensures URLs start with http:// or https://

#### Public Endpoint
**File**: `/app/api/settings/social-networks/route.ts`
- **GET**: Public endpoint for homepage to fetch social network URLs

## Frontend Implementation

### Admin Configuration Page
**File**: `/app/(dashboard)/dashboard/admin/parametres/page.tsx`

Added new section "Réseaux sociaux" after "Paramètres de la plateforme" with:
- LinkedIn URL input field
- YouTube URL input field
- Instagram URL input field
- Save button with loading state
- Success/error feedback

**Features**:
- Real-time state management
- Input validation
- Disabled state during save
- Placeholder examples for each platform

### Homepage Footer
**File**: `/app/page.tsx`

Updated footer social media links to:
- Fetch URLs from `/api/settings/social-networks` on component mount
- Use dynamic URLs instead of hardcoded `#`
- Include proper accessibility attributes (aria-label)
- Open links in new tab with security attributes (target="_blank" rel="noopener noreferrer")
- Fallback to `#` if URLs are not configured

## How to Use

### For Admins:
1. Navigate to `/dashboard/admin/parametres`
2. Scroll to the "Réseaux sociaux" section
3. Enter the full URLs for each social network:
   - LinkedIn: `https://www.linkedin.com/company/simplyjury`
   - YouTube: `https://www.youtube.com/@simplyjury`
   - Instagram: `https://www.instagram.com/simplyjury`
4. Click "Enregistrer les réseaux sociaux"
5. URLs are immediately available on the homepage

### For Users:
- Visit the homepage
- Scroll to the footer
- Click on any social media icon to visit the configured URL
- If no URL is configured, the link defaults to `#` (no action)

## Technical Details

### Security
- Admin-only access for configuration
- URL validation (must start with http:// or https://)
- Proper authorization checks using existing session management
- SQL injection protection via Drizzle ORM

### Performance
- Single API call on homepage load
- Cached in component state
- No impact on page load time

### Error Handling
- Graceful fallback to `#` if API fails
- Console error logging for debugging
- User-friendly error messages in admin panel

## Files Modified/Created

### Created:
1. `/app/api/admin/social-networks/route.ts`
2. `/app/api/settings/social-networks/route.ts`
3. `/docs/implementation-social-networks-config.md`

### Modified:
1. `/lib/db/schema.ts` - Added social network URL fields
2. `/lib/services/system-settings-service.ts` - Added update method
3. `/app/(dashboard)/dashboard/admin/parametres/page.tsx` - Added configuration UI
4. `/app/page.tsx` - Updated footer to use dynamic URLs

## Database Migration
```sql
ALTER TABLE system_settings
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(500);
```

## Testing Checklist
- [ ] Admin can access the configuration page
- [ ] Admin can save LinkedIn URL
- [ ] Admin can save YouTube URL
- [ ] Admin can save Instagram URL
- [ ] URLs are validated (must start with http:// or https://)
- [ ] Homepage footer displays configured URLs
- [ ] Links open in new tab
- [ ] Links work correctly when clicked
- [ ] Fallback to `#` when URLs are not configured
- [ ] Non-admin users cannot access configuration endpoint

## Future Enhancements
- Add more social networks (Twitter/X, Facebook, TikTok)
- Add URL preview/validation
- Add ability to enable/disable individual social networks
- Add analytics tracking for social media clicks
