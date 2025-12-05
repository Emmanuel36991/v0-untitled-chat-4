-- Add FVG and IFVG fields to trades table
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS smc_fvg_classic TEXT[],
ADD COLUMN IF NOT EXISTS smc_fvg_ifvg TEXT[];

-- Update the comment to reflect new fields
COMMENT ON TABLE trades IS 'Enhanced trades table with SMC FVG and IFVG concepts';
