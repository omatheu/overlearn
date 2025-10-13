import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import {
  currentSessionAtom,
  isTrackingAtom
} from '../atoms';
import { UseTimerTrackingReturn, FocusSession } from '../types';

export function useTimerTracking(): UseTimerTrackingReturn {
  const [currentSession] = useAtom(currentSessionAtom);
  const isTracking = useAtomValue(isTrackingAtom);
  // const sessionDuration = useAtomValue(currentSessionDurationAtom);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Atualizar tempo decorrido a cada segundo
  useEffect(() => {
    if (!isTracking || !currentSession) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - currentSession.startTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking, currentSession]);

  const startTimer = useCallback((type: FocusSession['type'], taskId?: string) => {
    // Esta função será implementada através do hook useCalendar
    // para manter a consistência com os atoms
    console.log('Starting timer:', { type, taskId });
  }, []);

  const stopTimer = useCallback(() => {
    // Esta função será implementada através do hook useCalendar
    console.log('Stopping timer');
  }, []);

  const pauseTimer = useCallback(() => {
    // Esta função será implementada através do hook useCalendar
    console.log('Pausing timer');
  }, []);

  const resumeTimer = useCallback(() => {
    // Esta função será implementada através do hook useCalendar
    console.log('Resuming timer');
  }, []);

  const resetTimer = useCallback(() => {
    setElapsedTime(0);
  }, []);

  return {
    currentSession,
    isTracking,
    elapsedTime,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    resetTimer
  };
}
