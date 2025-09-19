# Rating System: Jury to Center Feature Documentation

## Overview

The Jury to Center rating system allows juries to evaluate training centers after completed certification sessions. This feature provides a simplified rating mechanism with a single global rating, comments, and recommendations, enabling quality assessment and feedback for the training center community.

## Feature Scope

### Core Functionality
- **Single Global Rating**: Simplified 1-5 star rating system (unlike centers who use 3 criteria)
- **Qualitative Feedback**: Comment system for detailed feedback
- **Recommendation System**: Binary recommendation (would recommend/not recommend)
- **Rating Display**: Real-time rating aggregation and display across the platform
- **Historical Tracking**: Complete audit trail of all ratings

### User Roles
- **Juries**: Can rate training centers after completed sessions using simplified interface
- **Training Centers**: Can view their received ratings and statistics
- **System**: Automatically calculates and displays aggregated ratings

## Key Differences from Center-to-Jury Rating

### Jury Rating Interface (Simplified)
- **Single Global Rating**: Juries provide only one overall rating (1-5 stars)
- **No Criteria Breakdown**: Unlike centers, juries don't rate individual criteria
- **Simplified UI**: Cleaner, more focused rating interface
- **Same Comment & Recommendation**: Comment field and recommendation toggle remain the same

### Center Rating Interface (Detailed)
- **Three Criteria**: Communication, Punctuality, Expertise ratings
- **Detailed Breakdown**: Individual ratings for each criterion
- **Calculated Average**: Overall rating calculated from the 3 criteria

## Database Schema

The existing `session_ratings` table handles both center-to-jury and jury-to-center ratings:

```sql
-- Existing table structure supports both rating types
CREATE TABLE session_ratings (
  id SERIAL PRIMARY KEY,
  jury_request_id INTEGER REFERENCES jury_requests(id),
  rater_id INTEGER REFERENCES users(id),
  rated_id INTEGER REFERENCES users(id),
  rater_type VARCHAR(20) CHECK (rater_type IN ('centre', 'jury')),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
  expertise_rating INTEGER CHECK (expertise_rating BETWEEN 1 AND 5),
  overall_rating DECIMAL(2,1) CHECK (overall_rating BETWEEN 1.0 AND 5.0),
  comment TEXT,
  would_recommend BOOLEAN,
  -- ... other fields
);
```

### Data Storage for Jury Ratings
When a jury submits a rating:
- `rater_type` = 'jury'
- `communication_rating` = global_rating (same value)
- `punctuality_rating` = global_rating (same value)  
- `expertise_rating` = global_rating (same value)
- `overall_rating` = global_rating
- This maintains API compatibility while storing the simplified rating

## API Endpoints

### Existing Endpoints (Modified Behavior)

#### POST `/api/session-ratings` - Create Rating
**Behavior**: Handles both center and jury ratings with different validation

**For Jury Ratings**:
```json
{
  "jury_request_id": 123,
  "rated_id": 456, // Center user ID
  "communication_rating": 4, // Same as global rating
  "punctuality_rating": 4,   // Same as global rating
  "expertise_rating": 4,     // Same as global rating
  "overall_rating": 4,       // Global rating
  "comment": "Great organization and support",
  "would_recommend": true
}
```

**Validation**:
- Jury can only rate centers they worked with
- Session must be completed and in the past
- One rating per jury per session
- Global rating must be between 1-5

#### GET `/api/session-ratings` - Fetch Ratings
**Behavior**: Returns ratings with `rater_type` to distinguish jury vs center ratings

#### GET `/api/jury-missions` - Fetch Jury Missions
**Existing endpoint**: Already provides completed missions for juries to rate

## User Interface Components

### 1. Modified Rating Modal (`/components/ratings/rating-modal.tsx`)

**Key Changes**:
- **Conditional Rendering**: Different UI based on `userType` prop
- **Simplified Jury Interface**: Single global rating with larger stars
- **Maintained Center Interface**: Existing 3-criteria system unchanged

**Jury Rating Interface**:
```tsx
{userType === 'jury' ? (
  // Single Global Rating
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-[#0d4a70]">Évaluation globale</h3>
    <div className="border rounded-lg p-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Star className="w-6 h-6 text-[#0d4a70]" />
          <div>
            <h4 className="font-semibold text-[#0d4a70]">Note générale</h4>
            <p className="text-sm text-gray-600">Évaluez votre expérience globale avec ce centre</p>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button onClick={() => setGlobalRating(star)}>
              <Star className={`w-8 h-8 ${star <= globalRating ? 'fill-yellow-400' : 'text-gray-300'}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
) : (
  // Existing 3-criteria interface for centers
  // ... existing code
)}
```

**Props Interface**:
```typescript
interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ratingData: RatingData) => Promise<void>;
  session: {
    id: number;
    certification_title: string;
    session_date: string;
    jury_name?: string;
    center_name?: string;
  };
  userType: 'centre' | 'jury'; // Determines interface type
  ratedUserId: number;
}
```

### 2. Missions Page (`/app/(dashboard)/dashboard/missions/page.tsx`)

**Existing Features**:
- ✅ Lists completed missions for juries
- ✅ Shows "Donner un avis" button for completed, unrated sessions
- ✅ Integrates with rating modal
- ✅ Tracks rating status per mission

**Integration**:
```tsx
// Existing code already supports jury ratings
<RatingModal
  isOpen={ratingModal.isOpen}
  onClose={closeRatingModal}
  onSubmit={handleSubmitRating}
  session={{
    id: ratingModal.mission.id,
    certification_title: ratingModal.mission.certification_title,
    session_date: ratingModal.mission.session_date,
    center_name: ratingModal.mission.center_name
  }}
  userType="jury" // This triggers the simplified interface
  ratedUserId={ratingModal.centerId}
/>
```

## User Flow

### Jury Rating Flow
1. **Access Missions**: Jury visits `/dashboard/missions`
2. **View Completed Sessions**: Page shows past completed missions
3. **Rating Trigger**: "Donner un avis" button appears for unrated completed sessions
4. **Simplified Modal**: Modal opens with single global rating interface
5. **Rating Submission**: Jury provides global rating, comment, and recommendation
6. **Validation**: Client and server-side validation
7. **Storage**: Rating saved with `rater_type = 'jury'`
8. **UI Update**: Session marked as rated

### Rating Display Flow
1. **Center Dashboard**: Centers can view received jury ratings
2. **Aggregated Display**: Ratings from juries contribute to overall center rating
3. **Rating Breakdown**: System distinguishes between jury and center ratings

## Technical Implementation

### Rating Submission Logic
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (userType === 'centre') {
    // Centers must provide all 3 criteria ratings
    if (ratings.communication_rating === 0 || ratings.punctuality_rating === 0 || ratings.expertise_rating === 0) {
      alert('Veuillez donner une note pour tous les critères');
      return;
    }
  } else {
    // Juries only need to provide global rating
    if (globalRating === 0) {
      alert('Veuillez donner une note globale');
      return;
    }
  }

  const ratingData: any = {
    jury_request_id: session.id,
    rated_id: ratedUserId,
    comment: comment.trim() || undefined,
    would_recommend: wouldRecommend || undefined
  };

  if (userType === 'centre') {
    // Centers provide individual criteria ratings
    ratingData.communication_rating = ratings.communication_rating;
    ratingData.punctuality_rating = ratings.punctuality_rating;
    ratingData.expertise_rating = ratings.expertise_rating;
  } else {
    // Juries provide global rating - use same value for all criteria for API compatibility
    ratingData.communication_rating = globalRating;
    ratingData.punctuality_rating = globalRating;
    ratingData.expertise_rating = globalRating;
    ratingData.overall_rating = globalRating;
  }

  await onSubmit(ratingData);
};
```

### Data Compatibility
- **API Compatibility**: Jury ratings use the same API endpoints as center ratings
- **Database Compatibility**: Same table structure, different `rater_type`
- **Display Logic**: UI components check `rater_type` to show appropriate information

## Security & Validation

### Authorization
- **Jury Verification**: Only juries can access jury rating interface
- **Session Validation**: Jury can only rate sessions they participated in
- **Completion Check**: Sessions must be completed and in the past
- **Duplicate Prevention**: One rating per jury per session

### Data Validation
- **Rating Range**: Global rating must be 1-5
- **Comment Length**: Optional comment with character limit
- **Recommendation**: Optional boolean recommendation

## Benefits

### For Juries
- **Simplified Process**: Quick and easy rating submission
- **Focused Feedback**: Single rating reduces cognitive load
- **Voice Heard**: Ability to provide feedback on center experience

### For Centers
- **Quality Feedback**: Receive feedback from jury perspective
- **Improvement Insights**: Comments help identify areas for improvement
- **Reputation Building**: Good ratings enhance center reputation

### For Platform
- **Bidirectional Feedback**: Complete feedback loop between centers and juries
- **Quality Assurance**: Helps maintain high standards across the platform
- **Data Insights**: Rich data for platform improvements

## Future Enhancements

### Potential Improvements
1. **Rating Analytics**: Detailed analytics for centers on jury feedback
2. **Trend Analysis**: Track rating trends over time
3. **Comparative Ratings**: Compare center performance across different metrics
4. **Automated Insights**: AI-powered feedback analysis
5. **Rating Incentives**: Gamification to encourage rating participation

## Testing Scenarios

### Test Cases
1. **Jury Rating Submission**: Verify jury can submit global rating
2. **Center Rating Unchanged**: Ensure center 3-criteria rating still works
3. **API Compatibility**: Test both rating types use same endpoints
4. **Authorization**: Verify proper access controls
5. **Data Storage**: Confirm ratings stored correctly with proper `rater_type`
6. **UI Rendering**: Test modal renders correctly for both user types

### Test Data
```sql
-- Test jury rating submission
INSERT INTO session_ratings (
  jury_request_id, rater_id, rated_id, rater_type,
  communication_rating, punctuality_rating, expertise_rating, overall_rating,
  comment, would_recommend
) VALUES (
  2, 18, 17, 'jury',
  4, 4, 4, 4.0,
  'Excellent organization and support throughout the session',
  true
);
```

## Conclusion

The Jury to Center rating system successfully extends the existing rating infrastructure to support bidirectional feedback while maintaining simplicity for juries. The implementation preserves the detailed center-to-jury rating system while providing a streamlined experience for jury-to-center ratings.

Key achievements:
- ✅ Simplified jury rating interface (single global rating)
- ✅ Maintained center rating complexity (3 criteria)
- ✅ API compatibility between both rating types
- ✅ Proper data storage and validation
- ✅ Seamless integration with existing missions page
- ✅ Complete user flow from mission completion to rating submission

The feature enhances the platform's feedback ecosystem while respecting the different needs and contexts of centers versus juries.
