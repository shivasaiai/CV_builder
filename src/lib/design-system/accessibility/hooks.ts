import * as React from 'react';

/**
 * Accessibility Hooks
 * 
 * Custom hooks for managing accessibility features and WCAG compliance
 */

// Hook for managing focus trap
export const useFocusTrap = (isActive: boolean = true) => {
  const containerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        firstElement?.focus();
      }
    };

    container.addEventListener('keydown', handleTabKey);
    container.addEventListener('keydown', handleEscapeKey);

    // Focus first element when trap becomes active
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      container.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isActive]);

  return containerRef;
};

// Hook for managing ARIA announcements
export const useAnnouncer = () => {
  const announcerRef = React.useRef<HTMLDivElement>(null);

  const announce = React.useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcerRef.current) return;

    const announcer = announcerRef.current;
    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }, []);

  const AnnouncerComponent = React.useCallback(() => (
    <div
      ref={announcerRef}
      className="sr-only"
      aria-live="polite"
      aria-atomic="true"
    />
  ), []);

  return { announce, AnnouncerComponent };
};

// Hook for keyboard navigation
export const useKeyboardNavigation = (
  items: string[],
  onSelect?: (index: number) => void,
  loop: boolean = true
) => {
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => {
          const next = prev + 1;
          return loop ? next % items.length : Math.min(next, items.length - 1);
        });
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => {
          const next = prev - 1;
          return loop ? (next < 0 ? items.length - 1 : next) : Math.max(next, 0);
        });
        break;
      
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      
      case 'End':
        e.preventDefault();
        setActiveIndex(items.length - 1);
        break;
      
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0 && onSelect) {
          onSelect(activeIndex);
        }
        break;
      
      case 'Escape':
        setActiveIndex(-1);
        break;
    }
  }, [items.length, activeIndex, onSelect, loop]);

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
  };
};

// Hook for managing reduced motion preference
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// Hook for managing high contrast preference
export const useHighContrast = () => {
  const [prefersHighContrast, setPrefersHighContrast] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = () => setPrefersHighContrast(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
};

// Hook for managing focus visible
export const useFocusVisible = () => {
  const [isFocusVisible, setIsFocusVisible] = React.useState(false);
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleFocus = () => setIsFocusVisible(true);
    const handleBlur = () => setIsFocusVisible(false);
    const handleMouseDown = () => setIsFocusVisible(false);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsFocusVisible(true);
      }
    };

    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return { isFocusVisible, ref };
};

// Hook for managing ARIA expanded state
export const useAriaExpanded = (initialState: boolean = false) => {
  const [isExpanded, setIsExpanded] = React.useState(initialState);

  const toggle = React.useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const expand = React.useCallback(() => {
    setIsExpanded(true);
  }, []);

  const collapse = React.useCallback(() => {
    setIsExpanded(false);
  }, []);

  return {
    isExpanded,
    setIsExpanded,
    toggle,
    expand,
    collapse,
    ariaExpanded: isExpanded,
  };
};

// Hook for managing live regions
export const useLiveRegion = () => {
  const liveRegionRef = React.useRef<HTMLDivElement>(null);

  const announce = React.useCallback((
    message: string, 
    priority: 'off' | 'polite' | 'assertive' = 'polite'
  ) => {
    if (!liveRegionRef.current) return;

    const liveRegion = liveRegionRef.current;
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.textContent = message;

    // Clear the message after a delay to allow for re-announcement of the same message
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 100);
  }, []);

  const LiveRegion = React.useCallback(() => (
    <div
      ref={liveRegionRef}
      className="sr-only"
      aria-live="polite"
      aria-atomic="true"
    />
  ), []);

  return { announce, LiveRegion };
};

// Hook for managing roving tabindex
export const useRovingTabIndex = (items: React.RefObject<HTMLElement>[]) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    items.forEach((item, index) => {
      if (item.current) {
        item.current.tabIndex = index === activeIndex ? 0 : -1;
      }
    });
  }, [items, activeIndex]);

  const moveNext = React.useCallback(() => {
    setActiveIndex(prev => (prev + 1) % items.length);
  }, [items.length]);

  const movePrevious = React.useCallback(() => {
    setActiveIndex(prev => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const moveTo = React.useCallback((index: number) => {
    if (index >= 0 && index < items.length) {
      setActiveIndex(index);
    }
  }, [items.length]);

  return {
    activeIndex,
    moveNext,
    movePrevious,
    moveTo,
  };
};