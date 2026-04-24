import { useCallback, useEffect, useRef, useState } from 'react';
import { useProgressTracking } from './useProgressTracking';
import { useAutoSave } from './useAutoSave';
import { ResumeData, BuilderState } from '../types';
import { progressPersistence } from '../services/ProgressPersistence';

interface UseProgressiveNavigationProps {
  resumeData: ResumeData;
  builderState: BuilderState;
  updateResumeData: (data: Partial<ResumeData>) => void;
  updateBuilderState: (state: Partial<BuilderState>) => void;
  sessionId?: string;
}

export const useProgressiveNavigation = ({
  resumeData,
  builderState,
  updateResumeData,
  updateBuilderState,
  sessionId = 'default'
}: UseProgressiveNavigationProps) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<number[]>([]);
  const [showCompletionCelebration, setShowCompletionCelebration] = useState<{
    show: boolean;
    sectionName: string;
  }>({ show: false, sectionName: '' });

  // Progress tracking
  const {
    progressState,
    getSectionStatus,
    getSectionValidation,
    canNavigateToSection,
    getNextIncompleteSection,
    updateVisualState
  } = useProgressTracking({
    resumeData,
    currentSection: builderState.activeIndex,
    sessionId
  });

  // Auto-save functionality
  const {
    saveNow,
    getLastSaveTime,
    loadAutoSavedData,
    clearAutoSave
  } = useAutoSave({
    sessionId,
    resumeData,
    builderState,
    progressState,
    enabled: true,
    interval: 30000 // 30 seconds
  });

  // Section validation
  const validateSection = useCallback(async (sectionIndex: number): Promise<boolean> => {
    const validation = getSectionValidation(sectionIndex);
    return validation.isValid;
  }, [getSectionValidation]);

  // Enhanced navigation with validation and auto-save
  const navigateToSection = useCallback(async (targetIndex: number): Promise<boolean> => {
    if (isNavigating || targetIndex === builderState.activeIndex) {
      return false;
    }

    // Check if navigation is allowed
    if (!canNavigateToSection(targetIndex)) {
      console.warn(`Navigation to section ${targetIndex} is not allowed`);
      return false;
    }

    setIsNavigating(true);

    try {
      // Validate current section before leaving
      const currentValidation = getSectionValidation(builderState.activeIndex);
      if (!currentValidation.isValid && targetIndex > builderState.activeIndex) {
        console.warn('Current section has validation errors, preventing forward navigation');
        setIsNavigating(false);
        return false;
      }

      // Auto-save before navigation
      saveNow();

      // Update navigation history
      setNavigationHistory(prev => [...prev.slice(-9), builderState.activeIndex]);

      // Check if section was just completed
      const previousStatus = getSectionStatus(builderState.activeIndex);
      
      // Perform navigation
      updateBuilderState({ activeIndex: targetIndex });

      // Check if we just completed a section
      const newStatus = getSectionStatus(builderState.activeIndex);
      if (previousStatus !== 'completed' && newStatus === 'completed') {
        const sectionName = progressState.sections[builderState.activeIndex]?.name || '';
        setShowCompletionCelebration({ show: true, sectionName });
      }

      // Save progress
      progressPersistence.saveProgress(sessionId, {
        currentSection: targetIndex,
        completionPercentage: progressState.completionPercentage,
        sectionStatuses: progressState.sections.reduce((acc, section) => {
          acc[section.id] = section.status;
          return acc;
        }, {} as Record<string, string>)
      });

      setIsNavigating(false);
      return true;
    } catch (error) {
      console.error('Navigation failed:', error);
      setIsNavigating(false);
      return false;
    }
  }, [
    isNavigating,
    builderState.activeIndex,
    canNavigateToSection,
    getSectionValidation,
    getSectionStatus,
    saveNow,
    updateBuilderState,
    progressState,
    sessionId
  ]);

  // Navigation shortcuts
  const goToNext = useCallback(async (): Promise<boolean> => {
    const nextIndex = Math.min(progressState.sections.length - 1, builderState.activeIndex + 1);
    return await navigateToSection(nextIndex);
  }, [navigateToSection, progressState.sections.length, builderState.activeIndex]);

  const goToPrevious = useCallback(async (): Promise<boolean> => {
    const prevIndex = Math.max(0, builderState.activeIndex - 1);
    return await navigateToSection(prevIndex);
  }, [navigateToSection, builderState.activeIndex]);

  const goToNextIncomplete = useCallback(async (): Promise<boolean> => {
    const nextIncomplete = getNextIncompleteSection();
    if (nextIncomplete !== null) {
      return await navigateToSection(nextIncomplete);
    }
    return false;
  }, [navigateToSection, getNextIncompleteSection]);

  const goBack = useCallback(async (): Promise<boolean> => {
    if (navigationHistory.length > 0) {
      const lastSection = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      return await navigateToSection(lastSection);
    }
    return await goToPrevious();
  }, [navigationHistory, navigateToSection, goToPrevious]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }

      // Skip if modifier keys are pressed (except for specific combinations)
      if (event.ctrlKey || event.metaKey || event.altKey) {
        // Allow Ctrl+S for save
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
          event.preventDefault();
          saveNow();
        }
        return;
      }

      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          await goToPrevious();
          break;
        
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          await goToNext();
          break;
        
        case 'Home':
          event.preventDefault();
          await navigateToSection(0);
          break;
        
        case 'End':
          event.preventDefault();
          await navigateToSection(progressState.sections.length - 1);
          break;
        
        case 'Backspace':
          if (!event.shiftKey) {
            event.preventDefault();
            await goBack();
          }
          break;
        
        default:
          // Number keys for direct navigation
          if (event.key >= '1' && event.key <= '9') {
            const sectionIndex = parseInt(event.key) - 1;
            if (sectionIndex < progressState.sections.length) {
              event.preventDefault();
              await navigateToSection(sectionIndex);
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, navigateToSection, progressState.sections.length, goBack, saveNow]);

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = progressPersistence.loadProgress(sessionId);
    if (savedProgress && savedProgress.currentSection !== builderState.activeIndex) {
      // Optionally restore saved section
      console.log('Found saved progress:', savedProgress);
    }
  }, [sessionId, builderState.activeIndex]);

  // Auto-save on data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveNow();
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [resumeData, saveNow]);

  return {
    // Navigation methods
    navigateToSection,
    goToNext,
    goToPrevious,
    goToNextIncomplete,
    goBack,
    
    // State
    progressState,
    isNavigating,
    navigationHistory,
    showCompletionCelebration,
    
    // Validation
    validateSection,
    getSectionStatus,
    getSectionValidation,
    canNavigateToSection,
    
    // Auto-save
    saveNow,
    getLastSaveTime,
    loadAutoSavedData,
    clearAutoSave,
    
    // Utilities
    updateVisualState,
    setShowCompletionCelebration,
    
    // Computed properties
    currentSection: builderState.activeIndex,
    totalSections: progressState.sections.length,
    completedSections: progressState.sections.filter(s => s.status === 'completed').length,
    isFirstSection: builderState.activeIndex === 0,
    isLastSection: builderState.activeIndex === progressState.sections.length - 1,
    overallProgress: progressState.completionPercentage
  };
};