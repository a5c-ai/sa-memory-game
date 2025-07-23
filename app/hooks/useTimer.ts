'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { TimerState } from '../types/game';

export function useTimer() {
  const [timerState, setTimerState] = useState<TimerState>({
    timeElapsed: 0,
    isRunning: false,
    isPaused: false
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    if (timerState.isRunning && !timerState.isPaused) return;

    if (timerState.isPaused) {
      // Resume from pause
      setTimerState(prev => ({
        ...prev,
        isRunning: true,
        isPaused: false
      }));
    } else {
      // Start fresh
      setTimerState({
        timeElapsed: 0,
        isRunning: true,
        isPaused: false
      });
    }

    intervalRef.current = setInterval(() => {
      setTimerState(prev => ({
        ...prev,
        timeElapsed: prev.timeElapsed + 1
      }));
    }, 1000);
  }, [timerState.isRunning, timerState.isPaused]);

  const pause = useCallback(() => {
    if (!timerState.isRunning || timerState.isPaused) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: true
    }));
  }, [timerState.isRunning, timerState.isPaused]);

  const resume = useCallback(() => {
    if (!timerState.isPaused) return;
    
    start();
  }, [timerState.isPaused, start]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTimerState({
      timeElapsed: 0,
      isRunning: false,
      isPaused: false
    });
  }, []);

  const reset = useCallback(() => {
    stop();
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number = timerState.timeElapsed): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, [timerState.timeElapsed]);

  // Get time in different formats
  const getTimeInMilliseconds = useCallback((): number => {
    return timerState.timeElapsed * 1000;
  }, [timerState.timeElapsed]);

  const getTimeInMinutes = useCallback((): number => {
    return Math.floor(timerState.timeElapsed / 60);
  }, [timerState.timeElapsed]);

  const getTimeBreakdown = useCallback(() => {
    const totalSeconds = timerState.timeElapsed;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return { hours, minutes, seconds, total: totalSeconds };
  }, [timerState.timeElapsed]);

  // Toggle between play and pause
  const toggle = useCallback(() => {
    if (timerState.isRunning && !timerState.isPaused) {
      pause();
    } else {
      start();
    }
  }, [timerState.isRunning, timerState.isPaused, pause, start]);

  return {
    // State
    timeElapsed: timerState.timeElapsed,
    isRunning: timerState.isRunning,
    isPaused: timerState.isPaused,
    
    // Actions
    start,
    pause,
    resume,
    stop,
    reset,
    toggle,
    
    // Utilities
    formatTime,
    getTimeInMilliseconds,
    getTimeInMinutes,
    getTimeBreakdown,
    
    // Computed values
    isActive: timerState.isRunning && !timerState.isPaused,
    formattedTime: formatTime(),
    
    // Status checks
    hasStarted: timerState.timeElapsed > 0 || timerState.isRunning,
    canStart: !timerState.isRunning || timerState.isPaused,
    canPause: timerState.isRunning && !timerState.isPaused,
    canResume: timerState.isPaused
  };
}