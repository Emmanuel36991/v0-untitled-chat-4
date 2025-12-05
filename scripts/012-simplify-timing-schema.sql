-- Simplify timing fields in trades table
-- Remove complex time fields and keep only essential duration

ALTER TABLE public.trades 
DROP COLUMN IF EXISTS entry_time,
DROP COLUMN IF EXISTS exit_time,
DROP COLUMN IF EXISTS time_of_day;

-- Keep only duration_minutes as a simple integer
-- Make sure duration_minutes allows NULL values for optional timing
ALTER TABLE public.trades 
ALTER COLUMN duration_minutes DROP NOT NULL;

-- Add a simple trade_session field for basic session tracking
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS trade_session TEXT;

-- Update the analytics functions to work with simplified schema
DROP FUNCTION IF EXISTS get_time_based_analytics(UUID);
DROP FUNCTION IF EXISTS get_duration_based_analytics(UUID);

-- Create simplified duration analytics function
CREATE OR REPLACE FUNCTION get_duration_analytics(user_id_param UUID)
RETURNS TABLE (
    duration_category TEXT,
    total_trades INTEGER,
    win_count INTEGER,
    loss_count INTEGER,
    win_rate NUMERIC,
    avg_pnl NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN duration_minutes IS NULL THEN 'Unknown'
            WHEN duration_minutes <= 15 THEN 'Scalp (≤15m)'
            WHEN duration_minutes <= 60 THEN 'Short-term (15m-1h)'
            WHEN duration_minutes <= 240 THEN 'Medium-term (1h-4h)'
            WHEN duration_minutes <= 1440 THEN 'Day Trade (4h-1d)'
            ELSE 'Swing (>1d)'
        END as duration_category,
        COUNT(*)::INTEGER as total_trades,
        COUNT(CASE WHEN outcome = 'win' THEN 1 END)::INTEGER as win_count,
        COUNT(CASE WHEN outcome = 'loss' THEN 1 END)::INTEGER as loss_count,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN outcome = 'win' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END as win_rate,
        ROUND(AVG(pnl), 2) as avg_pnl
    FROM public.trades 
    WHERE user_id = user_id_param
    GROUP BY 
        CASE 
            WHEN duration_minutes IS NULL THEN 'Unknown'
            WHEN duration_minutes <= 15 THEN 'Scalp (≤15m)'
            WHEN duration_minutes <= 60 THEN 'Short-term (15m-1h)'
            WHEN duration_minutes <= 240 THEN 'Medium-term (1h-4h)'
            WHEN duration_minutes <= 1440 THEN 'Day Trade (4h-1d)'
            ELSE 'Swing (>1d)'
        END
    ORDER BY 
        CASE 
            WHEN duration_minutes IS NULL THEN 0
            WHEN duration_minutes <= 15 THEN 1
            WHEN duration_minutes <= 60 THEN 2
            WHEN duration_minutes <= 240 THEN 3
            WHEN duration_minutes <= 1440 THEN 4
            ELSE 5
        END;
END;
$$ LANGUAGE plpgsql;

-- Create simplified session analytics function
CREATE OR REPLACE FUNCTION get_session_analytics(user_id_param UUID)
RETURNS TABLE (
    session_name TEXT,
    total_trades INTEGER,
    win_count INTEGER,
    loss_count INTEGER,
    win_rate NUMERIC,
    avg_pnl NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(trade_session, 'Unknown') as session_name,
        COUNT(*)::INTEGER as total_trades,
        COUNT(CASE WHEN outcome = 'win' THEN 1 END)::INTEGER as win_count,
        COUNT(CASE WHEN outcome = 'loss' THEN 1 END)::INTEGER as loss_count,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN outcome = 'win' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END as win_rate,
        ROUND(AVG(pnl), 2) as avg_pnl
    FROM public.trades 
    WHERE user_id = user_id_param
    GROUP BY trade_session
    ORDER BY total_trades DESC;
END;
$$ LANGUAGE plpgsql;
