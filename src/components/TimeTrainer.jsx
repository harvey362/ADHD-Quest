import React, { useState, useEffect, useRef } from 'react';
import '../styles/timetrainer.css';

const TimeTrainer = () => {
  const [mode, setMode] = useState('practice'); // 'practice' or 'game'
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [targetTime, setTargetTime] = useState(60); // in seconds
  const [estimate, setEstimate] = useState('');
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({ total: 0, accuracy: 0, avgError: 0 });
  const intervalRef = useRef(null);

  // Load results and stats
  useEffect(() => {
    const savedResults = localStorage.getItem('adhd_quest_time_trainer_results');
    const savedStats = localStorage.getItem('adhd_quest_time_trainer_stats');

    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (e) {
        console.error('Error loading results:', e);
      }
    }

    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error('Error loading stats:', e);
      }
    }
  }, []);

  // Save results and stats
  useEffect(() => {
    localStorage.setItem('adhd_quest_time_trainer_results', JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    localStorage.setItem('adhd_quest_time_trainer_stats', JSON.stringify(stats));
  }, [stats]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
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
  }, [isRunning]);

  const startTimer = () => {
    setElapsedTime(0);
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const submitEstimate = () => {
    if (!estimate) {
      alert('Please enter your time estimate!');
      return;
    }

    const estimatedSeconds = parseInt(estimate);
    const actualSeconds = elapsedTime;
    const error = Math.abs(estimatedSeconds - actualSeconds);
    const errorPercentage = ((error / actualSeconds) * 100).toFixed(1);
    const accuracy = Math.max(0, 100 - parseFloat(errorPercentage));

    const result = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      estimated: estimatedSeconds,
      actual: actualSeconds,
      error,
      errorPercentage: parseFloat(errorPercentage),
      accuracy: parseFloat(accuracy.toFixed(1))
    };

    const newResults = [result, ...results].slice(0, 20); // Keep last 20
    setResults(newResults);

    // Update stats
    const totalAccuracy = newResults.reduce((sum, r) => sum + r.accuracy, 0);
    const totalError = newResults.reduce((sum, r) => sum + r.error, 0);
    setStats({
      total: newResults.length,
      accuracy: (totalAccuracy / newResults.length).toFixed(1),
      avgError: (totalError / newResults.length).toFixed(1)
    });

    // Reset for next round
    setElapsedTime(0);
    setEstimate('');
    setIsRunning(false);
  };

  const startGame = () => {
    const times = [30, 45, 60, 90, 120]; // Random target times
    const randomTarget = times[Math.floor(Math.random() * times.length)];
    setTargetTime(randomTarget);
    setMode('game');
    setElapsedTime(0);
    setEstimate('');
  };

  const checkGameResult = () => {
    stopTimer();
    const error = Math.abs(targetTime - elapsedTime);
    const errorPercentage = ((error / targetTime) * 100).toFixed(1);

    let message = '';
    if (error <= 3) {
      message = '🏆 PERFECT! You nailed it!';
    } else if (error <= 10) {
      message = '🎯 GREAT! Very close!';
    } else if (error <= 20) {
      message = '👍 GOOD! Not bad!';
    } else {
      message = '💪 KEEP PRACTICING!';
    }

    alert(`${message}\n\nTarget: ${targetTime}s\nYour time: ${elapsedTime}s\nError: ${error}s (${errorPercentage}%)`);
    setMode('practice');
  };

  const resetStats = () => {
    if (window.confirm('Reset all time training stats?')) {
      setResults([]);
      setStats({ total: 0, accuracy: 0, avgError: 0 });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return '#4ecdc4';
    if (accuracy >= 70) return '#ffd700';
    if (accuracy >= 50) return '#ffa500';
    return '#ff6b6b';
  };

  return (
    <div className="timetrainer-container">
      <div className="timetrainer-header">
        <h1 className="timetrainer-title glow-strong">
          &gt; TIME TRAINER_
        </h1>
        <p className="timetrainer-subtitle">IMPROVE TIME ESTIMATION</p>
      </div>

      <div className="timetrainer-body">
        {/* Mode Selector */}
        <div className="mode-selector">
          <button
            className={`mode-btn ${mode === 'practice' ? 'active' : ''}`}
            onClick={() => setMode('practice')}
            disabled={isRunning}
          >
            📊 PRACTICE MODE
          </button>
          <button
            className={`mode-btn ${mode === 'game' ? 'active' : ''}`}
            onClick={startGame}
            disabled={isRunning}
          >
            🎮 GAME MODE
          </button>
        </div>

        {/* Practice Mode */}
        {mode === 'practice' && (
          <div className="practice-mode">
            <div className="timer-section">
              <h3>PRACTICE TIME ESTIMATION</h3>
              <div className="timer-display-large">
                {formatTime(elapsedTime)}
              </div>

              <div className="timer-controls">
                {!isRunning ? (
                  <button className="control-btn start" onClick={startTimer}>
                    ▶ START TIMER
                  </button>
                ) : (
                  <button className="control-btn stop" onClick={stopTimer}>
                    ⏹ STOP TIMER
                  </button>
                )}
              </div>

              {!isRunning && elapsedTime > 0 && (
                <div className="estimate-section">
                  <h4>How long did that feel?</h4>
                  <div className="estimate-input-group">
                    <input
                      type="number"
                      className="estimate-input"
                      placeholder="Enter seconds"
                      value={estimate}
                      onChange={(e) => setEstimate(e.target.value)}
                      min="1"
                    />
                    <button className="submit-btn" onClick={submitEstimate}>
                      SUBMIT ESTIMATE
                    </button>
                  </div>
                  <p className="hint">Actual time: {elapsedTime} seconds (hidden until you estimate!)</p>
                </div>
              )}

              <div className="instructions">
                <h4>HOW TO PRACTICE</h4>
                <ol>
                  <li>Press START and do a task without watching the timer</li>
                  <li>When done, press STOP</li>
                  <li>Estimate how many seconds passed</li>
                  <li>Submit to see your accuracy!</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Game Mode */}
        {mode === 'game' && (
          <div className="game-mode">
            <h3>🎮 GAME CHALLENGE</h3>
            <div className="game-info">
              <p className="challenge-text">
                Try to stop the timer as close to <strong>{targetTime} seconds</strong> as possible!
              </p>
            </div>

            <div className="timer-display-large">
              {formatTime(elapsedTime)}
            </div>

            <div className="timer-controls">
              {!isRunning ? (
                <button className="control-btn start" onClick={startTimer}>
                  ▶ START CHALLENGE
                </button>
              ) : (
                <button className="control-btn stop" onClick={checkGameResult}>
                  ⏹ STOP (I'm at {targetTime}s!)
                </button>
              )}
            </div>

            <button className="back-btn" onClick={() => setMode('practice')}>
              ← BACK TO PRACTICE
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="stats-section">
          <div className="stats-header">
            <h3>YOUR STATS</h3>
            <button className="reset-stats-btn" onClick={resetStats}>
              RESET
            </button>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Attempts</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: getAccuracyColor(stats.accuracy) }}>
                {stats.accuracy}%
              </div>
              <div className="stat-label">Avg Accuracy</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.avgError}s</div>
              <div className="stat-label">Avg Error</div>
            </div>
          </div>
        </div>

        {/* Recent Results */}
        {results.length > 0 && (
          <div className="results-section">
            <h3>RECENT ATTEMPTS</h3>
            <div className="results-list">
              {results.slice(0, 10).map(result => (
                <div key={result.id} className="result-item">
                  <div className="result-info">
                    <div className="result-time">
                      Estimated: <strong>{result.estimated}s</strong> |
                      Actual: <strong>{result.actual}s</strong>
                    </div>
                    <div className="result-meta">
                      Error: {result.error}s ({result.errorPercentage}%)
                    </div>
                  </div>
                  <div
                    className="result-accuracy"
                    style={{ color: getAccuracyColor(result.accuracy) }}
                  >
                    {result.accuracy}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="tips-section">
          <h4>TRAINING TIPS</h4>
          <ul>
            <li>🧠 Practice regularly to improve your internal clock</li>
            <li>⏱ Start with shorter intervals (30-60s) before trying longer ones</li>
            <li>🎯 Don't peek at the timer - trust your sense of time</li>
            <li>📈 Track your progress - you'll improve with practice!</li>
            <li>💡 Use this skill for task planning and time management</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimeTrainer;
