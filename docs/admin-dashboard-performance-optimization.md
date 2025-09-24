# Admin Dashboard Performance Optimization

## Current Optimizations Implemented

### 1. **Query Optimization**
- **LIMIT 100**: Restricts results to prevent overwhelming UI
- **Smart Sorting**: Prioritizes upcoming sessions, then past sessions, then undefined dates
- **Minimal Initial Load**: Only essential fields in first query
- **Lazy Loading**: Detailed session info loaded only when expanded

### 2. **UI Performance**
- **Collapsible Rows**: Only essential info shown by default
- **Lazy Expansion**: Detailed data fetched on-demand
- **Single Expansion**: Only one row expanded at a time
- **Efficient Rendering**: Minimal DOM elements in collapsed state

### 3. **Data Structure Optimization**
- **Calculated Fields**: Days until session computed in SQL
- **Reduced JOINs**: Minimal joins for list view
- **Separate Detail Endpoint**: Full details only when needed

## Recommended Database Indexes

### Essential Indexes for Performance

```sql
-- 1. Primary query optimization (status filtering)
CREATE INDEX idx_jury_requests_status ON jury_requests(status);

-- 2. Date-based sorting optimization
CREATE INDEX idx_jury_requests_session_date ON jury_requests(session_date);

-- 3. Composite index for optimal query performance
CREATE INDEX idx_jury_requests_status_date ON jury_requests(status, session_date, created_at);

-- 4. Foreign key optimization for JOINs
CREATE INDEX idx_jury_requests_training_center_id ON jury_requests(training_center_id);
CREATE INDEX idx_jury_requests_jury_id ON jury_requests(jury_id);

-- 5. User lookup optimization
CREATE INDEX idx_training_centers_user_id ON training_centers(user_id);
CREATE INDEX idx_jury_profiles_user_id ON jury_profiles(user_id);

-- 6. Admin dashboard KPI queries
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_jury_requests_created_at ON jury_requests(created_at);
```

### Performance Monitoring Queries

```sql
-- Check query performance
EXPLAIN ANALYZE 
SELECT jr.id, jr.status, jr.session_date, jr.modality, jr.created_at,
       CASE 
         WHEN jr.session_date IS NULL THEN NULL
         WHEN jr.session_date < CURRENT_DATE THEN -1
         ELSE EXTRACT(DAY FROM (jr.session_date - CURRENT_DATE))::INTEGER
       END as days_until_session,
       tc.name as centre_name, tc.city as centre_city,
       jp.first_name as jury_first_name, jp.last_name as jury_last_name
FROM jury_requests jr
LEFT JOIN training_centers tc ON jr.training_center_id = tc.id
LEFT JOIN users u_jury ON jr.jury_id = u_jury.id
LEFT JOIN jury_profiles jp ON u_jury.id = jp.user_id
WHERE jr.status = 'pending'
ORDER BY 
  CASE 
    WHEN jr.session_date IS NULL THEN 2
    WHEN jr.session_date < CURRENT_DATE THEN 3
    ELSE 1
  END,
  jr.session_date ASC NULLS LAST,
  jr.created_at DESC
LIMIT 100;
```

## Scaling Considerations

### Current Limits
- **100 sessions per status**: Prevents UI overload
- **Lazy loading**: Reduces initial payload
- **Single expansion**: Limits concurrent detail requests

### Future Optimizations (if needed)

#### 1. **Pagination**
```typescript
// Add pagination to API
interface PaginationParams {
  page: number;
  limit: number;
  status: string;
}

// Virtual scrolling for large lists
// Implement infinite scroll or pagination
```

#### 2. **Caching Strategy**
```typescript
// Redis caching for frequently accessed data
const cacheKey = `admin:sessions:${status}:page:${page}`;
const cachedResult = await redis.get(cacheKey);
if (cachedResult) return JSON.parse(cachedResult);

// Cache for 5 minutes
await redis.setex(cacheKey, 300, JSON.stringify(result));
```

#### 3. **Database Partitioning**
```sql
-- Partition by status for very large datasets
CREATE TABLE jury_requests_pending PARTITION OF jury_requests 
FOR VALUES IN ('pending');

CREATE TABLE jury_requests_completed PARTITION OF jury_requests 
FOR VALUES IN ('completed');
```

#### 4. **Search and Filtering**
```sql
-- Full-text search index
CREATE INDEX idx_jury_requests_search ON jury_requests 
USING gin(to_tsvector('french', certification_title || ' ' || COALESCE(custom_message, '')));

-- Date range filtering
CREATE INDEX idx_jury_requests_date_range ON jury_requests(session_date) 
WHERE session_date IS NOT NULL;
```

## Performance Metrics to Monitor

### 1. **Query Performance**
- Average query execution time < 100ms
- 95th percentile < 500ms
- Index usage ratio > 95%

### 2. **UI Performance**
- Initial load time < 2 seconds
- Row expansion time < 500ms
- Smooth scrolling (60fps)

### 3. **Memory Usage**
- Client-side memory growth < 50MB for 100 sessions
- Server memory per request < 10MB

## Implementation Priority

### Phase 1 (Immediate) ✅
- [x] LIMIT 100 sessions
- [x] Lazy loading for details
- [x] Collapsible rows
- [x] Optimized queries

### Phase 2 (Next Sprint)
- [ ] Add database indexes
- [ ] Implement caching
- [ ] Add performance monitoring

### Phase 3 (Future)
- [ ] Pagination/virtual scrolling
- [ ] Advanced filtering
- [ ] Real-time updates

## Expected Performance Improvements

With proper indexing:
- **Query time**: 500ms → 50ms (10x improvement)
- **UI responsiveness**: Immediate expansion
- **Scalability**: Handle 10,000+ sessions efficiently
- **User experience**: Smooth, fast interactions

## Monitoring and Alerts

```sql
-- Slow query monitoring
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
WHERE query LIKE '%jury_requests%' 
ORDER BY mean_exec_time DESC;

-- Index usage monitoring
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats 
WHERE tablename = 'jury_requests';
```
