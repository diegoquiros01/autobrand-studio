-- Add feedback/rating fields to generaciones table
ALTER TABLE generaciones ADD COLUMN IF NOT EXISTS rating smallint CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE generaciones ADD COLUMN IF NOT EXISTS feedback_text text;
ALTER TABLE generaciones ADD COLUMN IF NOT EXISTS feedback_tags text[];
ALTER TABLE generaciones ADD COLUMN IF NOT EXISTS rated_at timestamptz;

-- Index for querying recent feedback per user efficiently
CREATE INDEX IF NOT EXISTS idx_generaciones_feedback ON generaciones (user_id, rated_at DESC) WHERE rating IS NOT NULL;
