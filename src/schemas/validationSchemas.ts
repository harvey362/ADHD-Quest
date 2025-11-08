/**
 * Zod Validation Schemas
 *
 * Comprehensive runtime validation schemas for all data structures.
 * Implements P1 security requirement from SECURITY_AUDIT.md
 */

import { z } from 'zod';

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Common timestamp schema
 */
export const timestampSchema = z.string().datetime().or(z.date());

/**
 * UUID schema for IDs
 */
export const uuidSchema = z.string().uuid();

/**
 * Non-empty string schema
 */
export const nonEmptyStringSchema = z.string().min(1, 'Cannot be empty');

/**
 * Email schema
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Username schema (3-20 chars, alphanumeric + underscore)
 */
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

/**
 * Password schema (min 8 chars, at least one letter and one number)
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * XP amount (non-negative integer)
 */
export const xpSchema = z.number().int().nonnegative();

/**
 * Level (positive integer between 1 and 100)
 */
export const levelSchema = z.number().int().min(1).max(100);

/**
 * Color hex code
 */
export const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color code');

// ============================================================================
// USER & AUTHENTICATION SCHEMAS
// ============================================================================

/**
 * User sign-up data
 */
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
});

/**
 * User sign-in data
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Password reset request
 */
export const passwordResetSchema = z.object({
  email: emailSchema,
});

/**
 * User profile
 */
export const userProfileSchema = z.object({
  user_id: uuidSchema,
  username: usernameSchema,
  email: emailSchema,
  total_xp: xpSchema,
  level: levelSchema,
  current_level_xp: xpSchema,
  xp_to_next_level: xpSchema,
  tasks_completed: z.number().int().nonnegative(),
  subtasks_completed: z.number().int().nonnegative(),
  avatar_url: z.string().url().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema.optional(),
});

// ============================================================================
// TASK SCHEMAS
// ============================================================================

/**
 * Task priority
 */
export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

/**
 * Task status
 */
export const taskStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'archived']);

/**
 * Subtask
 */
export const subtaskSchema = z.object({
  id: z.string(),
  text: nonEmptyStringSchema.max(500),
  completed: z.boolean(),
  xp: xpSchema.optional().default(10),
  created_at: timestampSchema,
  completed_at: timestampSchema.optional().nullable(),
});

/**
 * Task
 */
export const taskSchema = z.object({
  id: z.string(),
  user_id: uuidSchema.optional(),
  title: nonEmptyStringSchema.max(200),
  description: z.string().max(2000).optional().nullable(),
  priority: taskPrioritySchema.default('medium'),
  status: taskStatusSchema.default('pending'),
  subtasks: z.array(subtaskSchema).default([]),
  tags: z.array(z.string().max(50)).max(10).default([]),
  due_date: timestampSchema.optional().nullable(),
  estimated_time: z.number().int().min(1).max(1440).optional().nullable(), // minutes
  actual_time: z.number().int().min(0).optional().nullable(),
  total_xp: xpSchema.default(0),
  earned_xp: xpSchema.default(0),
  created_at: timestampSchema,
  updated_at: timestampSchema.optional(),
  completed_at: timestampSchema.optional().nullable(),
  synced_at: timestampSchema.optional().nullable(),
});

/**
 * Task template
 */
export const taskTemplateSchema = z.object({
  id: z.string(),
  user_id: uuidSchema.optional(),
  name: nonEmptyStringSchema.max(100),
  description: z.string().max(500).optional().nullable(),
  title_template: nonEmptyStringSchema.max(200),
  subtasks_template: z.array(z.string().max(500)).min(1),
  tags: z.array(z.string().max(50)).max(10).default([]),
  priority: taskPrioritySchema.default('medium'),
  estimated_time: z.number().int().min(1).max(1440).optional().nullable(),
  usage_count: z.number().int().nonnegative().default(0),
  is_public: z.boolean().default(false),
  created_at: timestampSchema,
  updated_at: timestampSchema.optional(),
});

// ============================================================================
// ACHIEVEMENT SCHEMAS
// ============================================================================

/**
 * Achievement category
 */
export const achievementCategorySchema = z.enum([
  'speed',
  'consistency',
  'mastery',
  'exploration',
  'social',
  'special',
]);

/**
 * Achievement tier
 */
export const achievementTierSchema = z.enum(['bronze', 'silver', 'gold', 'platinum', 'diamond']);

/**
 * Achievement definition
 */
export const achievementSchema = z.object({
  id: z.string(),
  name: nonEmptyStringSchema.max(100),
  description: z.string().max(500),
  category: achievementCategorySchema,
  tier: achievementTierSchema,
  icon: z.string().max(50),
  xp_reward: xpSchema,
  requirement: z.number().int().positive(),
  is_secret: z.boolean().default(false),
  created_at: timestampSchema,
});

/**
 * User achievement (unlocked achievement)
 */
export const userAchievementSchema = z.object({
  id: z.string(),
  user_id: uuidSchema,
  achievement_id: z.string(),
  progress: z.number().int().nonnegative(),
  unlocked: z.boolean().default(false),
  unlocked_at: timestampSchema.optional().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema.optional(),
});

// ============================================================================
// STREAK SCHEMAS
// ============================================================================

/**
 * Streak data
 */
export const streakSchema = z.object({
  user_id: uuidSchema.optional(),
  current_streak: z.number().int().nonnegative(),
  longest_streak: z.number().int().nonnegative(),
  activity_dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  milestones: z.array(
    z.object({
      days: z.number().int().positive(),
      reached: z.boolean(),
      reached_at: timestampSchema.optional().nullable(),
      xp_bonus: xpSchema,
    })
  ),
  last_activity: timestampSchema.optional().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema.optional(),
});

// ============================================================================
// STATISTICS SCHEMAS
// ============================================================================

/**
 * Daily statistics
 */
export const dailyStatsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tasks_completed: z.number().int().nonnegative(),
  subtasks_completed: z.number().int().nonnegative(),
  xp_earned: xpSchema,
  focus_time: z.number().int().nonnegative(), // minutes
  pomodoros_completed: z.number().int().nonnegative(),
  notes_created: z.number().int().nonnegative(),
  productivity_score: z.number().min(0).max(100),
});

/**
 * Weekly statistics
 */
export const weeklyStatsSchema = z.object({
  week_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  week_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  daily_stats: z.array(dailyStatsSchema),
  total_tasks_completed: z.number().int().nonnegative(),
  total_xp_earned: xpSchema,
  total_focus_time: z.number().int().nonnegative(),
  avg_productivity_score: z.number().min(0).max(100),
});

/**
 * Statistics aggregate
 */
export const statisticsSchema = z.object({
  user_id: uuidSchema.optional(),
  total_tasks: z.number().int().nonnegative(),
  total_subtasks: z.number().int().nonnegative(),
  total_xp: xpSchema,
  total_focus_time: z.number().int().nonnegative(),
  total_pomodoros: z.number().int().nonnegative(),
  achievements_unlocked: z.number().int().nonnegative(),
  daily_average_tasks: z.number().nonnegative(),
  best_productivity_day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema.optional(),
});

// ============================================================================
// NOTES SCHEMAS
// ============================================================================

/**
 * Note
 */
export const noteSchema = z.object({
  id: z.string(),
  user_id: uuidSchema.optional(),
  content: nonEmptyStringSchema.max(10000),
  tags: z.array(z.string().max(50)).max(20).default([]),
  is_pinned: z.boolean().default(false),
  color: hexColorSchema.optional().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema.optional(),
  synced_at: timestampSchema.optional().nullable(),
});

// ============================================================================
// POMODORO SCHEMAS
// ============================================================================

/**
 * Pomodoro session
 */
export const pomodoroSessionSchema = z.object({
  id: z.string(),
  user_id: uuidSchema.optional(),
  task_id: z.string().optional().nullable(),
  duration: z.number().int().min(1).max(120), // minutes
  completed: z.boolean(),
  interrupted: z.boolean().default(false),
  interruption_count: z.number().int().nonnegative().default(0),
  xp_earned: xpSchema.default(0),
  started_at: timestampSchema,
  completed_at: timestampSchema.optional().nullable(),
  created_at: timestampSchema,
  synced_at: timestampSchema.optional().nullable(),
});

// ============================================================================
// TIME TRAINER SCHEMAS
// ============================================================================

/**
 * Time trainer result
 */
export const timeTrainerResultSchema = z.object({
  id: z.string(),
  user_id: uuidSchema.optional(),
  target_duration: z.number().int().positive(),
  actual_duration: z.number().int().positive(),
  accuracy_percentage: z.number().min(0).max(100),
  xp_earned: xpSchema,
  created_at: timestampSchema,
  synced_at: timestampSchema.optional().nullable(),
});

// ============================================================================
// SETTINGS SCHEMAS
// ============================================================================

/**
 * Theme
 */
export const themeSchema = z.object({
  name: nonEmptyStringSchema.max(50),
  primary: hexColorSchema,
  secondary: hexColorSchema.optional(),
  accent: hexColorSchema.optional(),
  background: hexColorSchema.optional(),
  text: hexColorSchema.optional(),
});

/**
 * Sound settings
 */
export const soundSettingsSchema = z.object({
  enabled: z.boolean(),
  volume: z.number().min(0).max(1),
  sound_pack: z.string().max(50).default('default'),
});

/**
 * Notification settings
 */
export const notificationSettingsSchema = z.object({
  enabled: z.boolean(),
  task_reminders: z.boolean(),
  pomodoro_alerts: z.boolean(),
  streak_warnings: z.boolean(),
  achievement_unlocks: z.boolean(),
  daily_summary: z.boolean(),
  daily_summary_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
});

/**
 * User settings
 */
export const userSettingsSchema = z.object({
  user_id: uuidSchema,
  theme: themeSchema.default({
    name: 'neon-green',
    primary: '#00FF00',
  }),
  sound: soundSettingsSchema.default({
    enabled: true,
    volume: 0.5,
    sound_pack: 'default',
  }),
  notifications: notificationSettingsSchema.default({
    enabled: true,
    task_reminders: true,
    pomodoro_alerts: true,
    streak_warnings: true,
    achievement_unlocks: true,
    daily_summary: true,
    daily_summary_time: '09:00',
  }),
  pomodoro_duration: z.number().int().min(1).max(60).default(25),
  short_break_duration: z.number().int().min(1).max(30).default(5),
  long_break_duration: z.number().int().min(1).max(60).default(15),
  pomodoros_until_long_break: z.number().int().min(2).max(10).default(4),
  auto_start_breaks: z.boolean().default(false),
  auto_start_pomodoros: z.boolean().default(false),
  created_at: timestampSchema,
  updated_at: timestampSchema.optional(),
});

// ============================================================================
// DRAWINGS SCHEMA
// ============================================================================

/**
 * Drawing (for quick sketch widget)
 */
export const drawingSchema = z.object({
  id: z.string(),
  user_id: uuidSchema.optional(),
  data_url: z.string().startsWith('data:image/'), // Base64 image
  thumbnail_url: z.string().startsWith('data:image/').optional().nullable(),
  title: z.string().max(100).optional().nullable(),
  tags: z.array(z.string().max(50)).max(10).default([]),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  created_at: timestampSchema,
  updated_at: timestampSchema.optional(),
  synced_at: timestampSchema.optional().nullable(),
});

// ============================================================================
// COMPLETED QUEST SCHEMA
// ============================================================================

/**
 * Completed quest (for completed quests widget)
 */
export const completedQuestSchema = z.object({
  id: z.string(),
  user_id: uuidSchema.optional(),
  task_id: z.string(),
  title: nonEmptyStringSchema.max(200),
  xp_earned: xpSchema,
  subtasks_count: z.number().int().nonnegative(),
  completed_at: timestampSchema,
  created_at: timestampSchema,
  synced_at: timestampSchema.optional().nullable(),
});

// ============================================================================
// SOUND PACK SCHEMA
// ============================================================================

/**
 * Sound pack
 */
export const soundPackSchema = z.object({
  id: z.string(),
  name: nonEmptyStringSchema.max(50),
  description: z.string().max(500).optional().nullable(),
  author: z.string().max(100).optional().nullable(),
  sounds: z.object({
    xp_gain: z.string().url(),
    level_up: z.string().url(),
    achievement_unlock: z.string().url(),
    task_complete: z.string().url(),
    pomodoro_start: z.string().url(),
    pomodoro_end: z.string().url(),
    button_click: z.string().url().optional(),
  }),
  is_premium: z.boolean().default(false),
  created_at: timestampSchema,
});

// ============================================================================
// EXPORT/IMPORT SCHEMAS
// ============================================================================

/**
 * Full data export
 */
export const dataExportSchema = z.object({
  version: z.string(),
  exported_at: timestampSchema,
  user_profile: userProfileSchema.optional(),
  tasks: z.array(taskSchema),
  completed_quests: z.array(completedQuestSchema),
  achievements: z.array(userAchievementSchema),
  notes: z.array(noteSchema),
  drawings: z.array(drawingSchema),
  pomodoro_sessions: z.array(pomodoroSessionSchema),
  time_trainer_results: z.array(timeTrainerResultSchema),
  streaks: streakSchema.optional(),
  statistics: statisticsSchema.optional(),
  settings: userSettingsSchema.optional(),
});

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================

/**
 * Generic API success response
 */
export const apiSuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  message: z.string().optional(),
});

/**
 * Generic API error response
 */
export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
});

/**
 * API response (success or error)
 */
export const apiResponseSchema = z.union([apiSuccessResponseSchema, apiErrorResponseSchema]);

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

/**
 * Safe parse with detailed error reporting
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  error?: string;
  issues?: z.ZodIssue[];
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    error: result.error.message,
    issues: result.error.issues,
  };
}

/**
 * Validate or throw
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Create a validator middleware for services
 */
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): T => {
    const result = validateData(schema, data);

    if (!result.success) {
      throw new Error(`Validation failed: ${result.error}`);
    }

    return result.data as T;
  };
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type Task = z.infer<typeof taskSchema>;
export type Subtask = z.infer<typeof subtaskSchema>;
export type TaskTemplate = z.infer<typeof taskTemplateSchema>;
export type Achievement = z.infer<typeof achievementSchema>;
export type UserAchievement = z.infer<typeof userAchievementSchema>;
export type Streak = z.infer<typeof streakSchema>;
export type DailyStats = z.infer<typeof dailyStatsSchema>;
export type WeeklyStats = z.infer<typeof weeklyStatsSchema>;
export type Statistics = z.infer<typeof statisticsSchema>;
export type Note = z.infer<typeof noteSchema>;
export type PomodoroSession = z.infer<typeof pomodoroSessionSchema>;
export type TimeTrainerResult = z.infer<typeof timeTrainerResultSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
export type Drawing = z.infer<typeof drawingSchema>;
export type CompletedQuest = z.infer<typeof completedQuestSchema>;
export type SoundPack = z.infer<typeof soundPackSchema>;
export type DataExport = z.infer<typeof dataExportSchema>;
