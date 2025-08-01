import { useState, useCallback, useEffect, useRef } from 'react';

export interface ScaleManagerOptions {
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  autoFit?: boolean;
  persistScale?: boolean;
  storageKey?: string;
  smoothTransitions?: boolean;
  transitionDuration?: number;
  autoFitDelay?: number;
}

export interface ScaleManager {
  scale: number;
  targetScale: number;
  isTransitioning: boolean;
  setScale: (scale: number, smooth?: boolean) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToWidth: (containerWidth: number, contentWidth: number) => void;
  fitToHeight: (containerHeight: number, contentHeight: number) => void;
  fitToBest: (containerWidth: number, containerHeight: number, contentWidth: number, contentHeight: number) => void;
  autoFit: (containerWidth: number, containerHeight: number, contentWidth: number, contentHeight: number) => void;
  resetScale: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  scaleToFit: 'width' | 'height' | 'best' | 'none';
  setScaleToFit: (mode: 'width' | 'height' | 'best' | 'none') => void;
}

const DEFAULT_OPTIONS: Required<ScaleManagerOptions> = {
  initialScale: 1,
  minScale: 0.1,
  maxScale: 2.0,
  autoFit: true,
  persistScale: true,
  storageKey: 'resume-preview-scale',
  smoothTransitions: true,
  transitionDuration: 300,
  autoFitDelay: 150
};

export const useScaleManager = (options: ScaleManagerOptions = {}): ScaleManager => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const [scale, setScaleState] = useState(config.initialScale);
  const [targetScale, setTargetScale] = useState(config.initialScale);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scaleToFit, setScaleToFit] = useState<'width' | 'height' | 'best' | 'none'>('best');
  
  const scaleRef = useRef(scale);
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();
  const autoFitTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Update ref when scale changes
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // Load persisted scale and fit mode on mount
  useEffect(() => {
    if (config.persistScale && typeof window !== 'undefined') {
      const savedScale = localStorage.getItem(config.storageKey);
      const savedFitMode = localStorage.getItem(`${config.storageKey}-fit-mode`);
      
      if (savedScale) {
        const parsedScale = parseFloat(savedScale);
        if (!isNaN(parsedScale) && parsedScale >= config.minScale && parsedScale <= config.maxScale) {
          setScaleState(parsedScale);
          setTargetScale(parsedScale);
        }
      }
      
      if (savedFitMode && ['width', 'height', 'best', 'none'].includes(savedFitMode)) {
        setScaleToFit(savedFitMode as 'width' | 'height' | 'best' | 'none');
      }
    }
  }, [config.persistScale, config.storageKey, config.minScale, config.maxScale]);

  // Persist scale changes and fit mode
  useEffect(() => {
    if (config.persistScale && typeof window !== 'undefined') {
      localStorage.setItem(config.storageKey, scale.toString());
      localStorage.setItem(`${config.storageKey}-fit-mode`, scaleToFit);
    }
  }, [scale, scaleToFit, config.persistScale, config.storageKey]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      if (autoFitTimeoutRef.current) {
        clearTimeout(autoFitTimeoutRef.current);
      }
    };
  }, []);

  const setScale = useCallback((newScale: number, smooth: boolean = config.smoothTransitions) => {
    const clampedScale = Math.max(config.minScale, Math.min(config.maxScale, newScale));
    
    if (Math.abs(clampedScale - scale) < 0.001) {
      return; // No significant change
    }
    
    setTargetScale(clampedScale);
    
    if (smooth && config.smoothTransitions) {
      setIsTransitioning(true);
      
      // Clear any existing transition timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      
      // Set the scale immediately for CSS transition
      setScaleState(clampedScale);
      
      // Mark transition as complete after duration
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, config.transitionDuration);
    } else {
      setScaleState(clampedScale);
      setIsTransitioning(false);
    }
    
    // Reset fit mode when manually setting scale
    if (scaleToFit !== 'none') {
      setScaleToFit('none');
    }
  }, [config.minScale, config.maxScale, config.smoothTransitions, config.transitionDuration, scale, scaleToFit]);

  const zoomIn = useCallback(() => {
    const step = 0.1;
    const newScale = Math.min(scale + step, config.maxScale);
    setScale(newScale, true);
  }, [scale, config.maxScale, setScale]);

  const zoomOut = useCallback(() => {
    const step = 0.1;
    const newScale = Math.max(scale - step, config.minScale);
    setScale(newScale, true);
  }, [scale, config.minScale, setScale]);

  const fitToWidth = useCallback((containerWidth: number, contentWidth: number) => {
    if (containerWidth > 0 && contentWidth > 0) {
      const padding = 32; // Account for container padding
      const availableWidth = containerWidth - padding;
      const newScale = Math.min(availableWidth / contentWidth, config.maxScale);
      setScale(newScale, true);
      setScaleToFit('width');
    }
  }, [config.maxScale, setScale]);

  const fitToHeight = useCallback((containerHeight: number, contentHeight: number) => {
    if (containerHeight > 0 && contentHeight > 0) {
      const padding = 32; // Account for container padding
      const availableHeight = containerHeight - padding;
      const newScale = Math.min(availableHeight / contentHeight, config.maxScale);
      setScale(newScale, true);
      setScaleToFit('height');
    }
  }, [config.maxScale, setScale]);

  const fitToBest = useCallback((
    containerWidth: number, 
    containerHeight: number, 
    contentWidth: number, 
    contentHeight: number
  ) => {
    if (containerWidth > 0 && containerHeight > 0 && contentWidth > 0 && contentHeight > 0) {
      const padding = 32;
      const availableWidth = containerWidth - padding;
      const availableHeight = containerHeight - padding;
      
      const scaleX = availableWidth / contentWidth;
      const scaleY = availableHeight / contentHeight;
      
      // Choose the smaller scale to ensure content fits in both dimensions
      const newScale = Math.min(scaleX, scaleY, config.maxScale);
      setScale(newScale, true);
      setScaleToFit('best');
    }
  }, [config.maxScale, setScale]);

  const autoFit = useCallback((
    containerWidth: number, 
    containerHeight: number, 
    contentWidth: number, 
    contentHeight: number
  ) => {
    // Clear any existing auto-fit timeout
    if (autoFitTimeoutRef.current) {
      clearTimeout(autoFitTimeoutRef.current);
    }
    
    // Debounce auto-fit to prevent excessive calculations
    autoFitTimeoutRef.current = setTimeout(() => {
      if (scaleToFit === 'width') {
        fitToWidth(containerWidth, contentWidth);
      } else if (scaleToFit === 'height') {
        fitToHeight(containerHeight, contentHeight);
      } else if (scaleToFit === 'best') {
        fitToBest(containerWidth, containerHeight, contentWidth, contentHeight);
      }
    }, config.autoFitDelay);
  }, [scaleToFit, fitToWidth, fitToHeight, fitToBest, config.autoFitDelay]);

  const resetScale = useCallback(() => {
    setScale(config.initialScale, true);
    setScaleToFit('none');
  }, [config.initialScale, setScale]);

  const canZoomIn = scale < config.maxScale;
  const canZoomOut = scale > config.minScale;

  return {
    scale,
    targetScale,
    isTransitioning,
    setScale,
    zoomIn,
    zoomOut,
    fitToWidth,
    fitToHeight,
    fitToBest,
    autoFit,
    resetScale,
    canZoomIn,
    canZoomOut,
    scaleToFit,
    setScaleToFit
  };
};