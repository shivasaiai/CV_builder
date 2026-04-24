import React, { useEffect, useRef } from 'react';
import ProgressFlow from './ProgressFlow';
import NavigationController from './NavigationController';
import CompletionCelebration from './CompletionCelebration';
import { ProgressFlowProps } from './types';
import { useProgressiveNavigation } from '../../hooks/useProgressiveNavigation';
import { ResumeData, BuilderState } from '../../types';

interface EnhancedProgressFlowProps extends Omit<ProgressFlowProps, 'sections' | 'onSectionClick'> {
  resumeData: ResumeData;
  builderState: BuilderState;
  updateResumeData: (data: Partial<ResumeData>) => void;
  updateBuilderState: (state: Partial<BuilderState>) => void;
  sessionId?: string;
  enableKeyboardNavigation?: boolean;
  enableAutoSave?: boolean;
  celebrationVariant?: 'subtle' | 'celebration' | 'milestone';
}

const EnhancedProgressFlow: React.FC<EnhancedProgressFlowProps> = ({
  resumeData,
  builderState,
  updateResumeData,
  updateBuilderState,
  sessionId = 'default',
  enableKeyboardNavigation = true,
  enableAutoSave = true,
  celebrationVariant = 'subtle',
  currentSection,
  showConnectingLines = true,
  animationEnabled = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use the comprehensive navigation hook
  const {
    navigateToSection,
    progressState,
    isNavigating,
    showCompletionCelebration,
    setShowCompletionCelebration,
    validateSection,
    canNavigateToSection,
    saveNow,
    getLastSaveTime
  } = useProgressiveNavigation({
    resumeData,
    builderState,
    updateResumeData,
    updateBuilderState,
    sessionId
  });

  // Focus management for accessibility
  useEffect(() => {
    if (containerRef.current && !isNavigating) {
      const activeIndicator = containerRef.current.querySelector(
        `[data-section-index="${currentSection}"]`
      ) as HTMLElement;
      
      if (activeIndicator && document.activeElement !== activeIndicator) {
        // Only focus if no other element in the container has focus
        const focusedElement = document.activeElement;
        const isChildFocused = containerRef.current.contains(focusedElement);
        
        if (!isChildFocused) {
          activeIndicator.focus();
        }
      }
    }
  }, [currentSection, isNavigating]);

  // Announce section changes for screen readers
  useEffect(() => {
    const currentSectionData = progressState.sections[currentSection];
    if (currentSectionData) {
      const announcement = `Navigated to ${currentSectionData.name} section. ${
        currentSectionData.status === 'completed' ? 'Completed.' : 
        currentSectionData.status === 'in_progress' ? 'In progress.' : 'Not started.'
      }`;
      
      // Create a temporary element for screen reader announcement
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.textContent = announcement;
      
      document.body.appendChild(announcer);
      setTimeout(() => document.body.removeChild(announcer), 1000);
    }
  }, [currentSection, progressState.sections]);

  const handleSectionClick = async (index: number) => {
    await navigateToSection(index);
  };

  const handleValidateCurrentSection = async (): Promise<boolean> => {
    return await validateSection(currentSection);
  };

  const handleAutoSave = () => {
    if (enableAutoSave) {
      saveNow();
    }
  };

  const handleCompletionCelebrationComplete = () => {
    setShowCompletionCelebration({ show: false, sectionName: '' });
  };

  return (
    <div 
      ref={containerRef}
      className={`enhanced-progress-flow ${className}`}
      role="navigation"
      aria-label="Resume building progress"
    >
      {enableKeyboardNavigation ? (
        <NavigationController
          sections={progressState.sections}
          currentSection={currentSection}
          onSectionChange={handleSectionClick}
          onAutoSave={handleAutoSave}
          canNavigateToSection={canNavigateToSection}
          validateCurrentSection={handleValidateCurrentSection}
        >
          <ProgressFlow
            sections={progressState.sections}
            currentSection={currentSection}
            onSectionClick={handleSectionClick}
            showConnectingLines={showConnectingLines}
            animationEnabled={animationEnabled}
            className={isNavigating ? 'opacity-75 transition-opacity' : ''}
          />
        </NavigationController>
      ) : (
        <ProgressFlow
          sections={progressState.sections}
          currentSection={currentSection}
          onSectionClick={handleSectionClick}
          showConnectingLines={showConnectingLines}
          animationEnabled={animationEnabled}
          className={isNavigating ? 'opacity-75 transition-opacity' : ''}
        />
      )}

      {/* Completion Celebration */}
      <CompletionCelebration
        isVisible={showCompletionCelebration.show}
        sectionName={showCompletionCelebration.sectionName}
        onComplete={handleCompletionCelebrationComplete}
        variant={celebrationVariant}
      />

      {/* Auto-save indicator */}
      {enableAutoSave && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-75">
            {getLastSaveTime() ? (
              `Last saved: ${getLastSaveTime()?.toLocaleTimeString()}`
            ) : (
              'Auto-save enabled'
            )}
          </div>
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <div className="sr-only" aria-live="polite">
        Use arrow keys to navigate between sections, number keys for direct navigation, 
        Home/End for first/last section, and Ctrl+S to save.
      </div>
    </div>
  );
};

export default EnhancedProgressFlow;