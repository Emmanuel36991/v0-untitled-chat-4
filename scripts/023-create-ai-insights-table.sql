-- Create AI insights table for persisting dashboard AI-generated insights
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_text TEXT NOT NULL,
  trades_snapshot JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups ordered by recency
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_created
  ON ai_insights (user_id, created_at DESC);

-- Row Level Security
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights"
  ON ai_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON ai_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON ai_insights FOR DELETE
  USING (auth.uid() = user_id);
