/**
 * Notification Service
 *
 * Handles push notifications for:
 * - Task reminders
 * - Pomodoro timer alerts
 * - Streak preservation warnings
 * - Achievement unlocks
 * - Milestone celebrations
 */

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.isSupported = 'Notification' in window;
    this.notifications = [];
  }

  /**
   * Initialize notification service
   */
  async initialize() {
    if (!this.isSupported) {
      console.log('Push notifications not supported in this browser');
      return false;
    }

    this.permission = Notification.permission;

    // Request permission if not granted
    if (this.permission === 'default') {
      await this.requestPermission();
    }

    return this.permission === 'granted';
  }

  /**
   * Request notification permission
   */
  async requestPermission() {
    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  /**
   * Show notification
   */
  async show(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      console.log('Notifications not available or not permitted');
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        requireInteraction: false,
        ...options,
      });

      this.notifications.push(notification);

      // Auto-close after duration
      if (options.duration) {
        setTimeout(() => {
          notification.close();
        }, options.duration);
      }

      return notification;
    } catch (error) {
      console.error('Show notification error:', error);
      return null;
    }
  }

  /**
   * Show task reminder
   */
  showTaskReminder(taskTitle, dueDate) {
    return this.show('⏰ Task Reminder', {
      body: `Don't forget: ${taskTitle}`,
      tag: 'task-reminder',
      data: { type: 'task', title: taskTitle, dueDate },
      actions: [
        { action: 'complete', title: 'Mark Complete' },
        { action: 'snooze', title: 'Snooze 1h' },
      ],
    });
  }

  /**
   * Show pomodoro start notification
   */
  showPomodoroStart(type = 'focus') {
    const title = type === 'focus' ? '🍅 Focus Time!' : '☕ Break Time!';
    const body = type === 'focus'
      ? 'Time to focus! 25 minutes on the clock.'
      : 'Take a break! You earned it.';

    return this.show(title, {
      body,
      tag: 'pomodoro',
      data: { type: 'pomodoro', sessionType: type },
      duration: 5000,
    });
  }

  /**
   * Show pomodoro complete notification
   */
  showPomodoroComplete(type = 'focus') {
    const title = type === 'focus' ? '✅ Focus Session Complete!' : '✅ Break Complete!';
    const body = type === 'focus'
      ? 'Great work! Time for a break.'
      : 'Break over! Ready for another session?';

    return this.show(title, {
      body,
      tag: 'pomodoro-complete',
      data: { type: 'pomodoro-complete', sessionType: type },
      vibrate: [200, 100, 200, 100, 200],
      duration: 10000,
    });
  }

  /**
   * Show streak warning (no activity today)
   */
  showStreakWarning(currentStreak) {
    return this.show('🔥 Streak in Danger!', {
      body: `Your ${currentStreak}-day streak will break soon! Complete a task to keep it alive.`,
      tag: 'streak-warning',
      data: { type: 'streak', streak: currentStreak },
      requireInteraction: true,
      actions: [
        { action: 'open', title: 'Open App' },
      ],
    });
  }

  /**
   * Show streak saved notification
   */
  showStreakSaved(currentStreak) {
    return this.show('🔥 Streak Saved!', {
      body: `Amazing! Your ${currentStreak}-day streak continues!`,
      tag: 'streak-saved',
      data: { type: 'streak-saved', streak: currentStreak },
      duration: 5000,
    });
  }

  /**
   * Show streak milestone
   */
  showStreakMilestone(days) {
    let emoji = '🎉';
    let message = 'Congratulations!';

    if (days >= 365) {
      emoji = '👑';
      message = 'LEGENDARY!';
    } else if (days >= 90) {
      emoji = '💎';
      message = 'INCREDIBLE!';
    } else if (days >= 30) {
      emoji = '🌟';
      message = 'AMAZING!';
    }

    return this.show(`${emoji} ${days}-Day Streak!`, {
      body: `${message} You've maintained a ${days}-day streak!`,
      tag: 'streak-milestone',
      data: { type: 'milestone', milestone: days },
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      requireInteraction: true,
      duration: 15000,
    });
  }

  /**
   * Show achievement unlocked
   */
  showAchievementUnlocked(achievement) {
    return this.show(`🏆 Achievement Unlocked!`, {
      body: `${achievement.icon} ${achievement.name}\n${achievement.description}`,
      tag: 'achievement',
      data: { type: 'achievement', achievement },
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true,
      duration: 10000,
    });
  }

  /**
   * Show level up notification
   */
  showLevelUp(newLevel) {
    let emoji = '⬆️';
    let message = 'Level Up!';

    if (newLevel >= 100) {
      emoji = '👑';
      message = 'MAX LEVEL!';
    } else if (newLevel >= 50) {
      emoji = '💫';
      message = 'LEGENDARY LEVEL!';
    } else if (newLevel >= 25) {
      emoji = '⭐';
      message = 'EPIC LEVEL!';
    }

    return this.show(`${emoji} ${message}`, {
      body: `Congratulations! You've reached Level ${newLevel}!`,
      tag: 'level-up',
      data: { type: 'level-up', level: newLevel },
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      duration: 10000,
    });
  }

  /**
   * Show XP earned notification
   */
  showXPEarned(xp) {
    return this.show('✨ XP Earned!', {
      body: `+${xp} XP`,
      tag: 'xp-earned',
      data: { type: 'xp', amount: xp },
      duration: 3000,
    });
  }

  /**
   * Show task completed notification
   */
  showTaskCompleted(taskTitle, xpEarned) {
    return this.show('✅ Quest Complete!', {
      body: `${taskTitle} - Earned ${xpEarned} XP`,
      tag: 'task-complete',
      data: { type: 'task-complete', title: taskTitle, xp: xpEarned },
      duration: 5000,
    });
  }

  /**
   * Schedule daily streak reminder
   */
  scheduleDailyReminder(hour = 20, minute = 0) {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      // Check if user has activity today
      const streak = JSON.parse(localStorage.getItem('adhd_quest_streak') || '{"current":0}');
      const today = new Date().toISOString().split('T')[0];
      const lastActivity = streak.lastActivityDate;

      if (lastActivity !== today && streak.current > 0) {
        this.showStreakWarning(streak.current);
      }

      // Schedule next reminder
      this.scheduleDailyReminder(hour, minute);
    }, delay);
  }

  /**
   * Close all notifications
   */
  closeAll() {
    this.notifications.forEach(notification => {
      try {
        notification.close();
      } catch (error) {
        // Notification might already be closed
      }
    });
    this.notifications = [];
  }

  /**
   * Get permission status
   */
  getPermission() {
    return this.permission;
  }

  /**
   * Check if notifications are supported
   */
  isNotificationSupported() {
    return this.isSupported;
  }

  /**
   * Test notification
   */
  testNotification() {
    return this.show('🎮 ADHD Quest', {
      body: 'Notifications are working! You\'re all set.',
      tag: 'test',
      duration: 5000,
    });
  }
}

// Singleton instance
const notificationService = new NotificationService();

export default notificationService;
export const initializeNotifications = () => notificationService.initialize();
export const showNotification = (title, options) => notificationService.show(title, options);
export const showTaskReminder = (title, dueDate) => notificationService.showTaskReminder(title, dueDate);
export const showPomodoroStart = (type) => notificationService.showPomodoroStart(type);
export const showPomodoroComplete = (type) => notificationService.showPomodoroComplete(type);
export const showStreakWarning = (streak) => notificationService.showStreakWarning(streak);
export const showAchievementUnlocked = (achievement) => notificationService.showAchievementUnlocked(achievement);
export const showLevelUp = (level) => notificationService.showLevelUp(level);
export const scheduleDailyReminder = (hour, minute) => notificationService.scheduleDailyReminder(hour, minute);
