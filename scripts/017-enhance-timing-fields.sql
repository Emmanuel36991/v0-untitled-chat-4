-- Add any missing timing fields and create helpful functions for trade timing analysis

-- Ensure all timing fields exist (some may already exist)
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
ADD COLUMN IF NOT EXISTS trade_session TEXT,
ADD COLUMN IF NOT EXISTS trade_start_time TIME,
ADD COLUMN IF NOT EXISTS trade_end_time TIME,
ADD COLUMN IF NOT EXISTS precise_duration_minutes NUMERIC(10,2);

-- Create an index on timing fields for better query performance
CREATE INDEX IF NOT EXISTS idx_trades_timing ON public.trades(trade_session, duration_minutes);
CREATE INDEX IF NOT EXISTS idx_trades_start_time ON public.trades(trade_start_time);
CREATE INDEX IF NOT EXISTS idx_trades_duration ON public.trades(precise_duration_minutes);

-- Create a function to automatically calculate precise duration from start/end times
CREATE OR REPLACE FUNCTION calculate_trade_duration(
    start_time TIME,
    end_time TIME,
    trade_date DATE DEFAULT CURRENT_DATE
) RETURNS NUMERIC AS $$
DECLARE
    start_minutes INTEGER;
    end_minutes INTEGER;
    duration_minutes NUMERIC;
BEGIN
    -- Convert times to minutes since midnight
    start_minutes := EXTRACT(HOUR FROM start_time) * 60 + EXTRACT(MINUTE FROM start_time);
    end_minutes := EXTRACT(HOUR FROM end_time) * 60 + EXTRACT(MINUTE FROM end_time);
    
    -- Handle overnight trades (end time is next day)
    IF end_minutes < start_minutes THEN
        end_minutes := end_minutes + (24 * 60); -- Add 24 hours in minutes
    END IF;
    
    duration_minutes := end_minutes - start_minutes;
    
    RETURN duration_minutes;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update precise_duration_minutes when start/end times change
CREATE OR REPLACE FUNCTION update_precise_duration()
RETURNS TRIGGER AS $$
BEGIN
    -- Only calculate if both start and end times are provided
    IF NEW.trade_start_time IS NOT NULL AND NEW.trade_end_time IS NOT NULL THEN
        NEW.precise_duration_minutes := calculate_trade_duration(NEW.trade_start_time, NEW.trade_end_time);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_precise_duration ON public.trades;
CREATE TRIGGER trigger_update_precise_duration
    BEFORE INSERT OR UPDATE ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION update_precise_duration();

-- Create a view for trade timing analytics
CREATE OR REPLACE VIEW trade_timing_analytics AS
SELECT 
    user_id,
    trade_session,
    COUNT(*) as total_trades,
    AVG(precise_duration_minutes) as avg_duration_minutes,
    MIN(precise_duration_minutes) as min_duration_minutes,
    MAX(precise_duration_minutes) as max_duration_minutes,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY precise_duration_minutes) as median_duration_minutes,
    COUNT(CASE WHEN outcome = 'win' THEN 1 END) as winning_trades,
    COUNT(CASE WHEN outcome = 'loss' THEN 1 END) as losing_trades,
    ROUND(
        COUNT(CASE WHEN outcome = 'win' THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(*), 0) * 100, 2
    ) as win_rate_percent,
    AVG(CASE WHEN outcome = 'win' THEN precise_duration_minutes END) as avg_winning_duration,
    AVG(CASE WHEN outcome = 'loss' THEN precise_duration_minutes END) as avg_losing_duration,
    AVG(pnl) as avg_pnl
FROM public.trades 
WHERE precise_duration_minutes IS NOT NULL
GROUP BY user_id, trade_session;

-- Create duration category function for analytics
CREATE OR REPLACE FUNCTION get_duration_category(duration_minutes NUMERIC)
RETURNS TEXT AS $$
BEGIN
    CASE 
        WHEN duration_minutes IS NULL THEN RETURN 'Unknown';
        WHEN duration_minutes <= 5 THEN RETURN 'Scalp (≤5min)';
        WHEN duration_minutes <= 30 THEN RETURN 'Short-term (5-30min)';
        WHEN duration_minutes <= 240 THEN RETURN 'Intraday (30min-4h)';
        WHEN duration_minutes <= 1440 THEN RETURN 'Day Trade (4h-1d)';
        ELSE RETURN 'Swing (>1d)';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create session overlap detection function
CREATE OR REPLACE FUNCTION get_session_overlaps(trade_time TIME)
RETURNS TEXT[] AS $$
DECLARE
    overlaps TEXT[] := '{}';
    hour_minute INTEGER;
BEGIN
    -- Convert time to minutes since midnight for easier comparison
    hour_minute := EXTRACT(HOUR FROM trade_time) * 60 + EXTRACT(MINUTE FROM trade_time);
    
    -- Asian Session: 21:00 - 06:00 GMT (1260-360 minutes, wrapping around midnight)
    IF (hour_minute >= 1260) OR (hour_minute <= 360) THEN
        overlaps := array_append(overlaps, 'asian');
    END IF;
    
    -- London Session: 07:00 - 16:00 GMT (420-960 minutes)
    IF hour_minute >= 420 AND hour_minute <= 960 THEN
        overlaps := array_append(overlaps, 'london');
    END IF;
    
    -- New York Session: 12:00 - 21:00 GMT (720-1260 minutes)
    IF hour_minute >= 720 AND hour_minute <= 1260 THEN
        overlaps := array_append(overlaps, 'new-york');
    END IF;
    
    RETURN overlaps;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT ON trade_timing_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_trade_duration(TIME, TIME, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_duration_category(NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION get_session_overlaps(TIME) TO authenticated;
