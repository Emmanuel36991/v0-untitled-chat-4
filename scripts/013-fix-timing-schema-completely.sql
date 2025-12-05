-- Complete fix for timing schema issues
-- This script ensures all references to old time fields are removed

-- First, let's check and drop any triggers that might reference old fields
DROP TRIGGER IF EXISTS set_updated_at ON public.trades;
DROP TRIGGER IF EXISTS calculate_trade_metrics ON public.trades;

-- Drop any functions that might reference old fields
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS calculate_trade_outcome();
DROP FUNCTION IF EXISTS set_trade_metrics();

-- Ensure the old time fields are completely removed
ALTER TABLE public.trades 
DROP COLUMN IF EXISTS entry_time CASCADE,
DROP COLUMN IF EXISTS exit_time CASCADE,
DROP COLUMN IF EXISTS time_of_day CASCADE;

-- Make sure duration_minutes and trade_session allow NULL
ALTER TABLE public.trades 
ALTER COLUMN duration_minutes DROP NOT NULL,
ALTER COLUMN trade_session DROP NOT NULL;

-- Create a simple updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the trades table structure
DO $$
BEGIN
    -- Check if all required columns exist with correct types
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'outcome' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE public.trades ALTER COLUMN outcome DROP NOT NULL;
    END IF;
    
    -- Ensure pnl and risk_reward_ratio can be NULL initially
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'pnl' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE public.trades ALTER COLUMN pnl DROP NOT NULL;
    END IF;
END $$;

-- Update any existing trades that might have NULL outcomes
UPDATE public.trades 
SET 
    outcome = CASE 
        WHEN pnl > 0 THEN 'win'
        WHEN pnl < 0 THEN 'loss'
        ELSE 'breakeven'
    END,
    risk_reward_ratio = CASE 
        WHEN ABS((entry_price - stop_loss) * size) > 0 
        THEN (ABS(pnl) / ABS((entry_price - stop_loss) * size))::TEXT
        ELSE NULL
    END
WHERE outcome IS NULL OR pnl IS NULL;

-- Create a function to ensure data consistency
CREATE OR REPLACE FUNCTION ensure_trade_consistency()
RETURNS TRIGGER AS $$
BEGIN
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
    
    -- Calculate risk-reward ratio if not provided
    IF NEW.risk_reward_ratio IS NULL AND ABS((NEW.entry_price - NEW.stop_loss) * NEW.size) > 0 THEN
        NEW.risk_reward_ratio = (ABS(NEW.pnl) / ABS((NEW.entry_price - NEW.stop_loss) * NEW.size))::TEXT;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for data consistency
CREATE TRIGGER ensure_trade_consistency_trigger
    BEFORE INSERT OR UPDATE ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION ensure_trade_consistency();

-- Refresh the analytics functions to ensure they work with the new schema
DROP FUNCTION IF EXISTS get_duration_analytics(UUID);
DROP FUNCTION IF EXISTS get_session_analytics(UUID);

-- Recreate duration analytics function
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
        ROUND(AVG(t.pnl), 2) as avg_pnl
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
    ORDER BY 
        CASE 
            WHEN t.duration_minutes IS NULL THEN 0
            WHEN t.duration_minutes <= 15 THEN 1
            WHEN t.duration_minutes <= 60 THEN 2
            WHEN t.duration_minutes <= 240 THEN 3
            WHEN t.duration_minutes <= 1440 THEN 4
            ELSE 5
        END;
END;
$$ LANGUAGE plpgsql;

-- Recreate session analytics function
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
        ROUND(AVG(t.pnl), 2) as avg_pnl
    FROM public.trades t
    WHERE t.user_id = user_id_param
    GROUP BY t.trade_session
    ORDER BY total_trades DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_duration_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_session_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_trade_consistency() TO authenticated;
