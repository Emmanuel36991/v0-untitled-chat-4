-- Drop all broker-related tables
DROP TABLE IF EXISTS broker_trades CASCADE;
DROP TABLE IF EXISTS broker_sync_logs CASCADE;
DROP TABLE IF EXISTS broker_connections CASCADE;
DROP TABLE IF EXISTS supported_brokers CASCADE;

-- Drop all TradingView-related tables
DROP TABLE IF EXISTS tradingview_signals CASCADE;
DROP TABLE IF EXISTS tradingview_webhooks CASCADE;
DROP TABLE IF EXISTS tradingview_connections CASCADE;

-- Drop any related functions and triggers
DROP FUNCTION IF EXISTS update_broker_connection_sync_time() CASCADE;
DROP FUNCTION IF EXISTS update_tradingview_connection_stats() CASCADE;
