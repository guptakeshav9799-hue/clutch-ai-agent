import { useEffect, useRef } from 'react';
import useTaskStore from '../store/taskStore';
import { showCrisisNotification } from '../services/notifications';

export function useTaskDetection() {
  const { tasks, refreshCrisisModes } = useTaskStore();
  const previousModes = useRef({});

  // Refresh crisis modes every minute
  useEffect(() => {
    const interval = setInterval(() => {
      refreshCrisisModes();
    }, 60000);

    return () => clearInterval(interval);
  }, [refreshCrisisModes]);

  // Detect crisis mode transitions and show notifications
  useEffect(() => {
    tasks.forEach(task => {
      if (task.status === 'completed') return;
      
      const currentMode = task.currentCrisisMode?.mode;
      const previousMode = previousModes.current[task.id];

      if (previousMode && currentMode !== previousMode) {
        if (['CRUNCH', 'EMERGENCY', 'SURVIVAL'].includes(currentMode)) {
          showCrisisNotification(task.title, currentMode);
        }
      }

      previousModes.current[task.id] = currentMode;
    });
  }, [tasks]);
}
