-- Add good_habits field to trades table to track positive psychology factors
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS good_habits TEXT[];

-- Add comment to clarify the purpose
COMMENT ON COLUMN public.trades.good_habits IS 'Positive psychological habits and behaviors exhibited during the trade';
COMMENT ON COLUMN public.trades.psychology_factors IS 'Negative psychological factors and triggers that affected the trade';
