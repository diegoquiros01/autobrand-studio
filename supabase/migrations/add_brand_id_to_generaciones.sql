-- Link pieces to brands
ALTER TABLE generaciones ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brand_profiles(id) ON DELETE SET NULL;
ALTER TABLE generaciones ADD COLUMN IF NOT EXISTS brand_name text;

-- Index for filtering pieces by brand
CREATE INDEX IF NOT EXISTS idx_generaciones_brand ON generaciones (user_id, brand_id);
