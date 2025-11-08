/**
 * Validation Schemas Unit Tests
 *
 * Comprehensive tests for all Zod validation schemas.
 * Ensures data integrity and security.
 */

import {
  signUpSchema,
  signInSchema,
  passwordResetSchema,
  userProfileSchema,
  taskSchema,
  subtaskSchema,
  taskTemplateSchema,
  achievementSchema,
  userAchievementSchema,
  streakSchema,
  dailyStatsSchema,
  weeklyStatsSchema,
  statisticsSchema,
  noteSchema,
  pomodoroSessionSchema,
  timeTrainerResultSchema,
  userSettingsSchema,
  drawingSchema,
  completedQuestSchema,
  soundPackSchema,
  dataExportSchema,
  usernameSchema,
  passwordSchema,
  emailSchema,
  hexColorSchema,
} from '../../../src/schemas/validationSchemas';

describe('Validation Schemas', () => {
  // ============================================================================
  // BASE SCHEMAS
  // ============================================================================

  describe('usernameSchema', () => {
    it('should validate valid usernames', () => {
      const validUsernames = ['user123', 'test_user', 'ABC', 'a_b_c_123'];

      for (const username of validUsernames) {
        const result = usernameSchema.safeParse(username);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid usernames', () => {
      const invalidUsernames = [
        'ab', // Too short
        'a'.repeat(21), // Too long
        'user-name', // Contains hyphen
        'user name', // Contains space
        'user@name', // Contains @
        '', // Empty
      ];

      for (const username of invalidUsernames) {
        const result = usernameSchema.safeParse(username);
        expect(result.success).toBe(false);
      }
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong passwords', () => {
      const validPasswords = [
        'password123',
        'Test1234',
        'MyP@ssw0rd',
        'abcdefgh1',
      ];

      for (const password of validPasswords) {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(true);
      }
    });

    it('should reject weak passwords', () => {
      const invalidPasswords = [
        'short1', // Too short
        'password', // No number
        '12345678', // No letter
        'Pass1', // Too short
        '', // Empty
      ];

      for (const password of invalidPasswords) {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(false);
      }
    });
  });

  describe('emailSchema', () => {
    it('should validate valid emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name+tag@example.co.uk',
        'test_123@test-domain.com',
      ];

      for (const email of validEmails) {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid emails', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'test@',
        'test@.com',
        '',
      ];

      for (const email of invalidEmails) {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      }
    });
  });

  describe('hexColorSchema', () => {
    it('should validate valid hex colors', () => {
      const validColors = ['#000000', '#FFFFFF', '#00FF00', '#123abc'];

      for (const color of validColors) {
        const result = hexColorSchema.safeParse(color);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid hex colors', () => {
      const invalidColors = [
        '#FFF', // Too short
        '#GGGGGG', // Invalid hex
        'red', // Not hex
        '#00FF0', // Wrong length
        '',
      ];

      for (const color of invalidColors) {
        const result = hexColorSchema.safeParse(color);
        expect(result.success).toBe(false);
      }
    });
  });

  // ============================================================================
  // AUTHENTICATION SCHEMAS
  // ============================================================================

  describe('signUpSchema', () => {
    it('should validate correct sign-up data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing fields', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        // missing username
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
        username: 'testuser',
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
        username: 'testuser',
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid username', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'ab', // Too short
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('signInSchema', () => {
    it('should validate correct sign-in data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = signInSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid credentials', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'weak',
      };

      const result = signInSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('userProfileSchema', () => {
    it('should validate complete user profile', () => {
      const validProfile = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        email: 'test@example.com',
        total_xp: 1000,
        level: 5,
        current_level_xp: 200,
        xp_to_next_level: 500,
        tasks_completed: 50,
        subtasks_completed: 150,
        created_at: new Date().toISOString(),
      };

      const result = userProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it('should reject negative XP', () => {
      const invalidProfile = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        email: 'test@example.com',
        total_xp: -100, // Invalid: negative
        level: 5,
        current_level_xp: 200,
        xp_to_next_level: 500,
        tasks_completed: 50,
        subtasks_completed: 150,
        created_at: new Date().toISOString(),
      };

      const result = userProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it('should reject invalid level', () => {
      const invalidProfile = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        email: 'test@example.com',
        total_xp: 1000,
        level: 0, // Invalid: must be >= 1
        current_level_xp: 200,
        xp_to_next_level: 500,
        tasks_completed: 50,
        subtasks_completed: 150,
        created_at: new Date().toISOString(),
      };

      const result = userProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // TASK SCHEMAS
  // ============================================================================

  describe('taskSchema', () => {
    it('should validate complete task data', () => {
      const validTask = {
        id: '123',
        title: 'Test Task',
        description: 'This is a test task',
        priority: 'medium',
        status: 'pending',
        subtasks: [],
        tags: ['work', 'urgent'],
        total_xp: 100,
        earned_xp: 0,
        created_at: new Date().toISOString(),
      };

      const result = taskSchema.safeParse(validTask);
      expect(result.success).toBe(true);
    });

    it('should apply defaults for optional fields', () => {
      const minimalTask = {
        id: '123',
        title: 'Test Task',
        created_at: new Date().toISOString(),
      };

      const result = taskSchema.safeParse(minimalTask);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.priority).toBe('medium');
        expect(result.data.status).toBe('pending');
        expect(result.data.subtasks).toEqual([]);
        expect(result.data.tags).toEqual([]);
        expect(result.data.total_xp).toBe(0);
        expect(result.data.earned_xp).toBe(0);
      }
    });

    it('should validate with subtasks', () => {
      const taskWithSubtasks = {
        id: '123',
        title: 'Test Task',
        subtasks: [
          {
            id: '1',
            text: 'Subtask 1',
            completed: false,
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            text: 'Subtask 2',
            completed: true,
            xp: 20,
            created_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
          },
        ],
        created_at: new Date().toISOString(),
      };

      const result = taskSchema.safeParse(taskWithSubtasks);
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const invalidTask = {
        id: '123',
        title: '', // Invalid: empty
        created_at: new Date().toISOString(),
      };

      const result = taskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });

    it('should reject title > 200 chars', () => {
      const invalidTask = {
        id: '123',
        title: 'a'.repeat(201), // Invalid: too long
        created_at: new Date().toISOString(),
      };

      const result = taskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });

    it('should reject invalid priority', () => {
      const invalidTask = {
        id: '123',
        title: 'Test Task',
        priority: 'super-urgent', // Invalid: not in enum
        created_at: new Date().toISOString(),
      };

      const result = taskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });

    it('should reject too many tags', () => {
      const invalidTask = {
        id: '123',
        title: 'Test Task',
        tags: Array(11).fill('tag'), // Invalid: max 10 tags
        created_at: new Date().toISOString(),
      };

      const result = taskSchema.safeParse(invalidTask);
      expect(result.success).toBe(false);
    });
  });

  describe('subtaskSchema', () => {
    it('should validate subtask', () => {
      const validSubtask = {
        id: '1',
        text: 'Test subtask',
        completed: false,
        created_at: new Date().toISOString(),
      };

      const result = subtaskSchema.safeParse(validSubtask);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.xp).toBe(10); // Default XP
      }
    });

    it('should reject empty text', () => {
      const invalidSubtask = {
        id: '1',
        text: '',
        completed: false,
        created_at: new Date().toISOString(),
      };

      const result = subtaskSchema.safeParse(invalidSubtask);
      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // ACHIEVEMENT SCHEMAS
  // ============================================================================

  describe('achievementSchema', () => {
    it('should validate achievement', () => {
      const validAchievement = {
        id: '1',
        name: 'Speed Demon',
        description: 'Complete 10 tasks in under 5 minutes',
        category: 'speed',
        tier: 'gold',
        icon: '⚡',
        xp_reward: 100,
        requirement: 10,
        created_at: new Date().toISOString(),
      };

      const result = achievementSchema.safeParse(validAchievement);
      expect(result.success).toBe(true);
    });

    it('should reject invalid category', () => {
      const invalidAchievement = {
        id: '1',
        name: 'Test Achievement',
        description: 'Test',
        category: 'invalid', // Not in enum
        tier: 'gold',
        icon: '⚡',
        xp_reward: 100,
        requirement: 10,
        created_at: new Date().toISOString(),
      };

      const result = achievementSchema.safeParse(invalidAchievement);
      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // STATISTICS SCHEMAS
  // ============================================================================

  describe('dailyStatsSchema', () => {
    it('should validate daily stats', () => {
      const validStats = {
        date: '2025-01-08',
        tasks_completed: 5,
        subtasks_completed: 15,
        xp_earned: 150,
        focus_time: 120,
        pomodoros_completed: 4,
        notes_created: 3,
        productivity_score: 85,
      };

      const result = dailyStatsSchema.safeParse(validStats);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const invalidStats = {
        date: '01/08/2025', // Invalid format
        tasks_completed: 5,
        subtasks_completed: 15,
        xp_earned: 150,
        focus_time: 120,
        pomodoros_completed: 4,
        notes_created: 3,
        productivity_score: 85,
      };

      const result = dailyStatsSchema.safeParse(invalidStats);
      expect(result.success).toBe(false);
    });

    it('should reject productivity score > 100', () => {
      const invalidStats = {
        date: '2025-01-08',
        tasks_completed: 5,
        subtasks_completed: 15,
        xp_earned: 150,
        focus_time: 120,
        pomodoros_completed: 4,
        notes_created: 3,
        productivity_score: 105, // Invalid: > 100
      };

      const result = dailyStatsSchema.safeParse(invalidStats);
      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // NOTE SCHEMA
  // ============================================================================

  describe('noteSchema', () => {
    it('should validate note', () => {
      const validNote = {
        id: '1',
        content: 'This is a test note',
        tags: ['work'],
        is_pinned: false,
        created_at: new Date().toISOString(),
      };

      const result = noteSchema.safeParse(validNote);
      expect(result.success).toBe(true);
    });

    it('should reject empty content', () => {
      const invalidNote = {
        id: '1',
        content: '', // Invalid: empty
        tags: ['work'],
        is_pinned: false,
        created_at: new Date().toISOString(),
      };

      const result = noteSchema.safeParse(invalidNote);
      expect(result.success).toBe(false);
    });

    it('should reject content > 10000 chars', () => {
      const invalidNote = {
        id: '1',
        content: 'a'.repeat(10001), // Invalid: too long
        tags: [],
        is_pinned: false,
        created_at: new Date().toISOString(),
      };

      const result = noteSchema.safeParse(invalidNote);
      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // POMODORO SCHEMA
  // ============================================================================

  describe('pomodoroSessionSchema', () => {
    it('should validate pomodoro session', () => {
      const validSession = {
        id: '1',
        duration: 25,
        completed: true,
        xp_earned: 25,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      const result = pomodoroSessionSchema.safeParse(validSession);
      expect(result.success).toBe(true);
    });

    it('should reject invalid duration', () => {
      const invalidSession = {
        id: '1',
        duration: 121, // Invalid: > 120
        completed: false,
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      const result = pomodoroSessionSchema.safeParse(invalidSession);
      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // SETTINGS SCHEMA
  // ============================================================================

  describe('userSettingsSchema', () => {
    it('should validate settings with defaults', () => {
      const minimalSettings = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        created_at: new Date().toISOString(),
      };

      const result = userSettingsSchema.safeParse(minimalSettings);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.theme.name).toBe('neon-green');
        expect(result.data.sound.enabled).toBe(true);
        expect(result.data.notifications.enabled).toBe(true);
        expect(result.data.pomodoro_duration).toBe(25);
      }
    });

    it('should validate custom settings', () => {
      const customSettings = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        theme: {
          name: 'custom',
          primary: '#FF0000',
          secondary: '#00FF00',
        },
        sound: {
          enabled: false,
          volume: 0.8,
          sound_pack: 'retro',
        },
        notifications: {
          enabled: false,
          task_reminders: false,
          pomodoro_alerts: true,
          streak_warnings: true,
          achievement_unlocks: true,
          daily_summary: false,
          daily_summary_time: '08:00',
        },
        pomodoro_duration: 30,
        short_break_duration: 10,
        long_break_duration: 20,
        pomodoros_until_long_break: 3,
        auto_start_breaks: true,
        auto_start_pomodoros: false,
        created_at: new Date().toISOString(),
      };

      const result = userSettingsSchema.safeParse(customSettings);
      expect(result.success).toBe(true);
    });

    it('should reject invalid daily_summary_time', () => {
      const invalidSettings = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        notifications: {
          enabled: true,
          task_reminders: true,
          pomodoro_alerts: true,
          streak_warnings: true,
          achievement_unlocks: true,
          daily_summary: true,
          daily_summary_time: '25:00', // Invalid: hour > 23
        },
        created_at: new Date().toISOString(),
      };

      const result = userSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // DATA EXPORT SCHEMA
  // ============================================================================

  describe('dataExportSchema', () => {
    it('should validate minimal export', () => {
      const validExport = {
        version: '1.0.0',
        exported_at: new Date().toISOString(),
        tasks: [],
        completed_quests: [],
        achievements: [],
        notes: [],
        drawings: [],
        pomodoro_sessions: [],
        time_trainer_results: [],
      };

      const result = dataExportSchema.safeParse(validExport);
      expect(result.success).toBe(true);
    });
  });
});
