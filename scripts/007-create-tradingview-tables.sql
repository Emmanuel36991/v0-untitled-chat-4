-- Create TradingView connections table
CREATE TABLE IF NOT EXISTS tradingview_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    webhook_url TEXT NOT NULL,
    secret_key VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_signal_at TIMESTAMP WITH TIME ZONE,
    total_signals INTEGER DEFAULT 0
);

-- Create TradingView webhooks table (for logging all incoming requests)
CREATE TABLE IF NOT EXISTS tradingview_webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    connection_id UUID REFERENCES tradingview_connections(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    headers JSONB,
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(50) DEFAULT 'received',
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create TradingView signals table (for processed trading signals)
CREATE TABLE IF NOT EXISTS tradingview_signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    connection_id UUID NOT NULL REFERENCES tradingview_connections(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    webhook_id UUID REFERENCES tradingview_webhooks(id) ON DELETE SET NULL,
    symbol VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('buy', 'sell', 'close', 'alert')),
    price DECIMAL(20, 8),
    quantity DECIMAL(20, 8),
    strategy VARCHAR(255),
    timeframe VARCHAR(20),
    message TEXT,
    trade_created BOOLEAN DEFAULT false,
    trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tradingview_connections_user_id ON tradingview_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_tradingview_connections_secret_key ON tradingview_connections(secret_key);
CREATE INDEX IF NOT EXISTS idx_tradingview_webhooks_connection_id ON tradingview_webhooks(connection_id);
CREATE INDEX IF NOT EXISTS idx_tradingview_signals_connection_id ON tradingview_signals(connection_id);
CREATE INDEX IF NOT EXISTS idx_tradingview_signals_user_id ON tradingview_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_tradingview_signals_created_at ON tradingview_signals(created_at);

-- Enable Row Level Security
ALTER TABLE tradingview_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tradingview_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tradingview_signals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tradingview_connections
CREATE POLICY "Users can view their own TradingView connections" ON tradingview_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own TradingView connections" ON tradingview_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own TradingView connections" ON tradingview_connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own TradingView connections" ON tradingview_connections
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for tradingview_webhooks
CREATE POLICY "Users can view webhooks for their connections" ON tradingview_webhooks
    FOR SELECT USING (
        connection_id IN (
            SELECT id FROM tradingview_connections WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert webhooks" ON tradingview_webhooks
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for tradingview_signals
CREATE POLICY "Users can view their own TradingView signals" ON tradingview_signals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own TradingView signals" ON tradingview_signals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update connection stats when signals are received
CREATE OR REPLACE FUNCTION update_tradingview_connection_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tradingview_connections 
    SET 
        total_signals = total_signals + 1,
        last_signal_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.connection_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update connection stats
DROP TRIGGER IF EXISTS trigger_update_tradingview_stats ON tradingview_signals;
CREATE TRIGGER trigger_update_tradingview_stats
    AFTER INSERT ON tradingview_signals
    FOR EACH ROW
    EXECUTE FUNCTION update_tradingview_connection_stats();
