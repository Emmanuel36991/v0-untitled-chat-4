-- Create strategy relationship tables to support merging strategies
-- This enables users to link multiple strategies and view them as unified frameworks

-- 1. Create strategy_relationships table for linking strategies
CREATE TABLE IF NOT EXISTS strategy_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_strategy_id UUID NOT NULL,
  child_strategy_id UUID NOT NULL,
  relationship_type TEXT NOT NULL DEFAULT 'merged', -- 'merged', 'extends', 'combines'
  weight DECIMAL DEFAULT 1.0, -- Importance/influence weight
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_strategy_id, child_strategy_id)
);

-- 2. Create merged_strategy_groups table for grouping multiple strategies
CREATE TABLE IF NOT EXISTS merged_strategy_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1', -- Visual identifier color
  icon TEXT DEFAULT 'layers', -- Icon name for UI
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create junction table for strategies in merged groups
CREATE TABLE IF NOT EXISTS merged_group_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES merged_strategy_groups(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, strategy_id)
);

-- 4. Add merged_group_id to playbook_strategies (optional: if a strategy is part of a group)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'playbook_strategies' AND column_name = 'merged_group_id'
  ) THEN
    ALTER TABLE playbook_strategies ADD COLUMN merged_group_id UUID REFERENCES merged_strategy_groups(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_strategy_relationships_parent ON strategy_relationships(parent_strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_relationships_child ON strategy_relationships(child_strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_relationships_user ON strategy_relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_merged_groups_user ON merged_strategy_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_merged_group_strategies_group ON merged_group_strategies(group_id);

-- 6. Enable RLS
ALTER TABLE strategy_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE merged_strategy_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE merged_group_strategies ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
CREATE POLICY "Users can manage their own strategy relationships" ON strategy_relationships
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own merged groups" ON merged_strategy_groups
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their merged group strategies" ON merged_group_strategies
  FOR ALL USING (
    group_id IN (SELECT id FROM merged_strategy_groups WHERE user_id = auth.uid())
  );

-- 8. Create function to get merged strategy analytics
CREATE OR REPLACE FUNCTION get_merged_strategy_stats(p_group_id UUID)
RETURNS TABLE (
  total_trades BIGINT,
  win_rate DECIMAL,
  total_pnl DECIMAL,
  avg_pnl DECIMAL,
  best_strategy TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(t.id)::BIGINT as total_trades,
    ROUND((COUNT(CASE WHEN t.outcome = 'win' THEN 1 END)::DECIMAL / NULLIF(COUNT(t.id), 0) * 100), 2) as win_rate,
    SUM(t.pnl)::DECIMAL as total_pnl,
    AVG(t.pnl)::DECIMAL as avg_pnl,
    (
      SELECT ps.name 
      FROM playbook_strategies ps
      JOIN merged_group_strategies mgs ON mgs.strategy_id = ps.id
      WHERE mgs.group_id = p_group_id
      ORDER BY ps.win_rate DESC
      LIMIT 1
    ) as best_strategy
  FROM trades t
  WHERE t.playbook_strategy_id IN (
    SELECT strategy_id FROM merged_group_strategies WHERE group_id = p_group_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
