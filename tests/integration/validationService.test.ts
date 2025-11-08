/**
 * Validation Service Integration Tests
 *
 * Tests security features like XSS prevention, SSRF prevention,
 * and localStorage validation.
 */

import validationService from '../../src/services/validationService';
import { validatedLocalStorage, migrateLocalStorage } from '../../src/utils/localStorageValidator';

describe('Validation Service Integration', () => {
  // ============================================================================
  // XSS PREVENTION TESTS
  // ============================================================================

  describe('XSS Prevention', () => {
    it('should detect XSS in script tags', () => {
      const maliciousInput = '<script>alert("XSS")</script>';

      const result = validationService.validateUserInput(maliciousInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('malicious');
    });

    it('should detect XSS in event handlers', () => {
      const maliciousInputs = [
        '<img src=x onerror="alert(1)">',
        '<div onclick="alert(1)">',
        '<a onmouseover="alert(1)">',
      ];

      for (const input of maliciousInputs) {
        const result = validationService.validateUserInput(input);

        expect(result.success).toBe(false);
        expect(result.error).toContain('malicious');
      }
    });

    it('should detect javascript: protocol', () => {
      const maliciousInput = '<a href="javascript:alert(1)">Click</a>';

      const result = validationService.validateUserInput(maliciousInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('malicious');
    });

    it('should detect iframe injection', () => {
      const maliciousInput = '<iframe src="http://evil.com"></iframe>';

      const result = validationService.validateUserInput(maliciousInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('malicious');
    });

    it('should sanitize safe input', () => {
      const safeInputs = [
        'Hello, world!',
        'This is a <test>',
        "I'm testing 'quotes' and \"double quotes\"",
      ];

      for (const input of safeInputs) {
        const result = validationService.validateUserInput(input);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // Check that special chars are escaped
        if (result.data) {
          expect(result.data).not.toContain('<script');
          expect(result.data).not.toContain('onclick');
        }
      }
    });

    it('should enforce max length', () => {
      const longInput = 'a'.repeat(1001);

      const result = validationService.validateUserInput(longInput, 1000);

      expect(result.success).toBe(false);
      expect(result.error).toContain('maximum length');
    });

    it('should reject empty input', () => {
      const result = validationService.validateUserInput('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    it('should sanitize HTML entities', () => {
      const input = 'Hello <world>';

      const result = validationService.validateUserInput(input);

      expect(result.success).toBe(true);
      expect(result.data).toBe('Hello &lt;world&gt;');
    });
  });

  // ============================================================================
  // SSRF PREVENTION TESTS
  // ============================================================================

  describe('SSRF Prevention', () => {
    it('should allow valid HTTPS URLs', () => {
      const validUrls = [
        'https://example.com',
        'https://api.example.com/v1/data',
        'https://cdn.example.com/image.png',
      ];

      for (const url of validUrls) {
        const result = validationService.validateUrl(url);

        expect(result.success).toBe(true);
        expect(result.data).toBe(url);
      }
    });

    it('should allow HTTP URLs (upgraded to HTTPS in production)', () => {
      const httpUrl = 'http://example.com';

      const result = validationService.validateUrl(httpUrl);

      expect(result.success).toBe(true);
    });

    it('should reject non-HTTP protocols', () => {
      const invalidUrls = [
        'file:///etc/passwd',
        'ftp://example.com',
        'data:text/html,<script>alert(1)</script>',
        'javascript:alert(1)',
      ];

      for (const url of invalidUrls) {
        const result = validationService.validateUrl(url);

        expect(result.success).toBe(false);
        expect(result.error).toContain('protocol');
      }
    });

    it('should reject localhost', () => {
      const localhostUrls = [
        'http://localhost:3000',
        'https://localhost',
        'http://127.0.0.1',
      ];

      for (const url of localhostUrls) {
        const result = validationService.validateUrl(url);

        expect(result.success).toBe(false);
        expect(result.error).toContain('private');
      }
    });

    it('should reject private IP ranges', () => {
      const privateIPs = [
        'http://10.0.0.1',
        'http://172.16.0.1',
        'http://192.168.1.1',
        'http://169.254.169.254', // AWS metadata
      ];

      for (const url of privateIPs) {
        const result = validationService.validateUrl(url);

        expect(result.success).toBe(false);
        expect(result.error).toContain('private');
      }
    });

    it('should enforce allowed domains', () => {
      const url = 'https://evil.com/data';
      const allowedDomains = ['example.com', 'trusted.com'];

      const result = validationService.validateUrl(url, allowedDomains);

      expect(result.success).toBe(false);
      expect(result.error).toContain('allowed list');
    });

    it('should allow subdomains of allowed domains', () => {
      const url = 'https://api.example.com/data';
      const allowedDomains = ['example.com'];

      const result = validationService.validateUrl(url, allowedDomains);

      expect(result.success).toBe(true);
    });

    it('should reject invalid URL format', () => {
      const invalidUrls = [
        'not a url',
        'htp://typo.com',
        '//example.com',
        'example.com',
      ];

      for (const url of invalidUrls) {
        const result = validationService.validateUrl(url);

        expect(result.success).toBe(false);
      }
    });
  });

  // ============================================================================
  // LOCALSTORAGE VALIDATION TESTS
  // ============================================================================

  describe('localStorage Validation', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should validate tasks from localStorage', () => {
      const validTasks = [
        {
          id: '1',
          title: 'Task 1',
          priority: 'medium',
          status: 'pending',
          subtasks: [],
          tags: [],
          total_xp: 50,
          earned_xp: 0,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Task 2',
          priority: 'high',
          status: 'in_progress',
          subtasks: [],
          tags: ['urgent'],
          total_xp: 100,
          earned_xp: 50,
          created_at: new Date().toISOString(),
        },
      ];

      const result = validationService.validateLocalStorageData(
        'adhd_quest_tasks',
        validTasks
      );

      expect(result).toHaveLength(2);
    });

    it('should reject corrupt tasks', () => {
      const corruptTasks = [
        {
          id: '1',
          title: 'Valid Task',
          created_at: new Date().toISOString(),
        },
        {
          // Missing id, title
          invalid: 'data',
        },
      ];

      expect(() => {
        validationService.validateLocalStorageData('adhd_quest_tasks', corruptTasks);
      }).toThrow();
    });

    it('should validate notes from localStorage', () => {
      const validNotes = [
        {
          id: '1',
          content: 'Note 1',
          tags: ['work'],
          is_pinned: false,
          created_at: new Date().toISOString(),
        },
      ];

      const result = validationService.validateLocalStorageData(
        'adhd_quest_notes',
        validNotes
      );

      expect(result).toHaveLength(1);
    });

    it('should handle unknown localStorage keys gracefully', () => {
      const unknownData = { foo: 'bar' };

      // Should log warning but not throw
      const result = validationService.validateLocalStorageData(
        'unknown_key',
        unknownData
      );

      expect(result).toEqual(unknownData);
    });
  });

  // ============================================================================
  // VALIDATED LOCALSTORAGE WRAPPER TESTS
  // ============================================================================

  describe('validatedLocalStorage Wrapper', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should validate on getItem', () => {
      const validTasks = [
        {
          id: '1',
          title: 'Task 1',
          created_at: new Date().toISOString(),
        },
      ];

      localStorage.setItem('adhd_quest_tasks', JSON.stringify(validTasks));

      const result = validatedLocalStorage.getItem('adhd_quest_tasks');

      expect(result).not.toBeNull();

      if (result) {
        const parsed = JSON.parse(result);
        expect(Array.isArray(parsed)).toBe(true);
      }
    });

    it('should validate on setItem', () => {
      const validTasks = [
        {
          id: '1',
          title: 'Task 1',
          priority: 'medium',
          status: 'pending',
          subtasks: [],
          tags: [],
          total_xp: 50,
          earned_xp: 0,
          created_at: new Date().toISOString(),
        },
      ];

      validatedLocalStorage.setItem('adhd_quest_tasks', JSON.stringify(validTasks));

      const stored = localStorage.getItem('adhd_quest_tasks');
      expect(stored).not.toBeNull();

      if (stored) {
        const parsed = JSON.parse(stored);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed[0].id).toBe('1');
      }
    });

    it('should handle non-JSON values', () => {
      const simpleValue = 'simple string';

      validatedLocalStorage.setItem('simple_key', simpleValue);

      const result = validatedLocalStorage.getItem('simple_key');

      expect(result).toBe(simpleValue);
    });

    it('should return null for missing keys', () => {
      const result = validatedLocalStorage.getItem('nonexistent');

      expect(result).toBeNull();
    });

    it('should support removeItem', () => {
      localStorage.setItem('test_key', 'test_value');

      validatedLocalStorage.removeItem('test_key');

      expect(localStorage.getItem('test_key')).toBeNull();
    });

    it('should support clear', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');

      validatedLocalStorage.clear();

      expect(localStorage.length).toBe(0);
    });

    it('should support key()', () => {
      localStorage.setItem('test_key', 'test_value');

      const key = validatedLocalStorage.key(0);

      expect(key).toBe('test_key');
    });

    it('should support length', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');

      expect(validatedLocalStorage.length).toBe(2);
    });
  });

  // ============================================================================
  // MIGRATION TESTS
  // ============================================================================

  describe('localStorage Migration', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should migrate valid data', () => {
      const validTasks = [
        {
          id: '1',
          title: 'Task 1',
          created_at: new Date().toISOString(),
        },
      ];

      localStorage.setItem('adhd_quest_tasks', JSON.stringify(validTasks));

      const result = migrateLocalStorage();

      expect(result.migrated).toContain('adhd_quest_tasks');
      expect(result.failed).toHaveLength(0);
      expect(result.removed).toHaveLength(0);
    });

    it('should remove corrupt data', () => {
      const corruptTasks = [
        {
          // Missing required fields
          invalid: 'data',
        },
      ];

      localStorage.setItem('adhd_quest_tasks', JSON.stringify(corruptTasks));

      const result = migrateLocalStorage();

      expect(result.failed).toContain('adhd_quest_tasks');
      expect(result.removed).toContain('adhd_quest_tasks');

      // Corrupt data should be removed
      expect(localStorage.getItem('adhd_quest_tasks')).toBeNull();
    });

    it('should skip missing keys', () => {
      const result = migrateLocalStorage();

      expect(result.migrated).toHaveLength(0);
      expect(result.failed).toHaveLength(0);
    });
  });

  // ============================================================================
  // DATA TYPE VALIDATION TESTS
  // ============================================================================

  describe('Data Type Validation', () => {
    it('should validate sign-up data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      const result = validationService.validateSignUp(validData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it('should reject invalid sign-up data', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'weak',
        username: 'ab',
      };

      const result = validationService.validateSignUp(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate user profile', () => {
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

      const result = validationService.validateUserProfile(validProfile);

      expect(result.success).toBe(true);
    });

    it('should validate array of tasks', () => {
      const validTasks = [
        {
          id: '1',
          title: 'Task 1',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Task 2',
          created_at: new Date().toISOString(),
        },
      ];

      const result = validationService.validateTasks(validTasks);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should report validation errors for invalid tasks array', () => {
      const invalidTasks = [
        {
          id: '1',
          title: 'Valid Task',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          // Missing title
          created_at: new Date().toISOString(),
        },
      ];

      const result = validationService.validateTasks(invalidTasks);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to validate');
    });

    it('should validate streak data', () => {
      const validStreak = {
        current_streak: 5,
        longest_streak: 10,
        activity_dates: ['2025-01-01', '2025-01-02', '2025-01-03'],
        milestones: [
          {
            days: 7,
            reached: false,
            xp_bonus: 50,
          },
        ],
        created_at: new Date().toISOString(),
      };

      const result = validationService.validateStreak(validStreak);

      expect(result.success).toBe(true);
    });

    it('should validate user settings', () => {
      const validSettings = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        created_at: new Date().toISOString(),
      };

      const result = validationService.validateUserSettings(validSettings);

      expect(result.success).toBe(true);

      // Check defaults are applied
      if (result.data) {
        expect(result.data.pomodoro_duration).toBe(25);
        expect(result.data.theme.name).toBe('neon-green');
      }
    });
  });
});
