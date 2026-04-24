import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ColorOption {
  color: string;
  name: string;
}

interface ColorPickerProps {
  colors: ColorOption[];
  selectedColor: string;
  onColorChange: (color: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  colors,
  selectedColor,
  onColorChange,
  className
}) => {
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Premium Circular Color Grid */}
      <div className="flex flex-wrap gap-4 justify-center p-4">
        {colors.map((colorOption, index) => (
          <div
            key={colorOption.color}
            className="relative group"
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            {/* Outer rotating glow ring for selected color */}
            {selectedColor === colorOption.color && (
              <>
                <div 
                  className="absolute inset-0 rounded-full animate-spin-slow"
                  style={{
                    background: `conic-gradient(from 0deg, ${colorOption.color}, transparent, ${colorOption.color}, transparent, ${colorOption.color})`,
                    padding: '3px',
                    filter: 'blur(2px)',
                    transform: 'scale(1.6)',
                    opacity: 0.8
                  }}
                />
                <div 
                  className="absolute inset-0 rounded-full animate-pulse"
                  style={{
                    background: `radial-gradient(circle, ${colorOption.color}40 0%, transparent 70%)`,
                    transform: 'scale(2.2)',
                    filter: 'blur(12px)'
                  }}
                />
              </>
            )}
            
            {/* Shining border ring on hover */}
            <div 
              className={cn(
                "absolute inset-0 rounded-full transition-all duration-500",
                selectedColor === colorOption.color 
                  ? "animate-spin-slow opacity-100" 
                  : "opacity-0 group-hover:opacity-80 group-hover:animate-spin-slow"
              )}
              style={{
                background: `conic-gradient(from 0deg, ${colorOption.color}80, transparent, ${colorOption.color}80, transparent, ${colorOption.color}80)`,
                padding: '2px',
                transform: 'scale(1.3)',
                filter: 'blur(1px)'
              }}
            />
            
            {/* Main color button */}
            <button
              onClick={() => onColorChange(colorOption.color)}
              onMouseEnter={() => setHoveredColor(colorOption.name)}
              onMouseLeave={() => setHoveredColor(null)}
              className={cn(
                "relative w-12 h-12 rounded-full transition-all duration-300 transform",
                "hover:scale-110 active:scale-95",
                "shadow-lg hover:shadow-2xl",
                "border-3 border-white/60",
                "backdrop-blur-sm",
                selectedColor === colorOption.color 
                  ? "scale-115 shadow-2xl ring-4 ring-white/40 z-10" 
                  : "hover:shadow-2xl hover:ring-2 hover:ring-white/20"
              )}
              style={{ 
                backgroundColor: colorOption.color,
                boxShadow: selectedColor === colorOption.color 
                  ? `0 0 30px ${colorOption.color}60, 0 12px 35px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)` 
                  : `0 6px 20px rgba(0,0,0,0.15), 0 0 0 1px ${colorOption.color}30, inset 0 1px 0 rgba(255,255,255,0.2)`
              }}
              aria-label={`Select ${colorOption.name}`}
            >
              {/* Inner shine gradient */}
              <div 
                className="absolute inset-1 rounded-full opacity-40"
                style={{
                  background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.1) 30%, transparent 60%, rgba(255,255,255,0.3) 100%)`
                }}
              />
              
              {/* Selected indicator with animation */}
              {selectedColor === colorOption.color && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full shadow-lg animate-pulse border border-gray-200" 
                       style={{ 
                         boxShadow: `0 0 10px rgba(255,255,255,0.8), inset 0 1px 0 rgba(255,255,255,0.9)` 
                       }} 
                  />
                </div>
              )}
              
              {/* Sparkle effect on hover */}
              <div className={cn(
                "absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none",
                "opacity-0 group-hover:opacity-100"
              )}>
                <div className="absolute top-2 right-3 w-1 h-1 bg-white rounded-full animate-ping" />
                <div className="absolute bottom-3 left-2 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-3 left-3 w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }} />
              </div>
            </button>
            
            {/* Hover glow effect */}
            <div 
              className={cn(
                "absolute inset-0 rounded-full transition-all duration-500 pointer-events-none",
                "opacity-0 group-hover:opacity-50",
                selectedColor === colorOption.color ? "opacity-30" : ""
              )}
              style={{
                background: `radial-gradient(circle, ${colorOption.color}80 0%, ${colorOption.color}40 40%, transparent 70%)`,
                transform: 'scale(2)',
                filter: 'blur(15px)'
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Color Name Display with Animation */}
      <div className="text-center min-h-[24px] flex items-center justify-center">
        {hoveredColor && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="w-2 h-2 rounded-full animate-pulse" 
                 style={{ backgroundColor: colors.find(c => c.name === hoveredColor)?.color }} />
            <span className="text-sm text-foreground font-medium tracking-wide">
              {hoveredColor}
            </span>
          </div>
        )}
        {!hoveredColor && selectedColor && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" 
                 style={{ backgroundColor: selectedColor }} />
            <span className="text-sm text-foreground font-semibold tracking-wide">
              {colors.find(c => c.color === selectedColor)?.name || 'Selected Color'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};