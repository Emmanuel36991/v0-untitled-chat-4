-- Create supported brokers table
CREATE TABLE IF NOT EXISTS supported_brokers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    logo_url TEXT,
    api_type VARCHAR(50) NOT NULL, -- 'rest', 'websocket', 'oauth'
    auth_method VARCHAR(50) NOT NULL, -- 'api_key', 'oauth', 'credentials'
    base_url TEXT,
    documentation_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert supported brokers
INSERT INTO supported_brokers (name, display_name, api_type, auth_method, base_url, documentation_url) VALUES
('tradovate', 'Tradovate', 'rest', 'credentials', 'https://live-api.tradovate.com', 'https://api.tradovate.com/'),
('td_ameritrade', 'TD Ameritrade', 'rest', 'oauth', 'https://api.tdameritrade.com', 'https://developer.tdameritrade.com/'),
('interactive_brokers', 'Interactive Brokers', 'rest', 'api_key', 'https://api.interactivebrokers.com', 'https://www.interactivebrokers.com/api/'),
('alpaca', 'Alpaca', 'rest', 'api_key', 'https://paper-api.alpaca.markets', 'https://alpaca.markets/docs/'),
('oanda', 'OANDA', 'rest', 'api_key', 'https://api-fxpractice.oanda.com', 'https://developer.oanda.com/'),
('binance', 'Binance', 'rest', 'api_key', 'https://api.binance.com', 'https://binance-docs.github.io/apidocs/'),
('coinbase_pro', 'Coinbase Advanced', 'rest', 'api_key', 'https://api.exchange.coinbase.com', 'https://docs.cloud.coinbase.com/'),
('kraken', 'Kraken', 'rest', 'api_key', 'https://api.kraken.com', 'https://docs.kraken.com/rest/')
ON CONFLICT (name) DO NOTHING;

-- Create broker connections table
CREATE TABLE IF NOT EXISTS broker_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    broker_id UUID NOT NULL REFERENCES supported_brokers(id) ON DELETE CASCADE,
    connection_name VARCHAR(255) NOT NULL,
    account_id VARCHAR(255),
    credentials JSONB NOT NULL, -- Encrypted credentials
    is_active BOOLEAN DEFAULT true,
    is_paper_trading BOOLEAN DEFAULT false,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_frequency INTEGER DEFAULT 300, -- seconds
    auto_sync BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, broker_id, account_id)
);

-- Create broker sync logs table
CREATE TABLE IF NOT EXISTS broker_sync_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    connection_id UUID NOT NULL REFERENCES broker_connections(id) ON DELETE CASCADE,
    sync_type VARCHAR(50) NOT NULL, -- 'manual', 'auto', 'scheduled'
    status VARCHAR(50) NOT NULL DEFAULT 'running', -- 'running', 'success', 'error', 'partial'
    trades_synced INTEGER DEFAULT 0,
    trades_updated INTEGER DEFAULT 0,
    trades_skipped INTEGER DEFAULT 0,
    error_message TEXT,
    sync_duration_ms INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create broker trades table (for mapping synced trades)
CREATE TABLE IF NOT EXISTS broker_trades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    connection_id UUID NOT NULL REFERENCES broker_connections(id) ON DELETE CASCADE,
    trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
    broker_trade_id VARCHAR(255) NOT NULL,
    broker_order_id VARCHAR(255),
    raw_data JSONB, -- Store original broker data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(connection_id, broker_trade_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_broker_connections_user_id ON broker_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_broker_connections_broker_id ON broker_connections(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_sync_logs_connection_id ON broker_sync_logs(connection_id);
CREATE INDEX IF NOT EXISTS idx_broker_trades_connection_id ON broker_trades(connection_id);
CREATE INDEX IF NOT EXISTS idx_broker_trades_trade_id ON broker_trades(trade_id);

-- Enable RLS
ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_trades ENABLE ROW LEVEL SECURITY;

-- RLS Policies for broker_connections
CREATE POLICY "Users can view their own broker connections" ON broker_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own broker connections" ON broker_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own broker connections" ON broker_connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own broker connections" ON broker_connections
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for broker_sync_logs
CREATE POLICY "Users can view sync logs for their connections" ON broker_sync_logs
    FOR SELECT USING (
        connection_id IN (
            SELECT id FROM broker_connections WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for broker_trades
CREATE POLICY "Users can view broker trades for their connections" ON broker_trades
    FOR SELECT USING (
        connection_id IN (
            SELECT id FROM broker_connections WHERE user_id = auth.uid()
        )
    );

-- Function to update connection last_sync_at
CREATE OR REPLACE FUNCTION update_broker_connection_sync_time()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE broker_connections 
    SET 
        last_sync_at = NEW.completed_at,
        updated_at = NOW()
    WHERE id = NEW.connection_id AND NEW.status = 'success';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update sync time
CREATE TRIGGER trigger_update_broker_sync_time
    AFTER UPDATE ON broker_sync_logs
    FOR EACH ROW
    WHEN (NEW.status = 'success' AND OLD.status != 'success')
    EXECUTE FUNCTION update_broker_connection_sync_time();
