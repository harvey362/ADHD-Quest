import React, { useState } from 'react';
import { ACHIEVEMENTS, getAchievementProgress } from '../utils/achievementSystem';
import '../styles/badges.css';

const Badges = ({ userData }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = [
    { id: 'all', name: 'ALL', icon: '🏆' },
    { id: 'completion', name: 'COMPLETION', icon: '🎯' },
    { id: 'speed', name: 'SPEED', icon: '⚡' },
    { id: 'mastery', name: 'MASTERY', icon: '🎓' },
    { id: 'productivity', name: 'PRODUCTIVITY', icon: '💪' }
  ];
  
  // Filter achievements by category
  const filteredAchievements = selectedCategory === 'all' 
    ? ACHIEVEMENTS 
    : ACHIEVEMENTS.filter(a => a.category === selectedCategory);
  
  // Get progress for each achievement
  const achievementsWithProgress = filteredAchievements.map(achievement => ({
    ...achievement,
    progress: getAchievementProgress(achievement, userData)
  }));
  
  // Sort: unlocked first, then by progress
  const sortedAchievements = [...achievementsWithProgress].sort((a, b) => {
    if (a.progress.unlocked && !b.progress.unlocked) return -1;
    if (!a.progress.unlocked && b.progress.unlocked) return 1;
    return b.progress.progress - a.progress.progress;
  });
  
  const unlockedCount = achievementsWithProgress.filter(a => a.progress.unlocked).length;
  const totalCount = achievementsWithProgress.length;
  const completionPercent = Math.round((unlockedCount / totalCount) * 100);
  
  return (
    <div className="badges-widget">
      <div className="badges-header">
        <h2>[ ACHIEVEMENTS & BADGES ]</h2>
        <div className="badges-stats">
          <span className="badges-unlocked">{unlockedCount} / {totalCount} Unlocked</span>
          <div className="completion-bar">
            <div className="completion-fill" style={{ width: `${completionPercent}%` }} />
          </div>
          <span className="completion-percent">{completionPercent}%</span>
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="category-filters">
        {categories.map(cat => {
          const catAchievements = cat.id === 'all' 
            ? ACHIEVEMENTS 
            : ACHIEVEMENTS.filter(a => a.category === cat.id);
          const catUnlocked = catAchievements.filter(a => 
            getAchievementProgress(a, userData).unlocked
          ).length;
          
          return (
            <button
              key={cat.id}
              className={`category-filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.icon} {cat.name}
              <span className="category-count">({catUnlocked}/{catAchievements.length})</span>
            </button>
          );
        })}
      </div>
      
      {/* Achievements Grid */}
      <div className="achievements-grid">
        {sortedAchievements.map(achievement => (
          <div 
            key={achievement.id} 
            className={`achievement-card ${achievement.progress.unlocked ? 'unlocked' : 'locked'}`}
          >
            <div className="achievement-icon">
              {achievement.icon}
              {achievement.progress.unlocked && (
                <div className="unlock-badge">✓</div>
              )}
            </div>
            
            <div className="achievement-info">
              <h3 className="achievement-name">{achievement.name}</h3>
              <p className="achievement-description">{achievement.description}</p>
              
              {!achievement.progress.unlocked && (
                <div className="achievement-progress-section">
                  <div className="progress-bar-small">
                    <div 
                      className="progress-fill-small"
                      style={{ width: `${achievement.progress.progress}%` }}
                    />
                  </div>
                  <span className="progress-text-small">
                    {achievement.progress.current} / {achievement.progress.required}
                  </span>
                </div>
              )}
              
              {achievement.progress.unlocked && (
                <div className="achievement-unlocked-badge">
                  🎉 UNLOCKED
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {sortedAchievements.length === 0 && (
        <div className="no-achievements">
          <p>No achievements in this category yet!</p>
        </div>
      )}
    </div>
  );
};

export default Badges;
