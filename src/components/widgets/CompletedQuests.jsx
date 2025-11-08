import React from 'react';
import '../styles/completedquests.css';

const CompletedQuests = ({ completedTasks, onRestoreQuest, onDeleteQuest }) => {
  if (completedTasks.length === 0) {
    return (
      <div className="completed-quests-container">
        <h2 className="completed-quests-title">[ VICTORY ARCHIVES ]</h2>
        <div className="no-completed-quests">
          <p>[ NO VICTORIES YET ]</p>
          <p className="empty-subtitle">Complete your first quest to see it here!</p>
        </div>
      </div>
    );
  }

  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

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

  return (
    <div className="completed-quests-container">
      <h2 className="completed-quests-title">
        [ VICTORY ARCHIVES: {completedTasks.length} ]
      </h2>

      <div className="completed-quests-list">
        {completedTasks.map((task) => (
          <div key={task.id} className="completed-quest-card">
            <div className="quest-header">
              <h3 className="quest-title">⚡ {task.title}</h3>
              <div className="quest-actions">
                <button
                  onClick={() => onRestoreQuest(task.id)}
                  className="quest-action-btn restore-btn"
                  title="Restore quest to active"
                >
                  ↺ RESTORE
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Permanently delete this completed quest?')) {
                      onDeleteQuest(task.id);
                    }
                  }}
                  className="quest-action-btn delete-btn"
                  title="Delete forever"
                >
                  ✕ DELETE
                </button>
              </div>
            </div>

            <div className="quest-stats">
              <div className="quest-stat">
                <span className="stat-label">COMPLETED:</span>
                <span className="stat-value">{formatDate(task.completedAt)}</span>
              </div>
              <div className="quest-stat">
                <span className="stat-label">XP EARNED:</span>
                <span className="stat-value">{task.xpEarned || task.subtasks.length * 10}</span>
              </div>
              {task.timeData && task.timeData.totalTime && (
                <div className="quest-stat speedrun-stat">
                  <span className="stat-label">⏱️ SPEEDRUN:</span>
                  <span className="stat-value">{formatDuration(task.timeData.totalTime)}</span>
                </div>
              )}
            </div>

            {task.tags && task.tags.length > 0 && (
              <div className="quest-tags">
                {task.tags.map((tag, index) => (
                  <span key={index} className="quest-tag">#{tag}</span>
                ))}
              </div>
            )}

            <div className="quest-subtasks">
              <p className="subtasks-header">STEPS COMPLETED:</p>
              {task.subtasks.map((subtask, index) => (
                <div key={subtask.id} className="completed-subtask">
                  <span className="subtask-checkmark">✓</span>
                  <span className="subtask-text">{index + 1}. {subtask.text}</span>
                  {task.timeData && task.timeData.subtaskTimes && task.timeData.subtaskTimes[subtask.id] && (
                    <span className="subtask-time">
                      ⏱ {formatDuration(task.timeData.subtaskTimes[subtask.id])}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletedQuests;
