-- Ensure the uuid-ossp extension is enabled (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the trades table
CREATE TABLE IF NOT EXISTS public.trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    instrument TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('long', 'short')),
    entry_price DECIMAL NOT NULL,
    exit_price DECIMAL NOT NULL,
    stop_loss DECIMAL NOT NULL,
    take_profit DECIMAL,
    size DECIMAL NOT NULL,
    outcome TEXT NOT NULL CHECK (outcome IN ('win', 'loss', 'breakeven')),
    pnl DECIMAL NOT NULL,
    risk_reward_ratio TEXT,
    setup_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    screenshot_before_url TEXT,
    screenshot_after_url TEXT,

    -- Smart Money Concepts
    smc_market_structure TEXT[],
    smc_order_blocks TEXT[],
    smc_fvg TEXT[],
    smc_liquidity_concepts TEXT[],
    smc_breaker_mitigation_blocks TEXT[],
    smc_mitigation_fill_zones TEXT[],
    smc_wyckoff_overlaps TEXT[],

    -- ICT Concepts
    ict_market_structure_shift TEXT[],
    ict_order_flow_blocks TEXT[],
    ict_liquidity_pools_stops TEXT[],
    ict_kill_zones TEXT[],
    ict_ote TEXT[],
    ict_fibonacci_clusters TEXT[],
    ict_power_of_three TEXT[],
    ict_smt_divergence TEXT[],
    ict_daily_bias_session_dynamics TEXT[],
    ict_entry_model TEXT[],
    ict_liquidity_concepts TEXT[],
    ict_market_structure TEXT[],
    ict_time_and_price TEXT[],
    ict_bias_context TEXT[],
    ict_liquidity_events TEXT[],
    ict_fibonacci_levels TEXT[],
    ict_price_action_patterns TEXT[],
    ict_confluence TEXT[],

    -- Wyckoff Method
    wyckoff_price_volume TEXT[],
    wyckoff_phases TEXT[],
    wyckoff_composite_man TEXT[],
    wyckoff_spring_upthrust TEXT[],
    wyckoff_cause_effect TEXT[],
    wyckoff_sr TEXT[],
    wyckoff_effort_result TEXT[],

    -- Volume Analysis
    volume_spikes_clusters TEXT[],
    volume_profile_market_profile TEXT[],
    volume_trends TEXT[],
    volume_obv_ad TEXT[],
    volume_imbalance TEXT[],

    -- Support & Resistance
    sr_horizontal_levels TEXT[],
    sr_dynamic TEXT[],
    sr_supply_demand_zones TEXT[],
    sr_flip TEXT[],
    sr_confluence_zones TEXT[],
    sr_micro_macro TEXT[],
    sr_order_flow TEXT[],
    support_resistance_used TEXT[], -- Retained from existing type

    -- Psychology Factors
    psychology_factors TEXT[]
);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_trades_updated_at
BEFORE UPDATE ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS) for the trades table
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Policies for RLS
-- Allow users to see their own trades
CREATE POLICY "Allow individual user select access"
ON public.trades
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own trades
CREATE POLICY "Allow individual user insert access"
ON public.trades
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own trades
CREATE POLICY "Allow individual user update access"
ON public.trades
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own trades
CREATE POLICY "Allow individual user delete access"
ON public.trades
FOR DELETE
USING (auth.uid() = user_id);

-- Optional: Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_date ON public.trades(date);
CREATE INDEX IF NOT EXISTS idx_trades_instrument ON public.trades(instrument);
