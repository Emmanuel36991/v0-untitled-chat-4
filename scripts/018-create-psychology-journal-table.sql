-- Create psychology journal table for trading psychology entries
CREATE TABLE IF NOT EXISTS public.psychology_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_id UUID REFERENCES public.trades(id) ON DELETE SET NULL,
  
  -- Entry metadata
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_time TIME NOT NULL DEFAULT CURRENT_TIME,
  
  -- Emotional metrics (1-10 scale)
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  focus_level INTEGER CHECK (focus_level >= 1 AND focus_level <= 10),
  
  -- Mood and emotions
  mood TEXT NOT NULL, -- 'excited', 'confident', 'anxious', 'frustrated', 'calm', 'overwhelmed'
  emotions TEXT[], -- Array of emotions like ['fear', 'greed', 'excitement']
  
  -- Journal content
  pre_trade_thoughts TEXT,
  post_trade_thoughts TEXT,
  lessons_learned TEXT,
  mistakes_identified TEXT,
  improvements_planned TEXT,
  
  -- Market context
  market_conditions TEXT, -- 'trending', 'ranging', 'volatile', 'calm'
  session_type TEXT, -- 'london', 'new-york', 'asian', 'overlap'
  
  -- Performance reflection
  decision_quality INTEGER CHECK (decision_quality >= 1 AND decision_quality <= 10),
  discipline_rating INTEGER CHECK (discipline_rating >= 1 AND discipline_rating <= 10),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.psychology_journal_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own journal entries" 
  ON public.psychology_journal_entries FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries" 
  ON public.psychology_journal_entries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries" 
  ON public.psychology_journal_entries FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries" 
  ON public.psychology_journal_entries FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_psychology_journal_user_id ON public.psychology_journal_entries(user_id);
CREATE INDEX idx_psychology_journal_entry_date ON public.psychology_journal_entries(entry_date);
CREATE INDEX idx_psychology_journal_trade_id ON public.psychology_journal_entries(trade_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_psychology_journal_entries_updated_at 
  BEFORE UPDATE ON public.psychology_journal_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
