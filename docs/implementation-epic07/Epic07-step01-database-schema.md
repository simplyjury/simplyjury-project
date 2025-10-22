# Epic 07 - Step 01: Database Schema & Migrations

## 🎯 Objective
Create the minimal database schema to support subscription tiers, contact limits tracking, and waiting list management for the MVP.

---

## 📊 Database Changes

### 1. Extend `training_centers` Table

**Fields to Add:**
```sql
-- Subscription Management
subscription_tier VARCHAR(20) DEFAULT 'gratuit' CHECK (subscription_tier IN ('gratuit', 'basic', 'pro'))
subscription_start_date TIMESTAMP -- When current tier started (for 30-day rolling window)
subscription_end_date TIMESTAMP -- For future use when implementing actual subscriptions

-- Contact Limits Tracking
contacts_used_current_period INTEGER DEFAULT 0 -- Accepted requests in current 30-day window
contacts_limit INTEGER DEFAULT 1 -- Limit based on tier (1 for gratuit, 5 for basic, 15 for pro)
last_contact_reset_date TIMESTAMP -- Last time the counter was reset
first_accepted_contact_date TIMESTAMP -- Date of first accepted contact (starts the 30-day window)

-- Admin Override Capabilities
manual_contact_limit_override INTEGER NULL -- If set, overrides the tier-based limit
manual_limit_override_reason TEXT NULL -- Admin notes for why limit was overridden
manual_limit_override_expires TIMESTAMP NULL -- Optional expiration for temporary overrides
premium_access_granted_until TIMESTAMP NULL -- Temporary premium access (for trials, partnerships)
premium_access_granted_by INTEGER REFERENCES users(id) -- Admin who granted access
premium_access_reason TEXT NULL -- Reason for premium access
```

**Migration SQL:**
```sql
-- Migration: add_subscription_fields_to_training_centers
ALTER TABLE training_centers
ADD COLUMN subscription_start_date TIMESTAMP DEFAULT NOW(),
ADD COLUMN subscription_end_date TIMESTAMP,
ADD COLUMN contacts_used_current_period INTEGER DEFAULT 0,
ADD COLUMN contacts_limit INTEGER DEFAULT 1,
ADD COLUMN last_contact_reset_date TIMESTAMP,
ADD COLUMN first_accepted_contact_date TIMESTAMP,
ADD COLUMN manual_contact_limit_override INTEGER,
ADD COLUMN manual_limit_override_reason TEXT,
ADD COLUMN manual_limit_override_expires TIMESTAMP,
ADD COLUMN premium_access_granted_until TIMESTAMP,
ADD COLUMN premium_access_granted_by INTEGER REFERENCES users(id),
ADD COLUMN premium_access_reason TEXT;

-- Update existing centers to have proper subscription_start_date
UPDATE training_centers 
SET subscription_start_date = created_at 
WHERE subscription_start_date IS NULL;

-- Add constraint for subscription_tier if not already present
ALTER TABLE training_centers
DROP CONSTRAINT IF EXISTS training_centers_subscription_tier_check;

ALTER TABLE training_centers
ADD CONSTRAINT training_centers_subscription_tier_check 
CHECK (subscription_tier IN ('gratuit', 'basic', 'pro'));
```

---

### 2. Create `subscription_waiting_list` Table

**Purpose:** Track users interested in paid subscriptions before Stripe integration.

```sql
CREATE TABLE subscription_waiting_list (
  id SERIAL PRIMARY KEY,
  
  -- User Information
  email VARCHAR(255) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Link to user if authenticated
  training_center_id INTEGER REFERENCES training_centers(id) ON DELETE CASCADE,
  
  -- Subscription Interest
  desired_tier VARCHAR(20) NOT NULL CHECK (desired_tier IN ('basic', 'pro')),
  
  -- Tracking & Follow-up
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted', 'declined')),
  contacted_at TIMESTAMP,
  contacted_by INTEGER REFERENCES users(id), -- Admin who reached out
  contact_notes TEXT, -- Notes from admin about the contact
  converted_at TIMESTAMP, -- When they actually subscribed
  
  -- Context (helps understand user intent)
  triggered_by VARCHAR(50), -- 'limit_reached', 'pricing_page', 'dashboard_cta', 'manual'
  current_contacts_used INTEGER, -- How many contacts they had used when joining waitlist
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Prevent duplicate entries
  UNIQUE(email, desired_tier)
);

-- Indexes for performance
CREATE INDEX idx_waiting_list_status ON subscription_waiting_list(status);
CREATE INDEX idx_waiting_list_user_id ON subscription_waiting_list(user_id);
CREATE INDEX idx_waiting_list_created_at ON subscription_waiting_list(created_at);
CREATE INDEX idx_waiting_list_desired_tier ON subscription_waiting_list(desired_tier);

-- Add comment
COMMENT ON TABLE subscription_waiting_list IS 'Tracks users interested in paid subscription tiers before Stripe integration is active';
```

---

### 3. Create `contact_limit_history` Table

**Purpose:** Audit trail for contact usage and admin adjustments.

```sql
CREATE TABLE contact_limit_history (
  id SERIAL PRIMARY KEY,
  
  -- Reference
  training_center_id INTEGER NOT NULL REFERENCES training_centers(id) ON DELETE CASCADE,
  jury_request_id INTEGER REFERENCES jury_requests(id) ON DELETE SET NULL,
  
  -- Event Details
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'contact_used',           -- Jury accepted a request
    'contact_refunded',       -- Admin refunded a contact
    'limit_reset',            -- 30-day period reset
    'manual_adjustment',      -- Admin manually adjusted limit
    'tier_upgrade',           -- User upgraded tier
    'tier_downgrade',         -- User downgraded tier
    'premium_access_granted', -- Admin granted temporary premium
    'premium_access_expired'  -- Temporary premium expired
  )),
  
  -- State Changes
  contacts_used_before INTEGER,
  contacts_used_after INTEGER,
  contacts_limit_before INTEGER,
  contacts_limit_after INTEGER,
  subscription_tier_before VARCHAR(20),
  subscription_tier_after VARCHAR(20),
  
  -- Admin Actions
  performed_by INTEGER REFERENCES users(id), -- Admin who made the change (NULL for automatic events)
  reason TEXT, -- Explanation for manual changes
  
  -- Metadata
  metadata JSONB, -- Additional context (e.g., jury details, request details)
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_contact_history_center ON contact_limit_history(training_center_id);
CREATE INDEX idx_contact_history_event_type ON contact_limit_history(event_type);
CREATE INDEX idx_contact_history_created_at ON contact_limit_history(created_at);

-- Add comment
COMMENT ON TABLE contact_limit_history IS 'Audit trail for all contact limit changes and subscription events';
```

---

### 4. Create Helper Functions

**Function to Check if Contact Period Should Reset:**

```sql
CREATE OR REPLACE FUNCTION should_reset_contact_period(center_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  center_record RECORD;
  days_since_first_contact INTEGER;
BEGIN
  SELECT 
    first_accepted_contact_date,
    last_contact_reset_date
  INTO center_record
  FROM training_centers
  WHERE id = center_id;
  
  -- If no contacts yet, no reset needed
  IF center_record.first_accepted_contact_date IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate days since first contact in current period
  days_since_first_contact := EXTRACT(DAY FROM NOW() - center_record.first_accepted_contact_date);
  
  -- Reset if 30 days have passed
  RETURN days_since_first_contact >= 30;
END;
$$ LANGUAGE plpgsql;
```

**Function to Get Effective Contact Limit:**

```sql
CREATE OR REPLACE FUNCTION get_effective_contact_limit(center_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  center_record RECORD;
  effective_limit INTEGER;
BEGIN
  SELECT 
    subscription_tier,
    contacts_limit,
    manual_contact_limit_override,
    manual_limit_override_expires,
    premium_access_granted_until
  INTO center_record
  FROM training_centers
  WHERE id = center_id;
  
  -- Check if premium access is active
  IF center_record.premium_access_granted_until IS NOT NULL 
     AND center_record.premium_access_granted_until > NOW() THEN
    RETURN 15; -- Pro tier limit
  END IF;
  
  -- Check if manual override is active and not expired
  IF center_record.manual_contact_limit_override IS NOT NULL THEN
    IF center_record.manual_limit_override_expires IS NULL 
       OR center_record.manual_limit_override_expires > NOW() THEN
      RETURN center_record.manual_contact_limit_override;
    END IF;
  END IF;
  
  -- Return tier-based limit
  RETURN center_record.contacts_limit;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔄 Data Migration Strategy

### Update Existing Centers

```sql
-- Set proper limits based on existing subscription_tier
UPDATE training_centers
SET contacts_limit = CASE subscription_tier
  WHEN 'gratuit' THEN 1
  WHEN 'basic' THEN 5
  WHEN 'pro' THEN 15
  ELSE 1
END
WHERE contacts_limit IS NULL OR contacts_limit = 0;

-- Initialize subscription_start_date for existing centers
UPDATE training_centers
SET subscription_start_date = created_at
WHERE subscription_start_date IS NULL;
```

### Calculate Current Period Usage

```sql
-- For each center, count accepted requests in the last 30 days
UPDATE training_centers tc
SET 
  contacts_used_current_period = (
    SELECT COUNT(*)
    FROM jury_requests jr
    WHERE jr.training_center_id = tc.id
      AND jr.status = 'accepted'
      AND jr.jury_response_date >= NOW() - INTERVAL '30 days'
  ),
  first_accepted_contact_date = (
    SELECT MIN(jr.jury_response_date)
    FROM jury_requests jr
    WHERE jr.training_center_id = tc.id
      AND jr.status = 'accepted'
      AND jr.jury_response_date >= NOW() - INTERVAL '30 days'
  );
```

---

## 📝 Schema Updates for Drizzle ORM

**File: `lib/db/schema.ts`**

Add to `trainingCenters` table definition:

```typescript
export const trainingCenters = pgTable('training_centers', {
  // ... existing fields ...
  
  // Subscription Management
  subscriptionTier: varchar('subscription_tier', { length: 20 }).default('gratuit'),
  subscriptionStartDate: timestamp('subscription_start_date').defaultNow(),
  subscriptionEndDate: timestamp('subscription_end_date'),
  
  // Contact Limits Tracking
  contactsUsedCurrentPeriod: integer('contacts_used_current_period').default(0),
  contactsLimit: integer('contacts_limit').default(1),
  lastContactResetDate: timestamp('last_contact_reset_date'),
  firstAcceptedContactDate: timestamp('first_accepted_contact_date'),
  
  // Admin Override Capabilities
  manualContactLimitOverride: integer('manual_contact_limit_override'),
  manualLimitOverrideReason: text('manual_limit_override_reason'),
  manualLimitOverrideExpires: timestamp('manual_limit_override_expires'),
  premiumAccessGrantedUntil: timestamp('premium_access_granted_until'),
  premiumAccessGrantedBy: integer('premium_access_granted_by').references(() => users.id),
  premiumAccessReason: text('premium_access_reason'),
});

// New Tables
export const subscriptionWaitingList = pgTable('subscription_waiting_list', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  trainingCenterId: integer('training_center_id').references(() => trainingCenters.id, { onDelete: 'cascade' }),
  desiredTier: varchar('desired_tier', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  contactedAt: timestamp('contacted_at'),
  contactedBy: integer('contacted_by').references(() => users.id),
  contactNotes: text('contact_notes'),
  convertedAt: timestamp('converted_at'),
  triggeredBy: varchar('triggered_by', { length: 50 }),
  currentContactsUsed: integer('current_contacts_used'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const contactLimitHistory = pgTable('contact_limit_history', {
  id: serial('id').primaryKey(),
  trainingCenterId: integer('training_center_id').notNull().references(() => trainingCenters.id, { onDelete: 'cascade' }),
  juryRequestId: integer('jury_request_id').references(() => juryRequests.id, { onDelete: 'set null' }),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  contactsUsedBefore: integer('contacts_used_before'),
  contactsUsedAfter: integer('contacts_used_after'),
  contactsLimitBefore: integer('contacts_limit_before'),
  contactsLimitAfter: integer('contacts_limit_after'),
  subscriptionTierBefore: varchar('subscription_tier_before', { length: 20 }),
  subscriptionTierAfter: varchar('subscription_tier_after', { length: 20 }),
  performedBy: integer('performed_by').references(() => users.id),
  reason: text('reason'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Type exports
export type SubscriptionWaitingList = typeof subscriptionWaitingList.$inferSelect;
export type NewSubscriptionWaitingList = typeof subscriptionWaitingList.$inferInsert;
export type ContactLimitHistory = typeof contactLimitHistory.$inferSelect;
export type NewContactLimitHistory = typeof contactLimitHistory.$inferInsert;
```

---

## ✅ Validation Checklist

- [ ] All migrations run successfully on dev database
- [ ] Existing data migrated correctly (check sample centers)
- [ ] Database constraints work (try inserting invalid tier)
- [ ] Helper functions return correct values
- [ ] Drizzle schema updated and types generated
- [ ] No breaking changes to existing queries
- [ ] Indexes created for performance
- [ ] Foreign key relationships validated

---

## 🚀 Next Steps

After completing this step:
1. Run migrations on Supabase dev database
2. Update Drizzle schema file
3. Generate TypeScript types: `pnpm drizzle-kit generate`
4. Test helper functions with sample data
5. Proceed to **Step 02: Backend Services & Business Logic**
