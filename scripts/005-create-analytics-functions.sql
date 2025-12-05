-- Create function for duration-based analytics
CREATE OR REPLACE FUNCTION get_duration_based_analytics(user_id_param UUID)
RETURNS TABLE (
  duration_range TEXT,
  total_trades BIGINT,
  win_count BIGINT,
  loss_count BIGINT,
  win_rate NUMERIC,
  avg_pnl NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH duration_categories AS (
    SELECT 
      t.*,
      CASE 
        WHEN t.duration_minutes IS NULL THEN 'Unknown'
        WHEN t.duration_minutes <= 5 THEN '0-5 min'
        WHEN t.duration_minutes <= 15 THEN '5-15 min'
        WHEN t.duration_minutes <= 30 THEN '15-30 min'
        WHEN t.duration_minutes <= 60 THEN '30-60 min'
        WHEN t.duration_minutes <= 240 THEN '1-4 hours'
        WHEN t.duration_minutes <= 1440 THEN '4-24 hours'
        ELSE '1+ days'
      END as duration_category
    FROM trades t
    WHERE t.user_id = user_id_param
      AND t.outcome IN ('win', 'loss')
  )
  SELECT 
    dc.duration_category::TEXT,
    COUNT(*)::BIGINT as total_trades,
    COUNT(CASE WHEN dc.outcome = 'win' THEN 1 END)::BIGINT as win_count,
    COUNT(CASE WHEN dc.outcome = 'loss' THEN 1 END)::BIGINT as loss_count,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(CASE WHEN dc.outcome = 'win' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
      ELSE 0 
    END as win_rate,
    ROUND(AVG(dc.pnl), 2) as avg_pnl
  FROM duration_categories dc
  GROUP BY dc.duration_category
  ORDER BY 
    CASE dc.duration_category
      WHEN '0-5 min' THEN 1
      WHEN '5-15 min' THEN 2
      WHEN '15-30 min' THEN 3
      WHEN '30-60 min' THEN 4
      WHEN '1-4 hours' THEN 5
      WHEN '4-24 hours' THEN 6
      WHEN '1+ days' THEN 7
      ELSE 8
    END;
END;
$$ LANGUAGE plpgsql;

-- Create function for time-based analytics
CREATE OR REPLACE FUNCTION get_time_based_analytics(user_id_param UUID)
RETURNS TABLE (
  time_category TEXT,
  total_trades BIGINT,
  win_count BIGINT,
  loss_count BIGINT,
  win_rate NUMERIC,
  avg_pnl NUMERIC,
  avg_duration NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH time_categories AS (
    SELECT 
      t.*,
      CASE 
        WHEN t.time_of_day IS NULL THEN 'Unknown'
        WHEN t.time_of_day >= '00:00:00' AND t.time_of_day < '06:00:00' THEN 'Night (00-06)'
        WHEN t.time_of_day >= '06:00:00' AND t.time_of_day < '09:00:00' THEN 'Early Morning (06-09)'
        WHEN t.time_of_day >= '09:00:00' AND t.time_of_day < '12:00:00' THEN 'Morning (09-12)'
        WHEN t.time_of_day >= '12:00:00' AND t.time_of_day < '15:00:00' THEN 'Afternoon (12-15)'
        WHEN t.time_of_day >= '15:00:00' AND t.time_of_day < '18:00:00' THEN 'Late Afternoon (15-18)'
        WHEN t.time_of_day >= '18:00:00' AND t.time_of_day < '21:00:00' THEN 'Evening (18-21)'
        ELSE 'Late Evening (21-24)'
      END as time_category
    FROM trades t
    WHERE t.user_id = user_id_param
      AND t.outcome IN ('win', 'loss')
  )
  SELECT 
    tc.time_category::TEXT,
    COUNT(*)::BIGINT as total_trades,
    COUNT(CASE WHEN tc.outcome = 'win' THEN 1 END)::BIGINT as win_count,
    COUNT(CASE WHEN tc.outcome = 'loss' THEN 1 END)::BIGINT as loss_count,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(CASE WHEN tc.outcome = 'win' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
      ELSE 0 
    END as win_rate,
    ROUND(AVG(tc.pnl), 2) as avg_pnl,
    ROUND(AVG(tc.duration_minutes), 2) as avg_duration
  FROM time_categories tc
  GROUP BY tc.time_category
  ORDER BY 
    CASE tc.time_category
      WHEN 'Night (00-06)' THEN 1
      WHEN 'Early Morning (06-09)' THEN 2
      WHEN 'Morning (09-12)' THEN 3
      WHEN 'Afternoon (12-15)' THEN 4
      WHEN 'Late Afternoon (15-18)' THEN 5
      WHEN 'Evening (18-21)' THEN 6
      WHEN 'Late Evening (21-24)' THEN 7
      ELSE 8
    END;
END;
$$ LANGUAGE plpgsql;
