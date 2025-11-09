-- ADHD Quest Database Schema for Supabase
-- Version 1.0.0
--
-- This schema supports the full-featured productivity suite with:
-- - User authentication and profiles
-- - Task management and completion tracking
-- - Achievements and badges
-- - Statistics and analytics
-- - Cloud synchronization
-- - Streak tracking
-- - Settings and preferences

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USER PROFILES
-- ============================================================================
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_level_xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 200,
  tasks_completed INTEGER DEFAULT 0,
  subtasks_completed INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TASKS
-- ============================================================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  subtasks JSONB DEFAULT '[]',
  tags TEXT[],
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

-- ============================================================================
-- SUBTASKS
-- ============================================================================
CREATE TABLE public.subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subtasks_task_id ON public.subtasks(task_id);
CREATE INDEX idx_subtasks_user_id ON public.subtasks(user_id);

-- ============================================================================
-- COMPLETED QUESTS
-- ============================================================================
CREATE TABLE public.completed_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  subtasks JSONB DEFAULT '[]',
  xp_earned INTEGER DEFAULT 0,
  total_time INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_completed_quests_user_id ON public.completed_quests(user_id);
CREATE INDEX idx_completed_quests_completed_at ON public.completed_quests(completed_at);

-- ============================================================================
-- ACHIEVEMENTS
-- ============================================================================
CREATE TABLE public.achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements (unlocked achievements)
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT REFERENCES public.achievements(id) NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);

-- ============================================================================
-- NOTES (Quick Capture)
-- ============================================================================
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  tags TEXT[],
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_timestamp ON public.notes(timestamp);

-- ============================================================================
-- DRAWINGS
-- ============================================================================
CREATE TABLE public.drawings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data_url TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_drawings_user_id ON public.drawings(user_id);

-- ============================================================================
-- POMODORO SESSIONS
-- ============================================================================
CREATE TABLE public.pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_type TEXT CHECK (session_type IN ('focus', 'break')),
  session_date DATE DEFAULT CURRENT_DATE,
  focus_sessions INTEGER DEFAULT 0,
  break_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pomodoro_sessions_user_id ON public.pomodoro_sessions(user_id);
CREATE INDEX idx_pomodoro_sessions_date ON public.pomodoro_sessions(session_date);

-- ============================================================================
-- TIME TRAINER RESULTS
-- ============================================================================
CREATE TABLE public.time_trainer_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_duration INTEGER NOT NULL,
  actual_duration INTEGER NOT NULL,
  accuracy DECIMAL(5,2) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_time_trainer_results_user_id ON public.time_trainer_results(user_id);

-- ============================================================================
-- STREAKS
-- ============================================================================
CREATE TABLE public.streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  activity_dates DATE[],
  milestones INTEGER[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_streaks_user_id ON public.streaks(user_id);

-- ============================================================================
-- STATISTICS
-- ============================================================================
CREATE TABLE public.statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stat_date DATE NOT NULL,
  tasks_created INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  subtasks_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  focus_time_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stat_date)
);

CREATE INDEX idx_statistics_user_id ON public.statistics(user_id);
CREATE INDEX idx_statistics_date ON public.statistics(stat_date);

-- ============================================================================
-- USER SETTINGS
-- ============================================================================
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- ============================================================================
-- TASK TEMPLATES
-- ============================================================================
CREATE TABLE public.task_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  title TEXT NOT NULL,
  subtasks JSONB DEFAULT '[]',
  tags TEXT[],
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_task_templates_user_id ON public.task_templates(user_id);

-- ============================================================================
-- SOUND PACKS
-- ============================================================================
CREATE TABLE public.sound_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sounds JSONB NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sound_packs_user_id ON public.sound_packs(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_trainer_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sound_packs ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Tasks Policies
CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for other tables
CREATE POLICY "Users can manage their own subtasks"
  ON public.subtasks FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own completed quests"
  ON public.completed_quests FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own achievements"
  ON public.user_achievements FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notes"
  ON public.notes FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own drawings"
  ON public.drawings FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own pomodoro sessions"
  ON public.pomodoro_sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own time trainer results"
  ON public.time_trainer_results FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own streak"
  ON public.streaks FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own statistics"
  ON public.statistics FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings"
  ON public.user_settings FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own templates"
  ON public.task_templates FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sound packs"
  ON public.sound_packs FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at
  BEFORE UPDATE ON public.streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to delete user account and all related data
CREATE OR REPLACE FUNCTION delete_user_account(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- All related data will be deleted automatically via CASCADE
  DELETE FROM auth.users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED DATA - Built-in Achievements
-- ============================================================================

INSERT INTO public.achievements (id, name, description, icon, category, requirement) VALUES
('first-blood', 'First Blood', 'Complete your first quest', '🎯', 'completion', '{"type": "tasks_completed", "value": 1}'),
('speedrunner', 'Speedrunner', 'Complete a quest in under 5 minutes', '⚡', 'speed', '{"type": "speedrun", "value": 300000}'),
('quest-master', 'Quest Master', 'Complete 25 quests', '👑', 'completion', '{"type": "tasks_completed", "value": 25}'),
('legendary', 'Legendary', 'Complete 100 quests', '💎', 'completion', '{"type": "tasks_completed", "value": 100}'),
('rising-star', 'Rising Star', 'Reach level 10', '⭐', 'mastery', '{"type": "level", "value": 10}'),
('power-player', 'Power Player', 'Reach level 25', '💫', 'mastery', '{"type": "level", "value": 25}'),
('max-level', 'Max Level', 'Reach level 100', '👑', 'mastery', '{"type": "level", "value": 100}'),
('streak-7', '7-Day Streak', 'Maintain a 7-day streak', '🔥', 'productivity', '{"type": "streak", "value": 7}'),
('streak-30', '30-Day Streak', 'Maintain a 30-day streak', '🔥🔥', 'productivity', '{"type": "streak", "value": 30}'),
('subtask-master', 'Subtask Master', 'Complete 100 subtasks', '✅', 'special', '{"type": "subtasks_completed", "value": 100}');

COMMENT ON TABLE public.user_profiles IS 'User profiles and XP/level data';
COMMENT ON TABLE public.tasks IS 'Active and archived user tasks';
COMMENT ON TABLE public.completed_quests IS 'History of completed quests';
COMMENT ON TABLE public.achievements IS 'Achievement definitions';
COMMENT ON TABLE public.user_achievements IS 'User achievement unlocks';
COMMENT ON TABLE public.streaks IS 'User activity streaks';
COMMENT ON TABLE public.statistics IS 'Aggregated productivity statistics';
