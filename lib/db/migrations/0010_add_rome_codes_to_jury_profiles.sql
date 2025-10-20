-- Migration: Add ROME codes to jury_profiles
-- Date: 2025-10-15
-- Description: Add rome_codes and rome_labels arrays to store jury expertise domains using official ROME codes

-- Add rome_codes column (array of ROME codes like ["M1805", "D1202"])
ALTER TABLE jury_profiles 
ADD COLUMN IF NOT EXISTS rome_codes VARCHAR(10)[] DEFAULT '{}';

-- Add rome_labels column (array of ROME labels for display)
ALTER TABLE jury_profiles 
ADD COLUMN IF NOT EXISTS rome_labels TEXT[] DEFAULT '{}';

-- Create index for efficient array searches
CREATE INDEX IF NOT EXISTS idx_jury_profiles_rome_codes 
ON jury_profiles USING GIN (rome_codes);

-- Add comment for documentation
COMMENT ON COLUMN jury_profiles.rome_codes IS 'Array of ROME codes representing jury expertise domains (e.g., ["M1805", "D1202"])';
COMMENT ON COLUMN jury_profiles.rome_labels IS 'Array of ROME labels for display purposes (e.g., ["Études et développement informatique", "Coiffure"])';

-- Note: expertise_domains column is kept for backward compatibility
-- Gradually, rome_codes will replace expertise_domains
