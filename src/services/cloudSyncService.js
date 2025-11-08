/**
 * Cloud Sync Service
 *
 * Handles bidirectional synchronization between local storage and Supabase cloud.
 * Supports offline mode, conflict resolution, and data migration.
 */

import { supabase, TABLES, isSupabaseConfigured } from '../config/supabase';
import localforage from 'localforage';
import authService from './authService';

class CloudSyncService {
  constructor() {
    this.syncInProgress = false;
    this.pendingChanges = [];
    this.lastSyncTimestamp = null;
    this.offlineMode = false;
    this.syncInterval = null;

    // Initialize localforage instances
    this.localStore = localforage.createInstance({
      name: 'adhd_quest',
      storeName: 'user_data',
    });

    this.syncQueue = localforage.createInstance({
      name: 'adhd_quest',
      storeName: 'sync_queue',
    });
  }

  /**
   * Initialize sync service
   */
  async initialize() {
    try {
      // Load last sync timestamp
      this.lastSyncTimestamp = await this.localStore.getItem('last_sync_timestamp');

      // Load pending changes queue
      this.pendingChanges = (await this.syncQueue.getItem('pending_changes')) || [];

      // Check if we're online and configured
      if (navigator.onLine && isSupabaseConfigured()) {
        await this.performFullSync();
        this.startAutoSync();
      } else {
        this.offlineMode = true;
      }

      // Listen for online/offline events
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());

      return true;
    } catch (error) {
      console.error('Sync service initialization failed:', error);
      return false;
    }
  }

  /**
   * Perform full bidirectional sync
   */
  async performFullSync() {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    this.syncInProgress = true;

    try {
      const user = authService.getCurrentUser();
      if (!user) {
        console.log('No user logged in, skipping sync');
        return;
      }

      // Sync all data types
      await this.syncTasks(user.id);
      await this.syncCompletedQuests(user.id);
      await this.syncAchievements(user.id);
      await this.syncProfile(user.id);
      await this.syncSettings(user.id);
      await this.syncNotes(user.id);
      await this.syncDrawings(user.id);
      await this.syncPomodoroSessions(user.id);
      await this.syncTimeTrainerData(user.id);
      await this.syncStreaks(user.id);
      await this.syncStatistics(user.id);

      // Process pending changes
      await this.processPendingChanges(user.id);

      // Update last sync timestamp
      this.lastSyncTimestamp = new Date().toISOString();
      await this.localStore.setItem('last_sync_timestamp', this.lastSyncTimestamp);

      this.offlineMode = false;
    } catch (error) {
      console.error('Full sync failed:', error);
      this.offlineMode = true;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync tasks
   */
  async syncTasks(userId) {
    try {
      // Get local tasks
      const localTasks = JSON.parse(localStorage.getItem('adhd_quest_tasks') || '[]');

      // Get cloud tasks
      const { data: cloudTasks, error } = await supabase
        .from(TABLES.TASKS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Merge tasks (cloud takes precedence for conflicts)
      const mergedTasks = this.mergeTasks(localTasks, cloudTasks || []);

      // Update local storage
      localStorage.setItem('adhd_quest_tasks', JSON.stringify(mergedTasks));

      // Update cloud (upsert new/modified tasks)
      for (const task of mergedTasks) {
        const cloudTask = cloudTasks?.find(t => t.id === task.id);

        if (!cloudTask || new Date(task.updated_at) > new Date(cloudTask.updated_at)) {
          await supabase
            .from(TABLES.TASKS)
            .upsert({
              ...task,
              user_id: userId,
              synced_at: new Date().toISOString(),
            });
        }
      }

      return mergedTasks;
    } catch (error) {
      console.error('Task sync failed:', error);
      this.queueChange('tasks', 'sync_failed', { error: error.message });
      return null;
    }
  }

  /**
   * Sync completed quests
   */
  async syncCompletedQuests(userId) {
    try {
      const localQuests = JSON.parse(localStorage.getItem('adhd_quest_completed') || '[]');

      const { data: cloudQuests, error } = await supabase
        .from(TABLES.COMPLETED_QUESTS)
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      const mergedQuests = this.mergeByTimestamp(localQuests, cloudQuests || [], 'completed_at');

      localStorage.setItem('adhd_quest_completed', JSON.stringify(mergedQuests));

      // Upsert to cloud
      for (const quest of mergedQuests) {
        const cloudQuest = cloudQuests?.find(q => q.id === quest.id);

        if (!cloudQuest) {
          await supabase.from(TABLES.COMPLETED_QUESTS).insert({
            ...quest,
            user_id: userId,
            synced_at: new Date().toISOString(),
          });
        }
      }

      return mergedQuests;
    } catch (error) {
      console.error('Completed quests sync failed:', error);
      return null;
    }
  }

  /**
   * Sync achievements
   */
  async syncAchievements(userId) {
    try {
      const localAchievements = JSON.parse(localStorage.getItem('adhd_quest_achievements') || '[]');

      const { data: cloudAchievements, error } = await supabase
        .from(TABLES.USER_ACHIEVEMENTS)
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const mergedAchievements = this.mergeByTimestamp(
        localAchievements,
        cloudAchievements || [],
        'unlocked_at'
      );

      localStorage.setItem('adhd_quest_achievements', JSON.stringify(mergedAchievements));

      // Upsert to cloud
      for (const achievement of mergedAchievements) {
        const cloudAch = cloudAchievements?.find(a => a.achievement_id === achievement.id);

        if (!cloudAch) {
          await supabase.from(TABLES.USER_ACHIEVEMENTS).insert({
            user_id: userId,
            achievement_id: achievement.id,
            unlocked_at: achievement.unlocked_at,
            synced_at: new Date().toISOString(),
          });
        }
      }

      return mergedAchievements;
    } catch (error) {
      console.error('Achievements sync failed:', error);
      return null;
    }
  }

  /**
   * Sync user profile
   */
  async syncProfile(userId) {
    try {
      const localProfile = JSON.parse(localStorage.getItem('adhd_quest_profile') || '{}');

      const { data: cloudProfile, error } = await supabase
        .from(TABLES.USER_PROFILES)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      let mergedProfile;

      if (cloudProfile) {
        // Merge profiles (take higher XP, level, etc.)
        mergedProfile = {
          ...cloudProfile,
          totalXP: Math.max(localProfile.totalXP || 0, cloudProfile.total_xp || 0),
          level: Math.max(localProfile.level || 1, cloudProfile.level || 1),
          tasksCompleted: Math.max(localProfile.tasksCompleted || 0, cloudProfile.tasks_completed || 0),
          subtasksCompleted: Math.max(localProfile.subtasksCompleted || 0, cloudProfile.subtasks_completed || 0),
        };
      } else {
        mergedProfile = localProfile;
      }

      localStorage.setItem('adhd_quest_profile', JSON.stringify(mergedProfile));

      // Update cloud
      await supabase
        .from(TABLES.USER_PROFILES)
        .upsert({
          user_id: userId,
          total_xp: mergedProfile.totalXP || 0,
          level: mergedProfile.level || 1,
          current_level_xp: mergedProfile.currentLevelXP || 0,
          xp_to_next_level: mergedProfile.xpToNextLevel || 200,
          tasks_completed: mergedProfile.tasksCompleted || 0,
          subtasks_completed: mergedProfile.subtasksCompleted || 0,
          updated_at: new Date().toISOString(),
        });

      return mergedProfile;
    } catch (error) {
      console.error('Profile sync failed:', error);
      return null;
    }
  }

  /**
   * Sync settings
   */
  async syncSettings(userId) {
    try {
      const localSettings = JSON.parse(localStorage.getItem('adhd_quest_settings') || '{}');

      const { data: cloudSettings, error } = await supabase
        .from(TABLES.SETTINGS)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const mergedSettings = cloudSettings ? { ...cloudSettings.settings } : localSettings;

      localStorage.setItem('adhd_quest_settings', JSON.stringify(mergedSettings));

      // Update cloud
      await supabase
        .from(TABLES.SETTINGS)
        .upsert({
          user_id: userId,
          settings: mergedSettings,
          updated_at: new Date().toISOString(),
        });

      return mergedSettings;
    } catch (error) {
      console.error('Settings sync failed:', error);
      return null;
    }
  }

  /**
   * Sync notes
   */
  async syncNotes(userId) {
    try {
      const localNotes = JSON.parse(localStorage.getItem('adhd_quest_captures') || '[]');

      const { data: cloudNotes, error } = await supabase
        .from(TABLES.NOTES)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mergedNotes = this.mergeByTimestamp(localNotes, cloudNotes || [], 'timestamp');

      localStorage.setItem('adhd_quest_captures', JSON.stringify(mergedNotes));

      // Upsert to cloud
      for (const note of mergedNotes) {
        const cloudNote = cloudNotes?.find(n => n.id === note.id);

        if (!cloudNote) {
          await supabase.from(TABLES.NOTES).insert({
            ...note,
            user_id: userId,
            synced_at: new Date().toISOString(),
          });
        }
      }

      return mergedNotes;
    } catch (error) {
      console.error('Notes sync failed:', error);
      return null;
    }
  }

  /**
   * Sync drawings
   */
  async syncDrawings(userId) {
    try {
      const localDrawings = JSON.parse(localStorage.getItem('adhd_quest_drawings') || '[]');

      const { data: cloudDrawings, error } = await supabase
        .from(TABLES.DRAWINGS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mergedDrawings = this.mergeByTimestamp(localDrawings, cloudDrawings || [], 'timestamp');

      localStorage.setItem('adhd_quest_drawings', JSON.stringify(mergedDrawings));

      // Upsert to cloud (drawings might be large, consider compression)
      for (const drawing of mergedDrawings) {
        const cloudDrawing = cloudDrawings?.find(d => d.id === drawing.id);

        if (!cloudDrawing) {
          await supabase.from(TABLES.DRAWINGS).insert({
            ...drawing,
            user_id: userId,
            synced_at: new Date().toISOString(),
          });
        }
      }

      return mergedDrawings;
    } catch (error) {
      console.error('Drawings sync failed:', error);
      return null;
    }
  }

  /**
   * Sync pomodoro sessions
   */
  async syncPomodoroSessions(userId) {
    try {
      const localSessions = JSON.parse(localStorage.getItem('adhd_quest_pomodoro_sessions') || '{"focusSessions":0,"breakSessions":0}');

      const { data: cloudSessions, error } = await supabase
        .from(TABLES.POMODORO_SESSIONS)
        .select('*')
        .eq('user_id', userId)
        .order('session_date', { ascending: false });

      if (error) throw error;

      // Aggregate cloud sessions
      const totalFocus = cloudSessions?.reduce((sum, s) => sum + (s.focus_sessions || 0), 0) || 0;
      const totalBreak = cloudSessions?.reduce((sum, s) => sum + (s.break_sessions || 0), 0) || 0;

      const mergedSessions = {
        focusSessions: Math.max(localSessions.focusSessions || 0, totalFocus),
        breakSessions: Math.max(localSessions.breakSessions || 0, totalBreak),
      };

      localStorage.setItem('adhd_quest_pomodoro_sessions', JSON.stringify(mergedSessions));

      return mergedSessions;
    } catch (error) {
      console.error('Pomodoro sessions sync failed:', error);
      return null;
    }
  }

  /**
   * Sync time trainer data
   */
  async syncTimeTrainerData(userId) {
    try {
      const localResults = JSON.parse(localStorage.getItem('adhd_quest_time_trainer_results') || '[]');
      const localStats = JSON.parse(localStorage.getItem('adhd_quest_time_trainer_stats') || '{}');

      const { data: cloudResults, error } = await supabase
        .from(TABLES.TIME_TRAINER_RESULTS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mergedResults = this.mergeByTimestamp(localResults, cloudResults || [], 'timestamp');

      localStorage.setItem('adhd_quest_time_trainer_results', JSON.stringify(mergedResults));

      // Recalculate stats
      const stats = this.calculateTimeTrainerStats(mergedResults);
      localStorage.setItem('adhd_quest_time_trainer_stats', JSON.stringify(stats));

      return { results: mergedResults, stats };
    } catch (error) {
      console.error('Time trainer sync failed:', error);
      return null;
    }
  }

  /**
   * Sync streaks
   */
  async syncStreaks(userId) {
    try {
      const { data: cloudStreaks, error } = await supabase
        .from(TABLES.STREAKS)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const localStreak = JSON.parse(localStorage.getItem('adhd_quest_streak') || '{"current":0,"longest":0}');

      const mergedStreak = {
        current: Math.max(localStreak.current || 0, cloudStreaks?.current_streak || 0),
        longest: Math.max(localStreak.longest || 0, cloudStreaks?.longest_streak || 0),
        lastActivity: cloudStreaks?.last_activity_date || new Date().toISOString(),
      };

      localStorage.setItem('adhd_quest_streak', JSON.stringify(mergedStreak));

      // Update cloud
      await supabase
        .from(TABLES.STREAKS)
        .upsert({
          user_id: userId,
          current_streak: mergedStreak.current,
          longest_streak: mergedStreak.longest,
          last_activity_date: mergedStreak.lastActivity,
          updated_at: new Date().toISOString(),
        });

      return mergedStreak;
    } catch (error) {
      console.error('Streaks sync failed:', error);
      return null;
    }
  }

  /**
   * Sync statistics
   */
  async syncStatistics(userId) {
    try {
      const { data: cloudStats, error } = await supabase
        .from(TABLES.STATISTICS)
        .select('*')
        .eq('user_id', userId)
        .order('stat_date', { ascending: false })
        .limit(90); // Last 90 days

      if (error) throw error;

      localStorage.setItem('adhd_quest_statistics', JSON.stringify(cloudStats || []));

      return cloudStats;
    } catch (error) {
      console.error('Statistics sync failed:', error);
      return null;
    }
  }

  /**
   * Queue a change for later sync (offline support)
   */
  async queueChange(dataType, operation, data) {
    this.pendingChanges.push({
      dataType,
      operation,
      data,
      timestamp: new Date().toISOString(),
    });

    await this.syncQueue.setItem('pending_changes', this.pendingChanges);
  }

  /**
   * Process pending changes
   */
  async processPendingChanges(userId) {
    if (this.pendingChanges.length === 0) return;

    try {
      for (const change of this.pendingChanges) {
        // Process each pending change
        await this.applyChange(userId, change);
      }

      // Clear pending changes
      this.pendingChanges = [];
      await this.syncQueue.setItem('pending_changes', []);
    } catch (error) {
      console.error('Processing pending changes failed:', error);
    }
  }

  /**
   * Apply a queued change
   */
  async applyChange(userId, change) {
    try {
      switch (change.dataType) {
        case 'task':
          await supabase.from(TABLES.TASKS).upsert({
            ...change.data,
            user_id: userId,
          });
          break;
        case 'achievement':
          await supabase.from(TABLES.USER_ACHIEVEMENTS).insert({
            user_id: userId,
            ...change.data,
          });
          break;
        // Add more cases as needed
        default:
          console.warn('Unknown change type:', change.dataType);
      }
    } catch (error) {
      console.error('Apply change failed:', error);
    }
  }

  /**
   * Merge tasks with conflict resolution
   */
  mergeTasks(localTasks, cloudTasks) {
    const taskMap = new Map();

    // Add cloud tasks first
    cloudTasks.forEach(task => {
      taskMap.set(task.id, task);
    });

    // Add/update with local tasks
    localTasks.forEach(task => {
      const existing = taskMap.get(task.id);
      if (!existing || new Date(task.updated_at || task.createdAt) > new Date(existing.updated_at)) {
        taskMap.set(task.id, task);
      }
    });

    return Array.from(taskMap.values());
  }

  /**
   * Merge arrays by timestamp
   */
  mergeByTimestamp(localArray, cloudArray, timestampField) {
    const itemMap = new Map();

    cloudArray.forEach(item => {
      itemMap.set(item.id, item);
    });

    localArray.forEach(item => {
      const existing = itemMap.get(item.id);
      if (!existing || new Date(item[timestampField]) > new Date(existing[timestampField])) {
        itemMap.set(item.id, item);
      }
    });

    return Array.from(itemMap.values());
  }

  /**
   * Calculate time trainer stats
   */
  calculateTimeTrainerStats(results) {
    if (!results || results.length === 0) {
      return {
        totalAttempts: 0,
        averageAccuracy: 0,
        bestAccuracy: 0,
      };
    }

    const totalAttempts = results.length;
    const totalAccuracy = results.reduce((sum, r) => sum + (r.accuracy || 0), 0);
    const averageAccuracy = totalAccuracy / totalAttempts;
    const bestAccuracy = Math.max(...results.map(r => r.accuracy || 0));

    return {
      totalAttempts,
      averageAccuracy,
      bestAccuracy,
    };
  }

  /**
   * Handle online event
   */
  async handleOnline() {
    console.log('Connection restored, syncing...');
    this.offlineMode = false;
    await this.performFullSync();
    this.startAutoSync();
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    console.log('Connection lost, entering offline mode');
    this.offlineMode = true;
    this.stopAutoSync();
  }

  /**
   * Start automatic sync
   */
  startAutoSync(intervalMinutes = 5) {
    this.stopAutoSync();
    this.syncInterval = setInterval(() => {
      this.performFullSync();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Force sync now
   */
  async forceSyncNow() {
    await this.performFullSync();
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      lastSync: this.lastSyncTimestamp,
      inProgress: this.syncInProgress,
      offlineMode: this.offlineMode,
      pendingChanges: this.pendingChanges.length,
    };
  }

  /**
   * Clear local data
   */
  async clearLocalData() {
    await this.localStore.clear();
    await this.syncQueue.clear();
    this.pendingChanges = [];
    this.lastSyncTimestamp = null;
  }
}

// Export singleton instance
const cloudSyncService = new CloudSyncService();
export default cloudSyncService;
