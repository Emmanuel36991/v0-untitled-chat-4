-- AI Conversation Memory Tables
-- Run this migration to enable conversation history and user profile features

-- Conversation Messages Table
CREATE TABLE IF NOT EXISTS ai_conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  sentiment TEXT,
  topics TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation Sessions Table (for grouping related messages)
CREATE TABLE IF NOT EXISTS ai_conversation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  summary TEXT,
  topics TEXT[],
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  message_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

-- User AI Profile Table (stores learned preferences)
CREATE TABLE IF NOT EXISTS ai_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trading_style TEXT,
  experience_level TEXT,
  preferred_methodologies TEXT[],
  goals TEXT[],
  communication_preference TEXT,
  strengths TEXT[],
  areas_to_improve TEXT[],
  helpful_advice_topics TEXT[],
  common_questions TEXT[],
  last_daily_briefing TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proactive Insights Table (for storing AI-generated insights)
CREATE TABLE IF NOT EXISTS ai_proactive_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- 'daily_briefing', 'risk_alert', 'milestone', 'pattern_detected'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  related_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_messages_user_id ON ai_conversation_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_conversation_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_id ON ai_conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON ai_proactive_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_unread ON ai_proactive_insights(user_id, is_read) WHERE is_read = FALSE;

-- Row Level Security
ALTER TABLE ai_conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_proactive_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users can manage own messages" ON ai_conversation_messages
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions" ON ai_conversation_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own profile" ON ai_user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own insights" ON ai_proactive_insights
  FOR ALL USING (auth.uid() = user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_ai_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS ai_user_profiles_updated_at ON ai_user_profiles;
CREATE TRIGGER ai_user_profiles_updated_at
  BEFORE UPDATE ON ai_user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_profile_updated_at();

-- Function to clean up old messages (keep last 100 per user)
CREATE OR REPLACE FUNCTION cleanup_old_ai_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_conversation_messages
  WHERE id NOT IN (
    SELECT id FROM ai_conversation_messages m
    WHERE m.user_id = ai_conversation_messages.user_id
    ORDER BY created_at DESC
    LIMIT 100
  );
END;
$$ LANGUAGE plpgsql;
