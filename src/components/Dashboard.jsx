import React, { useState, useEffect } from 'react';
import XPBar from './XPBar';
import TaskInput from './TaskInput';
import TaskList from './TaskList';
import { generateSubtasks } from '../services/aiService';
import { getLevelFromXP, awardXP, createDefaultProfile, XP_PER_SUBTASK } from '../utils/xpSystem';
import '../styles/dashboard.css';

const Dashboard = ({ onCompleteQuest, settings }) => {
  const [tasks, setTasks] = useState([]);
  const [userProfile, setUserProfile] = useState(createDefaultProfile());
  const [isLoading, setIsLoading] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [speedrunTimers, setSpeedrunTimers] = useState({});

  // Track initial mount to prevent saving on first render
  const isInitialMountTasks = React.useRef(true);
  const isInitialMountProfile = React.useRef(true);
  const isInitialMountTimers = React.useRef(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('adhd_quest_tasks');
    const savedProfile = localStorage.getItem('adhd_quest_profile');
    const savedTimers = localStorage.getItem('adhd_quest_timers');

    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error('Error loading tasks:', e);
      }
    }

    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Error loading profile:', e);
      }
    }

    if (savedTimers) {
      try {
        setSpeedrunTimers(JSON.parse(savedTimers));
      } catch (e) {
        console.error('Error loading timers:', e);
      }
    }
  }, []);

  // Save to localStorage whenever data changes (skip on initial mount)
  useEffect(() => {
    if (isInitialMountTasks.current) {
      isInitialMountTasks.current = false;
      return;
    }
    localStorage.setItem('adhd_quest_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (isInitialMountProfile.current) {
      isInitialMountProfile.current = false;
      return;
    }
    localStorage.setItem('adhd_quest_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    if (isInitialMountTimers.current) {
      isInitialMountTimers.current = false;
      return;
    }
    localStorage.setItem('adhd_quest_timers', JSON.stringify(speedrunTimers));
  }, [speedrunTimers]);
  
  // Generate unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  
  // Create new task with AI-generated subtasks
  const handleTaskCreate = async (taskData) => {
    setIsLoading(true);
    
    try {
      const subtasks = await generateSubtasks(taskData.title, taskData.granularity);
      
      const newTask = {
        id: generateId(),
        title: taskData.title,
        description: '',
        createdAt: new Date().toISOString(),
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        tags: taskData.tags,
        recurring: taskData.recurring,
        speedrunMode: taskData.speedrunMode || false,
        subtasks: subtasks.map((text, index) => ({
          id: generateId(),
          text,
          completed: false,
          order: index
        }))
      };
      
      setTasks(prevTasks => [newTask, ...prevTasks]);
      
      // Initialize speedrun timer if enabled
      if (taskData.speedrunMode) {
        setSpeedrunTimers(prev => ({
          ...prev,
          [newTask.id]: {
            taskStartTime: Date.now(), // Start timer immediately
            subtaskTimes: {},
            currentSubtaskStart: null,
            totalTime: 0
          }
        }));
      }
      
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to generate task breakdown. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle subtask completion and award XP
  const handleSubtaskToggle = (taskId, subtaskId) => {
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map(st => {
            if (st.id === subtaskId) {
              const wasCompleted = st.completed;
              const nowCompleted = !wasCompleted;
              
              // Handle speedrun timer
              if (task.speedrunMode) {
                const now = Date.now();
                
                if (nowCompleted && !wasCompleted) {
                  // Starting/completing a subtask
                  setSpeedrunTimers(prev => {
                    const timer = prev[taskId] || {
                      taskStartTime: null,
                      subtaskTimes: {},
                      currentSubtaskStart: null,
                      totalTime: 0
                    };
                    
                    // Create new timer object (don't mutate)
                    const newTimer = { ...timer };
                    
                    // Start task timer on first subtask
                    if (!newTimer.taskStartTime) {
                      newTimer.taskStartTime = now;
                    }
                    
                    // Stop previous subtask timer
                    if (newTimer.currentSubtaskStart) {
                      const elapsed = now - newTimer.currentSubtaskStart;
                      // Find the previous active subtask
                      const activeSubtasks = task.subtasks.filter(s => !s.completed && s.id !== subtaskId);
                      if (activeSubtasks.length > 0) {
                        const prevSubtask = activeSubtasks[0];
                        newTimer.subtaskTimes = {
                          ...newTimer.subtaskTimes,
                          [prevSubtask.id]: elapsed
                        };
                      }
                    }
                    
                    // Start this subtask timer
                    newTimer.currentSubtaskStart = now;
                    
                    return {
                      ...prev,
                      [taskId]: newTimer
                    };
                  });
                } else if (!nowCompleted && wasCompleted) {
                  // Unchecking - remove time
                  setSpeedrunTimers(prev => {
                    const timer = prev[taskId];
                    if (timer && timer.subtaskTimes[subtaskId]) {
                      delete timer.subtaskTimes[subtaskId];
                    }
                    return {
                      ...prev,
                      [taskId]: timer
                    };
                  });
                }
              }
              
              // Award or remove XP
              if (nowCompleted && !wasCompleted) {
                const result = awardXP(userProfile.totalXP, XP_PER_SUBTASK);
                
                setUserProfile(prev => ({
                  ...prev,
                  totalXP: result.newTotalXP,
                  level: result.level,
                  currentLevelXP: result.currentLevelXP,
                  xpToNextLevel: result.xpToNextLevel,
                  subtasksCompleted: prev.subtasksCompleted + 1
                }));
                
                if (result.leveledUp) {
                  setLevelUpData(result);
                  setShowLevelUpModal(true);
                  setTimeout(() => setShowLevelUpModal(false), 3000);
                }
              } else if (!nowCompleted && wasCompleted) {
                const newTotalXP = Math.max(0, userProfile.totalXP - XP_PER_SUBTASK);
                const stats = getLevelFromXP(newTotalXP);
                
                setUserProfile(prev => ({
                  ...prev,
                  totalXP: newTotalXP,
                  level: stats.level,
                  currentLevelXP: stats.currentLevelXP,
                  xpToNextLevel: stats.xpToNextLevel,
                  subtasksCompleted: Math.max(0, prev.subtasksCompleted - 1)
                }));
              }
              
              return { ...st, completed: nowCompleted };
            }
            return st;
          });
          
          return { ...task, subtasks: updatedSubtasks };
        }
        return task;
      });
    });
  };
  
  // Edit subtask text
  const handleSubtaskEdit = (taskId, subtaskId, newText) => {
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.map(st =>
              st.id === subtaskId ? { ...st, text: newText } : st
            )
          };
        }
        return task;
      });
    });
  };
  
  // Delete subtask
  const handleSubtaskDelete = (taskId, subtaskId) => {
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          const subtask = task.subtasks.find(st => st.id === subtaskId);
          if (subtask && subtask.completed) {
            const newTotalXP = Math.max(0, userProfile.totalXP - XP_PER_SUBTASK);
            const stats = getLevelFromXP(newTotalXP);
            
            setUserProfile(prev => ({
              ...prev,
              totalXP: newTotalXP,
              level: stats.level,
              currentLevelXP: stats.currentLevelXP,
              xpToNextLevel: stats.xpToNextLevel,
              subtasksCompleted: Math.max(0, prev.subtasksCompleted - 1)
            }));
          }
          
          return {
            ...task,
            subtasks: task.subtasks.filter(st => st.id !== subtaskId)
          };
        }
        return task;
      });
    });
  };
  
  // Add new subtask
  const handleSubtaskAdd = (taskId, text) => {
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          const newSubtask = {
            id: generateId(),
            text,
            completed: false,
            order: task.subtasks.length
          };
          return {
            ...task,
            subtasks: [...task.subtasks, newSubtask]
          };
        }
        return task;
      });
    });
  };
  
  // Complete entire quest
  const handleCompleteQuest = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Calculate final times if speedrun
    let timeData = null;
    if (task.speedrunMode && speedrunTimers[taskId]) {
      const timer = speedrunTimers[taskId];
      const totalTime = Date.now() - (timer.taskStartTime || Date.now());
      timeData = {
        totalTime,
        subtaskTimes: timer.subtaskTimes
      };
      
      // Clean up timer
      setSpeedrunTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[taskId];
        return newTimers;
      });
    }
    
    // Send to parent (App) to add to completed quests
    const completedTask = {
      ...task,
      timeData,
      completedAt: new Date().toISOString()
    };
    
    if (onCompleteQuest) {
      onCompleteQuest(completedTask);
    }
    
    // Remove from active tasks
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
  };
  
  // Delete entire task
  const handleTaskDelete = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const completedCount = task.subtasks.filter(st => st.completed).length;
      if (completedCount > 0) {
        const xpToRemove = completedCount * XP_PER_SUBTASK;
        const newTotalXP = Math.max(0, userProfile.totalXP - xpToRemove);
        const stats = getLevelFromXP(newTotalXP);
        
        setUserProfile(prev => ({
          ...prev,
          totalXP: newTotalXP,
          level: stats.level,
          currentLevelXP: stats.currentLevelXP,
          xpToNextLevel: stats.xpToNextLevel,
          subtasksCompleted: Math.max(0, prev.subtasksCompleted - completedCount)
        }));
      }
    }
    
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    
    // Clean up timer if exists
    if (speedrunTimers[taskId]) {
      setSpeedrunTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[taskId];
        return newTimers;
      });
    }
  };
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title glow-strong">
          ⚡ TASK CRUSHER_
        </h1>
        <p className="dashboard-subtitle">AI-Powered Quest Builder</p>
      </div>
      
      <XPBar
        totalXP={userProfile.totalXP}
        level={userProfile.level}
        currentLevelXP={userProfile.currentLevelXP}
        xpToNextLevel={userProfile.xpToNextLevel}
        progressPercent={userProfile.xpToNextLevel > 0 
          ? Math.round((userProfile.currentLevelXP / userProfile.xpToNextLevel) * 100) 
          : 100}
      />
      
      {showLevelUpModal && levelUpData && (
        <div className="level-up-modal">
          <div className="level-up-content">
            <h2 className="level-up-title">⚡ LEVEL UP! ⚡</h2>
            <p className="level-up-text">
              You reached Level {levelUpData.newLevel}!
            </p>
            <p className="level-up-subtext">Keep crushing it! 🎮</p>
          </div>
        </div>
      )}
      
      <div className="dashboard-content">
        <TaskInput onTaskCreate={handleTaskCreate} isLoading={isLoading} />
        
        <TaskList
          tasks={tasks}
          onSubtaskToggle={handleSubtaskToggle}
          onSubtaskEdit={handleSubtaskEdit}
          onSubtaskDelete={handleSubtaskDelete}
          onSubtaskAdd={handleSubtaskAdd}
          onTaskDelete={handleTaskDelete}
          onCompleteQuest={handleCompleteQuest}
          speedrunTimers={speedrunTimers}
          showTimer={true}
        />
      </div>
      
      <div className="dashboard-footer">
        <span>Active Quests: {tasks.length}</span>
        <span>•</span>
        <span>Steps Completed: {userProfile.subtasksCompleted}</span>
        <span>•</span>
        <span>Total XP: {userProfile.totalXP}</span>
      </div>
    </div>
  );
};

export default Dashboard;
