/**
 * XP and Leveling System
 * Handles all calculations for experience points and level progression
 */

// Constants
export const XP_PER_SUBTASK = 10; // FR-20: Fixed XP amount per subtask
export const MAX_LEVEL = 100; // FR-22: Level system ranges 1-100

/**
 * Calculate XP required to reach a specific level
 * Using linear scaling: 100 * level
 * FR-23: XP required per level increases progressively
 */
export const getXPRequiredForLevel = (level) => {
  if (level <= 1) return 0;
  return 100 * level;
};

/**
 * Calculate total XP required from level 1 to target level
 */
export const getTotalXPForLevel = (level) => {
  if (level <= 1) return 0;
  
  let totalXP = 0;
  for (let i = 2; i <= level; i++) {
    totalXP += getXPRequiredForLevel(i);
  }
  return totalXP;
};

/**
 * Get current level and progress from total XP
 * Returns: { level, currentLevelXP, xpToNextLevel, progressPercent }
 */
export const getLevelFromXP = (totalXP) => {
  if (totalXP <= 0) {
    return {
      level: 1,
      currentLevelXP: 0,
      xpToNextLevel: getXPRequiredForLevel(2),
      progressPercent: 0
    };
  }
  
  let level = 1;
  let xpRemaining = totalXP;
  
  // Find current level
  while (level < MAX_LEVEL && xpRemaining >= getXPRequiredForLevel(level + 1)) {
    xpRemaining -= getXPRequiredForLevel(level + 1);
    level++;
  }
  
  const xpToNextLevel = level < MAX_LEVEL ? getXPRequiredForLevel(level + 1) : 0;
  const progressPercent = xpToNextLevel > 0 ? (xpRemaining / xpToNextLevel) * 100 : 100;
  
  return {
    level,
    currentLevelXP: xpRemaining,
    xpToNextLevel,
    progressPercent: Math.round(progressPercent)
  };
};

/**
 * Award XP and check for level up
 * FR-26: Visual/auditory feedback on subtask completion
 * FR-27: Level-up event triggers celebration
 */
export const awardXP = (currentTotalXP, xpToAdd = XP_PER_SUBTASK) => {
  const oldStats = getLevelFromXP(currentTotalXP);
  const newTotalXP = currentTotalXP + xpToAdd;
  const newStats = getLevelFromXP(newTotalXP);
  
  const leveledUp = newStats.level > oldStats.level;
  
  return {
    newTotalXP,
    xpGained: xpToAdd,
    leveledUp,
    oldLevel: oldStats.level,
    newLevel: newStats.level,
    ...newStats
  };
};

/**
 * Initialize default user profile
 * FR-66: User profile data structure
 */
export const createDefaultProfile = () => {
  return {
    totalXP: 0,
    level: 1,
    currentLevelXP: 0,
    xpToNextLevel: getXPRequiredForLevel(2),
    tasksCompleted: 0,
    subtasksCompleted: 0,
    createdAt: new Date().toISOString()
  };
};

/**
 * Calculate statistics for user profile
 */
export const calculateStats = (tasks) => {
  let totalSubtasks = 0;
  let completedSubtasks = 0;
  let completedTasks = 0;
  
  tasks.forEach(task => {
    totalSubtasks += task.subtasks.length;
    const completed = task.subtasks.filter(st => st.completed).length;
    completedSubtasks += completed;
    
    if (completed === task.subtasks.length && task.subtasks.length > 0) {
      completedTasks++;
    }
  });
  
  return {
    totalSubtasks,
    completedSubtasks,
    completedTasks,
    totalTasks: tasks.length
  };
};

export default {
  XP_PER_SUBTASK,
  MAX_LEVEL,
  getXPRequiredForLevel,
  getTotalXPForLevel,
  getLevelFromXP,
  awardXP,
  createDefaultProfile,
  calculateStats
};
