import { useEffect, useRef, useCallback } from 'react';
import { progressPersistence } from '../services/ProgressPersistence';
import { ResumeData, BuilderState } from '../types';
import { ProgressionState } from '../components/ProgressiveFlow/types';

interface UseAutoSaveProps {
  sessionId: string;
  resumeData: ResumeData;
  builderState: BuilderState;
  progressState: ProgressionState;
  enabled?: boolean;
  interval?: number; // in milliseconds
}

export const useAutoSave = ({
  sessionId,
  resumeData,
  builderState,
  progressState,
  enabled = true,
  interval = 30000 // 30 seconds
}: UseAutoSaveProps) => {
  const lastSaveRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const dataHashRef = useRef<string>('');

  // Create a hash of the current data to detect changes
  const createDataHash = useCallback((data: any): string => {
    return JSON.stringify(data).split('').reduce((hash, char) => {
      const charCode = char.charCodeAt(0);
      return ((hash << 5) - hash) + charCode;
    }, 0).toString();
  }, []);

  // Perform auto-save
  const performAutoSave = useCallback(() => {
    if (!enabled || !sessionId) return;

    try {
      const currentData = {
        resumeData,
        builderState,
        progressSnapshot: {
          currentSection: progressState.currentSection,
          completionPercentage: progressState.completionPercentage,
          sectionStatuses: progressState.sections.reduce((acc, section) => {
            acc[section.id] = section.status;
            return acc;
          }, {} as Record<string, string>)
        }
      };

      const currentHash = createDataHash(currentData);
      
      // Only save if data has changed
      if (currentHash !== dataHashRef.current) {
        progressPersistence.autoSave(sessionId, currentData);
        lastSaveRef.current = Date.now();
        dataHashRef.current = currentHash;
        
        console.log('Auto-save completed at', new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [enabled, sessionId, resumeData, builderState, progressState, createDataHash]);

  // Schedule auto-save
  const scheduleAutoSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      performAutoSave();
      scheduleAutoSave(); // Schedule next auto-save
    }, interval);
  }, [performAutoSave, interval]);

  // Manual save function
  const saveNow = useCallback(() => {
    performAutoSave();
  }, [performAutoSave]);

  // Get last save time
  const getLastSaveTime = useCallback((): Date | null => {
    return lastSaveRef.current ? new Date(lastSaveRef.current) : null;
  }, []);

  // Load auto-saved data
  const loadAutoSavedData = useCallback(() => {
    if (!sessionId) return null;
    return progressPersistence.loadAutoSave(sessionId);
  }, [sessionId]);

  // Clear auto-save data
  const clearAutoSave = useCallback(() => {
    if (!sessionId) return;
    progressPersistence.clearAutoSave(sessionId);
  }, [sessionId]);

  // Start auto-save when enabled
  useEffect(() => {
    if (enabled) {
      scheduleAutoSave();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, scheduleAutoSave]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (enabled) {
        performAutoSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, performAutoSave]);

  // Save when data changes (debounced)
  useEffect(() => {
    if (!enabled) return;

    const debounceTimeout = setTimeout(() => {
      const currentData = { resumeData, builderState, progressState };
      const currentHash = createDataHash(currentData);
      
      if (currentHash !== dataHashRef.current) {
        performAutoSave();
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(debounceTimeout);
  }, [resumeData, builderState, progressState, enabled, performAutoSave, createDataHash]);

  return {
    saveNow,
    getLastSaveTime,
    loadAutoSavedData,
    clearAutoSave,
    isAutoSaveEnabled: enabled
  };
};