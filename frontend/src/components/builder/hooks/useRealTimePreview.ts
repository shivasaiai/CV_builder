import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ResumeData, TemplateColors } from '../types';

interface PreviewUpdateConfig {
  debounceDelay: number;
  enableDiffing: boolean;
  enableLoadingStates: boolean;
  maxUpdateFrequency: number; // Max updates per second
  enablePerformanceMonitoring: boolean;
}

interface PreviewState {
  isUpdating: boolean;
  isTemplateChanging: boolean;
  isZoomChanging: boolean;
  lastUpdateTime: number;
  updateCount: number;
  pendingUpdates: number;
}

interface PerformanceMetrics {
  averageUpdateTime: number;
  totalUpdates: number;
  skippedUpdates: number;
  lastUpdateDuration: number;
}

const DEFAULT_CONFIG: PreviewUpdateConfig = {
  debounceDelay: 150,
  enableDiffing: true,
  enableLoadingStates: true,
  maxUpdateFrequency: 10, // 10 updates per second max
  enablePerformanceMonitoring: true
};

export const useRealTimePreview = (
  resumeData: ResumeData,
  activeTemplate: string,
  templateColors: TemplateColors,
  zoom: number,
  config: Partial<PreviewUpdateConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [previewState, setPreviewState] = useState<PreviewState>({
    isUpdating: false,
    isTemplateChanging: false,
    isZoomChanging: false,
    lastUpdateTime: 0,
    updateCount: 0,
    pendingUpdates: 0
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    averageUpdateTime: 0,
    totalUpdates: 0,
    skippedUpdates: 0,
    lastUpdateDuration: 0
  });

  // Refs for tracking changes and debouncing
  const previousDataRef = useRef<ResumeData>(resumeData);
  const previousTemplateRef = useRef<string>(activeTemplate);
  const previousColorsRef = useRef<TemplateColors>(templateColors);
  const previousZoomRef = useRef<number>(zoom);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const updateQueueRef = useRef<(() => void)[]>([]);
  const lastUpdateTimeRef = useRef<number>(0);

  // Deep comparison for resume data changes
  const hasResumeDataChanged = useCallback((
    current: ResumeData,
    previous: ResumeData
  ): boolean => {
    if (!finalConfig.enableDiffing) return true;
    
    try {
      // Quick reference check first
      if (current === previous) return false;
      
      // Deep comparison of key fields that affect rendering
      const currentKeys = [
        current.contact,
        current.summary,
        current.skills,
        current.workExperiences,
        current.education,
        current.projects,
        current.certifications,
        current.languages,
        current.volunteerExperiences,
        current.publications,
        current.awards,
        current.references,
        current.activeSections
      ];
      
      const previousKeys = [
        previous.contact,
        previous.summary,
        previous.skills,
        previous.workExperiences,
        previous.education,
        previous.projects,
        previous.certifications,
        previous.languages,
        previous.volunteerExperiences,
        previous.publications,
        previous.awards,
        previous.references,
        previous.activeSections
      ];
      
      return JSON.stringify(currentKeys) !== JSON.stringify(previousKeys);
    } catch (error) {
      console.warn('Error comparing resume data, assuming changed:', error);
      return true;
    }
  }, [finalConfig.enableDiffing]);

  // Check if template colors have changed
  const hasColorsChanged = useCallback((
    current: TemplateColors,
    previous: TemplateColors
  ): boolean => {
    if (!finalConfig.enableDiffing) return true;
    return JSON.stringify(current) !== JSON.stringify(previous);
  }, [finalConfig.enableDiffing]);

  // Rate limiting check
  const canUpdate = useCallback((): boolean => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
    const minInterval = 1000 / finalConfig.maxUpdateFrequency;
    
    return timeSinceLastUpdate >= minInterval;
  }, [finalConfig.maxUpdateFrequency]);

  // Performance monitoring
  const measureUpdatePerformance = useCallback((updateFn: () => void) => {
    if (!finalConfig.enablePerformanceMonitoring) {
      updateFn();
      return;
    }

    const startTime = performance.now();
    updateFn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    setPerformanceMetrics(prev => {
      const newTotalUpdates = prev.totalUpdates + 1;
      const newAverageTime = (prev.averageUpdateTime * prev.totalUpdates + duration) / newTotalUpdates;
      
      return {
        ...prev,
        averageUpdateTime: newAverageTime,
        totalUpdates: newTotalUpdates,
        lastUpdateDuration: duration
      };
    });
  }, [finalConfig.enablePerformanceMonitoring]);

  // Debounced update function
  const scheduleUpdate = useCallback((updateType: 'data' | 'template' | 'colors' | 'zoom') => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set loading state based on update type
    setPreviewState(prev => ({
      ...prev,
      isUpdating: true,
      isTemplateChanging: updateType === 'template',
      isZoomChanging: updateType === 'zoom',
      pendingUpdates: prev.pendingUpdates + 1
    }));

    // Schedule debounced update
    debounceTimeoutRef.current = setTimeout(() => {
      if (!canUpdate()) {
        // Skip this update due to rate limiting
        setPerformanceMetrics(prev => ({
          ...prev,
          skippedUpdates: prev.skippedUpdates + 1
        }));
        
        setPreviewState(prev => ({
          ...prev,
          isUpdating: false,
          isTemplateChanging: false,
          isZoomChanging: false,
          pendingUpdates: Math.max(0, prev.pendingUpdates - 1)
        }));
        return;
      }

      measureUpdatePerformance(() => {
        const now = Date.now();
        lastUpdateTimeRef.current = now;
        
        setPreviewState(prev => ({
          ...prev,
          isUpdating: false,
          isTemplateChanging: false,
          isZoomChanging: false,
          lastUpdateTime: now,
          updateCount: prev.updateCount + 1,
          pendingUpdates: Math.max(0, prev.pendingUpdates - 1)
        }));
      });
    }, finalConfig.debounceDelay);
  }, [canUpdate, measureUpdatePerformance, finalConfig.debounceDelay]);

  // Monitor resume data changes
  useEffect(() => {
    if (hasResumeDataChanged(resumeData, previousDataRef.current)) {
      previousDataRef.current = resumeData;
      scheduleUpdate('data');
    }
  }, [resumeData, hasResumeDataChanged, scheduleUpdate]);

  // Monitor template changes
  useEffect(() => {
    if (activeTemplate !== previousTemplateRef.current) {
      previousTemplateRef.current = activeTemplate;
      scheduleUpdate('template');
    }
  }, [activeTemplate, scheduleUpdate]);

  // Monitor color changes
  useEffect(() => {
    if (hasColorsChanged(templateColors, previousColorsRef.current)) {
      previousColorsRef.current = templateColors;
      scheduleUpdate('colors');
    }
  }, [templateColors, hasColorsChanged, scheduleUpdate]);

  // Monitor zoom changes
  useEffect(() => {
    if (zoom !== previousZoomRef.current) {
      previousZoomRef.current = zoom;
      scheduleUpdate('zoom');
    }
  }, [zoom, scheduleUpdate]);

  // Force immediate update (bypass debouncing)
  const forceUpdate = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    measureUpdatePerformance(() => {
      const now = Date.now();
      lastUpdateTimeRef.current = now;
      
      setPreviewState(prev => ({
        ...prev,
        isUpdating: false,
        isTemplateChanging: false,
        isZoomChanging: false,
        lastUpdateTime: now,
        updateCount: prev.updateCount + 1,
        pendingUpdates: 0
      }));
    });
  }, [measureUpdatePerformance]);

  // Get loading state for specific update types
  const getLoadingState = useCallback((type?: 'template' | 'zoom' | 'data') => {
    if (!finalConfig.enableLoadingStates) return false;
    
    switch (type) {
      case 'template':
        return previewState.isTemplateChanging;
      case 'zoom':
        return previewState.isZoomChanging;
      case 'data':
        return previewState.isUpdating && !previewState.isTemplateChanging && !previewState.isZoomChanging;
      default:
        return previewState.isUpdating;
    }
  }, [finalConfig.enableLoadingStates, previewState]);

  // Get performance insights
  const getPerformanceInsights = useCallback(() => {
    const { averageUpdateTime, totalUpdates, skippedUpdates } = performanceMetrics;
    
    return {
      isPerformant: averageUpdateTime < 16, // 60fps threshold
      averageUpdateTime: Math.round(averageUpdateTime * 100) / 100,
      totalUpdates,
      skippedUpdates,
      skipRate: totalUpdates > 0 ? (skippedUpdates / totalUpdates) * 100 : 0,
      updatesPerSecond: previewState.updateCount > 0 
        ? (previewState.updateCount / ((Date.now() - previewState.lastUpdateTime) / 1000)) 
        : 0
    };
  }, [performanceMetrics, previewState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Memoized return object to prevent unnecessary re-renders
  return useMemo(() => ({
    // State
    previewState,
    performanceMetrics,
    
    // Loading states
    isUpdating: previewState.isUpdating,
    isTemplateChanging: previewState.isTemplateChanging,
    isZoomChanging: previewState.isZoomChanging,
    hasPendingUpdates: previewState.pendingUpdates > 0,
    
    // Actions
    forceUpdate,
    getLoadingState,
    getPerformanceInsights,
    
    // Configuration
    config: finalConfig
  }), [
    previewState,
    performanceMetrics,
    forceUpdate,
    getLoadingState,
    getPerformanceInsights,
    finalConfig
  ]);
};