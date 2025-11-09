/**
 * Statistics Aggregator
 *
 * Collects, aggregates, and analyzes user productivity data
 * for visualization in the statistics dashboard.
 */

import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, differenceInDays } from 'date-fns';

class StatsAggregator {
  /**
   * Get all statistics for a date range
   */
  getStats(startDate, endDate, granularity = 'daily') {
    const tasks = this.loadTasks();
    const completedQuests = this.loadCompletedQuests();
    const pomodoroSessions = this.loadPomodoroSessions();
    const timeTrainerResults = this.loadTimeTrainerResults();
    const profile = this.loadProfile();

    return {
      tasks: this.aggregateTaskStats(tasks, completedQuests, startDate, endDate, granularity),
      pomodoro: this.aggregatePomodoroStats(pomodoroSessions, startDate, endDate, granularity),
      timeTrainer: this.aggregateTimeTrainerStats(timeTrainerResults, startDate, endDate, granularity),
      xp: this.aggregateXPStats(completedQuests, startDate, endDate, granularity),
      overview: this.getOverviewStats(profile, completedQuests, pomodoroSessions),
    };
  }

  /**
   * Load tasks from localStorage
   */
  loadTasks() {
    try {
      return JSON.parse(localStorage.getItem('adhd_quest_tasks') || '[]');
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  }

  /**
   * Load completed quests
   */
  loadCompletedQuests() {
    try {
      return JSON.parse(localStorage.getItem('adhd_quest_completed') || '[]');
    } catch (error) {
      console.error('Error loading completed quests:', error);
      return [];
    }
  }

  /**
   * Load pomodoro sessions
   */
  loadPomodoroSessions() {
    try {
      return JSON.parse(localStorage.getItem('adhd_quest_pomodoro_history') || '[]');
    } catch (error) {
      console.error('Error loading pomodoro sessions:', error);
      return [];
    }
  }

  /**
   * Load time trainer results
   */
  loadTimeTrainerResults() {
    try {
      return JSON.parse(localStorage.getItem('adhd_quest_time_trainer_results') || '[]');
    } catch (error) {
      console.error('Error loading time trainer results:', error);
      return [];
    }
  }

  /**
   * Load user profile
   */
  loadProfile() {
    try {
      return JSON.parse(localStorage.getItem('adhd_quest_profile') || '{}');
    } catch (error) {
      console.error('Error loading profile:', error);
      return {};
    }
  }

  /**
   * Aggregate task statistics
   */
  aggregateTaskStats(tasks, completedQuests, startDate, endDate, granularity) {
    const data = this.createTimeSeriesData(startDate, endDate, granularity);

    // Count tasks created
    tasks.forEach(task => {
      const key = this.getTimeKey(task.createdAt, granularity);
      if (data[key]) {
        data[key].created += 1;
      }
    });

    // Count tasks completed
    completedQuests.forEach(quest => {
      const key = this.getTimeKey(quest.completedAt, granularity);
      if (data[key]) {
        data[key].completed += 1;
        data[key].subtasks += quest.subtasks?.length || 0;
        data[key].completionTime += quest.totalTime || 0;
      }
    });

    return this.formatTimeSeriesData(data);
  }

  /**
   * Aggregate pomodoro statistics
   */
  aggregatePomodoroStats(sessions, startDate, endDate, granularity) {
    const data = this.createTimeSeriesData(startDate, endDate, granularity);

    sessions.forEach(session => {
      const key = this.getTimeKey(session.timestamp, granularity);
      if (data[key]) {
        if (session.type === 'focus') {
          data[key].focusSessions += 1;
          data[key].focusMinutes += 25;
        } else {
          data[key].breakSessions += 1;
          data[key].breakMinutes += 5;
        }
      }
    });

    return this.formatTimeSeriesData(data);
  }

  /**
   * Aggregate time trainer statistics
   */
  aggregateTimeTrainerStats(results, startDate, endDate, granularity) {
    const data = this.createTimeSeriesData(startDate, endDate, granularity);

    results.forEach(result => {
      const key = this.getTimeKey(result.timestamp, granularity);
      if (data[key]) {
        data[key].attempts += 1;
        data[key].totalAccuracy += result.accuracy || 0;
      }
    });

    // Calculate average accuracy
    const formatted = this.formatTimeSeriesData(data);
    formatted.forEach(point => {
      if (point.attempts > 0) {
        point.averageAccuracy = point.totalAccuracy / point.attempts;
      }
      delete point.totalAccuracy; // Remove intermediate value
    });

    return formatted;
  }

  /**
   * Aggregate XP statistics
   */
  aggregateXPStats(completedQuests, startDate, endDate, granularity) {
    const data = this.createTimeSeriesData(startDate, endDate, granularity);

    completedQuests.forEach(quest => {
      const key = this.getTimeKey(quest.completedAt, granularity);
      if (data[key]) {
        data[key].xpEarned += quest.xpEarned || 0;
      }
    });

    return this.formatTimeSeriesData(data);
  }

  /**
   * Get overview statistics
   */
  getOverviewStats(profile, completedQuests, pomodoroSessions) {
    const totalTasks = completedQuests.length;
    const totalXP = profile.totalXP || 0;
    const currentLevel = profile.level || 1;
    const totalSubtasks = completedQuests.reduce((sum, q) => sum + (q.subtasks?.length || 0), 0);

    const totalFocusTime = pomodoroSessions
      .filter(s => s.type === 'focus')
      .length * 25;

    const averageTaskTime = totalTasks > 0
      ? completedQuests.reduce((sum, q) => sum + (q.totalTime || 0), 0) / totalTasks
      : 0;

    const today = format(new Date(), 'yyyy-MM-dd');
    const tasksToday = completedQuests.filter(q => {
      const completedDate = format(new Date(q.completedAt), 'yyyy-MM-dd');
      return completedDate === today;
    }).length;

    const thisWeek = this.getWeekRange(new Date());
    const tasksThisWeek = completedQuests.filter(q => {
      const completedDate = new Date(q.completedAt);
      return completedDate >= thisWeek.start && completedDate <= thisWeek.end;
    }).length;

    return {
      totalTasks,
      totalXP,
      currentLevel,
      totalSubtasks,
      totalFocusTime,
      averageTaskTime,
      tasksToday,
      tasksThisWeek,
      productivity: this.calculateProductivityScore(completedQuests, pomodoroSessions),
    };
  }

  /**
   * Calculate productivity score (0-100)
   */
  calculateProductivityScore(completedQuests, pomodoroSessions) {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const recentTasks = completedQuests.filter(q => new Date(q.completedAt) >= last7Days).length;
    const recentPomodoros = pomodoroSessions.filter(s =>
      s.type === 'focus' && new Date(s.timestamp) >= last7Days
    ).length;

    // Score based on tasks per day and pomodoro sessions
    const taskScore = Math.min(50, (recentTasks / 7) * 10);
    const pomodoroScore = Math.min(50, (recentPomodoros / 7) * 5);

    return Math.round(taskScore + pomodoroScore);
  }

  /**
   * Create time series data structure
   */
  createTimeSeriesData(startDate, endDate, granularity) {
    const data = {};
    const start = new Date(startDate);
    const end = new Date(endDate);

    let current = start;
    while (current <= end) {
      const key = this.getTimeKey(current, granularity);
      data[key] = {
        date: key,
        created: 0,
        completed: 0,
        subtasks: 0,
        completionTime: 0,
        focusSessions: 0,
        breakSessions: 0,
        focusMinutes: 0,
        breakMinutes: 0,
        attempts: 0,
        totalAccuracy: 0,
        xpEarned: 0,
      };

      // Increment date based on granularity
      if (granularity === 'daily') {
        current = new Date(current.setDate(current.getDate() + 1));
      } else if (granularity === 'weekly') {
        current = new Date(current.setDate(current.getDate() + 7));
      } else if (granularity === 'monthly') {
        current = new Date(current.setMonth(current.getMonth() + 1));
      }
    }

    return data;
  }

  /**
   * Get time key for granularity
   */
  getTimeKey(timestamp, granularity) {
    const date = new Date(timestamp);

    switch (granularity) {
      case 'daily':
        return format(date, 'yyyy-MM-dd');
      case 'weekly':
        return format(startOfWeek(date), 'yyyy-MM-dd');
      case 'monthly':
        return format(startOfMonth(date), 'yyyy-MM');
      default:
        return format(date, 'yyyy-MM-dd');
    }
  }

  /**
   * Format time series data as array
   */
  formatTimeSeriesData(data) {
    return Object.values(data).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get week range
   */
  getWeekRange(date) {
    return {
      start: startOfWeek(date),
      end: endOfWeek(date),
    };
  }

  /**
   * Get month range
   */
  getMonthRange(date) {
    return {
      start: startOfMonth(date),
      end: endOfMonth(date),
    };
  }

  /**
   * Get productivity trends
   */
  getProductivityTrends(days = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = this.getStats(startDate, endDate, 'daily');

    return {
      tasks: this.calculateTrend(stats.tasks.map(d => d.completed)),
      xp: this.calculateTrend(stats.xp.map(d => d.xpEarned)),
      pomodoro: this.calculateTrend(stats.pomodoro.map(d => d.focusSessions)),
    };
  }

  /**
   * Calculate trend (increasing, decreasing, stable)
   */
  calculateTrend(values) {
    if (values.length < 2) return 'stable';

    const half = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, half);
    const secondHalf = values.slice(half);

    const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / (firstAvg || 1)) * 100;

    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  /**
   * Get heatmap data for calendar
   */
  getHeatmapData(year) {
    const completedQuests = this.loadCompletedQuests();
    const heatmap = {};

    completedQuests.forEach(quest => {
      const date = format(new Date(quest.completedAt), 'yyyy-MM-dd');
      if (date.startsWith(year.toString())) {
        heatmap[date] = (heatmap[date] || 0) + 1;
      }
    });

    return heatmap;
  }

  /**
   * Get best performance day/time
   */
  getBestPerformanceTimes() {
    const completedQuests = this.loadCompletedQuests();

    const byHour = Array(24).fill(0);
    const byDay = Array(7).fill(0);

    completedQuests.forEach(quest => {
      const date = new Date(quest.completedAt);
      const hour = date.getHours();
      const day = date.getDay();

      byHour[hour] += 1;
      byDay[day] += 1;
    });

    const bestHour = byHour.indexOf(Math.max(...byHour));
    const bestDay = byDay.indexOf(Math.max(...byDay));

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return {
      hour: bestHour,
      day: dayNames[bestDay],
      hourlyDistribution: byHour,
      dailyDistribution: byDay,
    };
  }

  /**
   * Export statistics to cloud
   */
  async exportToCloud(userId) {
    // This will be called by cloudSyncService
    const stats = this.getStats(
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
      new Date(),
      'daily'
    );

    return {
      user_id: userId,
      stats_data: stats,
      generated_at: new Date().toISOString(),
    };
  }
}

// Singleton instance
const statsAggregator = new StatsAggregator();

export default statsAggregator;
export const getStats = (startDate, endDate, granularity) =>
  statsAggregator.getStats(startDate, endDate, granularity);
export const getOverviewStats = () =>
  statsAggregator.getOverviewStats(
    statsAggregator.loadProfile(),
    statsAggregator.loadCompletedQuests(),
    statsAggregator.loadPomodoroSessions()
  );
export const getProductivityTrends = (days) =>
  statsAggregator.getProductivityTrends(days);
export const getHeatmapData = (year) =>
  statsAggregator.getHeatmapData(year);
export const getBestPerformanceTimes = () =>
  statsAggregator.getBestPerformanceTimes();
