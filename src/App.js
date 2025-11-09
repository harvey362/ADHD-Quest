import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import WidgetLibrary from './components/WidgetLibrary';
import Dashboard from './components/Dashboard';
import CompletedQuests from './components/CompletedQuests';
import Settings from './components/Settings';
import QuickCapture from './components/QuickCapture';
import PomodoroTimer from './components/PomodoroTimer';
import CalendarView from './components/CalendarView';
import PlaceholderWidget from './components/PlaceholderWidget';
import { initSoundEffects, toggleSound, playSound } from './utils/soundEffects';
import './styles/global.css';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [currentWidget, setCurrentWidget] = useState(null);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [settings, setSettings] = useState({
    themeColor: '#00FF00',
    scanlines: true,
    soundEffects: false,
    soundEnabled: false,
    soundSettings: {
      clickSoft: true,
      clickHard: true,
      clickDigital: true,
      keyTypewriter: true,
      keyThock: true,
      keyMembrane: true,
      effects: true,
    },
    currentClickSound: 'clickSoft',
    currentKeySound: 'keyTypewriter',
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

  // Initialize and sync sound effects with settings
  useEffect(() => {
    initSoundEffects(settings.soundEnabled);
    toggleSound(settings.soundEnabled);
  }, [settings.soundEnabled]);

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

  // Handle widget selection with sound
  const handleSelectWidget = (widgetId) => {
    playSound('click');
    setCurrentWidget(widgetId);
  };

  // Handle back to arcade with sound
  const handleBackToArcade = () => {
    playSound('click');
    setCurrentWidget(null);
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
      soundEnabled: false,
      soundSettings: {
        clickSoft: true,
        clickHard: true,
        clickDigital: true,
        keyTypewriter: true,
        keyThock: true,
        keyMembrane: true,
        effects: true,
      },
      currentClickSound: 'clickSoft',
      currentKeySound: 'keyTypewriter',
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
        return <PomodoroTimer />;

      case 'quick-capture':
        return <QuickCapture />;

      case 'calendar':
        return <CalendarView />;

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
          onSelectWidget={handleSelectWidget}
          userSettings={settings}
        />
      </div>
    );
  }

  return (
    <div className={`App ${settings.scanlines ? 'scanlines' : ''}`}>
      <div className="widget-container">
        <button className="back-to-arcade-btn" onClick={handleBackToArcade}>
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
