import { useState, useEffect, useCallback } from 'react';

export type LayoutPreference = 'top' | 'side';
export type ScreenSize = 'mobile' | 'tablet' | 'desktop';

interface LayoutConfig {
  previewPosition: LayoutPreference;
  previewWidth: string;
  previewHeight: string;
  defaultZoom: number;
  builderPosition: 'bottom' | 'side';
  builderWidth: string;
  showSidebar: boolean;
  sidebarWidth: string;
  responsive: boolean;
}

interface UseLayoutManagerProps {
  initialLayout?: LayoutPreference;
  sessionId?: string;
  persistPreferences?: boolean;
}

export const useLayoutManager = ({
  initialLayout = 'top',
  sessionId,
  persistPreferences = true
}: UseLayoutManagerProps = {}) => {
  const [layoutPreference, setLayoutPreference] = useState<LayoutPreference>(initialLayout);
  const [screenSize, setScreenSize] = useState<ScreenSize>('desktop');
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    previewPosition: 'top',
    previewWidth: '100%',
    previewHeight: '500px',
    defaultZoom: 0.4,
    builderPosition: 'bottom',
    builderWidth: '100%',
    showSidebar: true,
    sidebarWidth: '320px',
    responsive: true
  });

  // Load saved layout preference on mount
  useEffect(() => {
    if (persistPreferences) {
      const savedLayout = localStorage.getItem('resume-builder-layout-preference');
      if (savedLayout && (savedLayout === 'top' || savedLayout === 'side')) {
        setLayoutPreference(savedLayout as LayoutPreference);
      }
    }
  }, [persistPreferences]);

  // Detect screen size changes
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      let newSize: ScreenSize;
      
      if (width < 768) {
        newSize = 'mobile';
      } else if (width < 1024) {
        newSize = 'tablet';
      } else {
        newSize = 'desktop';
      }
      
      setScreenSize(newSize);
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Calculate optimal layout configuration
  const calculateLayoutConfig = useCallback((
    preference: LayoutPreference,
    screen: ScreenSize
  ): LayoutConfig => {
    const baseConfig: LayoutConfig = {
      previewPosition: preference,
      previewWidth: '100%',
      previewHeight: '500px',
      defaultZoom: 0.4,
      builderPosition: preference === 'top' ? 'bottom' : 'side',
      builderWidth: '100%',
      showSidebar: true,
      sidebarWidth: '320px',
      responsive: true
    };

    switch (screen) {
      case 'mobile':
        return {
          ...baseConfig,
          previewPosition: 'top', // Force top on mobile for better UX
          previewHeight: '400px',
          defaultZoom: 0.3,
          showSidebar: false, // Hide sidebar on mobile to save space
          sidebarWidth: '0px',
          builderPosition: 'bottom'
        };

      case 'tablet':
        return {
          ...baseConfig,
          previewPosition: 'top', // Prefer top on tablet
          previewHeight: '450px',
          defaultZoom: 0.35,
          sidebarWidth: '280px',
          builderPosition: 'bottom'
        };

      case 'desktop':
        return {
          ...baseConfig,
          previewPosition: preference,
          previewHeight: preference === 'top' ? '500px' : '100vh',
          previewWidth: preference === 'side' ? '400px' : '100%',
          builderWidth: preference === 'side' ? 'calc(100% - 400px)' : '100%',
          defaultZoom: 0.4,
          sidebarWidth: '320px',
          builderPosition: preference === 'top' ? 'bottom' : 'side'
        };

      default:
        return baseConfig;
    }
  }, []);

  // Update layout configuration when preference or screen size changes
  useEffect(() => {
    const newConfig = calculateLayoutConfig(layoutPreference, screenSize);
    setLayoutConfig(newConfig);
  }, [layoutPreference, screenSize, calculateLayoutConfig]);

  // Handle layout preference changes
  const changeLayoutPreference = useCallback((newLayout: LayoutPreference) => {
    setLayoutPreference(newLayout);
    
    // Persist preference if enabled
    if (persistPreferences) {
      localStorage.setItem('resume-builder-layout-preference', newLayout);
    }
    
    // Also save to session storage for current session
    if (sessionId) {
      sessionStorage.setItem(`layout-preference-${sessionId}`, newLayout);
    }
  }, [persistPreferences, sessionId]);

  // Toggle between layouts
  const toggleLayout = useCallback(() => {
    const newLayout = layoutPreference === 'top' ? 'side' : 'top';
    changeLayoutPreference(newLayout);
  }, [layoutPreference, changeLayoutPreference]);

  // Get responsive breakpoint information
  const getBreakpointInfo = useCallback(() => {
    return {
      isMobile: screenSize === 'mobile',
      isTablet: screenSize === 'tablet',
      isDesktop: screenSize === 'desktop',
      canUseSideLayout: screenSize === 'desktop',
      shouldForceTopLayout: screenSize !== 'desktop'
    };
  }, [screenSize]);

  // Get optimal zoom level for current configuration
  const getOptimalZoom = useCallback(() => {
    return layoutConfig.defaultZoom;
  }, [layoutConfig.defaultZoom]);

  // Check if layout switching is available
  const canSwitchLayout = useCallback(() => {
    return screenSize === 'desktop';
  }, [screenSize]);

  return {
    // Current state
    layoutPreference,
    screenSize,
    layoutConfig,
    
    // Actions
    changeLayoutPreference,
    toggleLayout,
    
    // Utilities
    getBreakpointInfo,
    getOptimalZoom,
    canSwitchLayout,
    
    // Computed values
    isTopLayout: layoutConfig.previewPosition === 'top',
    isSideLayout: layoutConfig.previewPosition === 'side',
    showSidebar: layoutConfig.showSidebar,
    previewHeight: layoutConfig.previewHeight,
    previewWidth: layoutConfig.previewWidth,
    defaultZoom: layoutConfig.defaultZoom
  };
};