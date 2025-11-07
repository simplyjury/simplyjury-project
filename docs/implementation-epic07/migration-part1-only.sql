-- ============================================================================
-- Epic 07 - Step 01 - PART 1 ONLY: Extend training_centers table
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

-- Verification
SELECT 'Part 1 Complete!' as status;
