-- Set a constant for the minimum number of trades required for an item to be displayed in public stats.
-- This can be adjusted as needed.
CREATE OR REPLACE FUNCTION get_min_trades_for_display()
RETURNS INT LANGUAGE sql IMMUTABLE AS $$
  SELECT 5;
$$;

-- Function to get instrument popularity
CREATE OR REPLACE FUNCTION get_instrument_popularity(limit_count INT, period_days INT)
RETURNS TABLE(instrument TEXT, trade_count BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.instrument,
    COUNT(t.id) as trade_count
  FROM
    public.trades t
  WHERE
    t.date >= (now() - (period_days || ' days')::interval)
  GROUP BY
    t.instrument
  HAVING
    COUNT(t.id) >= get_min_trades_for_display()
  ORDER BY
    trade_count DESC
  LIMIT
    limit_count;
END;
$$;

-- Function to get setup popularity
CREATE OR REPLACE FUNCTION get_setup_popularity(limit_count INT, period_days INT)
RETURNS TABLE(setup_name TEXT, trade_count BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.setup_name,
    COUNT(t.id) as trade_count
  FROM
    public.trades t
  WHERE
    t.date >= (now() - (period_days || ' days')::interval)
    AND t.setup_name IS NOT NULL
    AND t.setup_name != ''
  GROUP BY
    t.setup_name
  HAVING
    COUNT(t.id) >= get_min_trades_for_display()
  ORDER BY
    trade_count DESC
  LIMIT
    limit_count;
END;
$$;


-- Function to get overall instrument sentiment
CREATE OR REPLACE FUNCTION get_overall_instrument_sentiment(limit_count INT, period_days INT)
RETURNS TABLE(instrument TEXT, long_percentage FLOAT, short_percentage FLOAT, total_trades BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH popular_instruments AS (
    SELECT
      t.instrument,
      COUNT(t.id) as total_trades
    FROM
      public.trades t
    WHERE
      t.date >= (now() - (period_days || ' days')::interval)
    GROUP BY
      t.instrument
    HAVING
      COUNT(t.id) >= get_min_trades_for_display()
    ORDER BY
      total_trades DESC
    LIMIT
      limit_count
  ),
  sentiment_counts AS (
    SELECT
      t.instrument,
      COUNT(CASE WHEN t.direction = 'long' THEN 1 END) as long_trades,
      COUNT(CASE WHEN t.direction = 'short' THEN 1 END) as short_trades
    FROM
      public.trades t
    WHERE
      t.instrument IN (SELECT pi.instrument FROM popular_instruments pi)
      AND t.date >= (now() - (period_days || ' days')::interval)
    GROUP BY
      t.instrument
  )
  SELECT
    pi.instrument,
    COALESCE((sc.long_trades::FLOAT / NULLIF(pi.total_trades, 0)) * 100, 0)::FLOAT as long_percentage,
    COALESCE((sc.short_trades::FLOAT / NULLIF(pi.total_trades, 0)) * 100, 0)::FLOAT as short_percentage,
    pi.total_trades
  FROM
    popular_instruments pi
  LEFT JOIN
    sentiment_counts sc ON pi.instrument = sc.instrument
  ORDER BY
    pi.total_trades DESC;
END;
$$;
