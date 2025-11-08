/**
 * Streak Widget
 *
 * Displays current streak, longest streak, and streak milestones.
 * Encourages daily engagement with visual feedback.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getStreakDisplayData, hasActivityToday } from '../utils/streakTracker';
import '../styles/streakwidget.css';

function StreakWidget({ compact = false }) {
  const [streakData, setStreakData] = useState(null);

  useEffect(() => {
    loadStreakData();

    // Update streak data every minute
    const interval = setInterval(() => {
      loadStreakData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadStreakData = () => {
    const data = getStreakDisplayData();
    setStreakData(data);
  };

  if (!streakData) {
    return null;
  }

  if (compact) {
    return (
      <div className="streak-widget-compact">
        <div className="streak-flame">{streakData.flame}</div>
        <div className="streak-count">{streakData.current}</div>
      </div>
    );
  }

  const getFlameAnimation = () => {
    if (streakData.current === 0) {
      return {};
    }

    return {
      animate: {
        scale: [1, 1.2, 1],
        rotate: [-5, 5, -5],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
      },
    };
  };

  return (
    <div className="streak-widget">
      <div className="streak-header">
        <h2>🔥 STREAK</h2>
      </div>

      <div className="streak-main">
        <motion.div
          className="streak-flame-large"
          {...getFlameAnimation()}
        >
          {streakData.flame}
        </motion.div>

        <div className="streak-current">
          <div className="streak-number">{streakData.current}</div>
          <div className="streak-label">DAYS</div>
        </div>
      </div>

      <div className="streak-status">
        {streakData.status}
      </div>

      <div className="streak-stats">
        <div className="streak-stat">
          <div className="stat-label">LONGEST</div>
          <div className="stat-value">{streakData.longest}</div>
        </div>

        <div className="streak-stat">
          <div className="stat-label">NEXT GOAL</div>
          <div className="stat-value">
            {streakData.nextMilestone || 'MAX!'}
          </div>
        </div>

        <div className="streak-stat">
          <div className="stat-label">XP BONUS</div>
          <div className="stat-value">+{streakData.xpBonus}</div>
        </div>
      </div>

      {/* Progress to next milestone */}
      {streakData.nextMilestone && (
        <div className="streak-progress">
          <div className="progress-label">
            {streakData.current} / {streakData.nextMilestone}
          </div>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${streakData.progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Multiplier indicator */}
      {streakData.multiplier > 1 && (
        <div className="streak-multiplier">
          <span className="multiplier-icon">⚡</span>
          <span className="multiplier-text">
            {streakData.multiplier}x XP MULTIPLIER
          </span>
        </div>
      )}

      {/* Warning if no activity today */}
      {!hasActivityToday() && streakData.current > 0 && (
        <div className="streak-warning">
          ⚠️ Complete a task today to keep your streak alive!
        </div>
      )}
    </div>
  );
}

export default StreakWidget;
