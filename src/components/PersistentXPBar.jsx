import React from 'react';
import { getRankForLevel, getNextRank } from '../utils/rankSystem';
import '../styles/persistentxpbar.css';

const PersistentXPBar = ({ totalXP, level, currentLevelXP, xpToNextLevel, onBadgesClick }) => {
  const rank = getRankForLevel(level);
  const nextRank = getNextRank(level);
  const progressPercent = xpToNextLevel > 0 
    ? Math.round((currentLevelXP / xpToNextLevel) * 100) 
    : 100;
  
  return (
    <div className="persistent-xp-bar">
      <div className="persistent-xp-content">
        {/* Rank & Level */}
        <div className="rank-info">
          <span className="rank-icon">{rank.icon}</span>
          <span className="rank-name">{rank.name}</span>
          <span className="rank-separator">•</span>
          <span className="level-display">LV {level}</span>
        </div>
        
        {/* XP Bar */}
        <div className="xp-bar-section">
          <div className="xp-bar-track">
            <div 
              className="xp-bar-fill" 
              style={{ width: `${progressPercent}%` }}
            >
              <div className="xp-bar-shine"></div>
            </div>
          </div>
          <span className="xp-text">{currentLevelXP} / {xpToNextLevel} XP</span>
        </div>
        
        {/* Next Rank Preview */}
        {nextRank && (
          <div className="next-rank-preview">
            <span className="next-rank-text">Next:</span>
            <span className="next-rank-icon">{nextRank.icon}</span>
            <span className="next-rank-name">{nextRank.name}</span>
          </div>
        )}
        
        {/* Badges Button */}
        <button className="badges-btn" onClick={onBadgesClick} title="View Badges">
          🏆 BADGES
        </button>
      </div>
    </div>
  );
};

export default PersistentXPBar;
