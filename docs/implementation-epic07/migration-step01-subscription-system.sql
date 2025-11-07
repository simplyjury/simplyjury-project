-- ============================================================================
-- Epic 07 - Step 01: Subscription System Database Migration
-- ============================================================================
-- Description: Adds subscription management, contact limits tracking, and 
--              waiting list functionality to SimplyJury
-- Date: 2025-01-06
-- Author: SimplyJury Development Team
-- ============================================================================

-- ============================================================================
-- PART 1: Extend training_centers table with subscription fields
-- ============================================================================

-- Add subscription management fields
ALTER TABLE training_centers
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS contacts_used_current_period INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS contacts_limit INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_contact_reset_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS first_accepted_contact_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS manual_contact_limit_override INTEGER,
ADD COLUMN IF NOT EXISTS manual_limit_override_reason TEXT,
ADD COLUMN IF NOT EXISTS manual_limit_override_expires TIMESTAMP,
ADD COLUMN IF NOT EXISTS premium_access_granted_until TIMESTAMP,
ADD COLUMN IF NOT EXISTS premium_access_granted_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS premium_access_reason TEXT;

-- Add constraint for subscription_tier (if not already present)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'training_centers_subscription_tier_check'
    ) THEN
        ALTER TABLE training_centers
        ADD CONSTRAINT training_centers_subscription_tier_check 
        CHECK (subscription_tier IN ('gratuit', 'basic', 'pro'));
    END IF;
END $$;

-- Update existing centers to have proper subscription_start_date
UPDATE training_centers 
SET subscription_start_date = created_at 
WHERE subscription_start_date IS NULL;

-- Set proper limits based on existing subscription_tier
UPDATE training_centers
SET contacts_limit = CASE subscription_tier
  WHEN 'gratuit' THEN 1
  WHEN 'basic' THEN 5
  WHEN 'pro' THEN 15
  ELSE 1
END
WHERE contacts_limit IS NULL OR contacts_limit = 0;

-- Add comments for documentation
COMMENT ON COLUMN training_centers.subscription_tier IS 'Current subscription tier: gratuit (1 contact), basic (5 contacts), pro (15 contacts)';
COMMENT ON COLUMN training_centers.subscription_start_date IS 'When the current subscription tier started (for billing purposes)';
COMMENT ON COLUMN training_centers.contacts_used_current_period IS 'Number of contacts used in the current 30-day rolling window';
COMMENT ON COLUMN training_centers.contacts_limit IS 'Maximum contacts allowed based on subscription tier';
COMMENT ON COLUMN training_centers.first_accepted_contact_date IS 'Date of first accepted contact - starts the 30-day rolling window';
COMMENT ON COLUMN training_centers.last_contact_reset_date IS 'Last time the contact counter was reset (after 30 days)';
COMMENT ON COLUMN training_centers.manual_contact_limit_override IS 'Admin override for contact limit (if set, overrides tier limit)';
COMMENT ON COLUMN training_centers.premium_access_granted_until IS 'Temporary premium access expiration date (for trials, partnerships)';

-- ============================================================================
-- PART 2: Create subscription_waiting_list table
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_waiting_list (
  id SERIAL PRIMARY KEY,
  
  -- User Information
  email VARCHAR(255) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  training_center_id INTEGER REFERENCES training_centers(id) ON DELETE CASCADE,
  
  -- Subscription Interest
  desired_tier VARCHAR(20) NOT NULL CHECK (desired_tier IN ('basic', 'pro')),
  
  -- Tracking & Follow-up
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted', 'declined')),
  contacted_at TIMESTAMP,
  contacted_by INTEGER REFERENCES users(id),
  contact_notes TEXT,
  converted_at TIMESTAMP,
  
  -- Context (helps understand user intent)
  triggered_by VARCHAR(50) CHECK (triggered_by IN ('limit_reached', 'pricing_page', 'dashboard_cta', 'manual')),
  current_contacts_used INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Prevent duplicate entries for same email and tier
  UNIQUE(email, desired_tier)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_waiting_list_status ON subscription_waiting_list(status);
CREATE INDEX IF NOT EXISTS idx_waiting_list_user_id ON subscription_waiting_list(user_id);
CREATE INDEX IF NOT EXISTS idx_waiting_list_created_at ON subscription_waiting_list(created_at);
CREATE INDEX IF NOT EXISTS idx_waiting_list_desired_tier ON subscription_waiting_list(desired_tier);
CREATE INDEX IF NOT EXISTS idx_waiting_list_email ON subscription_waiting_list(email);

-- Add table comment
COMMENT ON TABLE subscription_waiting_list IS 'Tracks users interested in paid subscription tiers before Stripe integration is active (MVP phase)';
COMMENT ON COLUMN subscription_waiting_list.triggered_by IS 'Context of how user joined: limit_reached, pricing_page, dashboard_cta, or manual';
COMMENT ON COLUMN subscription_waiting_list.current_contacts_used IS 'Number of contacts used when joining waitlist (helps understand urgency)';

-- ============================================================================
-- PART 3: Create contact_limit_history table (audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS contact_limit_history (
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
  
  -- State Changes (before/after snapshots)
  contacts_used_before INTEGER,
  contacts_used_after INTEGER,
  contacts_limit_before INTEGER,
  contacts_limit_after INTEGER,
  subscription_tier_before VARCHAR(20),
  subscription_tier_after VARCHAR(20),
  
  -- Admin Actions
  performed_by INTEGER REFERENCES users(id), -- Admin who made the change (NULL for automatic events)
  reason TEXT, -- Explanation for manual changes
  
  -- Metadata (additional context as JSON)
  metadata JSONB,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_history_center ON contact_limit_history(training_center_id);
CREATE INDEX IF NOT EXISTS idx_contact_history_event_type ON contact_limit_history(event_type);
CREATE INDEX IF NOT EXISTS idx_contact_history_created_at ON contact_limit_history(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_history_performed_by ON contact_limit_history(performed_by);

-- Add table comment
COMMENT ON TABLE contact_limit_history IS 'Audit trail for all contact limit changes, subscription events, and admin actions';
COMMENT ON COLUMN contact_limit_history.event_type IS 'Type of event: contact_used, contact_refunded, limit_reset, manual_adjustment, tier_upgrade, tier_downgrade, premium_access_granted, premium_access_expired';
COMMENT ON COLUMN contact_limit_history.metadata IS 'Additional context stored as JSON (e.g., jury details, request details, expiration dates)';

-- ============================================================================
-- PART 4: Create helper functions for business logic
-- ============================================================================

-- Function to check if contact period should reset (30-day rolling window)
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

COMMENT ON FUNCTION should_reset_contact_period(INTEGER) IS 'Checks if a training center contact period should reset based on 30-day rolling window';

-- Function to get effective contact limit (considering overrides and premium access)
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

COMMENT ON FUNCTION get_effective_contact_limit(INTEGER) IS 'Returns the effective contact limit for a training center, considering premium access and manual overrides';

-- ============================================================================
-- PART 5: Create indexes for performance optimization
-- ============================================================================

-- Indexes on training_centers for subscription queries
CREATE INDEX IF NOT EXISTS idx_training_centers_subscription_tier ON training_centers(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_training_centers_premium_access ON training_centers(premium_access_granted_until) WHERE premium_access_granted_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_training_centers_first_contact ON training_centers(first_accepted_contact_date) WHERE first_accepted_contact_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_training_centers_contacts_used ON training_centers(contacts_used_current_period);

-- ============================================================================
-- PART 6: Data migration for existing centers
-- ============================================================================

-- Calculate current period usage for existing centers
-- Count accepted requests in the last 30 days
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
  )
WHERE EXISTS (
  SELECT 1 
  FROM jury_requests jr 
  WHERE jr.training_center_id = tc.id 
    AND jr.status = 'accepted'
    AND jr.jury_response_date >= NOW() - INTERVAL '30 days'
);

-- ============================================================================
-- PART 7: Create trigger for updated_at on waiting list
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on subscription_waiting_list
DROP TRIGGER IF EXISTS update_subscription_waiting_list_updated_at ON subscription_waiting_list;
CREATE TRIGGER update_subscription_waiting_list_updated_at
    BEFORE UPDATE ON subscription_waiting_list
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 8: Verification queries (run these to check migration success)
-- ============================================================================

-- Verify training_centers columns
DO $$
DECLARE
    missing_columns TEXT[];
    col TEXT;
BEGIN
    SELECT ARRAY_AGG(column_name)
    INTO missing_columns
    FROM (
        VALUES 
            ('subscription_start_date'),
            ('contacts_used_current_period'),
            ('contacts_limit'),
            ('first_accepted_contact_date'),
            ('manual_contact_limit_override'),
            ('premium_access_granted_until')
    ) AS required(column_name)
    WHERE NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'training_centers' 
        AND column_name = required.column_name
    );
    
    IF missing_columns IS NOT NULL THEN
        RAISE EXCEPTION 'Missing columns in training_centers: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE '✅ All required columns exist in training_centers';
    END IF;
END $$;

-- Verify new tables exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_waiting_list') THEN
        RAISE EXCEPTION '❌ Table subscription_waiting_list does not exist';
    ELSE
        RAISE NOTICE '✅ Table subscription_waiting_list exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_limit_history') THEN
        RAISE EXCEPTION '❌ Table contact_limit_history does not exist';
    ELSE
        RAISE NOTICE '✅ Table contact_limit_history exists';
    END IF;
END $$;

-- Verify functions exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'should_reset_contact_period') THEN
        RAISE EXCEPTION '❌ Function should_reset_contact_period does not exist';
    ELSE
        RAISE NOTICE '✅ Function should_reset_contact_period exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_effective_contact_limit') THEN
        RAISE EXCEPTION '❌ Function get_effective_contact_limit does not exist';
    ELSE
        RAISE NOTICE '✅ Function get_effective_contact_limit exists';
    END IF;
END $$;

-- Show summary of training centers by tier
SELECT 
    subscription_tier,
    COUNT(*) as center_count,
    AVG(contacts_used_current_period) as avg_contacts_used,
    SUM(CASE WHEN contacts_used_current_period >= contacts_limit THEN 1 ELSE 0 END) as centers_at_limit
FROM training_centers
GROUP BY subscription_tier
ORDER BY subscription_tier;

-- ============================================================================
-- Migration Complete!
-- ============================================================================
-- Next Steps:
-- 1. Verify all checks passed (look for ✅ messages above)
-- 2. Update Drizzle schema file: lib/db/schema.ts
-- 3. Generate TypeScript types: pnpm drizzle-kit generate
-- 4. Proceed to Step 02: Backend Services
-- ============================================================================
