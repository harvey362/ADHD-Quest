import React, { useState } from 'react';
import '../styles/completedquests.css';

const CompletedQuests = ({ completedQuests, onRestoreQuest, onDeleteCompleted }) => {
  const [expandedQuest, setExpandedQuest] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // date, xp, time

  if (!completedQuests || completedQuests.length === 0) {
    return (
      <div className="completed-quests-empty">
        <h2>[ QUEST LOG ]</h2>
        <p>No completed quests yet.</p>
        <p className="empty-subtitle">Complete your first quest to see it here!</p>
      </div>
    );
  }

  // Sort quests
  const sortedQuests = [...completedQuests].sort((a, b) => {
    switch (sortBy) {
      case 'xp':
        return b.xpEarned - a.xpEarned;
      case 'time':
        if (a.totalTime && b.totalTime) {
          return a.totalTime - b.totalTime;
        }
        return 0;
      case 'date':
      default:
        return new Date(b.completedAt) - new Date(a.completedAt);
    }
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (ms) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const getTotalXP = () => {
    return completedQuests.reduce((sum, quest) => sum + (quest.xpEarned || 0), 0);
  };

  return (
    <div className="completed-quests">
      <div className="completed-header">
        <h2>[ QUEST LOG ]</h2>
        <div className="completed-stats">
          <span>Total Completed: {completedQuests.length}</span>
          <span>•</span>
          <span>Total XP Earned: {getTotalXP()}</span>
        </div>
      </div>

      <div className="completed-controls">
        <label htmlFor="sort-by">SORT BY:</label>
        <select 
          id="sort-by"
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="date">DATE (NEWEST FIRST)</option>
          <option value="xp">XP EARNED</option>
          <option value="time">TIME TAKEN</option>
        </select>
      </div>

      <div className="completed-list">
        {sortedQuests.map((quest) => (
          <div 
            key={quest.id} 
            className={`completed-quest-item ${expandedQuest === quest.id ? 'expanded' : ''}`}
          >
            <div 
              className="completed-quest-header"
              onClick={() => setExpandedQuest(expandedQuest === quest.id ? null : quest.id)}
            >
              <div className="completed-quest-title-section">
                <span className="expand-icon">{expandedQuest === quest.id ? '▼' : '►'}</span>
                <h3>{quest.title}</h3>
              </div>
              
              <div className="completed-quest-meta">
                <span className="quest-xp">+{quest.xpEarned || 0} XP</span>
                {quest.wasSpeedrun && quest.totalTime && (
                  <span className="quest-time">⚡ {formatTime(quest.totalTime)}</span>
                )}
                <span className="quest-date">{formatDate(quest.completedAt)}</span>
              </div>
            </div>

            {expandedQuest === quest.id && (
              <div className="completed-quest-details">
                <div className="quest-info-grid">
                  <div className="info-item">
                    <span className="info-label">CREATED:</span>
                    <span className="info-value">{formatDate(quest.createdAt)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">COMPLETED:</span>
                    <span className="info-value">{formatDate(quest.completedAt)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">STEPS:</span>
                    <span className="info-value">{quest.subtasks.length}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">PRIORITY:</span>
                    <span className="info-value">{quest.priority.toUpperCase()}</span>
                  </div>
                </div>

                {quest.tags && quest.tags.length > 0 && (
                  <div className="quest-tags">
                    {quest.tags.map((tag, idx) => (
                      <span key={idx} className="quest-tag">#{tag}</span>
                    ))}
                  </div>
                )}

                <div className="quest-subtasks">
                  <h4>STEPS COMPLETED:</h4>
                  <ol className="subtask-list">
                    {quest.subtasks.map((subtask, idx) => (
                      <li key={idx} className="completed-subtask">
                        <span className="subtask-check">✓</span>
                        <span className="subtask-text">{subtask.text}</span>
                        {quest.wasSpeedrun && subtask.timeSpent && (
                          <span className="subtask-time">{formatTime(subtask.timeSpent)}</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="quest-actions">
                  <button
                    onClick={() => onRestoreQuest(quest)}
                    className="restore-btn"
                  >
                    ↺ RESTORE QUEST
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Permanently delete this completed quest from history?')) {
                        onDeleteCompleted(quest.id);
                      }
                    }}
                    className="delete-btn"
                  >
                    ✕ DELETE FROM LOG
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletedQuests;
