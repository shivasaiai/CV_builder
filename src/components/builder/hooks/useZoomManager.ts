import { useState, useEffect, useCallback, useRef } from 'react';

export interface ZoomConfig {
  defaultZoom: number;
  minZoom: number;
  maxZoom: number;
  presetLevels: number[];
  persistZoom: boolean;
  smoothTransitions: boolean;
}

interface UseZoomManagerProps {
  initialZoom?: number;
  sessionId?: string;
  templateId?: string;
  config?: Partial<ZoomConfig>;
  containerRef?: React.RefObject<HTMLElement>;
  contentRef?: React.RefObject<HTMLElement>;
}

const DEFAULT_CONFIG: ZoomConfig = {
  defaultZoom: 0.4, // 40% as per requirements
  minZoom: 0.25,
  maxZoom: 1.5,
  presetLevels: [0.25, 0.4, 0.5, 0.75, 1.0, 1.25, 1.5],
  persistZoom: true,
  smoothTransitions: true
};

export const useZoomManager = ({
  initialZoom,
  sessionId,
  templateId,
  config = {},
  containerRef,
  contentRef
}: UseZoomManagerProps = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [zoom, setZoom] = useState(initialZoom || finalConfig.defaultZoom);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();

  // Load saved zoom level on mount
  useEffect(() => {
    if (finalConfig.persistZoom && sessionId) {
      const savedZoom = localStorage.getItem(`zoom-level-${sessionId}`);
      if (savedZoom) {
        const parsedZoom = parseFloat(savedZoom);
        if (parsedZoom >= finalConfig.minZoom && parsedZoom <= finalConfig.maxZoom) {
          setZoom(parsedZoom);
        }
      }
      
      // Also check for template-specific zoom
      if (templateId) {
        const templateZoom = localStorage.getItem(`zoom-level-${sessionId}-${templateId}`);
        if (templateZoom) {
          const parsedZoom = parseFloat(templateZoom);
          if (parsedZoom >= finalConfig.minZoom && parsedZoom <= finalConfig.maxZoom) {
            setZoom(parsedZoom);
          }
        }
      }
    }
  }, [sessionId, templateId, finalConfig.persistZoom, finalConfig.minZoom, finalConfig.maxZoom]);

  // Save zoom level when it changes
  useEffect(() => {
    if (finalConfig.persistZoom && sessionId) {
      localStorage.setItem(`zoom-level-${sessionId}`, zoom.toString());
      
      // Also save template-specific zoom
      if (templateId) {
        localStorage.setItem(`zoom-level-${sessionId}-${templateId}`, zoom.toString());
      }
    }
  }, [zoom, sessionId, templateId, finalConfig.persistZoom]);

  // Handle smooth transitions
  const setZoomWithTransition = useCallback((newZoom: number) => {
    if (finalConfig.smoothTransitions) {
      setIsTransitioning(true);
      
      // Clear existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      
      // Set new timeout
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // Match CSS transition duration
    }
    
    setZoom(Math.max(finalConfig.minZoom, Math.min(finalConfig.maxZoom, newZoom)));
  }, [finalConfig.smoothTransitions, finalConfig.minZoom, finalConfig.maxZoom]);

  // Zoom in to next preset level
  const zoomIn = useCallback(() => {
    const currentIndex = finalConfig.presetLevels.findIndex(level => level >= zoom);
    const nextIndex = currentIndex < finalConfig.presetLevels.length - 1 ? currentIndex + 1 : currentIndex;
    setZoomWithTransition(finalConfig.presetLevels[nextIndex]);
  }, [zoom, finalConfig.presetLevels, setZoomWithTransition]);

  // Zoom out to previous preset level
  const zoomOut = useCallback(() => {
    const currentIndex = finalConfig.presetLevels.findIndex(level => level >= zoom);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : 0;
    setZoomWithTransition(finalConfig.presetLevels[prevIndex]);
  }, [zoom, finalConfig.presetLevels, setZoomWithTransition]);

  // Reset to default zoom
  const resetZoom = useCallback(() => {
    setZoomWithTransition(finalConfig.defaultZoom);
  }, [finalConfig.defaultZoom, setZoomWithTransition]);

  // Zoom to fit container
  const zoomToFit = useCallback(() => {
    if (containerRef?.current && contentRef?.current) {
      const container = containerRef.current;
      const content = contentRef.current;
      
      const containerWidth = container.clientWidth - 48; // Account for padding
      const containerHeight = container.clientHeight - 48;
      
      // Standard resume dimensions at 96 DPI
      const contentWidth = 8.5 * 96;
      const contentHeight = 11 * 96;
      
      const scaleX = containerWidth / contentWidth;
      const scaleY = containerHeight / contentHeight;
      const optimalZoom = Math.min(scaleX, scaleY, finalConfig.maxZoom);
      
      setZoomWithTransition(Math.max(optimalZoom, finalConfig.minZoom));
    }
  }, [containerRef, contentRef, finalConfig.maxZoom, finalConfig.minZoom, setZoomWithTransition]);

  // Zoom to fit width
  const zoomToWidth = useCallback(() => {
    if (containerRef?.current) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth - 48; // Account for padding
      const contentWidth = 8.5 * 96; // Standard resume width at 96 DPI
      
      const optimalZoom = Math.min(containerWidth / contentWidth, finalConfig.maxZoom);
      setZoomWithTransition(Math.max(optimalZoom, finalConfig.minZoom));
    }
  }, [containerRef, finalConfig.maxZoom, finalConfig.minZoom, setZoomWithTransition]);

  // Set specific zoom level
  const setSpecificZoom = useCallback((newZoom: number) => {
    setZoomWithTransition(newZoom);
  }, [setZoomWithTransition]);

  // Get zoom percentage as string
  const getZoomPercentage = useCallback(() => {
    return `${Math.round(zoom * 100)}%`;
  }, [zoom]);

  // Check if zoom controls should be disabled
  const canZoomIn = useCallback(() => {
    return zoom < finalConfig.maxZoom;
  }, [zoom, finalConfig.maxZoom]);

  const canZoomOut = useCallback(() => {
    return zoom > finalConfig.minZoom;
  }, [zoom, finalConfig.minZoom]);

  // Get current preset level index
  const getCurrentPresetIndex = useCallback(() => {
    return finalConfig.presetLevels.findIndex(level => Math.abs(level - zoom) < 0.01);
  }, [zoom, finalConfig.presetLevels]);

  // Check if current zoom is a preset level
  const isPresetLevel = useCallback(() => {
    return getCurrentPresetIndex() !== -1;
  }, [getCurrentPresetIndex]);

  // Get next/previous preset levels
  const getNextPresetLevel = useCallback(() => {
    const currentIndex = finalConfig.presetLevels.findIndex(level => level >= zoom);
    return currentIndex < finalConfig.presetLevels.length - 1 
      ? finalConfig.presetLevels[currentIndex + 1] 
      : null;
  }, [zoom, finalConfig.presetLevels]);

  const getPreviousPresetLevel = useCallback(() => {
    const currentIndex = finalConfig.presetLevels.findIndex(level => level >= zoom);
    return currentIndex > 0 
      ? finalConfig.presetLevels[currentIndex - 1] 
      : null;
  }, [zoom, finalConfig.presetLevels]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Current state
    zoom,
    isTransitioning,
    config: finalConfig,
    
    // Actions
    zoomIn,
    zoomOut,
    resetZoom,
    zoomToFit,
    zoomToWidth,
    setSpecificZoom,
    
    // Utilities
    getZoomPercentage,
    canZoomIn,
    canZoomOut,
    getCurrentPresetIndex,
    isPresetLevel,
    getNextPresetLevel,
    getPreviousPresetLevel,
    
    // Computed values
    zoomPercentage: Math.round(zoom * 100),
    isDefaultZoom: Math.abs(zoom - finalConfig.defaultZoom) < 0.01,
    isMinZoom: zoom <= finalConfig.minZoom,
    isMaxZoom: zoom >= finalConfig.maxZoom,
    presetLevels: finalConfig.presetLevels
  };
};