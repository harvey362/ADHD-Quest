import React, { useState } from 'react';
import '../styles/taskinput.css';

const TaskInput = ({ onTaskCreate, isLoading }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [granularity, setGranularity] = useState('detailed');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [speedrunMode, setSpeedrunMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!taskTitle.trim()) {
      alert('Please enter a task description');
      return;
    }
    
    const taskData = {
      title: taskTitle.trim(),
      granularity,
      priority,
      dueDate: dueDate || null,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [],
      recurring: 'none',
      speedrunMode
    };
    
    await onTaskCreate(taskData);
    
    // Clear form
    setTaskTitle('');
    setDueDate('');
    setTags('');
    setSpeedrunMode(false);
  };
  
  return (
    <div className="task-input-container">
      <h2 className="task-input-title">[ NEW QUEST ]</h2>
      
      <form onSubmit={handleSubmit} className="task-input-form">
        {/* Main task input */}
        <div className="form-group">
          <label htmlFor="task-title">TASK DESCRIPTION:</label>
          <input
            id="task-title"
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="e.g., Pack clothes from suitcase"
            disabled={isLoading}
            className="task-input-field"
            autoFocus
          />
        </div>
        
        {/* Granularity selector - FR-02 */}
        <div className="form-group">
          <label htmlFor="granularity">BREAKDOWN DETAIL:</label>
          <select
            id="granularity"
            value={granularity}
            onChange={(e) => setGranularity(e.target.value)}
            disabled={isLoading}
            className="task-select"
          >
            <option value="quick">QUICK (5-8 steps)</option>
            <option value="detailed">DETAILED (10-15 steps)</option>
            <option value="very-detailed">VERY DETAILED (20-30 steps)</option>
          </select>
        </div>
        
        {/* Priority - FR-05 */}
        <div className="form-group">
          <label htmlFor="priority">PRIORITY:</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={isLoading}
            className="task-select"
          >
            <option value="low">LOW</option>
            <option value="medium">MEDIUM</option>
            <option value="high">HIGH</option>
          </select>
        </div>
        
        {/* Speedrun Mode Toggle */}
        <div className="form-group speedrun-toggle-group">
          <label className="speedrun-label">
            <input
              type="checkbox"
              checked={speedrunMode}
              onChange={(e) => setSpeedrunMode(e.target.checked)}
              disabled={isLoading}
              className="speedrun-checkbox"
            />
            <span className="speedrun-text">
              ⏱️ SPEEDRUN MODE - Track time per step
            </span>
          </label>
        </div>
        
        {/* Advanced options toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="toggle-advanced-btn"
        >
          {showAdvanced ? '▼' : '►'} ADVANCED OPTIONS
        </button>
        
        {showAdvanced && (
          <div className="advanced-options">
            {/* Due date - FR-04 */}
            <div className="form-group">
              <label htmlFor="due-date">DUE DATE (OPTIONAL):</label>
              <input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isLoading}
                className="task-input-field"
              />
            </div>
            
            {/* Tags - FR-07 */}
            <div className="form-group">
              <label htmlFor="tags">TAGS (COMMA SEPARATED):</label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., home, urgent, chores"
                disabled={isLoading}
                className="task-input-field"
              />
            </div>
          </div>
        )}
        
        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || !taskTitle.trim()}
          className="task-submit-btn"
        >
          {isLoading ? '[ GENERATING... ]' : '[ CREATE QUEST ]'}
        </button>
        
        {isLoading && (
          <div className="loading-indicator">
            <span className="blink">▮</span> AI is breaking down your task into micro-steps...
          </div>
        )}
      </form>
    </div>
  );
};

export default TaskInput;
