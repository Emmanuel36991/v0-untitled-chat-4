-- Add precise timing fields to trades table
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS trade_start_time TIME,
ADD COLUMN IF NOT EXISTS trade_end_time TIME,
ADD COLUMN IF NOT EXISTS precise_duration_minutes INTEGER;

-- Create a function to calculate precise duration
CREATE OR REPLACE FUNCTION calculate_precise_duration()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate precise duration if both start and end times are provided
    IF NEW.trade_start_time IS NOT NULL AND NEW.trade_end_time IS NOT NULL THEN
        -- Handle same-day trades
        IF NEW.trade_end_time >= NEW.trade_start_time THEN
            NEW.precise_duration_minutes := EXTRACT(EPOCH FROM (NEW.trade_end_time - NEW.trade_start_time)) / 60;
        ELSE
            -- Handle trades that cross midnight (end time is next day)
            NEW.precise_duration_minutes := EXTRACT(EPOCH FROM (NEW.trade_end_time + INTERVAL '1 day' - NEW.trade_start_time)) / 60;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate precise duration
DROP TRIGGER IF EXISTS trigger_calculate_precise_duration ON public.trades;
CREATE TRIGGER trigger_calculate_precise_duration
    BEFORE INSERT OR UPDATE ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION calculate_precise_duration();

-- Update existing analytics function to include precise timing
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
    WITH duration_categorized AS (
        SELECT 
            t.*,
            CASE 
                -- Use precise duration if available, otherwise fall back to duration_minutes
                WHEN COALESCE(t.precise_duration_minutes, t.duration_minutes) IS NULL THEN 'Unknown'
                WHEN COALESCE(t.precise_duration_minutes, t.duration_minutes) <= 5 THEN '≤ 5 min'
                WHEN COALESCE(t.precise_duration_minutes, t.duration_minutes) <= 15 THEN '6-15 min'
                WHEN COALESCE(t.precise_duration_minutes, t.duration_minutes) <= 30 THEN '16-30 min'
                WHEN COALESCE(t.precise_duration_minutes, t.duration_minutes) <= 60 THEN '31-60 min'
                WHEN COALESCE(t.precise_duration_minutes, t.duration_minutes) <= 240 THEN '1-4 hours'
                WHEN COALESCE(t.precise_duration_minutes, t.duration_minutes) <= 1440 THEN '4-24 hours'
                ELSE '> 1 day'
            END as duration_range
        FROM trades t
        WHERE t.user_id = user_id_param
    )
    SELECT 
        dc.duration_range as duration_category,
        COUNT(*)::INTEGER as total_trades,
        COUNT(CASE WHEN dc.outcome = 'win' THEN 1 END)::INTEGER as win_count,
        COUNT(CASE WHEN dc.outcome = 'loss' THEN 1 END)::INTEGER as loss_count,
        CASE 
            WHEN COUNT(CASE WHEN dc.outcome IN ('win', 'loss') THEN 1 END) > 0 
            THEN ROUND((COUNT(CASE WHEN dc.outcome = 'win' THEN 1 END)::NUMERIC / 
                       COUNT(CASE WHEN dc.outcome IN ('win', 'loss') THEN 1 END)::NUMERIC) * 100, 2)
            ELSE 0 
        END as win_rate,
        ROUND(AVG(dc.pnl), 2) as avg_pnl
    FROM duration_categorized dc
    GROUP BY dc.duration_range
    ORDER BY 
        CASE dc.duration_range
            WHEN '≤ 5 min' THEN 1
            WHEN '6-15 min' THEN 2
            WHEN '16-30 min' THEN 3
            WHEN '31-60 min' THEN 4
            WHEN '1-4 hours' THEN 5
            WHEN '4-24 hours' THEN 6
            WHEN '> 1 day' THEN 7
            ELSE 8
        END;
END;
$$ LANGUAGE plpgsql;
