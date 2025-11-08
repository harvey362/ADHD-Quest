import React from 'react';
import TaskItem from './TaskItem';
import '../styles/tasklist.css';

const TaskList = ({ 
  tasks, 
  onSubtaskToggle, 
  onSubtaskEdit, 
  onSubtaskDelete, 
  onSubtaskAdd,
  onTaskDelete,
  onCompleteQuest,
  speedrunTimers,
  showTimer
}) => {
  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <p>[ NO ACTIVE QUESTS ]</p>
        <p className="empty-subtitle">Create your first quest above to begin your journey!</p>
      </div>
    );
  }
  
  // Sort tasks: incomplete first, then by priority
  const sortedTasks = [...tasks].sort((a, b) => {
    const aComplete = a.subtasks.filter(st => st.completed).length === a.subtasks.length;
    const bComplete = b.subtasks.filter(st => st.completed).length === b.subtasks.length;
    
    if (aComplete !== bComplete) {
      return aComplete ? 1 : -1;
    }
    
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  return (
    <div className="task-list">
      <h2 className="task-list-title">
        [ ACTIVE QUESTS: {tasks.length} ]
      </h2>
      
      {sortedTasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onSubtaskToggle={onSubtaskToggle}
          onSubtaskEdit={onSubtaskEdit}
          onSubtaskDelete={onSubtaskDelete}
          onSubtaskAdd={onSubtaskAdd}
          onTaskDelete={onTaskDelete}
          onCompleteQuest={onCompleteQuest}
          timerData={speedrunTimers?.[task.id]}
          showTimer={showTimer && task.speedrunMode}
        />
      ))}
    </div>
  );
};

export default TaskList;
