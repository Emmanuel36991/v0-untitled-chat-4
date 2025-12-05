-- Complete schema reset to fix all timing field references
-- This script will completely clean up the database

-- First, let's drop ALL triggers and functions to start fresh
DROP TRIGGER IF EXISTS set_updated_at ON public.trades CASCADE;
DROP TRIGGER IF EXISTS calculate_trade_metrics ON public.trades CASCADE;
DROP TRIGGER IF EXISTS ensure_trade_consistency_trigger ON public.trades CASCADE;
DROP TRIGGER IF EXISTS update_trades_updated_at ON public.trades CASCADE;

-- Drop all functions that might reference old fields
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS calculate_trade_outcome() CASCADE;
DROP FUNCTION IF EXISTS set_trade_metrics() CASCADE;
DROP FUNCTION IF EXISTS ensure_trade_consistency() CASCADE;
DROP FUNCTION IF EXISTS update_trades_updated_at() CASCADE;

-- Get a list of all triggers on the trades table and drop them
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'trades'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON public.trades CASCADE';
    END LOOP;
END $$;

-- Now ensure all old time fields are completely removed
ALTER TABLE public.trades 
DROP COLUMN IF EXISTS entry_time CASCADE,
DROP COLUMN IF EXISTS exit_time CASCADE,
DROP COLUMN IF EXISTS time_of_day CASCADE,
DROP COLUMN IF EXISTS entry_timestamp CASCADE,
DROP COLUMN IF EXISTS exit_timestamp CASCADE;

-- Ensure the current fields exist and have correct types
DO $$
BEGIN
    -- Add duration_minutes if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' AND column_name = 'duration_minutes'
    ) THEN
        ALTER TABLE public.trades ADD COLUMN duration_minutes INTEGER;
    END IF;
    
    -- Add trade_session if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' AND column_name = 'trade_session'
    ) THEN
        ALTER TABLE public.trades ADD COLUMN trade_session TEXT;
    END IF;
    
    -- Ensure these fields can be NULL
    ALTER TABLE public.trades ALTER COLUMN duration_minutes DROP NOT NULL;
    ALTER TABLE public.trades ALTER COLUMN trade_session DROP NOT NULL;
    ALTER TABLE public.trades ALTER COLUMN outcome DROP NOT NULL;
    ALTER TABLE public.trades ALTER COLUMN pnl DROP NOT NULL;
    ALTER TABLE public.trades ALTER COLUMN risk_reward_ratio DROP NOT NULL;
END $$;

-- Create a simple updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a comprehensive trade validation function
CREATE OR REPLACE FUNCTION validate_and_calculate_trade()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure required fields are present
    IF NEW.entry_price IS NULL OR NEW.exit_price IS NULL OR NEW.size IS NULL THEN
        RAISE EXCEPTION 'entry_price, exit_price, and size are required';
    END IF;
    
    -- Calculate P&L if not provided
    IF NEW.pnl IS NULL THEN
        NEW.pnl = CASE 
            WHEN NEW.direction = 'long' THEN (NEW.exit_price - NEW.entry_price) * NEW.size
            ELSE (NEW.entry_price - NEW.exit_price) * NEW.size
        END;
    END IF;
    
    -- Calculate outcome if not provided
    IF NEW.outcome IS NULL THEN
        NEW.outcome = CASE 
            WHEN ABS(NEW.pnl) < 0.01 THEN 'breakeven'
            WHEN NEW.pnl > 0 THEN 'win'
            ELSE 'loss'
        END;
    END IF;
    
    -- Calculate risk-reward ratio if not provided and stop_loss is set
    IF NEW.risk_reward_ratio IS NULL AND NEW.stop_loss IS NOT NULL THEN
        DECLARE
            risk_amount NUMERIC;
        BEGIN
            risk_amount := ABS((NEW.entry_price - NEW.stop_loss) * NEW.size);
            IF risk_amount > 0 THEN
                NEW.risk_reward_ratio := ROUND(ABS(NEW.pnl) / risk_amount, 2)::TEXT;
            END IF;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the validation trigger
CREATE TRIGGER validate_and_calculate_trade_trigger
    BEFORE INSERT OR UPDATE ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION validate_and_calculate_trade();

-- Update any existing trades that might have NULL calculated fields
UPDATE public.trades 
SET 
    pnl = CASE 
        WHEN direction = 'long' THEN (exit_price - entry_price) * size
        ELSE (entry_price - exit_price) * size
    END,
    outcome = CASE 
        WHEN ABS(CASE 
            WHEN direction = 'long' THEN (exit_price - entry_price) * size
            ELSE (entry_price - exit_price) * size
        END) < 0.01 THEN 'breakeven'
        WHEN CASE 
            WHEN direction = 'long' THEN (exit_price - entry_price) * size
            ELSE (entry_price - exit_price) * size
        END > 0 THEN 'win'
        ELSE 'loss'
    END
WHERE pnl IS NULL OR outcome IS NULL;

-- Recreate analytics functions with proper error handling
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
            WHEN t.duration_minutes IS NULL THEN 'Unknown'
            WHEN t.duration_minutes <= 15 THEN 'Scalp (≤15m)'
            WHEN t.duration_minutes <= 60 THEN 'Short-term (15m-1h)'
            WHEN t.duration_minutes <= 240 THEN 'Medium-term (1h-4h)'
            WHEN t.duration_minutes <= 1440 THEN 'Day Trade (4h-1d)'
            ELSE 'Swing (>1d)'
        END as duration_category,
        COUNT(*)::INTEGER as total_trades,
        COUNT(CASE WHEN t.outcome = 'win' THEN 1 END)::INTEGER as win_count,
        COUNT(CASE WHEN t.outcome = 'loss' THEN 1 END)::INTEGER as loss_count,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN t.outcome = 'win' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END as win_rate,
        ROUND(COALESCE(AVG(t.pnl), 0), 2) as avg_pnl
    FROM public.trades t
    WHERE t.user_id = user_id_param
    GROUP BY 
        CASE 
            WHEN t.duration_minutes IS NULL THEN 'Unknown'
            WHEN t.duration_minutes <= 15 THEN 'Scalp (≤15m)'
            WHEN t.duration_minutes <= 60 THEN 'Short-term (15m-1h)'
            WHEN t.duration_minutes <= 240 THEN 'Medium-term (1h-4h)'
            WHEN t.duration_minutes <= 1440 THEN 'Day Trade (4h-1d)'
            ELSE 'Swing (>1d)'
        END
    ORDER BY total_trades DESC;
END;
$$ LANGUAGE plpgsql;

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
        COALESCE(t.trade_session, 'Unknown') as session_name,
        COUNT(*)::INTEGER as total_trades,
        COUNT(CASE WHEN t.outcome = 'win' THEN 1 END)::INTEGER as win_count,
        COUNT(CASE WHEN t.outcome = 'loss' THEN 1 END)::INTEGER as loss_count,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN t.outcome = 'win' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END as win_rate,
        ROUND(COALESCE(AVG(t.pnl), 0), 2) as avg_pnl
    FROM public.trades t
    WHERE t.user_id = user_id_param
    GROUP BY t.trade_session
    ORDER BY total_trades DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_duration_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_session_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_and_calculate_trade() TO authenticated;

-- Verify the final table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'trades' 
ORDER BY ordinal_position;
