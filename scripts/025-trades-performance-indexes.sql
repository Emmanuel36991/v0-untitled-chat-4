-- 025: Trades table performance indexes for 5k+ trade scale
-- Run in Supabase SQL Editor. Safe to run multiple times (IF NOT EXISTS).

-- Primary filter: every trade query filters by user_id
CREATE INDEX IF NOT EXISTS idx_trades_user_id
  ON public.trades (user_id);

-- Ordered list/range: getTrades(..., order by date asc/desc), pagination
CREATE INDEX IF NOT EXISTS idx_trades_user_date_desc
  ON public.trades (user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_trades_user_date_asc
  ON public.trades (user_id, date ASC);

-- Count by user (getTradesCount)
-- idx_trades_user_id already supports COUNT(*) WHERE user_id = ?

COMMENT ON INDEX idx_trades_user_id IS 'Speed up all trade queries filtered by user_id';
COMMENT ON INDEX idx_trades_user_date_desc IS 'Speed up getTrades(limit, order desc) and dashboard recent trades';
COMMENT ON INDEX idx_trades_user_date_asc IS 'Speed up getTrades(limit, order asc) and analytics equity curve';
