import * as React from 'react';
import { useReducedMotion, useHighContrast, useAnnouncer } from './hooks';

/**
 * Accessibility Provider
 * 
 * Provides global accessibility context and features
 */

interface AccessibilityContextValue {
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  focusManagement: {
    trapFocus: boolean;
    setTrapFocus: (trap: boolean) => void;
  };
  screenReaderMode: boolean;
  setScreenReaderMode: (mode: boolean) => void;
}

const AccessibilityContext = React.createContext<AccessibilityContextValue | null>(null);

export const useAccessibility = () => {
  const context = React.useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
  enableAnnouncements?: boolean;
  enableFocusManagement?: boolean;
  enableScreenReaderDetection?: boolean;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
  enableAnnouncements = true,
  enableFocusManagement = true,
  enableScreenReaderDetection = true,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const prefersHighContrast = useHighContrast();
  const { announce, AnnouncerComponent } = useAnnouncer();
  
  const [trapFocus, setTrapFocus] = React.useState(false);
  const [screenReaderMode, setScreenReaderMode] = React.useState(false);

  // Detect screen reader usage
  React.useEffect(() => {
    if (!enableScreenReaderDetection) return;

    // Check for common screen reader indicators
    const hasScreenReader = 
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver') ||
      window.speechSynthesis?.getVoices().length > 0;

    setScreenReaderMode(hasScreenReader);
  }, [enableScreenReaderDetection]);

  // Apply global accessibility styles
  React.useEffect(() => {
    const root = document.documentElement;
    
    if (prefersReducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    if (prefersHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    if (screenReaderMode) {
      root.classList.add('screen-reader-mode');
    } else {
      root.classList.remove('screen-reader-mode');
    }
  }, [prefersReducedMotion, prefersHighContrast, screenReaderMode]);

  // Handle global keyboard shortcuts for accessibility
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + Shift + A: Toggle announcements
      if (event.altKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        announce('Announcements toggled', 'assertive');
      }
      
      // Alt + Shift + F: Toggle focus trap
      if (event.altKey && event.shiftKey && event.key === 'F') {
        event.preventDefault();
        setTrapFocus(prev => !prev);
        announce(`Focus trap ${trapFocus ? 'disabled' : 'enabled'}`, 'assertive');
      }
      
      // Alt + Shift + S: Toggle screen reader mode
      if (event.altKey && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        setScreenReaderMode(prev => !prev);
        announce(`Screen reader mode ${screenReaderMode ? 'disabled' : 'enabled'}`, 'assertive');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [announce, trapFocus, screenReaderMode]);

  const contextValue: AccessibilityContextValue = {
    prefersReducedMotion,
    prefersHighContrast,
    announce: enableAnnouncements ? announce : () => {},
    focusManagement: {
      trapFocus,
      setTrapFocus: enableFocusManagement ? setTrapFocus : () => {},
    },
    screenReaderMode,
    setScreenReaderMode,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      {enableAnnouncements && <AnnouncerComponent />}
      
      {/* Skip links */}
      <div className="sr-only focus-within:not-sr-only">
        <a
          href="#main-content"
          className="fixed top-4 left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <a
          href="#navigation"
          className="fixed top-4 left-32 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Skip to navigation
        </a>
      </div>
    </AccessibilityContext.Provider>
  );
};

// Accessibility status component for debugging
export const AccessibilityStatus: React.FC = () => {
  const {
    prefersReducedMotion,
    prefersHighContrast,
    focusManagement,
    screenReaderMode,
  } = useAccessibility();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-background border border-border rounded-lg p-3 text-xs space-y-1 shadow-lg">
      <div className="font-semibold">Accessibility Status</div>
      <div>Reduced Motion: {prefersReducedMotion ? '✅' : '❌'}</div>
      <div>High Contrast: {prefersHighContrast ? '✅' : '❌'}</div>
      <div>Focus Trap: {focusManagement.trapFocus ? '✅' : '❌'}</div>
      <div>Screen Reader: {screenReaderMode ? '✅' : '❌'}</div>
      <div className="text-muted-foreground mt-2">
        Alt+Shift+A/F/S to toggle
      </div>
    </div>
  );
};