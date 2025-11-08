import React from 'react';
import '../styles/widgetlibrary.css';

const WidgetLibrary = ({ onSelectWidget, userSettings }) => {
  const widgets = [
    {
      id: 'task-crusher',
      name: 'TASK CRUSHER',
      icon: '⚡',
      flavorText: '▼ PRESS START',
      description: 'Break down tasks with AI'
    },
    {
      id: 'completed-quests',
      name: 'QUEST LOG',
      icon: '📜',
      flavorText: '▼ VIEW HISTORY',
      description: 'Completed quests archive'
    },
    {
      id: 'pomodoro',
      name: 'FOCUS TIMER',
      icon: '🍅',
      flavorText: '▼ START FOCUS',
      description: 'Pomodoro technique timer'
    },
    {
      id: 'mood-tracker',
      name: 'MOOD LOGGER',
      icon: '😊',
      flavorText: '▼ LOG MOOD',
      description: 'Track energy and emotions'
    },
    {
      id: 'quick-capture',
      name: 'QUICK CAPTURE',
      icon: '📝',
      flavorText: '▼ TAKE NOTES',
      description: 'Rapid idea collection'
    },
    {
      id: 'calendar',
      name: 'CALENDAR',
      icon: '📅',
      flavorText: '▼ VIEW SCHEDULE',
      description: 'Daily planning view'
    },
    {
      id: 'daily-review',
      name: 'DAILY REVIEW',
      icon: '🌅',
      flavorText: '▼ PLAN DAY',
      description: 'Planning and reflection'
    },
    {
      id: 'distraction-log',
      name: 'DISTRACTION LOG',
      icon: '🎯',
      flavorText: '▼ TRACK FOCUS',
      description: 'Monitor distractions'
    },
    {
      id: 'medication',
      name: 'MED REMINDERS',
      icon: '💊',
      flavorText: '▼ SET ALERTS',
      description: 'Medication tracking'
    },
    {
      id: 'time-estimate',
      name: 'TIME TRAINER',
      icon: '⏰',
      flavorText: '▼ PRACTICE',
      description: 'Improve time estimation'
    },
    {
      id: 'settings',
      name: 'SETTINGS',
      icon: '⚙️',
      flavorText: '▼ CONFIGURE',
      description: 'App configuration'
    }
  ];

  // Filter hidden widgets based on user settings
  const visibleWidgets = userSettings?.hiddenWidgets 
    ? widgets.filter(w => !userSettings.hiddenWidgets.includes(w.id))
    : widgets;

  return (
    <div className="widget-library">
      <div className="arcade-header">
        <h1 className="arcade-title glow-strong">
          &gt; ADHD QUEST ARCADE_
        </h1>
        <p className="arcade-subtitle">SELECT YOUR TOOL</p>
      </div>

      <div className="cartridge-grid">
        {visibleWidgets.map((widget) => (
          <div
            key={widget.id}
            className="cartridge"
            onClick={() => onSelectWidget(widget.id)}
            title={widget.description}
          >
            <div className="cartridge-label">{widget.name}</div>
            <div className="cartridge-icon">{widget.icon}</div>
            <div className="cartridge-flavor">{widget.flavorText}</div>
            <div className="cartridge-shine"></div>
          </div>
        ))}
      </div>

      <div className="arcade-footer">
        <p>[ INSERT COIN TO CONTINUE ]</p>
      </div>
    </div>
  );
};

export default WidgetLibrary;
