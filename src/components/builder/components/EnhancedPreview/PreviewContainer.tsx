import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PreviewContainerProps {
  children: React.ReactNode;
  scale: number;
  targetScale?: number;
  isTransitioning?: boolean;
  onScaleChange: (scale: number, smooth?: boolean) => void;
  onFitToWidth?: () => void;
  onFitToHeight?: () => void;
  onFitToBest?: () => void;
  className?: string;
  fixedHeight?: number;
  enableZoomControls?: boolean;
  transitionDuration?: number;
}

const PreviewContainer: React.FC<PreviewContainerProps> = ({
  children,
  scale,
  targetScale,
  isTransitioning = false,
  onScaleChange,
  onFitToWidth,
  onFitToHeight,
  onFitToBest,
  className = '',
  fixedHeight = 600,
  enableZoomControls = true,
  transitionDuration = 300
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  // Scale limits
  const MIN_SCALE = 0.1;
  const MAX_SCALE = 2.0;
  const SCALE_STEP = 0.1;

  // Update container dimensions
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerDimensions({
        width: rect.width,
        height: rect.height
      });
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    const newScale = Math.min(scale + SCALE_STEP, MAX_SCALE);
    onScaleChange(newScale, true);
  }, [scale, onScaleChange]);

  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(scale - SCALE_STEP, MIN_SCALE);
    onScaleChange(newScale, true);
  }, [scale, onScaleChange]);

  const handleFitToWidth = useCallback(() => {
    if (onFitToWidth) {
      onFitToWidth();
    } else if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 32;
      const contentWidth = 8.5 * 96;
      const newScale = Math.min(containerWidth / contentWidth, MAX_SCALE);
      onScaleChange(newScale, true);
    }
  }, [onFitToWidth, onScaleChange]);

  const handleFitToHeight = useCallback(() => {
    if (onFitToHeight) {
      onFitToHeight();
    } else if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight - 32;
      const contentHeight = 11 * 96;
      const newScale = Math.min(containerHeight / contentHeight, MAX_SCALE);
      onScaleChange(newScale, true);
    }
  }, [onFitToHeight, onScaleChange]);

  const handleFitToBest = useCallback(() => {
    if (onFitToBest) {
      onFitToBest();
    } else if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 32;
      const containerHeight = containerRef.current.clientHeight - 32;
      const contentWidth = 8.5 * 96;
      const contentHeight = 11 * 96;
      
      const scaleX = containerWidth / contentWidth;
      const scaleY = containerHeight / contentHeight;
      const newScale = Math.min(scaleX, scaleY, MAX_SCALE);
      onScaleChange(newScale, true);
    }
  }, [onFitToBest, onScaleChange]);

  const handleResetZoom = useCallback(() => {
    onScaleChange(1, true);
  }, [onScaleChange]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));
      onScaleChange(newScale, false); // No smooth transition for wheel zoom
    }
  }, [scale, onScaleChange]);

  const containerStyle: React.CSSProperties = {
    height: isFullscreen ? '100vh' : `${fixedHeight}px`,
    position: isFullscreen ? 'fixed' : 'relative',
    top: isFullscreen ? 0 : 'auto',
    left: isFullscreen ? 0 : 'auto',
    right: isFullscreen ? 0 : 'auto',
    bottom: isFullscreen ? 0 : 'auto',
    zIndex: isFullscreen ? 9999 : 'auto',
    backgroundColor: isFullscreen ? 'white' : 'transparent'
  };

  return (
    <div 
      className={`relative border rounded-lg bg-gray-50 ${className}`}
      style={containerStyle}
    >
      {/* Zoom Controls */}
      {enableZoomControls && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white rounded-md shadow-sm border p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= MIN_SCALE}
            className="h-8 w-8 p-0"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-xs font-mono px-2 min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= MAX_SCALE}
            className="h-8 w-8 p-0"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-4 bg-gray-300 mx-1" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFitToWidth}
            className="h-8 px-2 text-xs"
            title="Fit to Width"
          >
            W
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFitToHeight}
            className="h-8 px-2 text-xs"
            title="Fit to Height"
          >
            H
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleFitToBest}
            className="h-8 px-2 text-xs"
            title="Fit to Best"
          >
            ⌘
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetZoom}
            className="h-8 px-2 text-xs"
            title="Reset Zoom (100%)"
          >
            1:1
          </Button>
          
          <div className="w-px h-4 bg-gray-300 mx-1" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Scrollable Content Area */}
      <div
        ref={containerRef}
        className="h-full overflow-auto p-4"
        onWheel={handleWheel}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9'
        }}
      >
        <div
          ref={contentRef}
          className={`origin-top-left ease-out ${isTransitioning ? 'transition-transform' : ''}`}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: '8.5in', // Standard letter size
            minHeight: '11in',
            backgroundColor: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            margin: '0 auto',
            transitionDuration: isTransitioning ? `${transitionDuration}ms` : '0ms'
          }}
        >
          {children}
        </div>
      </div>

      {/* Scale indicator for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
          Scale: {scale.toFixed(2)} | Container: {containerDimensions.width}×{containerDimensions.height}
        </div>
      )}
    </div>
  );
};

export default PreviewContainer;