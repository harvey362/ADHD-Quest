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
                  // Completing a subtask
                  setSpeedrunTimers(prev => {
                    const timer = prev[taskId] || {
                      taskStartTime: null,
                      subtaskTimes: {},
                      currentSubtaskStart: null,
                      totalTime: 0
                    };
                    
                    // Create new timer object (don't mutate)
                    const newTimer = { 
                      ...timer,
                      subtaskTimes: { ...timer.subtaskTimes }
                    };
                    
                    // Start task timer on first subtask
                    if (!newTimer.taskStartTime) {
                      newTimer.taskStartTime = now;
                      newTimer.currentSubtaskStart = now;
                    }
                    
                    // Record time for the subtask we just completed
                    if (newTimer.currentSubtaskStart) {
                      const elapsed = now - newTimer.currentSubtaskStart;
                      newTimer.subtaskTimes[subtaskId] = elapsed;
                    }
                    
                    // Start timer for next subtask
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
                      const newTimer = { 
                        ...timer,
                        subtaskTimes: { ...timer.subtaskTimes }
                      };
                      delete newTimer.subtaskTimes[subtaskId];
                      return {
                        ...prev,
                        [taskId]: newTimer
                      };
                    }
                    return prev;
                  });
                }
              }
