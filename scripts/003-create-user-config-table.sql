-- Create user_config_settings table to store user configurations
CREATE TABLE IF NOT EXISTS user_config_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  config JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at on row modification
DROP TRIGGER IF EXISTS on_user_config_update ON public.user_config_settings;
CREATE TRIGGER on_user_config_update
BEFORE UPDATE ON public.user_config_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_user_config_updated_at();

-- Enable RLS
ALTER TABLE public.user_config_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can select their own config
DROP POLICY IF EXISTS "Users can select their own config" ON public.user_config_settings;
CREATE POLICY "Users can select their own config"
ON public.user_config_settings
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own config
DROP POLICY IF EXISTS "Users can insert their own config" ON public.user_config_settings;
CREATE POLICY "Users can insert their own config"
ON public.user_config_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own config
DROP POLICY IF EXISTS "Users can update their own config" ON public.user_config_settings;
CREATE POLICY "Users can update their own config"
ON public.user_config_settings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.user_config_settings IS 'Stores user-specific application configurations.';
COMMENT ON COLUMN public.user_config_settings.user_id IS 'Foreign key to the authenticated user.';
COMMENT ON COLUMN public.user_config_settings.config IS 'JSONB object containing the user configuration.';
COMMENT ON COLUMN public.user_config_settings.updated_at IS 'Timestamp of the last update.';
