/**
 * Streak Tracker
 *
 * Tracks consecutive days of user activity (task completion, pomodoro sessions).
 * Manages current streak, longest streak, and streak milestones.
 */

import { format, differenceInDays, parseISO, startOfDay } from 'date-fns';

const STORAGE_KEY = 'adhd_quest_streak';

/**
 * Streak data structure:
 * {
 *   currentStreak: number,
 *   longestStreak: number,
 *   lastActivityDate: ISO string,
 *   activityDates: array of ISO date strings,
 *   milestones: array of achieved milestone numbers
 * }
 */

class StreakTracker {
  constructor() {
    this.streakData = this.loadStreakData();
  }

  /**
   * Load streak data from localStorage
   */
  loadStreakData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
    }

    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      activityDates: [],
      milestones: [],
    };
  }

  /**
   * Save streak data to localStorage
   */
  saveStreakData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.streakData));
    } catch (error) {
      console.error('Error saving streak data:', error);
    }
  }

  /**
   * Record activity for today
   */
  recordActivity() {
    const today = startOfDay(new Date()).toISOString();
    const todayFormatted = format(new Date(), 'yyyy-MM-dd');

    // Check if already recorded today
    if (this.streakData.lastActivityDate === todayFormatted) {
      return {
        streakContinued: false,
        currentStreak: this.streakData.currentStreak,
        milestoneReached: null,
      };
    }

    let milestoneReached = null;

    // Calculate days since last activity
    if (this.streakData.lastActivityDate) {
      const lastDate = parseISO(this.streakData.lastActivityDate);
      const daysSince = differenceInDays(startOfDay(new Date()), startOfDay(lastDate));

      if (daysSince === 1) {
        // Consecutive day - continue streak
        this.streakData.currentStreak += 1;
      } else if (daysSince > 1) {
        // Streak broken - reset
        this.streakData.currentStreak = 1;
      }
    } else {
      // First activity ever
      this.streakData.currentStreak = 1;
    }

    // Update longest streak
    if (this.streakData.currentStreak > this.streakData.longestStreak) {
      this.streakData.longestStreak = this.streakData.currentStreak;
    }

    // Update last activity date
    this.streakData.lastActivityDate = todayFormatted;

    // Add to activity dates
    if (!this.streakData.activityDates.includes(todayFormatted)) {
      this.streakData.activityDates.push(todayFormatted);
    }

    // Check for milestone
    milestoneReached = this.checkMilestone(this.streakData.currentStreak);

    this.saveStreakData();

    return {
      streakContinued: true,
      currentStreak: this.streakData.currentStreak,
      milestoneReached,
      isNewLongest: this.streakData.currentStreak === this.streakData.longestStreak,
    };
  }

  /**
   * Check if current streak reached a milestone
   */
  checkMilestone(streak) {
    const milestones = [3, 7, 14, 30, 60, 90, 180, 365];

    for (const milestone of milestones) {
      if (streak === milestone && !this.streakData.milestones.includes(milestone)) {
        this.streakData.milestones.push(milestone);
        return milestone;
      }
    }

    return null;
  }

  /**
   * Get current streak
   */
  getCurrentStreak() {
    // Check if streak is still valid
    if (this.streakData.lastActivityDate) {
      const lastDate = parseISO(this.streakData.lastActivityDate);
      const daysSince = differenceInDays(startOfDay(new Date()), startOfDay(lastDate));

      if (daysSince > 1) {
        // Streak is broken
        return 0;
      }
    }

    return this.streakData.currentStreak;
  }

  /**
   * Get longest streak
   */
  getLongestStreak() {
    return this.streakData.longestStreak;
  }

  /**
   * Get last activity date
   */
  getLastActivityDate() {
    return this.streakData.lastActivityDate;
  }

  /**
   * Check if user has activity today
   */
  hasActivityToday() {
    const today = format(new Date(), 'yyyy-MM-dd');
    return this.streakData.lastActivityDate === today;
  }

  /**
   * Get days until streak breaks
   */
  getDaysUntilBreak() {
    if (!this.streakData.lastActivityDate) return 0;

    const lastDate = parseISO(this.streakData.lastActivityDate);
    const daysSince = differenceInDays(startOfDay(new Date()), startOfDay(lastDate));

    if (daysSince >= 1) {
      return 0; // Already broken
    }

    return 1; // Today
  }

  /**
   * Get all activity dates
   */
  getActivityDates() {
    return this.streakData.activityDates;
  }

  /**
   * Check if date has activity
   */
  hasActivityOnDate(date) {
    const dateFormatted = format(new Date(date), 'yyyy-MM-dd');
    return this.streakData.activityDates.includes(dateFormatted);
  }

  /**
   * Get achieved milestones
   */
  getMilestones() {
    return this.streakData.milestones;
  }

  /**
   * Get next milestone
   */
  getNextMilestone() {
    const milestones = [3, 7, 14, 30, 60, 90, 180, 365];
    const current = this.getCurrentStreak();

    for (const milestone of milestones) {
      if (current < milestone) {
        return milestone;
      }
    }

    return null; // No more milestones
  }

  /**
   * Get progress to next milestone
   */
  getProgressToNextMilestone() {
    const current = this.getCurrentStreak();
    const next = this.getNextMilestone();

    if (!next) {
      return 100; // All milestones achieved
    }

    const previous = this.getPreviousMilestone(next);
    const progress = ((current - previous) / (next - previous)) * 100;

    return Math.min(100, Math.max(0, progress));
  }

  /**
   * Get previous milestone
   */
  getPreviousMilestone(current) {
    const milestones = [0, 3, 7, 14, 30, 60, 90, 180, 365];

    for (let i = milestones.length - 1; i >= 0; i--) {
      if (milestones[i] < current) {
        return milestones[i];
      }
    }

    return 0;
  }

  /**
   * Reset streak data
   */
  resetStreak() {
    this.streakData = {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      activityDates: [],
      milestones: [],
    };
    this.saveStreakData();
  }

  /**
   * Get streak statistics
   */
  getStats() {
    return {
      current: this.getCurrentStreak(),
      longest: this.getLongestStreak(),
      lastActivity: this.getLastActivityDate(),
      totalActiveDays: this.streakData.activityDates.length,
      milestones: this.getMilestones(),
      nextMilestone: this.getNextMilestone(),
      progressToNext: this.getProgressToNextMilestone(),
      hasActivityToday: this.hasActivityToday(),
    };
  }

  /**
   * Import streak data (for cloud sync)
   */
  importStreakData(data) {
    if (!data) return;

    this.streakData = {
      currentStreak: Math.max(this.streakData.currentStreak, data.currentStreak || 0),
      longestStreak: Math.max(this.streakData.longestStreak, data.longestStreak || 0),
      lastActivityDate: data.lastActivityDate || this.streakData.lastActivityDate,
      activityDates: this.mergeActivityDates(data.activityDates || []),
      milestones: this.mergeMilestones(data.milestones || []),
    };

    this.saveStreakData();
  }

  /**
   * Merge activity dates
   */
  mergeActivityDates(newDates) {
    const combined = new Set([...this.streakData.activityDates, ...newDates]);
    return Array.from(combined).sort();
  }

  /**
   * Merge milestones
   */
  mergeMilestones(newMilestones) {
    const combined = new Set([...this.streakData.milestones, ...newMilestones]);
    return Array.from(combined).sort((a, b) => a - b);
  }

  /**
   * Export streak data (for cloud sync)
   */
  exportStreakData() {
    return { ...this.streakData };
  }

  /**
   * Get XP bonus for streak
   */
  getStreakXPBonus() {
    const current = this.getCurrentStreak();

    if (current >= 30) return 100;
    if (current >= 14) return 50;
    if (current >= 7) return 25;
    if (current >= 3) return 10;

    return 0;
  }

  /**
   * Get streak multiplier
   */
  getStreakMultiplier() {
    const current = this.getCurrentStreak();

    if (current >= 30) return 2.0;
    if (current >= 14) return 1.5;
    if (current >= 7) return 1.25;
    if (current >= 3) return 1.1;

    return 1.0;
  }

  /**
   * Get streak display data for UI
   */
  getDisplayData() {
    const stats = this.getStats();

    return {
      current: stats.current,
      longest: stats.longest,
      flame: stats.current > 0 ? '🔥' : '💀',
      status: this.getStreakStatus(),
      nextMilestone: stats.nextMilestone,
      progressPercent: stats.progressToNext,
      xpBonus: this.getStreakXPBonus(),
      multiplier: this.getStreakMultiplier(),
      daysUntilBreak: this.getDaysUntilBreak(),
    };
  }

  /**
   * Get streak status message
   */
  getStreakStatus() {
    const current = this.getCurrentStreak();
    const hasToday = this.hasActivityToday();

    if (current === 0) {
      return 'Start your streak today!';
    }

    if (!hasToday) {
      return 'Complete a task to continue your streak!';
    }

    if (current >= 30) {
      return 'LEGENDARY STREAK! 🔥🔥🔥';
    }

    if (current >= 14) {
      return 'Incredible streak! Keep it up! 🔥🔥';
    }

    if (current >= 7) {
      return 'One week streak! Amazing! 🔥';
    }

    if (current >= 3) {
      return 'Great start! Keep going!';
    }

    return 'Building momentum!';
  }
}

// Singleton instance
const streakTracker = new StreakTracker();

// Helper functions
export const recordActivity = () => streakTracker.recordActivity();
export const getCurrentStreak = () => streakTracker.getCurrentStreak();
export const getLongestStreak = () => streakTracker.getLongestStreak();
export const getStreakStats = () => streakTracker.getStats();
export const getStreakDisplayData = () => streakTracker.getDisplayData();
export const hasActivityToday = () => streakTracker.hasActivityToday();
export const hasActivityOnDate = (date) => streakTracker.hasActivityOnDate(date);
export const resetStreak = () => streakTracker.resetStreak();
export const importStreakData = (data) => streakTracker.importStreakData(data);
export const exportStreakData = () => streakTracker.exportStreakData();

export default streakTracker;
