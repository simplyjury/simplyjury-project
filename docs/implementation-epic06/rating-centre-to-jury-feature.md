# Rating System: Centre to Jury Feature Documentation

## Overview

The Centre to Jury rating system allows training centers to evaluate juries after completed certification sessions. This feature provides a comprehensive rating mechanism with multiple criteria, comments, and recommendations, enabling quality assessment and feedback for the jury community.

## Feature Scope

### Core Functionality
- **Multi-criteria Rating**: Communication, Punctuality, Expertise, Overall rating (1-5 scale)
- **Qualitative Feedback**: Comment system for detailed feedback
- **Recommendation System**: Binary recommendation (would recommend/not recommend)
- **Rating Display**: Real-time rating aggregation and display across the platform
- **Historical Tracking**: Complete audit trail of all ratings

### User Roles
- **Training Centers**: Can rate juries after completed sessions
- **Juries**: Can view their received ratings and statistics
- **System**: Automatically calculates and displays aggregated ratings

## Database Schema

### Core Tables

#### `session_ratings`
```sql
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
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Related Tables
- **`jury_requests`**: Links ratings to specific certification sessions
- **`users`**: Contains both center and jury user information
- **`training_centers`**: Center-specific information for rating context

## API Endpoints

### 1. Session Ratings API (`/api/session-ratings`)

#### POST - Create Rating
**Purpose**: Allows centers to submit ratings for juries after completed sessions

**Authentication**: Required (Center users only)

**Request Body**:
```json
{
  "jury_request_id": 123,
  "communication_rating": 4,
  "punctuality_rating": 5,
  "expertise_rating": 3,
  "overall_rating": 4.0,
  "comment": "Excellent communication skills, very professional",
  "would_recommend": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Évaluation enregistrée avec succès"
}
```

**Validation Rules**:
- All rating fields must be between 1-5
- `overall_rating` accepts decimal values (1.0-5.0)
- `jury_request_id` must exist and be completed
- Center can only rate once per session
- Only the center that requested the jury can rate

#### GET - Fetch Ratings
**Purpose**: Retrieve ratings for a specific session

**Query Parameters**:
- `jury_request_id`: Session ID to fetch ratings for

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "communication_rating": 4,
      "punctuality_rating": 5,
      "expertise_rating": 3,
      "overall_rating": "4.0",
      "comment": "Excellent communication skills",
      "would_recommend": true,
      "rater_type": "centre",
      "created_at": "2025-09-19T10:30:00Z"
    }
  ]
}
```

### 2. Jury Ratings API (`/api/jury-ratings`)

#### GET - Fetch Jury's Received Ratings
**Purpose**: Allows juries to view all ratings they have received

**Authentication**: Required (Jury users only)

**Response**:
```json
{
  "success": true,
  "data": {
    "totalRatings": 5,
    "averageRatings": {
      "communication": 4.2,
      "punctuality": 4.8,
      "expertise": 3.9,
      "overall": 4.3
    },
    "recommendationPercentage": 80,
    "ratings": [
      {
        "id": 1,
        "communication_rating": 4,
        "punctuality_rating": 5,
        "expertise_rating": 3,
        "overall_rating": 4.0,
        "comment": "Very professional jury",
        "would_recommend": true,
        "certification_title": "RNCP31114",
        "session_date": "2025-09-18",
        "center_name": "CNAM",
        "created_at": "2025-09-19T10:30:00Z"
      }
    ]
  }
}
```

### 3. Jury Ratings Summary API (`/api/jury-ratings-summary`)

#### GET - Bulk Jury Ratings for Centers
**Purpose**: Allows centers to fetch rating summaries for multiple juries (used in sessions list)

**Authentication**: Required (Center users only)

**Query Parameters**:
- `jury_ids`: Comma-separated list of jury user IDs

**Example**: `/api/jury-ratings-summary?jury_ids=18,27,28`

**Response**:
```json
{
  "success": true,
  "data": {
    "18": {
      "averageRating": 4.4,
      "totalRatings": 2
    },
    "27": {
      "averageRating": 0,
      "totalRatings": 0
    }
  }
}
```

## User Interface Components

### 1. Rating Modal (`/components/ratings/rating-modal.tsx`)

**Purpose**: Modal component for centers to submit ratings

**Key Features**:
- **Star Rating Interface**: Interactive 5-star rating for each criterion
- **Comment System**: Rich text area for detailed feedback
- **Recommendation Toggle**: Binary choice for recommendation
- **Form Validation**: Client-side validation with error messages
- **Responsive Design**: Mobile-friendly interface

**Props**:
```typescript
interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  juryId: number | null;
  onSubmit: (ratingData: RatingData) => Promise<void>;
}
```

### 2. Jury Ratings Section (`/components/profile/jury-ratings-section.tsx`)

**Purpose**: Display component for juries to view their ratings on profile page

**Key Features**:
- **Overall Rating Display**: Large rating with stars
- **Criteria Breakdown**: Individual ratings for each criterion
- **Statistics Summary**: Total ratings and recommendation percentage
- **Individual Reviews**: Expandable list of detailed ratings
- **Empty State**: Appropriate message when no ratings exist

**Props**:
```typescript
interface JuryRatingsSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
}
```

## Integration Points

### 1. Center Sessions Page (`/dashboard/sessions`)

**Integration**: Real-time rating display in session history

**Features**:
- **Rating Button**: Appears for completed sessions
- **Rating Status**: Shows if session has been rated
- **Jury Rating Display**: Shows jury's overall rating and review count
- **Modal Integration**: Opens rating modal for unrated sessions

**Implementation**:
```typescript
// Fetch jury ratings for display
const fetchJuryRatings = async (sessionsData: Session[]) => {
  const juryIds = [...new Set(sessionsData.map(session => session.jury_id))];
  const response = await fetch(`/api/jury-ratings-summary?jury_ids=${juryIds.join(',')}`);
  const result = await response.json();
  if (result.success) {
    setJuryRatings(result.data);
  }
};
```

### 2. Jury Search Page (`/dashboard/search`)

**Integration**: Real-time rating display in search results

**Features**:
- **Rating Display**: Shows average rating and review count for each jury
- **Conditional Rendering**: Shows "Aucune évaluation" for unrated juries
- **Star Visualization**: Visual star rating display

**Implementation**:
```typescript
// API integration in jury search
const ratingsMap = Object.keys(groupedRatings).reduce((acc, juryId) => {
  const juryIdNum = parseInt(juryId);
  const juryRatings = groupedRatings[juryIdNum];
  const averageRating = juryRatings.reduce((sum, rating) => sum + rating, 0) / juryRatings.length;
  
  acc[juryIdNum] = {
    averageRating: Math.round(averageRating * 10) / 10,
    totalRatings: juryRatings.length
  };
  return acc;
}, {});
```

### 3. Jury Profile Page (`/dashboard/profile`)

**Integration**: Comprehensive ratings display for jury users

**Features**:
- **Rating Summary**: Overall statistics and averages
- **Detailed Reviews**: Individual rating breakdowns
- **Historical View**: Complete rating history
- **Performance Insights**: Recommendation percentage and trends

## Technical Implementation Details

### Rating Calculation Logic

#### Average Rating Calculation
```typescript
const averageRatings = {
  communication: Math.round((communicationSum / totalRatings) * 10) / 10,
  punctuality: Math.round((punctualitySum / totalRatings) * 10) / 10,
  expertise: Math.round((expertiseSum / totalRatings) * 10) / 10,
  overall: Math.round((overallSum / totalRatings) * 10) / 10
};
```

#### Recommendation Percentage
```typescript
const recommendationPercentage = totalRatings > 0 
  ? Math.round((recommendationsCount / totalRatings) * 100) 
  : 0;
```

### Star Rating Rendering
```typescript
const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <>
      {'⭐'.repeat(fullStars)}
      {hasHalfStar && '⭐'}
      {'☆'.repeat(emptyStars)}
    </>
  );
};
```

### Data Security & Validation

#### Authentication Middleware
- **Session Validation**: All endpoints verify user authentication
- **Role-Based Access**: Centers can only rate, juries can only view their ratings
- **Request Validation**: Comprehensive input validation on all endpoints

#### Data Integrity
- **Unique Constraints**: One rating per center per session
- **Status Management**: Soft delete with status field
- **Audit Trail**: Complete timestamp tracking

## User Flow

### Center Rating Flow
1. **Session Completion**: Center marks session as completed
2. **Rating Trigger**: "Évaluer" button appears in session history
3. **Modal Opening**: Rating modal opens with session context
4. **Rating Submission**: Center fills criteria, comment, and recommendation
5. **Validation**: Client and server-side validation
6. **Storage**: Rating saved to database
7. **UI Update**: Session marked as rated, jury rating updated

### Jury Viewing Flow
1. **Profile Access**: Jury visits their profile page
2. **Ratings Section**: Expandable ratings section displays
3. **Summary View**: Overall rating, criteria averages, statistics
4. **Detail Expansion**: Individual ratings with full context
5. **Historical Context**: Session details and center information

## Performance Optimizations

### Database Optimizations
- **Batch Queries**: Fetch multiple jury ratings in single query
- **Indexed Queries**: Proper indexing on `rated_id`, `rater_type`, `status`
- **Aggregation**: Server-side calculation of averages and counts

### Frontend Optimizations
- **Conditional Rendering**: Only show ratings when data exists
- **Lazy Loading**: Ratings fetched on demand
- **Caching**: SWR for client-side caching of rating data

## Error Handling

### API Error Responses
```json
{
  "success": false,
  "error": "Vous avez déjà évalué cette session",
  "code": "ALREADY_RATED"
}
```

### Common Error Scenarios
- **Duplicate Rating**: Center attempts to rate same session twice
- **Unauthorized Access**: Non-center user attempts to rate
- **Invalid Session**: Rating attempted on non-completed session
- **Missing Data**: Required rating fields not provided

## Testing Considerations

### Unit Tests
- **Rating Calculation**: Verify average calculations
- **Validation Logic**: Test input validation rules
- **Permission Checks**: Verify role-based access control

### Integration Tests
- **API Endpoints**: Test complete request/response cycles
- **Database Operations**: Verify data persistence and retrieval
- **UI Components**: Test modal interactions and data display

### Test Data
```sql
-- Sample test data for ratings
INSERT INTO session_ratings (
  jury_request_id, rater_id, rated_id, rater_type,
  communication_rating, punctuality_rating, expertise_rating, overall_rating,
  comment, would_recommend
) VALUES (
  1, 2, 18, 'centre',
  4, 5, 3, 4.0,
  'Excellent communication skills, very professional',
  true
);
```

## Future Enhancements

### Potential Improvements
1. **Rating Analytics**: Detailed performance analytics for juries
2. **Comparative Ratings**: Jury performance comparison tools
3. **Rating Trends**: Historical trend analysis
4. **Automated Insights**: AI-powered feedback analysis
5. **Rating Disputes**: System for handling rating disputes
6. **Bulk Rating**: Ability to rate multiple sessions at once

### Scalability Considerations
- **Database Partitioning**: Partition ratings by date for large datasets
- **Caching Strategy**: Redis caching for frequently accessed ratings
- **API Rate Limiting**: Prevent rating spam and abuse
- **Background Processing**: Async calculation of rating aggregations

## Conclusion

The Centre to Jury rating system provides a comprehensive solution for quality assessment in the SimplyJury platform. It enables training centers to provide meaningful feedback to juries while giving juries insights into their performance. The system is designed with scalability, security, and user experience in mind, providing a solid foundation for the platform's quality assurance mechanisms.

The implementation follows best practices for API design, database management, and user interface development, ensuring maintainability and extensibility for future enhancements.
