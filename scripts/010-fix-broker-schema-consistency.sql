-- Drop existing tables to recreate with correct schema
DROP TABLE IF EXISTS broker_trades CASCADE;
DROP TABLE IF EXISTS broker_sync_logs CASCADE;
DROP TABLE IF EXISTS broker_connections CASCADE;
DROP TABLE IF EXISTS supported_brokers CASCADE;

-- Create broker connections table with correct field names
CREATE TABLE broker_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    broker_id VARCHAR(50) NOT NULL, -- Use string ID instead of UUID for simplicity
    name VARCHAR(255) NOT NULL, -- This matches the frontend expectation
    account_id VARCHAR(255),
    credentials JSONB NOT NULL, -- Encrypted credentials
    is_active BOOLEAN DEFAULT true,
    is_paper_trading BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'connected', -- 'connected', 'error', 'syncing'
    error_message TEXT,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_frequency INTEGER DEFAULT 300, -- seconds
    auto_sync BOOLEAN DEFAULT true,
    total_trades_synced INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, broker_id, account_id)
);

-- Create broker sync logs table
CREATE TABLE broker_sync_logs (
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
CREATE TABLE broker_trades (
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
CREATE INDEX idx_broker_connections_user_id ON broker_connections(user_id);
CREATE INDEX idx_broker_connections_broker_id ON broker_connections(broker_id);
CREATE INDEX idx_broker_sync_logs_connection_id ON broker_sync_logs(connection_id);
CREATE INDEX idx_broker_trades_connection_id ON broker_trades(connection_id);
CREATE INDEX idx_broker_trades_trade_id ON broker_trades(trade_id);

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

CREATE POLICY "Users can insert sync logs for their connections" ON broker_sync_logs
    FOR INSERT WITH CHECK (
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

CREATE POLICY "Users can insert broker trades for their connections" ON broker_trades
    FOR INSERT WITH CHECK (
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
