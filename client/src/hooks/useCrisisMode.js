import { useState, useEffect, useCallback } from 'react';
import { calculateCrisisMode } from '../utils/crisisCalculator';

export function useCrisisMode(deadline) {
  const [crisisInfo, setCrisisInfo] = useState(() => calculateCrisisMode(deadline));
  const [countdown, setCountdown] = useState('');

  const updateCountdown = useCallback(() => {
    const now = new Date();
    const dl = new Date(deadline);
    const diff = dl - now;

    if (diff <= 0) {
      setCountdown('00:00:00');
      return;
    }

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remHours = hours % 24;
      setCountdown(`${days}d ${String(remHours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`);
    } else {
      setCountdown(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }
  }, [deadline]);

  useEffect(() => {
    const info = calculateCrisisMode(deadline);
    setCrisisInfo(info);
    updateCountdown();

    const interval = setInterval(() => {
      setCrisisInfo(calculateCrisisMode(deadline));
      updateCountdown();
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline, updateCountdown]);

  return { ...crisisInfo, countdown };
}
