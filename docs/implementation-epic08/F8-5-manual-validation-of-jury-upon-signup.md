# F8-5 - Manual Validation of Jury Upon Signup

## Overview
This document describes the implementation of an automated email notification system that alerts validators when a new jury member completes their profile registration on the SimplyJury platform.

## Part 1 - Send Email to Validator After Profile Completion

### Business Context
When a jury member signs up on the platform, they must complete a detailed profile form after email verification. Once this profile is completed, designated validators need to be notified to review and validate the new jury profile before the member can access full platform functionality.

### Implementation Details

#### 1. Database Schema Changes
**File Modified**: `/lib/db/schema.ts`
- Added `isValidator` boolean column to the `users` table with default value `false`
- This allows administrators to designate specific users as validators
- Validators can be either admin users (`user_type = 'admin'`) or regular users with validator privileges (`is_validator = true`)

```sql
-- Migration applied via Supabase MCP
ALTER TABLE users ADD COLUMN is_validator BOOLEAN DEFAULT FALSE;
UPDATE users SET is_validator = TRUE WHERE id = 20; -- Example validator setup
```

#### 2. Email Template Component
**File Created**: `/components/emails/jury-validation-request.tsx`

A professional React Email template that includes:
- **Validator personalization**: Addresses the validator by name
- **Jury profile summary**: Displays key information about the new jury member
  - Full name (first name + last name)
  - Location (city, region)
  - Hourly rate (if provided)
  - Profile photo (if uploaded)
  - Expertise domains list
- **Call-to-action button**: Direct link to `/dashboard/admin/validation-profils`
- **Brand consistency**: Uses SimplyJury branding and color scheme
- **Responsive design**: Works across email clients

#### 3. Email Service Extension
**File Modified**: `/lib/email/resend-service.ts`

Added new method `sendJuryValidationRequest()` to the EmailService class:
- Integrates with existing Resend API configuration
- Uses the new jury validation request email template
- Handles email delivery errors gracefully
- Maintains consistent email formatting and branding

#### 4. Server Action Implementation
**File Created**: `/lib/actions/jury-validation-actions.ts`

Core function: `notifyValidatorsOfNewJury(juryUserId: number)`

**Process Flow**:
1. **Data Retrieval**: Fetches jury profile and user data from database
2. **Validator Query**: Identifies all validators using SQL query:
   ```sql
   SELECT * FROM users 
   WHERE user_type = 'admin' OR is_validator = true
   ```
3. **Email Distribution**: Sends personalized emails to each validator
4. **Error Handling**: Continues operation even if individual emails fail
5. **Logging**: Comprehensive logging for debugging and monitoring
6. **Result Reporting**: Returns detailed success/failure statistics

**Features**:
- Parallel email sending for performance
- Individual error handling per validator
- Detailed logging for troubleshooting
- Graceful degradation (profile creation succeeds even if emails fail)

#### 5. API Integration
**File Modified**: `/app/api/profile/jury/route.ts`

Enhanced the POST endpoint that handles jury profile creation:
- **Trigger Point**: After successful profile creation and `profile_completed = true`
- **Async Execution**: Validator notifications run after profile is saved
- **Non-blocking**: Email failures don't affect profile creation success
- **Logging**: Comprehensive logging for monitoring email delivery

**Integration Flow**:
```javascript
// After successful profile creation
const result = await withRLSContext(userId, async () => {
  // Create jury profile
  const juryProfileId = await JuryProfileService.createProfile(userId, profileData);
  
  // Mark profile as completed
  await db.update(users)
    .set({ profileCompleted: true })
    .where(eq(users.id, userId));
    
  return { id: juryProfileId };
});

// Send validator notifications (non-blocking)
await notifyValidatorsOfNewJury(userId);
```

### Complete User Journey

1. **Jury Signup**: User registers as jury type at `/sign-up`
2. **Email Verification**: User verifies email address
3. **Profile Completion**: User completes detailed profile form at `/app/profile/jury/page.tsx`
4. **Profile Submission**: Form data sent to `/api/profile/jury` (POST)
5. **Database Update**: Profile created, `profile_completed = true`
6. **🆕 Validator Notification**: System automatically sends emails to all validators
7. **Validator Action**: Validators receive email with jury details and validation link
8. **Validation Process**: Validators access `/dashboard/admin/validation-profils` to review

### Technical Specifications

#### Email Content Structure
- **Subject**: "Nouveau profil jury à valider - [FirstName] [LastName]"
- **Sender**: Configured via `FROM_EMAIL` environment variable
- **Template**: React-based email with responsive design
- **CTA Button**: Links to validation dashboard with proper styling

#### Error Handling Strategy
- **Profile Creation**: Always succeeds regardless of email status
- **Email Failures**: Logged but don't block user experience
- **Validator Queries**: Graceful handling of empty validator lists
- **Network Issues**: Retry logic handled by Resend service

#### Performance Considerations
- **Parallel Processing**: Multiple validator emails sent concurrently
- **Database Optimization**: Single query to fetch all validators
- **Memory Efficiency**: Streaming approach for large validator lists
- **Timeout Handling**: Resend service manages email delivery timeouts

### Configuration Requirements

#### Environment Variables
```bash
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@simplyjury.com
FROM_NAME=SimplyJury
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### Validator Setup
Administrators can designate validators by:
1. Setting `user_type = 'admin'` (automatic validator privileges)
2. Setting `is_validator = true` for specific users

### Monitoring and Logging

The system provides comprehensive logging at each step:
- Validator query results
- Email sending attempts and results
- Error details for failed deliveries
- Success statistics for reporting

**Log Examples**:
```
Starting validator notification process for jury user ID: 123
Found 3 validators to notify
Sending validation email to validator: admin@company.com
Successfully sent email to validator: admin@company.com
Notification summary: 3 successful, 0 failed
```

### Future Enhancements

Potential improvements for future iterations:
- **Email Templates**: Multiple template variations for different validator types
- **Notification Preferences**: Allow validators to set email preferences
- **Batch Notifications**: Daily/weekly digest options for high-volume periods
- **Mobile Notifications**: Push notifications for mobile app validators
- **Validation Reminders**: Follow-up emails for pending validations

### Testing Considerations

To test the implementation:
1. Create a test jury user account
2. Set up a test validator (set `is_validator = true`)
3. Complete the jury profile form
4. Verify email delivery to validator
5. Check validation dashboard accessibility
6. Monitor logs for any errors

This implementation ensures that all designated validators are immediately notified when new jury members complete their profiles, enabling prompt validation and improved user experience.
