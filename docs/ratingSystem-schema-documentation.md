# SimplyJury Rating System - Schema Documentation

## Overview

The SimplyJury rating system is designed following Uber's bi-directional rating model, where both training centers and juries can rate each other after completed sessions. The system emphasizes transparency, privacy protection, and quality control through comprehensive moderation features.

## Core Principles

### 🎯 **Uber-Inspired Design Principles**
- **Mutual Rating**: Both parties rate each other after each session
- **Transparency**: Public visibility of overall ratings and statistics
- **Privacy Protection**: Anonymous comments and controlled personal data exposure
- **Quality Control**: Comprehensive moderation and reporting system
- **Accountability**: Rating history follows users across sessions

## Database Schema

### 1. Core Rating Table: `session_ratings`

The main table storing all rating data with comprehensive moderation support.

#### Structure
```sql
session_ratings (
    id SERIAL PRIMARY KEY,
    jury_request_id INTEGER NOT NULL REFERENCES jury_requests(id),
    rater_id INTEGER NOT NULL REFERENCES users(id),
    rated_id INTEGER NOT NULL REFERENCES users(id),
    rater_type VARCHAR(10) CHECK (rater_type IN ('centre', 'jury')),
    
    -- Rating Criteria (1-5 scale)
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
    expertise_rating INTEGER CHECK (expertise_rating >= 1 AND expertise_rating <= 5),
    overall_rating DECIMAL(2,1), -- Auto-calculated average
    
    -- Feedback
    comment TEXT,
    would_recommend BOOLEAN,
    
    -- Moderation & Visibility Controls
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'flagged', 'removed')),
    is_flagged BOOLEAN DEFAULT FALSE,
    flagged_reason TEXT,
    moderated_by INTEGER REFERENCES users(id),
    moderated_at TIMESTAMP,
    is_visible BOOLEAN DEFAULT TRUE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    public_visibility BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(jury_request_id, rater_id) -- One rating per user per session
)
```

#### Field Descriptions

**Core Rating Fields:**
- `communication_rating`: Quality of communication and exchanges (1-5)
- `punctuality_rating`: Respect for schedules and deadlines (1-5)
- `expertise_rating`: Level of expertise and technical skills (1-5)
- `overall_rating`: Automatically calculated average of the three criteria

**Moderation Fields:**
- `status`: Current state of the rating (`active`, `hidden`, `flagged`, `removed`)
- `is_flagged`: Quick flag for ratings requiring attention
- `flagged_reason`: Explanation for why the rating was flagged
- `moderated_by`: Admin user who performed moderation action
- `moderated_at`: Timestamp of moderation action

**Visibility Controls:**
- `is_visible`: Controls if rating appears in any views
- `is_anonymous`: Hides rater identity in public views
- `public_visibility`: Controls if rating appears in public profiles

### 2. Rating Reports Table: `rating_reports`

Handles user reports of inappropriate ratings with full audit trail.

#### Structure
```sql
rating_reports (
    id SERIAL PRIMARY KEY,
    rating_id INTEGER NOT NULL REFERENCES session_ratings(id),
    reporter_id INTEGER NOT NULL REFERENCES users(id),
    report_reason VARCHAR(50) CHECK (report_reason IN (
        'inappropriate_language', 
        'false_information', 
        'harassment', 
        'spam', 
        'other'
    )),
    report_details TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 
        'reviewed', 
        'resolved', 
        'dismissed'
    )),
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(rating_id, reporter_id) -- Prevent duplicate reports
)
```

### 3. Supporting Tables

#### `rating_criteria`
Flexible configuration for rating criteria.

```sql
rating_criteria (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    user_type VARCHAR(10) CHECK (user_type IN ('centre', 'jury', 'both')),
    active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
)
```

#### `rating_details`
Extended rating storage for flexible criteria (future use).

```sql
rating_details (
    id SERIAL PRIMARY KEY,
    session_rating_id INTEGER NOT NULL REFERENCES session_ratings(id),
    criteria_id INTEGER NOT NULL REFERENCES rating_criteria(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(session_rating_id, criteria_id)
)
```

## Public Views

### 1. `public_user_ratings`
Aggregated rating statistics visible to all users (Uber-style public profiles).

```sql
SELECT 
    rated_id as user_id,
    COUNT(*) as total_ratings,
    ROUND(AVG(overall_rating), 1) as avg_overall_rating,
    ROUND(AVG(communication_rating), 1) as avg_communication,
    ROUND(AVG(punctuality_rating), 1) as avg_punctuality,
    ROUND(AVG(expertise_rating), 1) as avg_expertise,
    COUNT(CASE WHEN would_recommend = true THEN 1 END) as recommendations,
    ROUND(COUNT(CASE WHEN would_recommend = true THEN 1 END) * 100.0 / COUNT(*), 1) as recommendation_percentage
FROM session_ratings 
WHERE status = 'active' AND is_visible = true AND public_visibility = true
GROUP BY rated_id;
```

### 2. `public_rating_comments`
Anonymous comments visible to public (privacy-protected).

```sql
SELECT 
    rated_id as user_id,
    overall_rating,
    CASE 
        WHEN is_anonymous = true OR comment IS NULL THEN NULL
        ELSE comment 
    END as comment,
    would_recommend,
    created_at,
    NULL as rater_name -- Privacy protection
FROM session_ratings
WHERE status = 'active' AND is_visible = true AND public_visibility = true
AND comment IS NOT NULL;
```

## Access Control Rules

### 🔐 **Data Visibility Matrix**

| Data Type | Public | Rated User | Rater | Admin | Notes |
|-----------|--------|------------|-------|-------|-------|
| Overall Rating Average | ✅ | ✅ | ✅ | ✅ | Uber-style public visibility |
| Total Rating Count | ✅ | ✅ | ✅ | ✅ | Public transparency |
| Individual Rating Scores | ❌ | ✅ | ✅ | ✅ | Private to involved parties |
| Comments (Anonymous) | ✅ | ✅ | ✅ | ✅ | No rater identification |
| Comments (Attributed) | ❌ | ✅ | ✅ | ✅ | Only to involved parties |
| Rater Identity | ❌ | ❌ | ✅ | ✅ | Privacy protection |
| Moderation Data | ❌ | ❌ | ❌ | ✅ | Admin-only access |

### 🛡️ **Row Level Security (RLS) Rules**

#### For `session_ratings` table:

1. **Public Read Access** (for aggregated data):
   ```sql
   -- Anyone can see public rating summaries
   status = 'active' AND is_visible = true AND public_visibility = true
   ```

2. **User Read Access** (for detailed data):
   ```sql
   -- Users can see ratings they gave or received
   (auth.uid()::text)::integer IN (rater_id, rated_id)
   ```

3. **Admin Full Access**:
   ```sql
   -- Admins can see everything
   EXISTS (
     SELECT 1 FROM users 
     WHERE id = (auth.uid()::text)::integer 
     AND user_type = 'admin'
   )
   ```

4. **Insert/Update Restrictions**:
   ```sql
   -- Only session participants can create ratings
   -- Only within 24 hours for updates
   -- Only for completed sessions
   ```

#### For `rating_reports` table:

1. **Reporter Access**:
   ```sql
   -- Users can see reports they created
   reporter_id = (auth.uid()::text)::integer
   ```

2. **Admin Access**:
   ```sql
   -- Admins can see all reports
   EXISTS (
     SELECT 1 FROM users 
     WHERE id = (auth.uid()::text)::integer 
     AND user_type = 'admin'
   )
   ```

## Business Rules

### 📋 **Rating Eligibility**
- ✅ Session must have `status = 'completed'`
- ✅ Session date must be in the past
- ✅ Both parties (center and jury) can rate each other
- ✅ One rating per user per session (enforced by unique constraint)
- ✅ 30-day window for rating submission after session completion

### 📝 **Rating Modification**
- ✅ Users can edit their ratings within 24 hours of creation
- ✅ After 24 hours, ratings become immutable (except for admin moderation)
- ✅ Users cannot delete ratings, only admins can hide/remove them

### 🚨 **Automatic Moderation**
- ✅ Ratings with 3+ reports are automatically flagged
- ✅ Flagged ratings remain visible but marked for admin review
- ✅ Admins can hide, remove, or restore ratings
- ✅ All moderation actions are logged with timestamps and admin IDs

### 🔒 **Privacy Protection**
- ✅ Comments can be marked as anonymous
- ✅ Rater identity is never exposed in public views
- ✅ Users cannot see who specifically rated them (Uber model)
- ✅ Only aggregated statistics are publicly visible

## API Endpoints

### Rating Management
- `GET /api/session-ratings` - Fetch ratings (with filtering)
- `POST /api/session-ratings` - Create new rating
- `PUT /api/session-ratings` - Update existing rating (24h window)

### Reporting System
- `POST /api/rating-reports` - Report inappropriate rating
- `GET /api/rating-reports` - View reports (admin/reporter only)
- `PUT /api/rating-reports` - Update report status (admin only)

### Public Data
- `GET /api/public-ratings/:userId` - Public rating profile
- `GET /api/rating-stats` - Platform-wide rating statistics

## Moderation Workflow

### 🔍 **Report Processing**
1. User reports inappropriate rating
2. Report stored in `rating_reports` table
3. If rating receives 3+ reports, automatically flagged
4. Admin reviews flagged content
5. Admin takes action (dismiss, hide, remove)
6. Resolution logged with notes

### 👮 **Admin Actions**
- **Hide Rating**: `status = 'hidden'` (not visible to public, visible to participants)
- **Remove Rating**: `status = 'removed'` (not visible to anyone except admin)
- **Flag Rating**: `is_flagged = true` (marked for review)
- **Restore Rating**: `status = 'active'` (make visible again)

### 📊 **Audit Trail**
All moderation actions include:
- `moderated_by`: Admin user ID
- `moderated_at`: Timestamp of action
- `flagged_reason`: Explanation for action
- `resolution_notes`: Detailed admin notes

## Performance Optimizations

### 🚀 **Database Indexes**
```sql
-- Core performance indexes
CREATE INDEX idx_session_ratings_rated_rater_type ON session_ratings(rated_id, rater_type);
CREATE INDEX idx_session_ratings_status ON session_ratings(status);
CREATE INDEX idx_session_ratings_public_visibility ON session_ratings(public_visibility);
CREATE INDEX idx_session_ratings_is_flagged ON session_ratings(is_flagged);

-- Moderation indexes
CREATE INDEX idx_rating_reports_status ON rating_reports(status);
CREATE INDEX idx_rating_reports_created_at ON rating_reports(created_at);
```

### 📈 **Query Optimization**
- Use materialized views for frequently accessed aggregations
- Implement caching for public rating profiles
- Batch process rating statistics updates
- Use database triggers for automatic calculations

## Integration Points

### 🔗 **Related Systems**
- **Session Management**: Links to `jury_requests` table
- **User Management**: Links to `users` table for all participants
- **Notification System**: Triggers for rating requests and reports
- **Analytics Dashboard**: Aggregated rating data for insights

### 📱 **UI Components**
- **Rating Modal**: 5-star rating interface with criteria
- **Public Profile**: Display aggregated ratings and anonymous comments
- **Admin Panel**: Moderation tools and report management
- **Rating History**: Personal rating dashboard for users

## Email Notification System

### 📧 **Rating Invitation Emails**

When a center changes a jury request status from "accepted" to "completed", the system automatically sends rating invitation emails to both parties to encourage mutual evaluation.

#### **Trigger Conditions**
- Session status changes to "completed"
- Session date is in the past (prevents premature rating requests)
- Both center and jury users have valid email addresses
- No duplicate emails for the same session

#### **Email Templates**

**Center Rating Invitation Email:**
- **Subject**: `Évaluez votre jury - Session [Certification Title]`
- **Template**: `center-rating-invitation`
- **Call-to-Action**: Links to `/dashboard/sessions` 
- **Content**: Invites center to rate jury on 3 criteria (Communication, Punctuality, Expertise)
- **Session Details**: Includes certification info, jury details, session specifics

**Jury Rating Invitation Email:**
- **Subject**: `Évaluez le centre de formation - Mission [Certification Title]`
- **Template**: `jury-rating-invitation`
- **Call-to-Action**: Links to `/dashboard/missions`
- **Content**: Invites jury to provide global rating for the center
- **Session Details**: Includes certification info, center details, session specifics

#### **Implementation Details**

**Server Action**: `sendRatingInvitationEmails(requestId: number)`
- **Location**: `/lib/actions/rating-invitation-actions.ts`
- **Trigger**: Called when session status changes to "completed"
- **Process**: 
  1. Validates session eligibility
  2. Fetches session and participant data
  3. Sends parallel emails to both parties
  4. Returns success/failure status for each email

**Email Service Integration**:
```typescript
EmailService.sendRatingInvitationEmails(
  centerEmail: string,
  centerName: string,
  contactPersonName: string,
  juryEmail: string,
  juryFirstName: string,
  juryLastName: string,
  sessionData: SessionData
)
```

#### **Email Content Structure**

Both emails include:
- **Header**: Branded header with appropriate colors (blue for centers, green for juries)
- **Session Summary**: Complete session details in a formatted card
- **Rating Invitation**: Personalized message explaining the rating process
- **Call-to-Action Button**: Direct link to appropriate dashboard page
- **Footer**: Professional closing with SimplyJury branding

#### **Error Handling**
- **Partial Success**: If one email fails, the other can still succeed
- **Retry Logic**: Failed emails are logged for potential retry
- **Validation**: Pre-flight checks ensure data completeness
- **Fallback**: Graceful degradation if email service is unavailable

#### **Usage Integration**

The rating invitation system integrates with:
- **Session Management**: Triggered by status changes
- **Dashboard Pages**: Email links direct users to rating interfaces
- **Rating Modal**: Simplified interface for juries vs detailed for centers
- **Audit Trail**: All email attempts are logged for tracking

**Example Integration in Session Status Update:**
```typescript
// When updating session status to "completed"
if (newStatus === 'completed' && oldStatus === 'accepted') {
  await sendRatingInvitationEmails(sessionId);
}
```

## Security Considerations

### 🛡️ **Data Protection**
- All personal data encrypted at rest
- RLS policies prevent unauthorized access
- API rate limiting to prevent abuse
- Input validation and sanitization

### 🔐 **Authentication Requirements**
- All rating operations require authenticated users
- Session validation for rating eligibility
- Admin role verification for moderation actions
- JWT token validation for API access

## Future Enhancements

### 🚀 **Planned Features**
- **Machine Learning**: Automatic detection of fake/spam ratings
- **Advanced Analytics**: Rating trends and insights dashboard
- **Gamification**: Badges and achievements for highly-rated users
- **Integration**: Export ratings to external certification systems
- **Mobile API**: Dedicated endpoints for mobile applications

---

*This documentation covers the complete rating system schema and business rules. For implementation details and API specifications, refer to the respective technical documentation files.*
