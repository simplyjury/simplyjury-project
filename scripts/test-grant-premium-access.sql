-- Epic 07 - Test Script: Grant Premium Access
-- This script grants premium access to a training center for testing purposes

-- Grant premium access to cedric.kerbidi@gmail.com
-- Expires in 30 days from now
UPDATE training_centers
SET 
  has_premium_access = true,
  premium_access_expires_at = NOW() + INTERVAL '30 days'
WHERE id = (
  SELECT id 
  FROM users 
  WHERE email = 'cedric.kerbidi@gmail.com' 
  AND user_type = 'centre'
);

-- Verify the update
SELECT 
  tc.id,
  u.email,
  tc.name,
  tc.subscription_tier,
  tc.contacts_used,
  tc.has_premium_access,
  tc.premium_access_expires_at,
  -- Calculate days until expiry
  EXTRACT(DAY FROM (tc.premium_access_expires_at - NOW())) as days_until_expiry
FROM training_centers tc
JOIN users u ON u.id = tc.id
WHERE u.email = 'cedric.kerbidi@gmail.com';
