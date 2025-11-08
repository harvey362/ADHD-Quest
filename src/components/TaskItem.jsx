import React, { useState, useEffect } from 'react';
import '../styles/taskitem.css';

const TaskItem = ({ 
  task, 
  onSubtaskToggle, 
  onSubtaskEdit, 
  onSubtaskDelete, 
  onSubtaskAdd, 
  onTaskDelete,
  onCompleteQuest,
  timerData,
  showTimer
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [editText, setEditText] = useState('');
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  const completedCount = task.subtasks.filter(st => st.completed).length;
  const totalCount = task.subtasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = completedCount === totalCount && totalCount > 0;
  
  // Update timer display every second if speedrun active
  useEffect(() => {
    if (showTimer && timerData?.taskStartTime) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showTimer, timerData]);
  
  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    } else {
      return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
    }
  };
  
  const getTotalElapsed = () => {
    if (!timerData?.taskStartTime) return 0;
    return currentTime - timerData.taskStartTime;
  };
  
  const getSubtaskTime = (subtaskId) => {
    if (!timerData) return null;
    if (timerData.subtaskTimes[subtaskId]) {
      return timerData.subtaskTimes[subtaskId];
    }
    return null;
  };
  
  const handleSubtaskToggle = (subtaskId) => {
    onSubtaskToggle(task.id, subtaskId);
  };
  
  const startEditing = (subtask) => {
    setEditingSubtask(subtask.id);
    setEditText(subtask.text);
  };
  
  const saveEdit = (subtaskId) => {
    if (editText.trim()) {
      onSubtaskEdit(task.id, subtaskId, editText.trim());
    }
    setEditingSubtask(null);
    setEditText('');
  };
  
  const cancelEdit = () => {
    setEditingSubtask(null);
    setEditText('');
  };
  
  const handleAddSubtask = () => {
    if (newSubtaskText.trim()) {
      onSubtaskAdd(task.id, newSubtaskText.trim());
      setNewSubtaskText('');
      setShowAddSubtask(false);
    }
  };
  
  const handleCompleteQuest = () => {
    if (window.confirm('⚡ Complete this quest and move to Victory Archives?')) {
      onCompleteQuest(task.id);
    }
  };
  
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return 'var(--color-green-light)';
      case 'low': return 'var(--color-green-darker)';
      default: return 'var(--color-green)';
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const isOverdue = () => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  };
  
  return (
    <div className={`task-item ${isComplete ? 'task-complete' : ''}`}>
      {/* Task Header */}
      <div className="task-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="task-header-left">
          <span className="task-expand-icon">{isExpanded ? '▼' : '►'}</span>
          <h3 className="task-title" style={{ color: getPriorityColor() }}>
            {task.speedrunMode && '⏱️ '}
            {task.title}
          </h3>
        </div>
        
        <div className="task-header-right">
          {showTimer && timerData?.taskStartTime && (
            <span className="task-timer">
              ⏱ {formatDuration(getTotalElapsed())}
            </span>
          )}
          {task.dueDate && (
            <span className={`task-due-date ${isOverdue() ? 'overdue' : ''}`}>
              {isOverdue() ? '⚠ ' : ''}
              {formatDate(task.dueDate)}
            </span>
          )}
          <span className="task-progress-text">
            {completedCount}/{totalCount}
          </span>
          <button
            className="task-delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Delete this quest and all its steps?')) {
                onTaskDelete(task.id);
              }
            }}
            title="Delete task"
          >
            ✕
          </button>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="task-progress-bar">
        <div 
          className="task-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      {/* Complete Quest Button - only shows when all subtasks done */}
      {isComplete && onCompleteQuest && (
        <button
          className="complete-quest-btn"
          onClick={handleCompleteQuest}
        >
          ⚡ COMPLETE QUEST ⚡
        </button>
      )}
      
      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.map((tag, index) => (
            <span key={index} className="task-tag">#{tag}</span>
          ))}
        </div>
      )}
      
      {/* Subtasks List */}
      {isExpanded && (
        <div className="subtasks-container">
          {task.subtasks.map((subtask, index) => (
            <div
              key={subtask.id}
              className={`subtask-item ${subtask.completed ? 'subtask-completed' : ''}`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => handleSubtaskToggle(subtask.id)}
                className="subtask-checkbox"
                id={`subtask-${subtask.id}`}
              />
              
              {/* Subtask text or edit input */}
              {editingSubtask === subtask.id ? (
                <div className="subtask-edit-container">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(subtask.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="subtask-edit-input"
                    autoFocus
                  />
                  <button onClick={() => saveEdit(subtask.id)} className="subtask-save-btn">
                    ✓
                  </button>
                  <button onClick={cancelEdit} className="subtask-cancel-btn">
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <label 
                    htmlFor={`subtask-${subtask.id}`}
                    className="subtask-text"
                  >
                    <span className="subtask-number">{index + 1}.</span>
                    {subtask.text}
                  </label>
                  
                  {/* Show timer for completed subtasks */}
                  {showTimer && subtask.completed && getSubtaskTime(subtask.id) && (
                    <span className="subtask-time">
                      ⏱ {formatDuration(getSubtaskTime(subtask.id))}
                    </span>
                  )}
                  
                  {/* Edit and Delete buttons */}
                  <div className="subtask-actions">
                    <button
                      onClick={() => startEditing(subtask)}
                      className="subtask-action-btn"
                      title="Edit step"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this step?')) {
                          onSubtaskDelete(task.id, subtask.id);
                        }
                      }}
                      className="subtask-action-btn"
                      title="Delete step"
                    >
                      ✕
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {/* Add new subtask */}
          {showAddSubtask ? (
            <div className="subtask-add-container">
              <input
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSubtask();
                  if (e.key === 'Escape') {
                    setShowAddSubtask(false);
                    setNewSubtaskText('');
                  }
                }}
                placeholder="Add a new step..."
                className="subtask-add-input"
                autoFocus
              />
              <button onClick={handleAddSubtask} className="subtask-save-btn">
                ✓
              </button>
              <button
                onClick={() => {
                  setShowAddSubtask(false);
                  setNewSubtaskText('');
                }}
                className="subtask-cancel-btn"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddSubtask(true)}
              className="subtask-add-btn"
            >
              + ADD STEP
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskItem;
