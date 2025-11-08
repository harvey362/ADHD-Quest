/**
 * Validated localStorage Wrapper
 *
 * Drop-in replacement for localStorage that validates all reads/writes.
 * Prevents corrupt or malicious data from crashing the application.
 *
 * Usage:
 *   import { validatedLocalStorage } from './utils/localStorageValidator';
 *
 *   // Replace localStorage with validatedLocalStorage
 *   const tasks = JSON.parse(validatedLocalStorage.getItem('adhd_quest_tasks') || '[]');
 */

import validationService from '../services/validationService';

/**
 * Validated localStorage wrapper
 */
export const validatedLocalStorage = {
  /**
   * Get item from localStorage with validation
   */
  getItem(key: string): string | null {
    const value = localStorage.getItem(key);

    if (!value) {
      return null;
    }

    // For non-JSON values, return as-is
    if (!value.startsWith('{') && !value.startsWith('[')) {
      return value;
    }

    try {
      const parsed = JSON.parse(value);

      // Validate known keys
      const validated = validationService.validateLocalStorageData(key, parsed);

      return JSON.stringify(validated);
    } catch (error) {
      console.error(`Failed to validate localStorage key "${key}":`, error);

      // In production, return null to prevent crashes
      if (process.env.NODE_ENV === 'production') {
        console.warn(`Clearing corrupt localStorage key: ${key}`);
        localStorage.removeItem(key);
        return null;
      }

      // In development, throw to catch issues early
      throw error;
    }
  },

  /**
   * Set item in localStorage with validation
   */
  setItem(key: string, value: string): void {
    // For non-JSON values, save directly
    if (!value.startsWith('{') && !value.startsWith('[')) {
      localStorage.setItem(key, value);
      return;
    }

    try {
      const parsed = JSON.parse(value);

      // Validate before saving
      const validated = validationService.validateLocalStorageData(key, parsed);

      localStorage.setItem(key, JSON.stringify(validated));
    } catch (error) {
      console.error(`Failed to validate data for localStorage key "${key}":`, error);

      // In production, log but don't crash
      if (process.env.NODE_ENV === 'production') {
        console.error('Skipping invalid localStorage write');
        return;
      }

      // In development, throw to catch issues early
      throw error;
    }
  },

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  },

  /**
   * Clear all localStorage
   */
  clear(): void {
    localStorage.clear();
  },

  /**
   * Get key at index
   */
  key(index: number): string | null {
    return localStorage.key(index);
  },

  /**
   * Get number of items in localStorage
   */
  get length(): number {
    return localStorage.length;
  },
};

/**
 * Safe localStorage getter with fallback
 */
export function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const value = validatedLocalStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Failed to get localStorage item "${key}":`, error);
    return fallback;
  }
}

/**
 * Safe localStorage setter
 */
export function safeSetItem(key: string, value: unknown): boolean {
  try {
    validatedLocalStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to set localStorage item "${key}":`, error);
    return false;
  }
}

/**
 * Migrate localStorage data with validation
 * Useful for cleaning up corrupt data on app startup
 */
export function migrateLocalStorage(): {
  migrated: string[];
  failed: string[];
  removed: string[];
} {
  const migrated: string[] = [];
  const failed: string[] = [];
  const removed: string[] = [];

  const keysToValidate = [
    'adhd_quest_tasks',
    'adhd_quest_completed_quests',
    'adhd_quest_notes',
    'adhd_quest_settings',
    'adhd_quest_streak',
    'adhd_quest_statistics',
  ];

  for (const key of keysToValidate) {
    try {
      const value = localStorage.getItem(key);

      if (!value) {
        continue;
      }

      const parsed = JSON.parse(value);

      // Try to validate
      const validated = validationService.validateLocalStorageData(key, parsed);

      // Re-save validated data
      localStorage.setItem(key, JSON.stringify(validated));
      migrated.push(key);
    } catch (error) {
      console.error(`Migration failed for ${key}:`, error);
      failed.push(key);

      // Remove corrupt data
      localStorage.removeItem(key);
      removed.push(key);
    }
  }

  return { migrated, failed, removed };
}

export default validatedLocalStorage;
