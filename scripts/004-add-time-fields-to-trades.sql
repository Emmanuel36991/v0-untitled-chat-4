-- Add time-related fields to trades table
ALTER TABLE trades 
ADD COLUMN entry_time TIME,
ADD COLUMN exit_time TIME,
ADD COLUMN duration_minutes INTEGER,
ADD COLUMN time_of_day VARCHAR(20);

-- Create index for time-based queries
CREATE INDEX idx_trades_entry_time ON trades(entry_time);
CREATE INDEX idx_trades_time_of_day ON trades(time_of_day);

-- Update time_of_day for existing records where entry_time is available
CREATE OR REPLACE FUNCTION update_time_of_day()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entry_time IS NOT NULL THEN
    -- Categorize time of day
    IF NEW.entry_time BETWEEN '04:00:00' AND '08:59:59' THEN
      NEW.time_of_day := 'Early Morning';
    ELSIF NEW.entry_time BETWEEN '09:00:00' AND '11:59:59' THEN
      NEW.time_of_day := 'Morning';
    ELSIF NEW.entry_time BETWEEN '12:00:00' AND '13:59:59' THEN
      NEW.time_of_day := 'Midday';
    ELSIF NEW.entry_time BETWEEN '14:00:00' AND '16:59:59' THEN
      NEW.time_of_day := 'Afternoon';
    ELSIF NEW.entry_time BETWEEN '17:00:00' AND '20:59:59' THEN
      NEW.time_of_day := 'Evening';
    ELSE
      NEW.time_of_day := 'Night';
    END IF;
    
    -- Calculate duration if both entry and exit times are available
    IF NEW.exit_time IS NOT NULL THEN
      -- Calculate minutes between times, handling cases where exit is on the next day
      IF NEW.exit_time >= NEW.entry_time THEN
        NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.exit_time - NEW.entry_time))/60;
      ELSE
        -- Exit time is on the next day
        NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.exit_time + INTERVAL '24 hours' - NEW.entry_time))/60;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update time_of_day and duration_minutes
CREATE TRIGGER trg_update_time_of_day
BEFORE INSERT OR UPDATE ON trades
FOR EACH ROW
EXECUTE FUNCTION update_time_of_day();

-- Add function to get time-based analytics
CREATE OR REPLACE FUNCTION get_time_based_analytics(user_id_param UUID)
RETURNS TABLE (
  time_category VARCHAR(20),
  total_trades INTEGER,
  win_count INTEGER,
  loss_count INTEGER,
  win_rate NUMERIC,
  avg_pnl NUMERIC,
  avg_duration NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    time_of_day AS time_category,
    COUNT(*) AS total_trades,
    COUNT(*) FILTER (WHERE outcome = 'win') AS win_count,
    COUNT(*) FILTER (WHERE outcome = 'loss') AS loss_count,
    CASE 
      WHEN COUNT(*) FILTER (WHERE outcome IN ('win', 'loss')) > 0 
      THEN ROUND((COUNT(*) FILTER (WHERE outcome = 'win')::NUMERIC / 
           COUNT(*) FILTER (WHERE outcome IN ('win', 'loss'))) * 100, 2)
      ELSE 0
    END AS win_rate,
    ROUND(AVG(pnl), 2) AS avg_pnl,
    ROUND(AVG(duration_minutes), 2) AS avg_duration
  FROM trades
  WHERE user_id = user_id_param
    AND time_of_day IS NOT NULL
  GROUP BY time_of_day
  ORDER BY 
    CASE time_of_day
      WHEN 'Early Morning' THEN 1
      WHEN 'Morning' THEN 2
      WHEN 'Midday' THEN 3
      WHEN 'Afternoon' THEN 4
      WHEN 'Evening' THEN 5
      WHEN 'Night' THEN 6
      ELSE 7
    END;
END;
$$ LANGUAGE plpgsql;

-- Add function to get duration-based analytics
CREATE OR REPLACE FUNCTION get_duration_based_analytics(user_id_param UUID)
RETURNS TABLE (
  duration_range VARCHAR(20),
  total_trades INTEGER,
  win_count INTEGER,
  loss_count INTEGER,
  win_rate NUMERIC,
  avg_pnl NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH duration_categories AS (
    SELECT 
      id,
      CASE 
        WHEN duration_minutes < 15 THEN 'Under 15m'
        WHEN duration_minutes BETWEEN 15 AND 59 THEN '15m-1h'
        WHEN duration_minutes BETWEEN 60 AND 239 THEN '1h-4h'
        WHEN duration_minutes BETWEEN 240 AND 479 THEN '4h-8h'
        WHEN duration_minutes >= 480 THEN 'Over 8h'
        ELSE 'Unknown'
      END AS duration_range,
      outcome,
      pnl
    FROM trades
    WHERE user_id = user_id_param
      AND duration_minutes IS NOT NULL
  )
  SELECT 
    duration_range,
    COUNT(*) AS total_trades,
    COUNT(*) FILTER (WHERE outcome = 'win') AS win_count,
    COUNT(*) FILTER (WHERE outcome = 'loss') AS loss_count,
    CASE 
      WHEN COUNT(*) FILTER (WHERE outcome IN ('win', 'loss')) > 0 
      THEN ROUND((COUNT(*) FILTER (WHERE outcome = 'win')::NUMERIC / 
           COUNT(*) FILTER (WHERE outcome IN ('win', 'loss'))) * 100, 2)
      ELSE 0
    END AS win_rate,
    ROUND(AVG(pnl), 2) AS avg_pnl
  FROM duration_categories
  GROUP BY duration_range
  ORDER BY 
    CASE duration_range
      WHEN 'Under 15m' THEN 1
      WHEN '15m-1h' THEN 2
      WHEN '1h-4h' THEN 3
      WHEN '4h-8h' THEN 4
      WHEN 'Over 8h' THEN 5
      ELSE 6
    END;
END;
$$ LANGUAGE plpgsql;
