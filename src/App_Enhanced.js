/**
 * ADHD Quest v1.0.0 - Enhanced App Component
 *
 * Integrates:
 * - User authentication (Supabase)
 * - Cloud synchronization
 * - All new widgets and features
 * - Backward compatibility with localStorage
 */

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Existing components
import LandingPage from './components/LandingPage';
import WidgetLibrary from './components/WidgetLibrary';
import Dashboard from './components/Dashboard';
import CompletedQuests from './components/CompletedQuests';
import Settings from './components/Settings';
import QuickCapture from './components/QuickCapture';
import PomodoroTimer from './components/PomodoroTimer';
import CalendarView from './components/CalendarView';
import TimeTrainer from './components/TimeTrainer';
import Badges from './components/Badges';
import PlaceholderWidget from './components/PlaceholderWidget';

// New components
import Login from './components/Login';
import SignUp from './components/SignUp';
import UserProfile from './components/UserProfile';
import StatsDashboard from './components/StatsDashboard';
import AchievementsEnhanced from './components/AchievementsEnhanced';
import StreakWidget from './components/StreakWidget';
import TemplateLibrary from './components/TemplateLibrary';
import ThemeEditor from './components/ThemeEditor';

// Services
import authService from './services/authService';
import cloudSyncService from './services/cloudSyncService';
import notificationService from './services/notificationService';

// Utils
import { initSoundEffects, toggleSound, playSound } from './utils/soundEffects';
import { recordActivity, getStreakStats } from './utils/streakTracker';
import { isSupabaseConfigured } from './config/supabase';

import './styles/global.css';

function App() {
  // Core state
  const [showLanding, setShowLanding] = useState(true);
  const [currentWidget, setCurrentWidget] = useState(null);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [settings, setSettings] = useState({
    themeColor: '#00FF00',
    primaryColor: '#00FF00',
    scanlines: true,
    soundEffects: false,
    soundEnabled: false,
    scanlinesEnabled: true,
    hiddenWidgets: []
  });

  // Auth state
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authMode, setAuthMode] = useState(null); // 'login', 'signup', null
  const [authLoading, setAuthLoading] = useState(true);

  // Sync state
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize sound effects
      initSoundEffects(settings.soundEnabled);

      // Initialize notifications
      if (process.env.REACT_APP_ENABLE_PUSH_NOTIFICATIONS === 'true') {
        await notificationService.initialize();
      }

      // Check if cloud sync is configured
      const cloudConfigured = isSupabaseConfigured();
      setSyncEnabled(cloudConfigured);

      if (cloudConfigured) {
        // Initialize auth service
        const currentUser = await authService.initialize();

        if (currentUser) {
          setUser(currentUser);
          await loadUserProfile(currentUser.id);

          // Initialize cloud sync
          await cloudSyncService.initialize();

          // Schedule daily streak reminder (8 PM)
          if (process.env.REACT_APP_ENABLE_PUSH_NOTIFICATIONS === 'true') {
            notificationService.scheduleDailyReminder(20, 0);
          }
        }
      }

      // Load local settings
      loadLocalSettings();

      // Listen for auth state changes
      if (cloudConfigured) {
        authService.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN') {
            setUser(session.user);
            await loadUserProfile(session.user.id);
            await cloudSyncService.performFullSync();
            toast.success('Signed in successfully!');
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setProfile(null);
            toast.info('Signed out');
          }
        });
      }
    } catch (error) {
      console.error('App initialization error:', error);
      toast.error('Failed to initialize app');
    } finally {
      setAuthLoading(false);
    }
  };

  // Load local settings
  const loadLocalSettings = () => {
    try {
      const savedSettings = localStorage.getItem('adhd_quest_settings');
      const savedCompleted = localStorage.getItem('adhd_quest_completed');

      if (savedSettings) {
        const loaded = JSON.parse(savedSettings);
        setSettings(loaded);
        applyTheme(loaded.primaryColor || loaded.themeColor || '#00FF00');
      }

      if (savedCompleted) {
        setCompletedQuests(JSON.parse(savedCompleted));
      }
    } catch (error) {
      console.error('Error loading local settings:', error);
    }
  };

  // Load user profile
  const loadUserProfile = async (userId) => {
    try {
      const { profile: userProfile, error } = await authService.getUserProfile(userId);

      if (error) throw error;

      if (userProfile) {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Save settings
  useEffect(() => {
    if (!authLoading) {
      localStorage.setItem('adhd_quest_settings', JSON.stringify(settings));
    }
  }, [settings, authLoading]);

  // Save completed quests
  useEffect(() => {
    if (!authLoading) {
      localStorage.setItem('adhd_quest_completed', JSON.stringify(completedQuests));
    }
  }, [completedQuests, authLoading]);

  // Sync sound effects with settings
  useEffect(() => {
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

  // Handle widget selection
  const handleSelectWidget = (widgetId) => {
    playSound('click');
    setCurrentWidget(widgetId);
  };

  // Handle back to arcade
  const handleBackToArcade = () => {
    playSound('click');
    setCurrentWidget(null);
  };

  // Handle completing a quest
  const handleCompleteQuest = async (task) => {
    const completedQuest = {
      ...task,
      completedAt: new Date().toISOString(),
      xpEarned: task.subtasks.length * 10,
      wasSpeedrun: false,
      totalTime: null
    };

    setCompletedQuests(prev => [completedQuest, ...prev]);

    // Record activity for streak
    const streakResult = recordActivity();

    if (streakResult.milestoneReached) {
      toast.success(`🔥 ${streakResult.currentStreak}-Day Streak Milestone!`);
      notificationService.showStreakMilestone(streakResult.milestoneReached);
    } else if (streakResult.streakContinued) {
      if (streakResult.isNewLongest) {
        toast.success(`🔥 New longest streak: ${streakResult.currentStreak} days!`);
      }
    }

    // Sync to cloud if logged in
    if (user && syncEnabled) {
      try {
        await cloudSyncService.performFullSync();
      } catch (error) {
        console.error('Sync error:', error);
      }
    }

    playSound('complete');
  };

  // Handle restoring a quest
  const handleRestoreQuest = (quest) => {
    setCompletedQuests(prev => prev.filter(q => q.id !== quest.id));
    toast.info('Quest restored from archive');
  };

  // Handle deleting a completed quest
  const handleDeleteCompleted = (questId) => {
    setCompletedQuests(prev => prev.filter(q => q.id !== questId));
    toast.info('Quest deleted');
  };

  // Handle settings updates
  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    applyTheme(newSettings.primaryColor || newSettings.themeColor);
  };

  // Handle theme change
  const handleThemeChange = (color) => {
    const newSettings = {
      ...settings,
      primaryColor: color,
      themeColor: color
    };
    setSettings(newSettings);
    applyTheme(color);
    toast.success('Theme applied!');
  };

  // Handle template selection
  const handleSelectTemplate = (template) => {
    // Switch to Task Crusher and pass template
    setCurrentWidget('task-crusher');
    toast.success(`Template "${template.name}" loaded!`);
  };

  // Handle reset all data
  const handleResetAll = () => {
    if (window.confirm('Are you sure? This will delete ALL local data and cannot be undone!')) {
      localStorage.clear();
      setCompletedQuests([]);
      setSettings({
        themeColor: '#00FF00',
        primaryColor: '#00FF00',
        scanlines: true,
        soundEffects: false,
        soundEnabled: false,
        scanlinesEnabled: true,
        hiddenWidgets: []
      });
      applyTheme('#00FF00');
      toast.success('All data reset!');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // Handle reset XP
  const handleResetXP = () => {
    if (window.confirm('Reset your XP and level? This cannot be undone!')) {
      const profile = JSON.parse(localStorage.getItem('adhd_quest_profile') || '{}');
      profile.totalXP = 0;
      profile.level = 1;
      profile.currentLevelXP = 0;
      profile.xpToNextLevel = 200;
      profile.subtasksCompleted = 0;
      localStorage.setItem('adhd_quest_profile', JSON.stringify(profile));
      toast.success('XP and Level reset! Refresh to see changes.');
    }
  };

  // Handle login
  const handleLogin = async (userData) => {
    setUser(userData);
    await loadUserProfile(userData.id);
    setAuthMode(null);
    setShowLanding(false);
    toast.success('Welcome back!');

    // Perform initial sync
    if (syncEnabled) {
      setSyncing(true);
      try {
        await cloudSyncService.performFullSync();
        toast.success('Data synced!');
      } catch (error) {
        toast.error('Sync failed');
      } finally {
        setSyncing(false);
      }
    }
  };

  // Handle signup
  const handleSignUp = async (userData) => {
    setUser(userData);
    await loadUserProfile(userData.id);
    setAuthMode(null);
    setShowLanding(false);
    toast.success('Account created!');

    // Migrate local data to cloud
    if (syncEnabled) {
      toast.info('Migrating local data to cloud...');
      setSyncing(true);
      try {
        await cloudSyncService.performFullSync();
        toast.success('Local data migrated to cloud!');
      } catch (error) {
        toast.error('Migration failed');
      } finally {
        setSyncing(false);
      }
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    if (window.confirm('Sign out? Your data will remain saved in the cloud.')) {
      try {
        await authService.signOut();
        setUser(null);
        setProfile(null);
        toast.success('Signed out');
      } catch (error) {
        toast.error('Sign out failed');
      }
    }
  };

  // Handle profile update
  const handleUpdateProfile = (updatedUser) => {
    setUser(updatedUser);
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

      case 'time-trainer':
        return <TimeTrainer onBack={handleBackToArcade} />;

      case 'badges':
      case 'achievements':
        return (
          <AchievementsEnhanced
            profile={profile}
            completedQuests={completedQuests}
            onBack={handleBackToArcade}
          />
        );

      case 'statistics':
      case 'stats':
        return <StatsDashboard onBack={handleBackToArcade} />;

      case 'streak':
        return (
          <div className="widget-container">
            <StreakWidget compact={false} />
          </div>
        );

      case 'templates':
        return (
          <TemplateLibrary
            onSelectTemplate={handleSelectTemplate}
            onBack={handleBackToArcade}
          />
        );

      case 'theme-editor':
        return (
          <ThemeEditor
            currentTheme={settings.primaryColor || settings.themeColor}
            onThemeChange={handleThemeChange}
            onBack={handleBackToArcade}
          />
        );

      case 'profile':
        return (
          <UserProfile
            user={user}
            profile={profile}
            onUpdate={handleUpdateProfile}
            onSignOut={handleSignOut}
          />
        );

      default:
        return <PlaceholderWidget name="UNKNOWN" icon="❓" description="Widget not found" />;
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="App">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'var(--font-primary)',
          color: 'var(--color-green)',
          fontSize: '24px'
        }}>
          LOADING...
        </div>
      </div>
    );
  }

  // Auth modals
  if (authMode === 'login') {
    return (
      <>
        <Login
          onLogin={handleLogin}
          onSwitchToSignUp={() => setAuthMode('signup')}
          onClose={() => setAuthMode(null)}
        />
        <ToastContainer position="bottom-right" theme="dark" />
      </>
    );
  }

  if (authMode === 'signup') {
    return (
      <>
        <SignUp
          onSignUp={handleSignUp}
          onSwitchToLogin={() => setAuthMode('login')}
          onClose={() => setAuthMode(null)}
        />
        <ToastContainer position="bottom-right" theme="dark" />
      </>
    );
  }

  // Landing page
  if (showLanding) {
    return (
      <div className={`App ${settings.scanlinesEnabled ? 'scanlines' : ''}`}>
        <LandingPage
          onEnterApp={() => setShowLanding(false)}
          onShowLogin={() => syncEnabled && setAuthMode('login')}
          onShowSignUp={() => syncEnabled && setAuthMode('signup')}
          cloudEnabled={syncEnabled}
          user={user}
        />
        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    );
  }

  // Widget library
  if (!currentWidget) {
    return (
      <div className={`App ${settings.scanlinesEnabled ? 'scanlines' : ''}`}>
        <WidgetLibrary
          onSelectWidget={handleSelectWidget}
          userSettings={settings}
          user={user}
          onShowProfile={() => handleSelectWidget('profile')}
          onShowLogin={() => setAuthMode('login')}
        />
        <ToastContainer position="bottom-right" theme="dark" />
      </div>
    );
  }

  // Active widget
  return (
    <div className={`App ${settings.scanlinesEnabled ? 'scanlines' : ''}`}>
      <div className="widget-container">
        <button className="back-to-arcade-btn" onClick={handleBackToArcade}>
          ◄ BACK TO ARCADE
        </button>
        <div className="widget-content">
          {renderWidget()}
        </div>
      </div>
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}

export default App;
