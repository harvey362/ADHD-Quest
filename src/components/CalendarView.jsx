import React, { useState, useEffect } from 'react';
import '../styles/calendar.css';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('month'); // 'month' or 'week'

  // Load tasks and completed quests
  useEffect(() => {
    const savedTasks = localStorage.getItem('adhd_quest_tasks');
    const savedCompleted = localStorage.getItem('adhd_quest_completed');

    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error('Error loading tasks:', e);
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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getTasksForDate = (date) => {
    if (!date) return [];

    const dateStr = date.toISOString().split('T')[0];

    // Get active tasks with target dates
    const activeTasks = tasks.filter(task => {
      if (task.targetDate) {
        return task.targetDate === dateStr;
      }
      return false;
    });

    // Get completed quests on this date
    const completed = completedQuests.filter(quest => {
      if (quest.completedAt) {
        const completedDate = new Date(quest.completedAt).toISOString().split('T')[0];
        return completedDate === dateStr;
      }
      return false;
    });

    return { active: activeTasks, completed };
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date) => {
    if (!date) return false;
    return date.getMonth() === currentDate.getMonth();
  };

  const changeMonth = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : null;

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1 className="calendar-title glow-strong">
          &gt; QUEST CALENDAR_
        </h1>
        <p className="calendar-subtitle">TIMELINE VIEW</p>
      </div>

      <div className="calendar-controls">
        <button className="cal-nav-btn" onClick={() => changeMonth(-1)}>
          ◄ PREV
        </button>
        <div className="month-display">{formatMonthYear()}</div>
        <button className="cal-nav-btn" onClick={() => changeMonth(1)}>
          NEXT ►
        </button>
        <button className="today-btn" onClick={goToToday}>
          TODAY
        </button>
      </div>

      <div className="calendar-grid">
        {/* Day headers */}
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className="day-header">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((date, index) => {
          const tasksOnDate = date ? getTasksForDate(date) : { active: [], completed: [] };
          const hasEvents = date && (tasksOnDate.active.length > 0 || tasksOnDate.completed.length > 0);
          const isSelected = selectedDate && date &&
            selectedDate.toDateString() === date.toDateString();

          return (
            <div
              key={index}
              className={`calendar-day ${!date ? 'empty' : ''} ${
                isToday(date) ? 'today' : ''
              } ${!isSameMonth(date) ? 'other-month' : ''} ${
                hasEvents ? 'has-events' : ''
              } ${isSelected ? 'selected' : ''}`}
              onClick={() => date && setSelectedDate(date)}
            >
              {date && (
                <>
                  <div className="day-number">{date.getDate()}</div>
                  {hasEvents && (
                    <div className="event-indicators">
                      {tasksOnDate.active.length > 0 && (
                        <span className="indicator active" title={`${tasksOnDate.active.length} active`}>
                          ⚡{tasksOnDate.active.length}
                        </span>
                      )}
                      {tasksOnDate.completed.length > 0 && (
                        <span className="indicator completed" title={`${tasksOnDate.completed.length} completed`}>
                          ✓{tasksOnDate.completed.length}
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Date Details */}
      {selectedDate && selectedDateTasks && (
        <div className="date-details">
          <h3>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </h3>

          {selectedDateTasks.active.length === 0 && selectedDateTasks.completed.length === 0 && (
            <p className="no-events">No quests for this date</p>
          )}

          {selectedDateTasks.active.length > 0 && (
            <div className="tasks-section">
              <h4>⚡ ACTIVE QUESTS ({selectedDateTasks.active.length})</h4>
              <ul className="task-list">
                {selectedDateTasks.active.map(task => (
                  <li key={task.id} className="task-item active">
                    <div className="task-icon">🎯</div>
                    <div className="task-info">
                      <div className="task-name">{task.name}</div>
                      <div className="task-meta">
                        {task.subtasks?.length || 0} subtasks • Priority: {task.priority || 'Normal'}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedDateTasks.completed.length > 0 && (
            <div className="tasks-section">
              <h4>✓ COMPLETED QUESTS ({selectedDateTasks.completed.length})</h4>
              <ul className="task-list">
                {selectedDateTasks.completed.map(quest => (
                  <li key={quest.id} className="task-item completed">
                    <div className="task-icon">🏆</div>
                    <div className="task-info">
                      <div className="task-name">{quest.name}</div>
                      <div className="task-meta">
                        {quest.xpEarned || 0} XP earned
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="calendar-legend">
        <h4>LEGEND</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-box today-box"></span>
            <span>Today</span>
          </div>
          <div className="legend-item">
            <span className="legend-box active-box">⚡</span>
            <span>Active Quests</span>
          </div>
          <div className="legend-item">
            <span className="legend-box completed-box">✓</span>
            <span>Completed Quests</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="calendar-info">
        <p>💡 TIP: Click on any date to view quests scheduled for that day</p>
        <p>⚠️ NOTE: Calendar shows tasks with target dates and completed quests</p>
      </div>
    </div>
  );
};

export default CalendarView;
