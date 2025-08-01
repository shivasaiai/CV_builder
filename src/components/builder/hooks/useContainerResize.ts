import { useState, useCallback, useRef, useEffect } from 'react';

interface ContainerDimensions {
  width: number;
  height: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

interface UseContainerResizeProps {
  initialDimensions?: Partial<ContainerDimensions>;
  onResize?: (dimensions: ContainerDimensions) => void;
  enableResize?: boolean;
  resizeHandles?: ('n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw')[];
}

const DEFAULT_DIMENSIONS: ContainerDimensions = {
  width: 400,
  height: 500,
  minWidth: 300,
  maxWidth: 800,
  minHeight: 300,
  maxHeight: 1000
};

export const useContainerResize = ({
  initialDimensions = {},
  onResize,
  enableResize = true,
  resizeHandles = ['se']
}: UseContainerResizeProps = {}) => {
  const [dimensions, setDimensions] = useState<ContainerDimensions>({
    ...DEFAULT_DIMENSIONS,
    ...initialDimensions
  });
  
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startPositionRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  // Handle mouse down on resize handles
  const handleMouseDown = useCallback((event: React.MouseEvent, handle: string) => {
    if (!enableResize) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    setIsResizing(true);
    setResizeHandle(handle);
    
    startPositionRef.current = {
      x: event.clientX,
      y: event.clientY,
      width: dimensions.width,
      height: dimensions.height
    };
    
    // Add global mouse event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = getCursorForHandle(handle);
    document.body.style.userSelect = 'none';
  }, [enableResize, dimensions.width, dimensions.height]);

  // Handle mouse move during resize
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isResizing || !startPositionRef.current || !resizeHandle) return;
    
    const { x: startX, y: startY, width: startWidth, height: startHeight } = startPositionRef.current;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    
    let newWidth = startWidth;
    let newHeight = startHeight;
    
    // Calculate new dimensions based on resize handle
    switch (resizeHandle) {
      case 'se': // Southeast
        newWidth = startWidth + deltaX;
        newHeight = startHeight + deltaY;
        break;
      case 'sw': // Southwest
        newWidth = startWidth - deltaX;
        newHeight = startHeight + deltaY;
        break;
      case 'ne': // Northeast
        newWidth = startWidth + deltaX;
        newHeight = startHeight - deltaY;
        break;
      case 'nw': // Northwest
        newWidth = startWidth - deltaX;
        newHeight = startHeight - deltaY;
        break;
      case 'n': // North
        newHeight = startHeight - deltaY;
        break;
      case 's': // South
        newHeight = startHeight + deltaY;
        break;
      case 'e': // East
        newWidth = startWidth + deltaX;
        break;
      case 'w': // West
        newWidth = startWidth - deltaX;
        break;
    }
    
    // Apply constraints
    newWidth = Math.max(dimensions.minWidth, Math.min(dimensions.maxWidth, newWidth));
    newHeight = Math.max(dimensions.minHeight, Math.min(dimensions.maxHeight, newHeight));
    
    const newDimensions = {
      ...dimensions,
      width: newWidth,
      height: newHeight
    };
    
    setDimensions(newDimensions);
    onResize?.(newDimensions);
  }, [isResizing, resizeHandle, dimensions, onResize]);

  // Handle mouse up to end resize
  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setResizeHandle(null);
    startPositionRef.current = null;
    
    // Remove global mouse event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleMouseMove]);

  // Get cursor style for resize handle
  const getCursorForHandle = (handle: string): string => {
    const cursors: Record<string, string> = {
      'n': 'n-resize',
      's': 's-resize',
      'e': 'e-resize',
      'w': 'w-resize',
      'ne': 'ne-resize',
      'nw': 'nw-resize',
      'se': 'se-resize',
      'sw': 'sw-resize'
    };
    return cursors[handle] || 'default';
  };

  // Render resize handles
  const renderResizeHandles = useCallback(() => {
    if (!enableResize) return null;
    
    return resizeHandles.map((handle) => {
      const handleStyles = getHandleStyles(handle);
      
      return (
        <div
          key={handle}
          className={`absolute bg-blue-500 opacity-0 hover:opacity-100 transition-opacity duration-200 ${
            isResizing && resizeHandle === handle ? 'opacity-100' : ''
          }`}
          style={{
            ...handleStyles,
            cursor: getCursorForHandle(handle),
            zIndex: 10
          }}
          onMouseDown={(e) => handleMouseDown(e, handle)}
        />
      );
    });
  }, [enableResize, resizeHandles, isResizing, resizeHandle, handleMouseDown]);

  // Get styles for resize handle position
  const getHandleStyles = (handle: string): React.CSSProperties => {
    const handleSize = 8;
    const offset = -handleSize / 2;
    
    const styles: Record<string, React.CSSProperties> = {
      'n': { top: offset, left: '50%', width: '20px', height: `${handleSize}px`, transform: 'translateX(-50%)' },
      's': { bottom: offset, left: '50%', width: '20px', height: `${handleSize}px`, transform: 'translateX(-50%)' },
      'e': { right: offset, top: '50%', width: `${handleSize}px`, height: '20px', transform: 'translateY(-50%)' },
      'w': { left: offset, top: '50%', width: `${handleSize}px`, height: '20px', transform: 'translateY(-50%)' },
      'ne': { top: offset, right: offset, width: `${handleSize}px`, height: `${handleSize}px` },
      'nw': { top: offset, left: offset, width: `${handleSize}px`, height: `${handleSize}px` },
      'se': { bottom: offset, right: offset, width: `${handleSize}px`, height: `${handleSize}px` },
      'sw': { bottom: offset, left: offset, width: `${handleSize}px`, height: `${handleSize}px` }
    };
    
    return styles[handle] || {};
  };

  // Update dimensions programmatically
  const updateDimensions = useCallback((newDimensions: Partial<ContainerDimensions>) => {
    const updatedDimensions = { ...dimensions, ...newDimensions };
    setDimensions(updatedDimensions);
    onResize?.(updatedDimensions);
  }, [dimensions, onResize]);

  // Reset to initial dimensions
  const resetDimensions = useCallback(() => {
    const resetDimensions = { ...DEFAULT_DIMENSIONS, ...initialDimensions };
    setDimensions(resetDimensions);
    onResize?.(resetDimensions);
  }, [initialDimensions, onResize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [handleMouseMove, handleMouseUp]);

  return {
    // Current state
    dimensions,
    isResizing,
    resizeHandle,
    containerRef,
    
    // Actions
    updateDimensions,
    resetDimensions,
    
    // Render functions
    renderResizeHandles,
    
    // Computed values
    containerStyle: {
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      position: 'relative' as const,
      minWidth: `${dimensions.minWidth}px`,
      maxWidth: `${dimensions.maxWidth}px`,
      minHeight: `${dimensions.minHeight}px`,
      maxHeight: `${dimensions.maxHeight}px`
    }
  };
};