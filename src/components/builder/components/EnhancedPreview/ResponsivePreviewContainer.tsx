import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ResizeObserver } from '@juggle/resize-observer';

interface ResponsivePreviewContainerProps {
  children: React.ReactNode;
  fixedHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  layoutPreference: 'top' | 'side';
  zoom: number;
  onContainerResize?: (dimensions: { width: number; height: number }) => void;
  className?: string;
  enableScrolling?: boolean;
  scrollBehavior?: 'smooth' | 'auto';
}

interface ContainerDimensions {
  width: number;
  height: number;
  availableWidth: number;
  availableHeight: number;
  aspectRatio: number;
}

const ResponsivePreviewContainer: React.FC<ResponsivePreviewContainerProps> = ({
  children,
  fixedHeight = 500,
  minHeight = 300,
  maxHeight = 800,
  layoutPreference,
  zoom,
  onContainerResize,
  className = '',
  enableScrolling = true,
  scrollBehavior = 'smooth'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<ContainerDimensions>({
    width: 0,
    height: 0,
    availableWidth: 0,
    availableHeight: 0,
    aspectRatio: 0
  });
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  // Calculate responsive dimensions based on screen size and layout
  const calculateResponsiveDimensions = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let containerHeight: number;
    let containerWidth = rect.width;

    // Determine optimal height based on layout and screen size
    if (layoutPreference === 'top') {
      if (screenWidth < 768) { // Mobile
        containerHeight = Math.min(screenHeight * 0.4, 400);
      } else if (screenWidth < 1024) { // Tablet
        containerHeight = Math.min(screenHeight * 0.45, 450);
      } else { // Desktop
        containerHeight = fixedHeight;
      }
    } else {
      // Side layout - use full available height
      containerHeight = Math.min(screenHeight - 100, maxHeight);
    }

    // Ensure height constraints
    containerHeight = Math.max(minHeight, Math.min(containerHeight, maxHeight));

    // Calculate available space (accounting for padding)
    const padding = 48; // 24px on each side
    const availableWidth = containerWidth - padding;
    const availableHeight = containerHeight - padding;

    const newDimensions: ContainerDimensions = {
      width: containerWidth,
      height: containerHeight,
      availableWidth,
      availableHeight,
      aspectRatio: availableWidth / availableHeight
    };

    setDimensions(newDimensions);
    onContainerResize?.(newDimensions);

    // Check if content is overflowing
    if (contentWrapperRef.current) {
      const contentRect = contentWrapperRef.current.getBoundingClientRect();
      const isContentOverflowing = 
        contentRect.width > availableWidth || 
        contentRect.height > availableHeight;
      setIsOverflowing(isContentOverflowing);
    }
  }, [layoutPreference, fixedHeight, minHeight, maxHeight, onContainerResize]);

  // Set up resize observer
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      calculateResponsiveDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also listen to window resize for responsive behavior
    window.addEventListener('resize', calculateResponsiveDimensions);

    // Initial calculation
    calculateResponsiveDimensions();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateResponsiveDimensions);
    };
  }, [calculateResponsiveDimensions]);

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    setScrollPosition({
      x: target.scrollLeft,
      y: target.scrollTop
    });
  }, []);

  // Smooth scroll to center content
  const centerContent = useCallback(() => {
    if (!containerRef.current || !contentWrapperRef.current) return;

    const container = containerRef.current;
    const content = contentWrapperRef.current;

    const containerRect = container.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();

    const centerX = (contentRect.width - containerRect.width) / 2;
    const centerY = (contentRect.height - containerRect.height) / 2;

    container.scrollTo({
      left: Math.max(0, centerX),
      top: Math.max(0, centerY),
      behavior: scrollBehavior
    });
  }, [scrollBehavior]);

  // Auto-center when zoom changes
  useEffect(() => {
    const timeoutId = setTimeout(centerContent, 100);
    return () => clearTimeout(timeoutId);
  }, [zoom, centerContent]);

  // Get container styles based on layout and dimensions
  const getContainerStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      width: '100%',
      height: `${dimensions.height}px`,
      minHeight: `${minHeight}px`,
      maxHeight: `${maxHeight}px`,
      position: 'relative',
      overflow: enableScrolling ? 'auto' : 'hidden',
      scrollBehavior: scrollBehavior
    };

    // Add responsive adjustments
    if (layoutPreference === 'top') {
      return {
        ...baseStyles,
        // Fixed height for top layout
        height: `${dimensions.height}px`
      };
    } else {
      return {
        ...baseStyles,
        // Flexible height for side layout
        height: '100%',
        minHeight: `${minHeight}px`
      };
    }
  };

  // Get content wrapper styles
  const getContentWrapperStyles = (): React.CSSProperties => {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100%',
      padding: '24px',
      position: 'relative'
    };
  };

  return (
    <div
      ref={containerRef}
      className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg transition-all duration-300 ${className}`}
      style={getContainerStyles()}
      onScroll={handleScroll}
      role="region"
      aria-label="Resume preview container"
    >
      {/* Scroll indicators */}
      {isOverflowing && enableScrolling && (
        <>
          {scrollPosition.y > 10 && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 bg-black/20 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
              Scroll up for more content
            </div>
          )}
          {scrollPosition.x > 10 && (
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/20 text-white text-xs px-2 py-1 rounded-full pointer-events-none rotate-90">
              Scroll left
            </div>
          )}
        </>
      )}

      {/* Content wrapper */}
      <div
        ref={contentWrapperRef}
        style={getContentWrapperStyles()}
      >
        {children}
      </div>

      {/* Resize handle for manual resizing (desktop only) */}
      {layoutPreference === 'side' && window.innerWidth >= 1024 && (
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-gray-300 hover:bg-gray-400 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity">
          <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-gray-600"></div>
        </div>
      )}

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 bg-black/80 text-white text-xs p-2 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <div>Container: {Math.round(dimensions.width)}×{Math.round(dimensions.height)}</div>
          <div>Available: {Math.round(dimensions.availableWidth)}×{Math.round(dimensions.availableHeight)}</div>
          <div>Zoom: {Math.round(zoom * 100)}%</div>
          <div>Layout: {layoutPreference}</div>
          <div>Overflow: {isOverflowing ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

export default ResponsivePreviewContainer;