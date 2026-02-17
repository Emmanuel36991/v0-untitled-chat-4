-- Ensure Alpaca exists in supported_brokers (required for Connect Broker -> Alpaca).
-- Run this in Supabase SQL Editor if you get "Alpaca broker configuration not found."
-- Safe to run multiple times (no duplicate row).

INSERT INTO supported_brokers (name, display_name, api_type, auth_method, base_url, documentation_url)
VALUES (
  'alpaca',
  'Alpaca',
  'rest',
  'api_key',
  'https://paper-api.alpaca.markets',
  'https://alpaca.markets/docs/'
)
ON CONFLICT (name) DO NOTHING;
