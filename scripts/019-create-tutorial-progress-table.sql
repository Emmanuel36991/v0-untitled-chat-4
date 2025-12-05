-- Create tutorial progress table to track user's learning journey
CREATE TABLE IF NOT EXISTS public.tutorial_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tutorial_id TEXT NOT NULL, -- e.g., "dashboard-welcome", "first-trade", etc.
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    time_spent_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, tutorial_id)
);

-- Enable Row Level Security
ALTER TABLE public.tutorial_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own tutorial progress" 
    ON public.tutorial_progress FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tutorial progress" 
    ON public.tutorial_progress FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tutorial progress" 
    ON public.tutorial_progress FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tutorial progress" 
    ON public.tutorial_progress FOR DELETE 
    USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tutorial_progress_user_id ON public.tutorial_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_progress_tutorial_id ON public.tutorial_progress(tutorial_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_progress_status ON public.tutorial_progress(status);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_tutorial_progress_updated_at ON public.tutorial_progress;
CREATE TRIGGER trigger_tutorial_progress_updated_at
BEFORE UPDATE ON public.tutorial_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
