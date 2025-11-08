import React from 'react';
import XPBar from './XPBar';
import TaskInput from './TaskInput';
import TaskList from './TaskList';
import '../styles/dashboard.css';

const TaskCrusher = ({ 
  tasks, 
  userProfile, 
  onTaskCreate, 
  onSubtaskToggle, 
  onSubtaskEdit, 
  onSubtaskDelete, 
  onSubtaskAdd, 
  onTaskDelete,
  onCompleteQuest,
  isLoading 
}) => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title glow-strong">
          ⚡ TASK CRUSHER
        </h1>
        <p className="dashboard-subtitle">Break It Down & Level Up</p>
      </div>
      
      {/* XP Bar */}
      <XPBar
        totalXP={userProfile.totalXP}
        level={userProfile.level}
        currentLevelXP={userProfile.currentLevelXP}
        xpToNextLevel={userProfile.xpToNextLevel}
        progressPercent={userProfile.xpToNextLevel > 0 
          ? Math.round((userProfile.currentLevelXP / userProfile.xpToNextLevel) * 100) 
          : 100}
      />
      
      <div className="dashboard-content">
        {/* Task Input */}
        <TaskInput onTaskCreate={onTaskCreate} isLoading={isLoading} />
        
        {/* Task List */}
        <TaskList
          tasks={tasks}
          onSubtaskToggle={onSubtaskToggle}
          onSubtaskEdit={onSubtaskEdit}
          onSubtaskDelete={onSubtaskDelete}
          onSubtaskAdd={onSubtaskAdd}
          onTaskDelete={onTaskDelete}
          onCompleteQuest={onCompleteQuest}
        />
      </div>
      
      {/* Stats Footer */}
      <div className="dashboard-footer">
        <span>Tasks: {tasks.length}</span>
        <span>•</span>
        <span>Steps Completed: {userProfile.subtasksCompleted}</span>
        <span>•</span>
        <span>Total XP: {userProfile.totalXP}</span>
      </div>
    </div>
  );
};

export default TaskCrusher;
