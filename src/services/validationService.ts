/**
 * Validation Service
 *
 * Centralized service for runtime data validation using Zod schemas.
 * Implements P1 security requirement from SECURITY_AUDIT.md
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
  validateData,
  type SignUpData,
  type SignInData,
  type UserProfile,
  type Task,
  type Subtask,
  type TaskTemplate,
  type Achievement,
  type UserAchievement,
  type Streak,
  type DailyStats,
  type WeeklyStats,
  type Statistics,
  type Note,
  type PomodoroSession,
  type TimeTrainerResult,
  type UserSettings,
  type Drawing,
  type CompletedQuest,
  type SoundPack,
  type DataExport,
} from '../schemas/validationSchemas';

/**
 * Validation result
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  issues?: Array<{
    path: (string | number)[];
    message: string;
  }>;
}

class ValidationService {
  /**
   * Validate sign-up data
   */
  validateSignUp(data: unknown): ValidationResult<SignUpData> {
    return validateData(signUpSchema, data);
  }

  /**
   * Validate sign-in data
   */
  validateSignIn(data: unknown): ValidationResult<SignInData> {
    return validateData(signInSchema, data);
  }

  /**
   * Validate password reset data
   */
  validatePasswordReset(data: unknown): ValidationResult<{ email: string }> {
    return validateData(passwordResetSchema, data);
  }

  /**
   * Validate user profile
   */
  validateUserProfile(data: unknown): ValidationResult<UserProfile> {
    return validateData(userProfileSchema, data);
  }

  /**
   * Validate task
   */
  validateTask(data: unknown): ValidationResult<Task> {
    return validateData(taskSchema, data);
  }

  /**
   * Validate array of tasks
   */
  validateTasks(data: unknown): ValidationResult<Task[]> {
    if (!Array.isArray(data)) {
      return {
        success: false,
        error: 'Tasks must be an array',
      };
    }

    const validatedTasks: Task[] = [];
    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const result = this.validateTask(data[i]);
      if (result.success && result.data) {
        validatedTasks.push(result.data);
      } else {
        errors.push(`Task ${i}: ${result.error}`);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: `Failed to validate ${errors.length} task(s): ${errors.join('; ')}`,
      };
    }

    return {
      success: true,
      data: validatedTasks,
    };
  }

  /**
   * Validate subtask
   */
  validateSubtask(data: unknown): ValidationResult<Subtask> {
    return validateData(subtaskSchema, data);
  }

  /**
   * Validate task template
   */
  validateTaskTemplate(data: unknown): ValidationResult<TaskTemplate> {
    return validateData(taskTemplateSchema, data);
  }

  /**
   * Validate achievement
   */
  validateAchievement(data: unknown): ValidationResult<Achievement> {
    return validateData(achievementSchema, data);
  }

  /**
   * Validate user achievement
   */
  validateUserAchievement(data: unknown): ValidationResult<UserAchievement> {
    return validateData(userAchievementSchema, data);
  }

  /**
   * Validate streak data
   */
  validateStreak(data: unknown): ValidationResult<Streak> {
    return validateData(streakSchema, data);
  }

  /**
   * Validate daily statistics
   */
  validateDailyStats(data: unknown): ValidationResult<DailyStats> {
    return validateData(dailyStatsSchema, data);
  }

  /**
   * Validate weekly statistics
   */
  validateWeeklyStats(data: unknown): ValidationResult<WeeklyStats> {
    return validateData(weeklyStatsSchema, data);
  }

  /**
   * Validate statistics aggregate
   */
  validateStatistics(data: unknown): ValidationResult<Statistics> {
    return validateData(statisticsSchema, data);
  }

  /**
   * Validate note
   */
  validateNote(data: unknown): ValidationResult<Note> {
    return validateData(noteSchema, data);
  }

  /**
   * Validate array of notes
   */
  validateNotes(data: unknown): ValidationResult<Note[]> {
    if (!Array.isArray(data)) {
      return {
        success: false,
        error: 'Notes must be an array',
      };
    }

    const validatedNotes: Note[] = [];
    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const result = this.validateNote(data[i]);
      if (result.success && result.data) {
        validatedNotes.push(result.data);
      } else {
        errors.push(`Note ${i}: ${result.error}`);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: `Failed to validate ${errors.length} note(s): ${errors.join('; ')}`,
      };
    }

    return {
      success: true,
      data: validatedNotes,
    };
  }

  /**
   * Validate pomodoro session
   */
  validatePomodoroSession(data: unknown): ValidationResult<PomodoroSession> {
    return validateData(pomodoroSessionSchema, data);
  }

  /**
   * Validate time trainer result
   */
  validateTimeTrainerResult(data: unknown): ValidationResult<TimeTrainerResult> {
    return validateData(timeTrainerResultSchema, data);
  }

  /**
   * Validate user settings
   */
  validateUserSettings(data: unknown): ValidationResult<UserSettings> {
    return validateData(userSettingsSchema, data);
  }

  /**
   * Validate drawing
   */
  validateDrawing(data: unknown): ValidationResult<Drawing> {
    return validateData(drawingSchema, data);
  }

  /**
   * Validate completed quest
   */
  validateCompletedQuest(data: unknown): ValidationResult<CompletedQuest> {
    return validateData(completedQuestSchema, data);
  }

  /**
   * Validate array of completed quests
   */
  validateCompletedQuests(data: unknown): ValidationResult<CompletedQuest[]> {
    if (!Array.isArray(data)) {
      return {
        success: false,
        error: 'Completed quests must be an array',
      };
    }

    const validatedQuests: CompletedQuest[] = [];
    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const result = this.validateCompletedQuest(data[i]);
      if (result.success && result.data) {
        validatedQuests.push(result.data);
      } else {
        errors.push(`Quest ${i}: ${result.error}`);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: `Failed to validate ${errors.length} quest(s): ${errors.join('; ')}`,
      };
    }

    return {
      success: true,
      data: validatedQuests,
    };
  }

  /**
   * Validate sound pack
   */
  validateSoundPack(data: unknown): ValidationResult<SoundPack> {
    return validateData(soundPackSchema, data);
  }

  /**
   * Validate data export
   */
  validateDataExport(data: unknown): ValidationResult<DataExport> {
    return validateData(dataExportSchema, data);
  }

  /**
   * Validate localStorage data
   * Returns sanitized data or throws detailed error
   */
  validateLocalStorageData(key: string, data: unknown): unknown {
    // Map localStorage keys to validators
    const validators: Record<string, (data: unknown) => ValidationResult<unknown>> = {
      adhd_quest_tasks: this.validateTasks.bind(this),
      adhd_quest_completed_quests: this.validateCompletedQuests.bind(this),
      adhd_quest_notes: this.validateNotes.bind(this),
      adhd_quest_settings: this.validateUserSettings.bind(this),
      adhd_quest_streak: this.validateStreak.bind(this),
      adhd_quest_statistics: this.validateStatistics.bind(this),
    };

    const validator = validators[key];

    if (!validator) {
      // If no specific validator, return data as-is but log warning
      console.warn(`No validator found for localStorage key: ${key}`);
      return data;
    }

    const result = validator(data);

    if (!result.success) {
      console.error(`Validation failed for ${key}:`, result.error);
      console.error('Issues:', result.issues);

      // In development, we can throw to catch issues early
      if (process.env['NODE_ENV'] === 'development') {
        throw new Error(`Invalid data in localStorage key "${key}": ${result.error}`);
      }

      // In production, return null/empty to prevent crashes
      if (key.includes('tasks') || key.includes('notes') || key.includes('quests')) {
        return [];
      }
      return null;
    }

    return result.data;
  }

  /**
   * Sanitize input to prevent XSS
   */
  sanitizeString(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate and sanitize user input
   */
  validateUserInput(input: unknown, maxLength: number = 1000): ValidationResult<string> {
    if (typeof input !== 'string') {
      return {
        success: false,
        error: 'Input must be a string',
      };
    }

    if (input.length === 0) {
      return {
        success: false,
        error: 'Input cannot be empty',
      };
    }

    if (input.length > maxLength) {
      return {
        success: false,
        error: `Input exceeds maximum length of ${maxLength} characters`,
      };
    }

    // Check for potentially malicious patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i, // event handlers like onclick=
      /<iframe/i,
      /<embed/i,
      /<object/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(input)) {
        return {
          success: false,
          error: 'Input contains potentially malicious content',
        };
      }
    }

    return {
      success: true,
      data: this.sanitizeString(input),
    };
  }

  /**
   * Validate URL to prevent SSRF attacks
   */
  validateUrl(url: string, allowedDomains?: string[]): ValidationResult<string> {
    try {
      const parsed = new URL(url);

      // Only allow http and https
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return {
          success: false,
          error: 'Only HTTP and HTTPS protocols are allowed',
        };
      }

      // Check allowed domains if provided
      if (allowedDomains && allowedDomains.length > 0) {
        const isAllowed = allowedDomains.some((domain) => parsed.hostname.endsWith(domain));

        if (!isAllowed) {
          return {
            success: false,
            error: 'URL domain is not in the allowed list',
          };
        }
      }

      // Prevent private IP ranges
      const privateIPPatterns = [
        /^localhost$/i,
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
        /^169\.254\./, // link-local
        /^::1$/, // IPv6 localhost
        /^fc00:/, // IPv6 private
      ];

      for (const pattern of privateIPPatterns) {
        if (pattern.test(parsed.hostname)) {
          return {
            success: false,
            error: 'URLs pointing to private IP addresses are not allowed',
          };
        }
      }

      return {
        success: true,
        data: url,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid URL format',
      };
    }
  }
}

// Export singleton instance
const validationService = new ValidationService();
export default validationService;

// Export type definitions
export type {
  SignUpData,
  SignInData,
  UserProfile,
  Task,
  Subtask,
  TaskTemplate,
  Achievement,
  UserAchievement,
  Streak,
  DailyStats,
  WeeklyStats,
  Statistics,
  Note,
  PomodoroSession,
  TimeTrainerResult,
  UserSettings,
  Drawing,
  CompletedQuest,
  SoundPack,
  DataExport,
};
