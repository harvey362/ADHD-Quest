/**
 * Export Service
 *
 * Handles exporting user data in multiple formats:
 * - JSON (raw data)
 * - CSV (flat tables)
 * - iCalendar (calendar events)
 */

import Papa from 'papaparse';
import ical from 'ical-generator';
import { format } from 'date-fns';

class ExportService {
  /**
   * Export all data as JSON
   */
  exportAsJSON() {
    const data = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      tasks: this.getTasks(),
      completedQuests: this.getCompletedQuests(),
      profile: this.getProfile(),
      settings: this.getSettings(),
      notes: this.getNotes(),
      drawings: this.getDrawings(),
      pomodoroSessions: this.getPomodoroSessions(),
      timeTrainerResults: this.getTimeTrainerResults(),
      achievements: this.getAchievements(),
      streak: this.getStreak(),
    };

    const jsonString = JSON.stringify(data, null, 2);
    this.downloadFile(jsonString, 'adhd-quest-export.json', 'application/json');

    return data;
  }

  /**
   * Export tasks as CSV
   */
  exportTasksAsCSV() {
    const tasks = this.getTasks();
    const completedQuests = this.getCompletedQuests();

    const allTasks = [
      ...tasks.map(t => ({
        id: t.id,
        title: t.title,
        status: 'active',
        createdAt: t.createdAt,
        completedAt: '',
        subtaskCount: t.subtasks?.length || 0,
        xpEarned: 0,
        totalTime: 0,
      })),
      ...completedQuests.map(q => ({
        id: q.id,
        title: q.title,
        status: 'completed',
        createdAt: q.createdAt,
        completedAt: q.completedAt,
        subtaskCount: q.subtasks?.length || 0,
        xpEarned: q.xpEarned || 0,
        totalTime: q.totalTime || 0,
      })),
    ];

    const csv = Papa.unparse(allTasks);
    this.downloadFile(csv, 'adhd-quest-tasks.csv', 'text/csv');

    return csv;
  }

  /**
   * Export subtasks as CSV
   */
  exportSubtasksAsCSV() {
    const tasks = this.getTasks();
    const completedQuests = this.getCompletedQuests();

    const allSubtasks = [];

    tasks.forEach(task => {
      task.subtasks?.forEach(subtask => {
        allSubtasks.push({
          taskId: task.id,
          taskTitle: task.title,
          subtaskText: subtask.text,
          completed: subtask.completed,
          completedAt: subtask.completedAt || '',
          xp: 10,
        });
      });
    });

    completedQuests.forEach(quest => {
      quest.subtasks?.forEach(subtask => {
        allSubtasks.push({
          taskId: quest.id,
          taskTitle: quest.title,
          subtaskText: subtask.text,
          completed: true,
          completedAt: subtask.completedAt || quest.completedAt,
          xp: 10,
        });
      });
    });

    const csv = Papa.unparse(allSubtasks);
    this.downloadFile(csv, 'adhd-quest-subtasks.csv', 'text/csv');

    return csv;
  }

  /**
   * Export notes as CSV
   */
  exportNotesAsCSV() {
    const notes = this.getNotes();

    const notesData = notes.map(note => ({
      id: note.id,
      text: note.text,
      tags: note.tags?.join(', ') || '',
      timestamp: note.timestamp,
    }));

    const csv = Papa.unparse(notesData);
    this.downloadFile(csv, 'adhd-quest-notes.csv', 'text/csv');

    return csv;
  }

  /**
   * Export as iCalendar
   */
  exportAsICalendar() {
    const calendar = ical({ name: 'ADHD Quest Tasks' });

    // Export active tasks with due dates
    const tasks = this.getTasks();
    tasks.forEach(task => {
      if (task.dueDate) {
        calendar.createEvent({
          start: new Date(task.dueDate),
          end: new Date(task.dueDate),
          summary: task.title,
          description: `Subtasks: ${task.subtasks?.length || 0}\nCreated: ${task.createdAt}`,
          allDay: true,
        });
      }
    });

    // Export completed quests
    const completedQuests = this.getCompletedQuests();
    completedQuests.forEach(quest => {
      calendar.createEvent({
        start: new Date(quest.completedAt),
        end: new Date(quest.completedAt),
        summary: `✅ ${quest.title}`,
        description: `XP Earned: ${quest.xpEarned}\nTime: ${this.formatTime(quest.totalTime)}\nSubtasks: ${quest.subtasks?.length || 0}`,
        allDay: true,
      });
    });

    // Export pomodoro sessions
    const pomodoroSessions = this.getPomodoroSessions();
    pomodoroSessions.forEach(session => {
      if (session.timestamp) {
        const start = new Date(session.timestamp);
        const end = new Date(start.getTime() + (session.type === 'focus' ? 25 : 5) * 60 * 1000);

        calendar.createEvent({
          start,
          end,
          summary: session.type === 'focus' ? '🍅 Focus Session' : '☕ Break',
          description: `Pomodoro ${session.type} session`,
        });
      }
    });

    const icalString = calendar.toString();
    this.downloadFile(icalString, 'adhd-quest-calendar.ics', 'text/calendar');

    return icalString;
  }

  /**
   * Export statistics as CSV
   */
  exportStatisticsAsCSV(startDate, endDate) {
    // This would require importing statsAggregator, but to avoid circular deps,
    // we'll keep it simple and export raw completion data

    const completedQuests = this.getCompletedQuests();

    const filtered = completedQuests.filter(q => {
      const date = new Date(q.completedAt);
      return (!startDate || date >= new Date(startDate)) &&
             (!endDate || date <= new Date(endDate));
    });

    const statsData = filtered.map(quest => ({
      date: format(new Date(quest.completedAt), 'yyyy-MM-dd'),
      time: format(new Date(quest.completedAt), 'HH:mm:ss'),
      title: quest.title,
      xpEarned: quest.xpEarned || 0,
      subtasks: quest.subtasks?.length || 0,
      totalTime: quest.totalTime || 0,
    }));

    const csv = Papa.unparse(statsData);
    this.downloadFile(csv, 'adhd-quest-statistics.csv', 'text/csv');

    return csv;
  }

  /**
   * Export achievements as CSV
   */
  exportAchievementsAsCSV() {
    const achievements = this.getAchievements();

    const achievementsData = achievements.map(ach => ({
      id: ach.id,
      name: ach.name,
      category: ach.category,
      unlockedAt: ach.unlockedAt || '',
      isUnlocked: Boolean(ach.unlockedAt),
    }));

    const csv = Papa.unparse(achievementsData);
    this.downloadFile(csv, 'adhd-quest-achievements.csv', 'text/csv');

    return csv;
  }

  /**
   * Export full backup (all formats in a ZIP)
   */
  async exportFullBackup() {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Add JSON export
    const jsonData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      tasks: this.getTasks(),
      completedQuests: this.getCompletedQuests(),
      profile: this.getProfile(),
      settings: this.getSettings(),
      notes: this.getNotes(),
      drawings: this.getDrawings(),
      pomodoroSessions: this.getPomodoroSessions(),
      timeTrainerResults: this.getTimeTrainerResults(),
      achievements: this.getAchievements(),
      streak: this.getStreak(),
    };
    zip.file('backup.json', JSON.stringify(jsonData, null, 2));

    // Add CSV exports
    const tasksCSV = Papa.unparse(this.getCompletedQuests().map(q => ({
      id: q.id,
      title: q.title,
      completedAt: q.completedAt,
      xpEarned: q.xpEarned || 0,
      subtaskCount: q.subtasks?.length || 0,
    })));
    zip.file('tasks.csv', tasksCSV);

    const notesCSV = Papa.unparse(this.getNotes().map(n => ({
      id: n.id,
      text: n.text,
      tags: n.tags?.join(', ') || '',
      timestamp: n.timestamp,
    })));
    zip.file('notes.csv', notesCSV);

    // Generate ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    this.downloadBlob(blob, 'adhd-quest-backup.zip', 'application/zip');

    return blob;
  }

  /**
   * Download file helper
   */
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    this.downloadBlob(blob, filename, mimeType);
  }

  /**
   * Download blob helper
   */
  downloadBlob(blob, filename, mimeType) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Format time helper
   */
  formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Data loading helpers
  getTasks() {
    try {
      return JSON.parse(localStorage.getItem('adhd_quest_tasks') || '[]');
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  }

  getCompletedQuests() {
    try {
      return JSON.parse(localStorage.getItem('adhd_quest_completed') || '[]');
    } catch (error) {
      console.error('Error loading completed quests:', error);
      return [];
    }
  }

  getProfile() {
    try {
      return JSON.parse(localStorage.getItem('adhd_quest_profile') || '{}');
    } catch (error) {
      console.error('Error loading profile:', error);
      return {};
    }
  }

  getSettings() {
    try {
      return JSON.parse(localStorage.getItem('adhd_quest_settings') || '{}');
    } catch (error) {
      console.error('Error loading settings:', error);
      return {};
    }
  }

  getNotes() {
    try {
      return JSON.parse(localStorage.getItem('adhd_quest_captures') || '[]');
    } catch (error) {
      console.error('Error loading notes:', error);
      return [];
    }
  }

  getDrawings() {
    try {
      return JSON.parse(localStorage.getItem('adhd_quest_drawings') || '[]');
    } catch (error) {
      console.error('Error loading drawings:', error);
      return [];
    }
  }

  getPomodoroSessions() {
    try {
      // Note: Current implementation stores summary, not individual sessions
      // This would need to be updated to track individual sessions
      const summary = JSON.parse(localStorage.getItem('adhd_quest_pomodoro_sessions') || '{"focusSessions":0,"breakSessions":0}');
      return [];
    } catch (error) {
      console.error('Error loading pomodoro sessions:', error);
      return [];
    }
  }

  getTimeTrainerResults() {
    try {
      return JSON.parse(localStorage.getItem('adhd_quest_time_trainer_results') || '[]');
    } catch (error) {
      console.error('Error loading time trainer results:', error);
      return [];
    }
  }

  getAchievements() {
    try {
      return JSON.parse(localStorage.getItem('adhd_quest_achievements') || '[]');
    } catch (error) {
      console.error('Error loading achievements:', error);
      return [];
    }
  }

  getStreak() {
    try {
      return JSON.parse(localStorage.getItem('adhd_quest_streak') || '{"current":0,"longest":0}');
    } catch (error) {
      console.error('Error loading streak:', error);
      return { current: 0, longest: 0 };
    }
  }

  /**
   * Import from JSON
   */
  async importFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      // Validate version
      if (data.version !== '1.0.0') {
        throw new Error('Unsupported export version');
      }

      // Merge imported data with existing data
      if (data.tasks) {
        const existing = this.getTasks();
        const merged = this.mergeArrays(existing, data.tasks, 'id');
        localStorage.setItem('adhd_quest_tasks', JSON.stringify(merged));
      }

      if (data.completedQuests) {
        const existing = this.getCompletedQuests();
        const merged = this.mergeArrays(existing, data.completedQuests, 'id');
        localStorage.setItem('adhd_quest_completed', JSON.stringify(merged));
      }

      if (data.notes) {
        const existing = this.getNotes();
        const merged = this.mergeArrays(existing, data.notes, 'id');
        localStorage.setItem('adhd_quest_captures', JSON.stringify(merged));
      }

      // Import other data types...

      return { success: true, message: 'Data imported successfully' };
    } catch (error) {
      console.error('Import error:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Merge arrays by unique key
   */
  mergeArrays(existing, imported, key) {
    const map = new Map();

    existing.forEach(item => map.set(item[key], item));
    imported.forEach(item => map.set(item[key], item));

    return Array.from(map.values());
  }
}

// Singleton instance
const exportService = new ExportService();

export default exportService;
export const exportAsJSON = () => exportService.exportAsJSON();
export const exportTasksAsCSV = () => exportService.exportTasksAsCSV();
export const exportNotesAsCSV = () => exportService.exportNotesAsCSV();
export const exportAsICalendar = () => exportService.exportAsICalendar();
export const exportFullBackup = () => exportService.exportFullBackup();
export const importFromJSON = (jsonString) => exportService.importFromJSON(jsonString);
