import React, { useState, useEffect, useRef } from 'react';
import '../styles/pomodoro.css';

const PomodoroTimer = () => {
  const [mode, setMode] = useState('focus'); // 'focus' or 'break'
  const [timeLeft, setTimeLeft] = useState(25 * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState({ focus: 0, breaks: 0 });
  const intervalRef = useRef(null);

  // Load sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('adhd_quest_pomodoro_sessions');
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error('Error loading pomodoro sessions:', e);
      }
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('adhd_quest_pomodoro_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    if (mode === 'focus') {
      setSessions(prev => ({ ...prev, focus: prev.focus + 1 }));
      // Auto-switch to break
      setMode('break');
      setTimeLeft(5 * 60);
    } else {
      setSessions(prev => ({ ...prev, breaks: prev.breaks + 1 }));
      // Auto-switch to focus
      setMode('focus');
      setTimeLeft(25 * 60);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const resetSessions = () => {
    if (window.confirm('Reset all session stats?')) {
      setSessions({ focus: 0, breaks: 0 });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'focus'
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="pomodoro-container">
      <div className="pomodoro-header">
        <h1 className="pomodoro-title glow-strong">
          &gt; FOCUS TIMER_
        </h1>
        <p className="pomodoro-subtitle">POMODORO TECHNIQUE</p>
      </div>

      <div className="pomodoro-body">
        {/* Mode Selector */}
        <div className="mode-selector">
          <button
            className={`mode-btn ${mode === 'focus' ? 'active' : ''}`}
            onClick={() => switchMode('focus')}
            disabled={isRunning}
          >
            🍅 FOCUS (25:00)
          </button>
          <button
            className={`mode-btn ${mode === 'break' ? 'active' : ''}`}
            onClick={() => switchMode('break')}
            disabled={isRunning}
          >
            ☕ BREAK (05:00)
          </button>
        </div>

        {/* Timer Display */}
        <div className={`timer-display ${isRunning ? 'running' : ''} ${mode}`}>
          <div className="timer-circle">
            <svg className="progress-ring" width="300" height="300">
              <circle
                className="progress-ring-bg"
                cx="150"
                cy="150"
                r="130"
              />
              <circle
                className="progress-ring-fill"
                cx="150"
                cy="150"
                r="130"
                style={{
                  strokeDasharray: `${2 * Math.PI * 130}`,
                  strokeDashoffset: `${2 * Math.PI * 130 * (1 - progress / 100)}`
                }}
              />
            </svg>
            <div className="timer-text">
              <div className="time-value">{formatTime(timeLeft)}</div>
              <div className="mode-label">{mode === 'focus' ? 'FOCUS' : 'BREAK'}</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="timer-controls">
          <button
            className={`control-btn ${isRunning ? 'pause' : 'start'}`}
            onClick={toggleTimer}
          >
            {isRunning ? '⏸ PAUSE' : '▶ START'}
          </button>
          <button
            className="control-btn reset"
            onClick={resetTimer}
          >
            🔄 RESET
          </button>
        </div>

        {/* Session Stats */}
        <div className="session-stats">
          <div className="stats-header">
            <h3>SESSION STATS</h3>
            <button className="reset-stats-btn" onClick={resetSessions}>
              CLEAR
            </button>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">🍅</div>
              <div className="stat-value">{sessions.focus}</div>
              <div className="stat-label">Focus Sessions</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">☕</div>
              <div className="stat-value">{sessions.breaks}</div>
              <div className="stat-label">Break Sessions</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">⏱</div>
              <div className="stat-value">{sessions.focus * 25}</div>
              <div className="stat-label">Minutes Focused</div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="pomodoro-tips">
          <h4>TECHNIQUE GUIDE</h4>
          <ul>
            <li>🎯 Focus for 25 minutes without interruption</li>
            <li>☕ Take a 5-minute break after each session</li>
            <li>🔁 After 4 focus sessions, take a longer 15-30 min break</li>
            <li>🚫 Minimize distractions during focus time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
