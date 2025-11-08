/**
 * Enhanced Achievements Component
 *
 * Displays achievements with:
 * - Progress tracking
 * - Unlock animations
 * - Category filtering
 * - Detailed descriptions
 * - Notification integration
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAchievementsByCategory,
  checkAchievement,
  getAchievementProgress,
} from '../utils/achievementSystem';
import notificationService from '../services/notificationService';
import '../styles/achievements.css';

function AchievementsEnhanced({ profile, completedQuests, onBack }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [achievements, setAchievements] = useState([]);
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState(null);

  const categories = ['all', 'speed', 'completion', 'mastery', 'productivity', 'special'];

  useEffect(() => {
    loadAchievements();
  }, [selectedCategory, profile, completedQuests]);

  const loadAchievements = () => {
    const unlocked = JSON.parse(localStorage.getItem('adhd_quest_achievements') || '[]');
    const unlockedIdsList = unlocked.map(a => a.id);

    setUnlockedIds(unlockedIdsList);

    const allAchievements = selectedCategory === 'all'
      ? Object.values(require('../utils/achievementSystem').achievements).flat()
      : getAchievementsByCategory(selectedCategory);

    // Prepare user data for checking
    const userData = {
      profile: profile || {},
      completedQuests: completedQuests || [],
      totalXP: profile?.totalXP || 0,
      level: profile?.level || 1,
      tasksCompleted: profile?.tasksCompleted || 0,
      subtasksCompleted: profile?.subtasksCompleted || 0,
    };

    // Add progress to each achievement
    const achievementsWithProgress = allAchievements.map(achievement => ({
      ...achievement,
      isUnlocked: unlockedIdsList.includes(achievement.id),
      progress: getAchievementProgress(achievement, userData),
    }));

    setAchievements(achievementsWithProgress);
  };

  const handleAchievementCheck = (achievement) => {
    const userData = {
      profile: profile || {},
      completedQuests: completedQuests || [],
      totalXP: profile?.totalXP || 0,
      level: profile?.level || 1,
      tasksCompleted: profile?.tasksCompleted || 0,
      subtasksCompleted: profile?.subtasksCompleted || 0,
    };

    const isUnlocked = checkAchievement(achievement, userData);

    if (isUnlocked && !unlockedIds.includes(achievement.id)) {
      // Newly unlocked!
      unlockAchievement(achievement);
    }
  };

  const unlockAchievement = (achievement) => {
    const unlocked = JSON.parse(localStorage.getItem('adhd_quest_achievements') || '[]');

    const newAchievement = {
      ...achievement,
      unlockedAt: new Date().toISOString(),
    };

    unlocked.push(newAchievement);
    localStorage.setItem('adhd_quest_achievements', JSON.stringify(unlocked));

    setUnlockedIds([...unlockedIds, achievement.id]);
    setNewlyUnlocked(achievement);

    // Show notification
    notificationService.showAchievementUnlocked(achievement);

    // Hide animation after 5 seconds
    setTimeout(() => {
      setNewlyUnlocked(null);
    }, 5000);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      all: '🏆',
      speed: '⚡',
      completion: '✅',
      mastery: '👑',
      productivity: '📊',
      special: '⭐',
    };
    return icons[category] || '🏆';
  };

  const getProgressBarColor = (progress) => {
    if (progress >= 100) return 'var(--color-green)';
    if (progress >= 75) return '#00cc00';
    if (progress >= 50) return '#00aa00';
    if (progress >= 25) return '#008800';
    return '#006600';
  };

  return (
    <div className="achievements-enhanced">
      <div className="achievements-header">
        <button className="back-button" onClick={onBack}>
          ← BACK
        </button>
        <h1 className="achievements-title">🏆 ACHIEVEMENTS</h1>
      </div>

      {/* Unlock Animation */}
      <AnimatePresence>
        {newlyUnlocked && (
          <motion.div
            className="achievement-unlock-animation"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <motion.div
              className="unlock-content"
              animate={{
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              <div className="unlock-icon">{newlyUnlocked.icon}</div>
              <div className="unlock-title">ACHIEVEMENT UNLOCKED!</div>
              <div className="unlock-name">{newlyUnlocked.name}</div>
              <div className="unlock-description">{newlyUnlocked.description}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map(category => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {getCategoryIcon(category)} {category.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Statistics */}
      <div className="achievement-stats">
        <div className="stat-item">
          <span className="stat-label">Unlocked:</span>
          <span className="stat-value">
            {unlockedIds.length} / {achievements.length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Completion:</span>
          <span className="stat-value">
            {achievements.length > 0
              ? Math.round((unlockedIds.length / achievements.length) * 100)
              : 0}%
          </span>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="achievements-grid">
        {achievements.map(achievement => (
          <motion.div
            key={achievement.id}
            className={`achievement-card ${achievement.isUnlocked ? 'unlocked' : 'locked'}`}
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px var(--color-green)' }}
            transition={{ duration: 0.2 }}
          >
            <div className="achievement-icon">
              {achievement.isUnlocked ? achievement.icon : '🔒'}
            </div>

            <div className="achievement-info">
              <div className="achievement-name">
                {achievement.isUnlocked ? achievement.name : '???'}
              </div>

              <div className="achievement-description">
                {achievement.isUnlocked
                  ? achievement.description
                  : 'Keep playing to unlock this achievement!'}
              </div>

              <div className="achievement-category">
                {getCategoryIcon(achievement.category)} {achievement.category}
              </div>

              {/* Progress Bar */}
              {!achievement.isUnlocked && (
                <div className="achievement-progress">
                  <div className="progress-label">
                    Progress: {Math.round(achievement.progress)}%
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${achievement.progress}%` }}
                      transition={{ duration: 0.5 }}
                      style={{
                        backgroundColor: getProgressBarColor(achievement.progress),
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Unlock Date */}
              {achievement.isUnlocked && achievement.unlockedAt && (
                <div className="achievement-unlocked-date">
                  Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {achievements.length === 0 && (
        <div className="no-achievements">
          <p>No achievements in this category yet!</p>
        </div>
      )}
    </div>
  );
}

export default AchievementsEnhanced;
