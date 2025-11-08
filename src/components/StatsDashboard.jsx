/**
 * Statistics Dashboard
 *
 * Comprehensive analytics and visualization dashboard showing:
 * - Task completion trends
 * - XP earnings over time
 * - Pomodoro session statistics
 * - Time trainer accuracy
 * - Productivity heatmap
 * - Performance insights
 */

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import statsAggregator from '../utils/statsAggregator';
import { getStreakStats } from '../utils/streakTracker';
import '../styles/statsdashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function StatsDashboard({ onBack }) {
  const [timeRange, setTimeRange] = useState('week'); // day, week, month, year
  const [stats, setStats] = useState(null);
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState(null);
  const [bestTimes, setBestTimes] = useState(null);
  const [streakStats, setStreakStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = () => {
    setLoading(true);

    try {
      const endDate = new Date();
      let startDate = new Date();
      let granularity = 'daily';

      // Calculate date range based on selection
      switch (timeRange) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1);
          granularity = 'daily';
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          granularity = 'daily';
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          granularity = 'daily';
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          granularity = 'weekly';
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      const statsData = statsAggregator.getStats(startDate, endDate, granularity);
      const overviewData = statsAggregator.getOverviewStats(
        statsAggregator.loadProfile(),
        statsAggregator.loadCompletedQuests(),
        statsAggregator.loadPomodoroSessions()
      );
      const trendsData = statsAggregator.getProductivityTrends(30);
      const bestTimesData = statsAggregator.getBestPerformanceTimes();
      const streakData = getStreakStats();

      setStats(statsData);
      setOverview(overviewData);
      setTrends(trendsData);
      setBestTimes(bestTimesData);
      setStreakStats(streakData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTaskChartData = () => {
    if (!stats) return null;

    return {
      labels: stats.tasks.map(d => d.date),
      datasets: [
        {
          label: 'Completed',
          data: stats.tasks.map(d => d.completed),
          borderColor: '#00FF00',
          backgroundColor: 'rgba(0, 255, 0, 0.2)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Created',
          data: stats.tasks.map(d => d.created),
          borderColor: '#00AA00',
          backgroundColor: 'rgba(0, 170, 0, 0.1)',
          fill: false,
          tension: 0.4,
        },
      ],
    };
  };

  const getXPChartData = () => {
    if (!stats) return null;

    return {
      labels: stats.xp.map(d => d.date),
      datasets: [
        {
          label: 'XP Earned',
          data: stats.xp.map(d => d.xpEarned),
          backgroundColor: '#00FF00',
          borderColor: '#00FF00',
          borderWidth: 2,
        },
      ],
    };
  };

  const getPomodoroChartData = () => {
    if (!stats) return null;

    return {
      labels: stats.pomodoro.map(d => d.date),
      datasets: [
        {
          label: 'Focus Sessions',
          data: stats.pomodoro.map(d => d.focusSessions),
          backgroundColor: '#00FF00',
        },
        {
          label: 'Break Sessions',
          data: stats.pomodoro.map(d => d.breakSessions),
          backgroundColor: '#00AA00',
        },
      ],
    };
  };

  const getProductivityBreakdownData = () => {
    if (!overview) return null;

    const total = overview.totalTasks + overview.totalSubtasks;
    if (total === 0) return null;

    return {
      labels: ['Tasks', 'Subtasks'],
      datasets: [
        {
          data: [overview.totalTasks, overview.totalSubtasks],
          backgroundColor: ['#00FF00', '#00AA00'],
          borderColor: '#000000',
          borderWidth: 3,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#00FF00',
          font: {
            family: 'VT323',
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: '#000000',
        borderColor: '#00FF00',
        borderWidth: 2,
        titleColor: '#00FF00',
        bodyColor: '#00FF00',
        titleFont: {
          family: 'Press Start 2P',
          size: 10,
        },
        bodyFont: {
          family: 'VT323',
          size: 14,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#00AA00',
          font: {
            family: 'VT323',
            size: 12,
          },
        },
        grid: {
          color: 'rgba(0, 255, 0, 0.1)',
        },
      },
      y: {
        ticks: {
          color: '#00AA00',
          font: {
            family: 'VT323',
            size: 12,
          },
        },
        grid: {
          color: 'rgba(0, 255, 0, 0.1)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#00FF00',
          font: {
            family: 'VT323',
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: '#000000',
        borderColor: '#00FF00',
        borderWidth: 2,
        titleColor: '#00FF00',
        bodyColor: '#00FF00',
        titleFont: {
          family: 'Press Start 2P',
          size: 10,
        },
        bodyFont: {
          family: 'VT323',
          size: 14,
        },
      },
    },
  };

  const getTrendIndicator = (trend) => {
    if (trend === 'increasing') return '📈';
    if (trend === 'decreasing') return '📉';
    return '➡️';
  };

  const getTrendClass = (trend) => {
    if (trend === 'increasing') return 'trend-up';
    if (trend === 'decreasing') return 'trend-down';
    return 'trend-stable';
  };

  if (loading) {
    return (
      <div className="stats-dashboard">
        <div className="stats-loading">
          <div className="loading-spinner">⏳</div>
          <p>LOADING STATS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-dashboard">
      <div className="stats-header">
        <button className="back-button" onClick={onBack}>
          ← BACK
        </button>
        <h1 className="stats-title">📊 STATISTICS</h1>
      </div>

      <div className="time-range-selector">
        <button
          className={`time-button ${timeRange === 'day' ? 'active' : ''}`}
          onClick={() => setTimeRange('day')}
        >
          DAY
        </button>
        <button
          className={`time-button ${timeRange === 'week' ? 'active' : ''}`}
          onClick={() => setTimeRange('week')}
        >
          WEEK
        </button>
        <button
          className={`time-button ${timeRange === 'month' ? 'active' : ''}`}
          onClick={() => setTimeRange('month')}
        >
          MONTH
        </button>
        <button
          className={`time-button ${timeRange === 'year' ? 'active' : ''}`}
          onClick={() => setTimeRange('year')}
        >
          YEAR
        </button>
      </div>

      {/* Overview Cards */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{overview?.totalTasks || 0}</div>
          <div className="stat-label">Total Tasks</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✨</div>
          <div className="stat-value">{overview?.totalXP?.toLocaleString() || 0}</div>
          <div className="stat-label">Total XP</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🍅</div>
          <div className="stat-value">{overview?.totalFocusTime || 0}m</div>
          <div className="stat-label">Focus Time</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{streakStats?.current || 0}</div>
          <div className="stat-label">Current Streak</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-value">{overview?.productivity || 0}%</div>
          <div className="stat-label">Productivity</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{overview?.tasksToday || 0}</div>
          <div className="stat-label">Today</div>
        </div>
      </div>

      {/* Trends */}
      {trends && (
        <div className="trends-section">
          <h2>30-Day Trends</h2>
          <div className="trends-grid">
            <div className={`trend-item ${getTrendClass(trends.tasks)}`}>
              <span className="trend-icon">{getTrendIndicator(trends.tasks)}</span>
              <span className="trend-label">Tasks</span>
              <span className="trend-status">{trends.tasks}</span>
            </div>
            <div className={`trend-item ${getTrendClass(trends.xp)}`}>
              <span className="trend-icon">{getTrendIndicator(trends.xp)}</span>
              <span className="trend-label">XP</span>
              <span className="trend-status">{trends.xp}</span>
            </div>
            <div className={`trend-item ${getTrendClass(trends.pomodoro)}`}>
              <span className="trend-icon">{getTrendIndicator(trends.pomodoro)}</span>
              <span className="trend-label">Pomodoro</span>
              <span className="trend-status">{trends.pomodoro}</span>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Task Completion Chart */}
        <div className="chart-container">
          <h3>Task Activity</h3>
          <div className="chart-wrapper">
            {getTaskChartData() && (
              <Line data={getTaskChartData()} options={chartOptions} />
            )}
          </div>
        </div>

        {/* XP Earnings Chart */}
        <div className="chart-container">
          <h3>XP Earned</h3>
          <div className="chart-wrapper">
            {getXPChartData() && (
              <Bar data={getXPChartData()} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Pomodoro Sessions Chart */}
        <div className="chart-container">
          <h3>Pomodoro Sessions</h3>
          <div className="chart-wrapper">
            {getPomodoroChartData() && (
              <Bar data={getPomodoroChartData()} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Productivity Breakdown */}
        <div className="chart-container">
          <h3>Completion Breakdown</h3>
          <div className="chart-wrapper">
            {getProductivityBreakdownData() && (
              <Doughnut data={getProductivityBreakdownData()} options={doughnutOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Best Performance Times */}
      {bestTimes && (
        <div className="insights-section">
          <h2>⏰ Peak Performance</h2>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-label">Best Hour</div>
              <div className="insight-value">
                {bestTimes.hour}:00 - {bestTimes.hour + 1}:00
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-label">Best Day</div>
              <div className="insight-value">{bestTimes.day}</div>
            </div>
          </div>
        </div>
      )}

      {/* Streak Info */}
      {streakStats && (
        <div className="insights-section">
          <h2>🔥 Streak Performance</h2>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-label">Current Streak</div>
              <div className="insight-value">{streakStats.current} days</div>
            </div>
            <div className="insight-card">
              <div className="insight-label">Longest Streak</div>
              <div className="insight-value">{streakStats.longest} days</div>
            </div>
            <div className="insight-card">
              <div className="insight-label">Next Milestone</div>
              <div className="insight-value">
                {streakStats.nextMilestone ? `${streakStats.nextMilestone} days` : 'MAX!'}
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-label">Total Active Days</div>
              <div className="insight-value">{streakStats.totalActiveDays}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatsDashboard;
