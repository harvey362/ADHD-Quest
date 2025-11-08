/**
 * Achievements & Badges System
 */

export const ACHIEVEMENTS = [
  // Speed Badges
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete a task in under 5 minutes',
    icon: '⚡',
    category: 'speed',
    requirement: { type: 'speedrun', value: 300000 } // 5 min in ms
  },
  {
    id: 'flash',
    name: 'Flash',
    description: 'Complete 10 tasks in one day',
    icon: '🏃',
    category: 'speed',
    requirement: { type: 'tasksInDay', value: 10 }
  },
  {
    id: 'speedrunner',
    name: 'Speedrunner',
    description: 'Complete 5 speedrun tasks',
    icon: '💨',
    category: 'speed',
    requirement: { type: 'speedrunCount', value: 5 }
  },
  
  // Completion Badges
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Complete your first task',
    icon: '🎯',
    category: 'completion',
    requirement: { type: 'tasksCompleted', value: 1 }
  },
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Complete 5 tasks',
    icon: '🎊',
    category: 'completion',
    requirement: { type: 'tasksCompleted', value: 5 }
  },
  {
    id: 'on-a-roll',
    name: 'On A Roll',
    description: 'Complete 25 tasks',
    icon: '🔥',
    category: 'completion',
    requirement: { type: 'tasksCompleted', value: 25 }
  },
  {
    id: 'quest-master',
    name: 'Quest Master',
    description: 'Complete 50 tasks',
    icon: '👑',
    category: 'completion',
    requirement: { type: 'tasksCompleted', value: 50 }
  },
  {
    id: 'century',
    name: 'Century',
    description: 'Complete 100 subtasks',
    icon: '💯',
    category: 'completion',
    requirement: { type: 'subtasksCompleted', value: 100 }
  },
  {
    id: 'legendary',
    name: 'Legendary',
    description: 'Complete 100 tasks',
    icon: '🏆',
    category: 'completion',
    requirement: { type: 'tasksCompleted', value: 100 }
  },
  
  // Level Badges
  {
    id: 'level-10',
    name: 'Rising Star',
    description: 'Reach level 10',
    icon: '🌟',
    category: 'mastery',
    requirement: { type: 'level', value: 10 }
  },
  {
    id: 'level-25',
    name: 'Power Player',
    description: 'Reach level 25',
    icon: '⚡',
    category: 'mastery',
    requirement: { type: 'level', value: 25 }
  },
  {
    id: 'level-50',
    name: 'Scholar',
    description: 'Reach level 50',
    icon: '🎓',
    category: 'mastery',
    requirement: { type: 'level', value: 50 }
  },
  {
    id: 'level-75',
    name: 'Grandmaster',
    description: 'Reach level 75',
    icon: '💎',
    category: 'mastery',
    requirement: { type: 'level', value: 75 }
  },
  {
    id: 'level-100',
    name: 'God Mode',
    description: 'Reach level 100',
    icon: '👑',
    category: 'mastery',
    requirement: { type: 'level', value: 100 }
  },
  
  // Productivity Badges
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete a task before 9 AM',
    icon: '🌅',
    category: 'productivity',
    requirement: { type: 'earlyCompletion', value: 9 }
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete a task after 10 PM',
    icon: '🦉',
    category: 'productivity',
    requirement: { type: 'lateCompletion', value: 22 }
  },
  {
    id: 'bookworm',
    name: 'Bookworm',
    description: 'Create 100 tasks',
    icon: '📚',
    category: 'productivity',
    requirement: { type: 'tasksCreated', value: 100 }
  }
];

/**
 * Check if achievement is unlocked
 */
export const checkAchievement = (achievement, userData) => {
  const { requirement } = achievement;
  
  switch (requirement.type) {
    case 'tasksCompleted':
      return (userData.completedQuests?.length || 0) >= requirement.value;
    
    case 'subtasksCompleted':
      return (userData.subtasksCompleted || 0) >= requirement.value;
    
    case 'level':
      return (userData.level || 1) >= requirement.value;
    
    case 'speedrunCount':
      return (userData.completedQuests?.filter(q => q.wasSpeedrun).length || 0) >= requirement.value;
    
    case 'speedrun':
      return userData.completedQuests?.some(q => q.totalTime && q.totalTime <= requirement.value) || false;
    
    case 'tasksInDay':
      // Check if any day has 10+ completions
      const today = new Date().toDateString();
      const todayCompletions = userData.completedQuests?.filter(q => 
        new Date(q.completedAt).toDateString() === today
      ).length || 0;
      return todayCompletions >= requirement.value;
    
    case 'earlyCompletion':
      return userData.completedQuests?.some(q => {
        const hour = new Date(q.completedAt).getHours();
        return hour < requirement.value;
      }) || false;
    
    case 'lateCompletion':
      return userData.completedQuests?.some(q => {
        const hour = new Date(q.completedAt).getHours();
        return hour >= requirement.value;
      }) || false;
    
    case 'tasksCreated':
      return (userData.totalTasksCreated || 0) >= requirement.value;
    
    default:
      return false;
  }
};

/**
 * Get all unlocked achievements
 */
export const getUnlockedAchievements = (userData) => {
  return ACHIEVEMENTS.filter(achievement => 
    checkAchievement(achievement, userData)
  );
};

/**
 * Get newly unlocked achievements (not in previous unlocked list)
 */
export const getNewlyUnlocked = (userData, previouslyUnlocked = []) => {
  const currentUnlocked = getUnlockedAchievements(userData);
  return currentUnlocked.filter(achievement => 
    !previouslyUnlocked.some(prev => prev.id === achievement.id)
  );
};

/**
 * Get progress toward an achievement
 */
export const getAchievementProgress = (achievement, userData) => {
  const { requirement } = achievement;
  let current = 0;
  
  switch (requirement.type) {
    case 'tasksCompleted':
      current = userData.completedQuests?.length || 0;
      break;
    case 'subtasksCompleted':
      current = userData.subtasksCompleted || 0;
      break;
    case 'level':
      current = userData.level || 1;
      break;
    case 'speedrunCount':
      current = userData.completedQuests?.filter(q => q.wasSpeedrun).length || 0;
      break;
    case 'tasksCreated':
      current = userData.totalTasksCreated || 0;
      break;
    default:
      current = 0;
  }
  
  const progress = Math.min((current / requirement.value) * 100, 100);
  
  return {
    current,
    required: requirement.value,
    progress: Math.round(progress),
    unlocked: checkAchievement(achievement, userData)
  };
};

/**
 * Get achievements by category
 */
export const getAchievementsByCategory = (category) => {
  return ACHIEVEMENTS.filter(a => a.category === category);
};

export default {
  ACHIEVEMENTS,
  checkAchievement,
  getUnlockedAchievements,
  getNewlyUnlocked,
  getAchievementProgress,
  getAchievementsByCategory
};
