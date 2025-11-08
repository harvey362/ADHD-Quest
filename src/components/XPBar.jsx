import React from 'react';
import '../styles/xpbar.css';

const XPBar = ({ totalXP, level, currentLevelXP, xpToNextLevel, progressPercent }) => {
  return (
    <div className="xp-bar-container">
      <div className="xp-bar-header">
        <span className="xp-level">LEVEL: {level}</span>
        <span className="xp-amount">{currentLevelXP} / {xpToNextLevel} XP</span>
      </div>
      
      <div className="xp-bar-track">
        <div 
          className="xp-bar-fill" 
          style={{ width: `${progressPercent}%` }}
        >
          <div className="xp-bar-glow"></div>
        </div>
      </div>
      
      <div className="xp-bar-footer">
        <span className="xp-total">TOTAL XP: {totalXP}</span>
        <span className="xp-progress">{progressPercent}%</span>
      </div>
    </div>
  );
};

export default XPBar;
