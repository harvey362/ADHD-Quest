import React from 'react';
import TaskCrusher from './TaskCrusher';
import CompletedQuests from './CompletedQuests';
import Settings from './Settings';
import PlaceholderWidget from './PlaceholderWidget';
import '../styles/widgetcontainer.css';

const WidgetContainer = ({ 
  activeWidget, 
  onBack, 
  tasks,
  completedQuests,
  userProfile,
  userSettings,
  onTaskCreate,
  onSubtaskToggle,
  onSubtaskEdit,
  onSubtaskDelete,
  onSubtaskAdd,
  onTaskDelete,
  onCompleteQuest,
  onRestoreQuest,
  onDeleteCompleted,
  onUpdateSettings,
  onResetAll,
  onResetXP,
  isLoading
}) => {
  const renderWidget = () => {
    switch (activeWidget) {
      case 'task-crusher':
        return (
          <TaskCrusher
            tasks={tasks}
            userProfile={userProfile}
            onTaskCreate={onTaskCreate}
            onSubtaskToggle={onSubtaskToggle}
            onSubtaskEdit={onSubtaskEdit}
            onSubtaskDelete={onSubtaskDelete}
            onSubtaskAdd={onSubtaskAdd}
            onTaskDelete={onTaskDelete}
            onCompleteQuest={onCompleteQuest}
            isLoading={isLoading}
          />
        );
      
      case 'completed-quests':
        return (
          <CompletedQuests
            completedQuests={completedQuests}
            onRestoreQuest={onRestoreQuest}
            onDeleteCompleted={onDeleteCompleted}
          />
        );
      
      case 'settings':
        return (
          <Settings
            userSettings={userSettings}
            onUpdateSettings={onUpdateSettings}
            onResetAll={onResetAll}
            onResetXP={onResetXP}
          />
        );
      
      // Placeholder widgets
      case 'pomodoro':
        return <PlaceholderWidget name="FOCUS TIMER" icon="🍅" description="Pomodoro technique timer - Coming soon!" />;
      
      case 'mood-tracker':
        return <PlaceholderWidget name="MOOD LOGGER" icon="😊" description="Track your energy and emotions - Coming soon!" />;
      
      case 'quick-capture':
        return <PlaceholderWidget name="QUICK CAPTURE" icon="📝" description="Rapid idea collection - Coming soon!" />;
      
      case 'calendar':
        return <PlaceholderWidget name="CALENDAR" icon="📅" description="Daily planning view - Coming soon!" />;
      
      case 'daily-review':
        return <PlaceholderWidget name="DAILY REVIEW" icon="🌅" description="Planning and reflection - Coming soon!" />;
      
      case 'distraction-log':
        return <PlaceholderWidget name="DISTRACTION LOG" icon="🎯" description="Monitor distractions - Coming soon!" />;
      
      case 'medication':
        return <PlaceholderWidget name="MED REMINDERS" icon="💊" description="Medication tracking - Coming soon!" />;
      
      case 'time-estimate':
        return <PlaceholderWidget name="TIME TRAINER" icon="⏰" description="Improve time estimation - Coming soon!" />;
      
      default:
        return <PlaceholderWidget name="UNKNOWN WIDGET" icon="❓" description="Widget not found" />;
    }
  };

  return (
    <div className="widget-container">
      <button className="back-to-arcade-btn" onClick={onBack}>
        ◄ BACK TO ARCADE
      </button>
      
      <div className="widget-content">
        {renderWidget()}
      </div>
    </div>
  );
};

export default WidgetContainer;
