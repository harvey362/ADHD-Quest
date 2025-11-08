/**
 * Supabase Configuration
 *
 * Initializes and exports the Supabase client for authentication
 * and database operations.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'adhd_quest_auth',
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'adhd-quest',
    },
  },
});

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Database table names
export const TABLES = {
  USERS: 'users',
  USER_PROFILES: 'user_profiles',
  TASKS: 'tasks',
  SUBTASKS: 'subtasks',
  COMPLETED_QUESTS: 'completed_quests',
  ACHIEVEMENTS: 'achievements',
  USER_ACHIEVEMENTS: 'user_achievements',
  NOTES: 'notes',
  DRAWINGS: 'drawings',
  POMODORO_SESSIONS: 'pomodoro_sessions',
  TIME_TRAINER_RESULTS: 'time_trainer_results',
  STREAKS: 'streaks',
  STATISTICS: 'statistics',
  SETTINGS: 'user_settings',
  TEMPLATES: 'task_templates',
  SOUND_PACKS: 'sound_packs',
};

export default supabase;
