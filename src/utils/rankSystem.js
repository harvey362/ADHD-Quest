/**
 * Rank System - Titles every 5 levels
 */

export const RANKS = [
  { level: 1, name: 'NOVICE', icon: '🌱', minLevel: 1, maxLevel: 5 },
  { level: 6, name: 'APPRENTICE', icon: '⚔️', minLevel: 6, maxLevel: 10 },
  { level: 11, name: 'WARRIOR', icon: '🛡️', minLevel: 11, maxLevel: 15 },
  { level: 16, name: 'CHAMPION', icon: '👑', minLevel: 16, maxLevel: 20 },
  { level: 21, name: 'HERO', icon: '⚡', minLevel: 21, maxLevel: 25 },
  { level: 26, name: 'MASTER', icon: '🌟', minLevel: 26, maxLevel: 30 },
  { level: 31, name: 'LEGEND', icon: '💎', minLevel: 31, maxLevel: 35 },
  { level: 36, name: 'ELITE', icon: '🔥', minLevel: 36, maxLevel: 40 },
  { level: 41, name: 'ACE', icon: '⭐', minLevel: 41, maxLevel: 45 },
  { level: 46, name: 'CONQUEROR', icon: '🏆', minLevel: 46, maxLevel: 50 },
  { level: 51, name: 'MYTHIC', icon: '💫', minLevel: 51, maxLevel: 60 },
  { level: 61, name: 'EPIC', icon: '🌈', minLevel: 61, maxLevel: 70 },
  { level: 71, name: 'SUPREME', icon: '✨', minLevel: 71, maxLevel: 80 },
  { level: 81, name: 'GRANDMASTER', icon: '🎖️', minLevel: 81, maxLevel: 90 },
  { level: 91, name: 'GOD MODE', icon: '👑', minLevel: 91, maxLevel: 100 }
];

/**
 * Get rank info for a given level
 */
export const getRankForLevel = (level) => {
  if (level < 1) return RANKS[0];
  if (level > 100) return RANKS[RANKS.length - 1];
  
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (level >= RANKS[i].minLevel) {
      return RANKS[i];
    }
  }
  
  return RANKS[0];
};

/**
 * Get next rank info
 */
export const getNextRank = (level) => {
  const currentRank = getRankForLevel(level);
  const currentIndex = RANKS.findIndex(r => r.name === currentRank.name);
  
  if (currentIndex < RANKS.length - 1) {
    return RANKS[currentIndex + 1];
  }
  
  return null; // Max rank
};

/**
 * Calculate progress to next rank
 */
export const getRankProgress = (level) => {
  const currentRank = getRankForLevel(level);
  const levelsInRank = currentRank.maxLevel - currentRank.minLevel + 1;
  const levelInCurrentRank = level - currentRank.minLevel;
  const progress = (levelInCurrentRank / levelsInRank) * 100;
  
  return {
    currentRank,
    nextRank: getNextRank(level),
    levelsToNextRank: currentRank.maxLevel - level + 1,
    progressPercent: Math.round(progress)
  };
};

export default {
  RANKS,
  getRankForLevel,
  getNextRank,
  getRankProgress
};
