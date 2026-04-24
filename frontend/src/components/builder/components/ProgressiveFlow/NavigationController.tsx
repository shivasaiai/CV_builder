import React, { useEffect, useCallback, useRef } from 'react';
import { SectionProgress } from './types';

interface NavigationControllerProps {
  sections: SectionProgress[];
  currentSection: number;
  onSectionChange: (index: number) => void;
  onAutoSave?: () => void;
  canNavigateToSection: (index: number) => boolean;
  validateCurrentSection?: () => Promise<boolean>;
  children: React.ReactNode;
}

const NavigationController: React.FC<NavigationControllerProps> = ({
  sections,
  currentSection,
  onSectionChange,
  onAutoSave,
  canNavigateToSection,
  validateCurrentSection,
  children
}) => {
  const navigationTimeoutRef = useRef<NodeJS.Timeout>();
  const lastNavigationRef = useRef<number>(0);

  // Keyboard navigation handler
  const handleKeyDown = useCallback(async (event: KeyboardEvent) => {
    // Prevent navigation if user is typing in an input
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }

    let targetSection = currentSection;

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        targetSection = Math.max(0, currentSection - 1);
        break;
      
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        targetSection = Math.min(sections.length - 1, currentSection + 1);
        break;
      
      case 'Home':
        event.preventDefault();
        targetSection = 0;
        break;
      
      case 'End':
        event.preventDefault();
        targetSection = sections.length - 1;
        break;
      
      case 'Enter':
      case ' ':
        // If focused on a section indicator, activate it
        if (event.target instanceof HTMLButtonElement && 
            event.target.getAttribute('data-section-index')) {
          event.preventDefault();
          const sectionIndex = parseInt(event.target.getAttribute('data-section-index') || '0');
          if (canNavigateToSection(sectionIndex)) {
            await navigateToSection(sectionIndex);
          }
        }
        return;
      
      default:
        // Number keys for direct navigation
        if (event.key >= '1' && event.key <= '9') {
          const sectionIndex = parseInt(event.key) - 1;
          if (sectionIndex < sections.length && canNavigateToSection(sectionIndex)) {
            event.preventDefault();
            targetSection = sectionIndex;
          }
        }
        return;
    }

    if (targetSection !== currentSection && canNavigateToSection(targetSection)) {
      await navigateToSection(targetSection);
    }
  }, [currentSection, sections.length, canNavigateToSection]);

  // Navigation with validation and auto-save
  const navigateToSection = useCallback(async (targetIndex: number): Promise<boolean> => {
    // Prevent rapid navigation
    const now = Date.now();
    if (now - lastNavigationRef.current < 300) {
      return false;
    }
    lastNavigationRef.current = now;

    // Check if navigation is allowed
    if (!canNavigateToSection(targetIndex)) {
      console.warn(`Navigation to section ${targetIndex} is not allowed`);
      return false;
    }

    try {
      // Validate current section before leaving (if validator provided)
      if (validateCurrentSection && targetIndex !== currentSection) {
        const isValid = await validateCurrentSection();
        if (!isValid) {
          console.warn('Current section validation failed, preventing navigation');
          return false;
        }
      }

      // Auto-save before navigation
      if (onAutoSave) {
        onAutoSave();
      }

      // Perform navigation
      onSectionChange(targetIndex);
      
      // Focus management for accessibility
      setTimeout(() => {
        const targetElement = document.querySelector(`[data-section-index="${targetIndex}"]`) as HTMLElement;
        if (targetElement) {
          targetElement.focus();
        }
      }, 100);

      return true;
    } catch (error) {
      console.error('Navigation failed:', error);
      return false;
    }
  }, [currentSection, canNavigateToSection, validateCurrentSection, onAutoSave, onSectionChange]);

  // Auto-save with debouncing
  const debouncedAutoSave = useCallback(() => {
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    navigationTimeoutRef.current = setTimeout(() => {
      if (onAutoSave) {
        onAutoSave();
      }
    }, 1000); // 1 second debounce
  }, [onAutoSave]);

  // Set up keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [handleKeyDown]);

  // Auto-save when section changes
  useEffect(() => {
    debouncedAutoSave();
  }, [currentSection, debouncedAutoSave]);

  // Navigation methods to expose to children
  const navigationMethods = {
    navigateToSection,
    canNavigateToSection,
    goToNext: () => navigateToSection(Math.min(sections.length - 1, currentSection + 1)),
    goToPrevious: () => navigateToSection(Math.max(0, currentSection - 1)),
    goToFirst: () => navigateToSection(0),
    goToLast: () => navigateToSection(sections.length - 1),
    getCurrentSection: () => currentSection,
    getSectionCount: () => sections.length,
    isFirstSection: currentSection === 0,
    isLastSection: currentSection === sections.length - 1
  };

  return (
    <div className="navigation-controller">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...navigationMethods,
            onSectionClick: navigateToSection
          } as any);
        }
        return child;
      })}
    </div>
  );
};

export default NavigationController;