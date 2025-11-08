import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import WidgetLibrary from './components/WidgetLibrary';
import Dashboard from './components/Dashboard';
import CompletedQuests from './components/CompletedQuests';
import Settings from './components/Settings';
import QuickCapture from './components/QuickCapture';
import PlaceholderWidget from './components/PlaceholderWidget';
import './styles/global.css';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [currentWidget, setCurrentWidget] = useState(null);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [settings, setSettings] = useState({
    themeColor: '#00FF00',
    scanlines: true,
    soundEffects: false,
    scanlinesEnabled: true,
    hiddenWidgets: []
  });

  // Load settings and completed quests
  useEffect(() => {
    const savedSettings = localStorage.getItem('adhd_quest_settings');
    const savedCompleted = localStorage.getItem('adhd_quest_completed');
    
    if (savedSettings) {
      try {
        const loaded = JSON.parse(savedSettings);
        setSettings(loaded);
        applyTheme(loaded.themeColor);
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
    
    if (savedCompleted) {
      try {
        setCompletedQuests(JSON.parse(savedCompleted));
      } catch (e) {
        console.error('Error loading completed quests:', e);
      }
    }
  }, []);

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem('adhd_quest_settings', JSON.stringify(settings));
  }, [settings]);

  // Save completed quests when they change
  useEffect(() => {
    localStorage.setItem('adhd_quest_completed', JSON.stringify(completedQuests));
  }, [completedQuests]);

  // Apply theme
  const applyTheme = (color) => {
    document.documentElement.style.setProperty('--color-green', color);
    document.documentElement.style.setProperty('--color-green-light', color);
    const darker = adjustBrightness(color, -50);
    const darkest = adjustBrightness(color, -100);
    document.documentElement.style.setProperty('--color-green-dark', darker);
    document.documentElement.style.setProperty('--color-green-darker', darkest);
  };

  const adjustBrightness = (color, amount) => {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${(0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  // Handle completing a quest
  const handleCompleteQuest = (task) => {
    const completedQuest = {
      ...task,
      completedAt: new Date().toISOString(),
      xpEarned: task.subtasks.length * 10,
      wasSpeedrun: false,
      totalTime: null
    };
    
    setCompletedQuests(prev => [completedQuest, ...prev]);
  };

  // Handle restoring a quest
  const handleRestoreQuest = (quest) => {
    // Remove from completed quests
    setCompletedQuests(prev => prev.filter(q => q.id !== quest.id));
    
    // Note: The Dashboard component will need to handle adding it back to active tasks
    // For now, we just remove it from completed
    alert('Quest restored! It has been removed from the completed log. Create a new task with the same details.');
  };

  // Handle deleting a completed quest
  const handleDeleteCompleted = (questId) => {
    setCompletedQuests(prev => prev.filter(q => q.id !== questId));
  };

  // Handle settings updates
  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    applyTheme(newSettings.themeColor);
  };

  // Handle reset all data
  const handleResetAll = () => {
    // Clear all localStorage
    localStorage.clear();
    
    // Reset state
    setCompletedQuests([]);
    setSettings({
      themeColor: '#00FF00',
      scanlines: true,
      soundEffects: false,
      scanlinesEnabled: true,
      hiddenWidgets: []
    });
    
    applyTheme('#00FF00');
    
    // Reload page to reset everything
    window.location.reload();
  };

  // Handle reset XP
  const handleResetXP = () => {
    const profile = JSON.parse(localStorage.getItem('adhd_quest_profile') || '{}');
    profile.totalXP = 0;
    profile.level = 1;
    profile.currentLevelXP = 0;
    profile.xpToNextLevel = 200;
    profile.subtasksCompleted = 0;
    localStorage.setItem('adhd_quest_profile', JSON.stringify(profile));
    
    alert('XP and Level reset! Refresh the page to see changes.');
  };

  // Render appropriate widget
  const renderWidget = () => {
    switch (currentWidget) {
      case 'task-crusher':
        return <Dashboard onCompleteQuest={handleCompleteQuest} />;
      
      case 'completed-quests':
        return (
          <CompletedQuests
            completedQuests={completedQuests}
            onRestoreQuest={handleRestoreQuest}
            onDeleteCompleted={handleDeleteCompleted}
          />
        );
      
      case 'settings':
        return (
          <Settings
            userSettings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetAll={handleResetAll}
            onResetXP={handleResetXP}
          />
        );
      
      case 'pomodoro':
        return <PlaceholderWidget name="FOCUS TIMER" icon="🍅" description="Pomodoro technique timer - Coming soon!" />;
      
      case 'mood-tracker':
        return <PlaceholderWidget name="MOOD LOGGER" icon="😊" description="Track your energy and emotions - Coming soon!" />;
      
      case 'quick-capture':
        return <QuickCapture />;
      
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
        return <PlaceholderWidget name="UNKNOWN" icon="❓" description="Widget not found" />;
    }
  };

  if (showLanding) {
    return (
      <div className={`App ${settings.scanlines ? 'scanlines' : ''}`}>
        <LandingPage onEnterApp={() => setShowLanding(false)} />
      </div>
    );
  }

  if (!currentWidget) {
    return (
      <div className={`App ${settings.scanlines ? 'scanlines' : ''}`}>
        <WidgetLibrary 
          onSelectWidget={setCurrentWidget}
          userSettings={settings}
        />
      </div>
    );
  }

  return (
    <div className={`App ${settings.scanlines ? 'scanlines' : ''}`}>
      <div className="widget-container">
        <button className="back-to-arcade-btn" onClick={() => setCurrentWidget(null)}>
          ◄ BACK TO ARCADE
        </button>
        <div className="widget-content">
          {renderWidget()}
        </div>
      </div>
    </div>
  );
}

export default App;
