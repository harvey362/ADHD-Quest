/**
 * Streak Tracker Unit Tests
 *
 * Comprehensive test suite for streak tracking logic including:
 * - Basic streak operations
 * - Edge cases (DST, timezone changes, leap years)
 * - Property-based tests
 * - Milestone calculations
 */

import fc from 'fast-check';
import { addDays, subDays, startOfDay } from 'date-fns';
import streakTracker, {
  recordActivity,
  getCurrentStreak,
  getLongestStreak,
  hasActivityToday,
  resetStreak,
} from '../../../src/utils/streakTracker';

describe('StreakTracker', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStreak();
  });

  describe('recordActivity', () => {
    it('should initialize streak to 1 on first activity', () => {
      const result = recordActivity();
      expect(result.currentStreak).toBe(1);
      expect(result.streakContinued).toBe(true);
    });

    it('should increment streak on consecutive days', () => {
      // Record activity for Day 1
      recordActivity();

      // Mock next day
      jest.useFakeTimers();
      jest.setSystemTime(addDays(new Date(), 1));

      const result = recordActivity();
      expect(result.currentStreak).toBe(2);
      expect(result.streakContinued).toBe(true);

      jest.useRealTimers();
    });

    it('should not increment streak if already recorded today', () => {
      const result1 = recordActivity();
      const result2 = recordActivity();

      expect(result1.currentStreak).toBe(1);
      expect(result2.currentStreak).toBe(1);
      expect(result2.streakContinued).toBe(false);
    });

    it('should reset streak if more than 1 day gap', () => {
      recordActivity();

      jest.useFakeTimers();
      jest.setSystemTime(addDays(new Date(), 3));

      const result = recordActivity();
      expect(result.currentStreak).toBe(1);

      jest.useRealTimers();
    });

    it('should track longest streak', () => {
      // Build 5-day streak
      for (let i = 0; i < 5; i++) {
        recordActivity();
        if (i < 4) {
          jest.useFakeTimers();
          jest.setSystemTime(addDays(new Date(), 1));
        }
      }

      expect(getLongestStreak()).toBe(5);

      // Break streak
      jest.setSystemTime(addDays(new Date(), 3));
      recordActivity();

      // Longest should still be 5
      expect(getLongestStreak()).toBe(5);

      jest.useRealTimers();
    });

    it('should detect milestone achievements', () => {
      jest.useFakeTimers();

      // Build to 7-day streak
      for (let i = 0; i < 7; i++) {
        if (i > 0) {
          jest.setSystemTime(addDays(startOfDay(new Date()), i));
        }
        const result = recordActivity();

        if (i === 6) {
          expect(result.milestoneReached).toBe(7);
        }
      }

      jest.useRealTimers();
    });
  });

  describe('Edge Cases', () => {
    it('should handle DST transitions correctly', () => {
      // Spring forward (lose 1 hour)
      const springForward = new Date('2024-03-10T01:00:00-05:00');
      const nextDay = new Date('2024-03-11T01:00:00-04:00');

      jest.useFakeTimers();
      jest.setSystemTime(springForward);
      recordActivity();

      jest.setSystemTime(nextDay);
      const result = recordActivity();

      expect(result.currentStreak).toBe(2);

      jest.useRealTimers();
    });

    it('should handle leap year correctly', () => {
      jest.useFakeTimers();

      const feb28 = new Date('2024-02-28T12:00:00Z');
      const feb29 = new Date('2024-02-29T12:00:00Z');
      const mar1 = new Date('2024-03-01T12:00:00Z');

      jest.setSystemTime(feb28);
      recordActivity();

      jest.setSystemTime(feb29);
      recordActivity();

      jest.setSystemTime(mar1);
      const result = recordActivity();

      expect(result.currentStreak).toBe(3);

      jest.useRealTimers();
    });

    it('should handle year transitions', () => {
      jest.useFakeTimers();

      jest.setSystemTime(new Date('2023-12-31T23:59:00Z'));
      recordActivity();

      jest.setSystemTime(new Date('2024-01-01T00:01:00Z'));
      const result = recordActivity();

      expect(result.currentStreak).toBe(2);

      jest.useRealTimers();
    });

    it('should handle system clock going backwards', () => {
      jest.useFakeTimers();

      const today = new Date();
      jest.setSystemTime(today);
      recordActivity();

      // Clock goes back
      jest.setSystemTime(subDays(today, 1));

      const result = recordActivity();

      // Should not break streak or create duplicate
      expect(result.currentStreak).toBeGreaterThanOrEqual(1);

      jest.useRealTimers();
    });
  });

  describe('Property-Based Tests', () => {
    it('streak should never be negative', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 100 }), (days) => {
          resetStreak();
          jest.useFakeTimers();

          for (let i = 0; i < days; i++) {
            jest.setSystemTime(addDays(new Date(), i));
            recordActivity();
          }

          const streak = getCurrentStreak();
          jest.useRealTimers();

          return streak >= 0;
        })
      );
    });

    it('longest streak should be >= current streak', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 30 }), { minLength: 1, maxLength: 10 }),
          (gaps) => {
            resetStreak();
            jest.useFakeTimers();

            let day = 0;
            gaps.forEach((gap) => {
              for (let i = 0; i < gap; i++) {
                jest.setSystemTime(addDays(new Date(), day++));
                recordActivity();
              }
              day += 2; // Add gap
            });

            const current = getCurrentStreak();
            const longest = getLongestStreak();
            jest.useRealTimers();

            return longest >= current;
          }
        )
      );
    });

    it('should maintain data consistency across operations', () => {
      fc.assert(
        fc.property(
          fc.array(fc.boolean(), { minLength: 10, maxLength: 30 }),
          (activities) => {
            resetStreak();
            jest.useFakeTimers();

            activities.forEach((shouldRecord, index) => {
              jest.setSystemTime(addDays(new Date(), index));
              if (shouldRecord) {
                recordActivity();
              }
            });

            const current = getCurrentStreak();
            const longest = getLongestStreak();
            const hasToday = hasActivityToday();

            jest.useRealTimers();

            // Invariants
            return (
              current >= 0 &&
              longest >= current &&
              (hasToday ? current > 0 : true)
            );
          }
        )
      );
    });
  });

  describe('Milestone Calculations', () => {
    it('should correctly calculate progress to next milestone', () => {
      jest.useFakeTimers();

      // Build 5-day streak
      for (let i = 0; i < 5; i++) {
        jest.setSystemTime(addDays(new Date(), i));
        recordActivity();
      }

      const stats = streakTracker.getStats();

      // Next milestone should be 7
      expect(stats.nextMilestone).toBe(7);

      // Progress should be: (5-3)/(7-3) = 2/4 = 50%
      expect(stats.progressToNext).toBeCloseTo(50, 1);

      jest.useRealTimers();
    });

    it('should return null for next milestone after reaching max', () => {
      jest.useFakeTimers();

      // Build 365+ day streak
      for (let i = 0; i < 366; i++) {
        jest.setSystemTime(addDays(new Date(), i));
        recordActivity();
      }

      const stats = streakTracker.getStats();
      expect(stats.nextMilestone).toBeNull();
      expect(stats.progressToNext).toBe(100);

      jest.useRealTimers();
    });
  });

  describe('XP Bonuses and Multipliers', () => {
    it('should return correct XP bonuses for streak levels', () => {
      jest.useFakeTimers();

      const testCases = [
        { days: 3, expectedBonus: 10 },
        { days: 7, expectedBonus: 25 },
        { days: 14, expectedBonus: 50 },
        { days: 30, expectedBonus: 100 },
      ];

      testCases.forEach(({ days, expectedBonus }) => {
        resetStreak();
        for (let i = 0; i < days; i++) {
          jest.setSystemTime(addDays(new Date(), i));
          recordActivity();
        }

        const bonus = streakTracker.getStreakXPBonus();
        expect(bonus).toBe(expectedBonus);
      });

      jest.useRealTimers();
    });

    it('should return correct multipliers', () => {
      jest.useFakeTimers();

      const testCases = [
        { days: 3, expectedMultiplier: 1.1 },
        { days: 7, expectedMultiplier: 1.25 },
        { days: 14, expectedMultiplier: 1.5 },
        { days: 30, expectedMultiplier: 2.0 },
      ];

      testCases.forEach(({ days, expectedMultiplier }) => {
        resetStreak();
        for (let i = 0; i < days; i++) {
          jest.setSystemTime(addDays(new Date(), i));
          recordActivity();
        }

        const multiplier = streakTracker.getStreakMultiplier();
        expect(multiplier).toBe(expectedMultiplier);
      });

      jest.useRealTimers();
    });
  });

  describe('Data Import/Export', () => {
    it('should export streak data correctly', () => {
      jest.useFakeTimers();

      for (let i = 0; i < 5; i++) {
        jest.setSystemTime(addDays(new Date(), i));
        recordActivity();
      }

      const exported = streakTracker.exportStreakData();

      expect(exported).toHaveProperty('currentStreak');
      expect(exported).toHaveProperty('longestStreak');
      expect(exported).toHaveProperty('activityDates');
      expect(exported).toHaveProperty('milestones');

      expect(exported.currentStreak).toBe(5);
      expect(Array.isArray(exported.activityDates)).toBe(true);

      jest.useRealTimers();
    });

    it('should import and merge streak data', () => {
      // Local streak
      jest.useFakeTimers();
      for (let i = 0; i < 3; i++) {
        jest.setSystemTime(addDays(new Date(), i));
        recordActivity();
      }

      // Imported data with higher streak
      const importedData = {
        currentStreak: 10,
        longestStreak: 15,
        lastActivityDate: new Date().toISOString(),
        activityDates: Array.from({ length: 10 }, (_, i) =>
          addDays(new Date(), i - 9).toISOString().split('T')[0]
        ),
        milestones: [3, 7],
      };

      streakTracker.importStreakData(importedData);

      const current = getCurrentStreak();
      const longest = getLongestStreak();

      // Should take the higher values
      expect(current).toBeGreaterThanOrEqual(3);
      expect(longest).toBe(15);

      jest.useRealTimers();
    });
  });

  describe('localStorage Persistence', () => {
    it('should persist data to localStorage', () => {
      recordActivity();

      const stored = localStorage.getItem('adhd_quest_streak');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed.currentStreak).toBe(1);
    });

    it('should load data from localStorage on initialization', () => {
      // Manually set localStorage
      localStorage.setItem(
        'adhd_quest_streak',
        JSON.stringify({
          currentStreak: 5,
          longestStreak: 10,
          lastActivityDate: new Date().toISOString().split('T')[0],
          activityDates: [],
          milestones: [3],
        })
      );

      // Create new instance
      const newTracker = require('../../../src/utils/streakTracker').default;
      const stats = newTracker.getStats();

      expect(stats.current).toBe(5);
      expect(stats.longest).toBe(10);
    });
  });
});
