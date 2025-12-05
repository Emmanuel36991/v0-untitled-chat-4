-- Ensure user_config_settings table exists with proper structure
CREATE TABLE IF NOT EXISTS public.user_config_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_config_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "user_config_settings_select_own" ON public.user_config_settings;
DROP POLICY IF EXISTS "user_config_settings_insert_own" ON public.user_config_settings;
DROP POLICY IF EXISTS "user_config_settings_update_own" ON public.user_config_settings;
DROP POLICY IF EXISTS "user_config_settings_delete_own" ON public.user_config_settings;

-- Create RLS policies for CRUD operations
-- Allow users to view their own config
CREATE POLICY "user_config_settings_select_own"
  ON public.user_config_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own config
CREATE POLICY "user_config_settings_insert_own"
  ON public.user_config_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own config
CREATE POLICY "user_config_settings_update_own"
  ON public.user_config_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own config
CREATE POLICY "user_config_settings_delete_own"
  ON public.user_config_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_config_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create a trigger to call the function before updates
DROP TRIGGER IF EXISTS user_config_settings_updated_at ON public.user_config_settings;
CREATE TRIGGER user_config_settings_updated_at
  BEFORE UPDATE ON public.user_config_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_config_updated_at();
