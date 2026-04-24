import React, { useEffect, useRef, useState } from 'react';
import { Check, Circle, AlertCircle } from 'lucide-react';
import { SectionIndicatorProps } from './types';
import { 
  animationStyles, 
  triggerSectionCompletionAnimation,
  triggerLineAnimation,
  respectsReducedMotion 
} from './animations';

const SectionIndicator: React.FC<SectionIndicatorProps> = ({
  section,
  index,
  isActive,
  isClickable,
  onClick,
  showConnectingLine = true,
  isLastSection = false,
}) => {
  const indicatorRef = useRef<HTMLButtonElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [previousStatus, setPreviousStatus] = useState(section.status);
  const [isNavigating, setIsNavigating] = useState(false);
  const reducedMotion = respectsReducedMotion();
  const getStatusIcon = () => {
    switch (section.status) {
      case 'completed':
        return <Check className="w-4 h-4 text-white" />;
      case 'in_progress':
        return <Circle className="w-4 h-4 text-white fill-current" />;
      case 'not_started':
        return <span className="text-sm font-medium text-gray-400">{index + 1}</span>;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  // Trigger animations when status changes
  useEffect(() => {
    if (previousStatus !== section.status && !reducedMotion) {
      if (section.status === 'completed' && indicatorRef.current) {
        triggerSectionCompletionAnimation(indicatorRef.current);
      }
      setPreviousStatus(section.status);
    }
  }, [section.status, previousStatus, reducedMotion]);

  // Trigger line animation when section completes
  useEffect(() => {
    if (lineRef.current && !reducedMotion) {
      triggerLineAnimation(lineRef.current, section.status === 'completed');
    }
  }, [section.status, reducedMotion]);

  const getIndicatorStyles = () => {
    const baseStyles = "w-10 h-10 rounded-full flex items-center justify-center relative z-10";
    const animationStyle = animationStyles.sectionIndicator(section.status, isActive);
    const navigationStyle = animationStyles.navigationTransition(isNavigating);
    
    let statusStyles = "";
    if (section.status === 'completed') {
      statusStyles = "bg-blue-500 hover:bg-blue-600 shadow-lg";
    } else if (isActive) {
      statusStyles = "bg-blue-500 ring-4 ring-blue-200 shadow-lg";
      if (!reducedMotion) {
        statusStyles += " animate-pulse";
      }
    } else if (section.status === 'in_progress') {
      statusStyles = "bg-blue-400 hover:bg-blue-500";
    } else {
      statusStyles = "bg-gray-300 hover:bg-gray-400";
    }
    
    return {
      className: `${baseStyles} ${statusStyles} transition-all duration-300`,
      style: {
        ...animationStyle,
        ...navigationStyle
      }
    };
  };

  const getConnectingLineStyles = () => {
    const baseStyles = "absolute top-5 left-5 w-px";
    const height = "h-16"; // Distance between indicators
    const animationStyle = animationStyles.connectingLine(
      section.status === 'completed',
      isActive && section.status === 'in_progress'
    );
    
    return {
      className: `${baseStyles} ${height}`,
      style: animationStyle
    };
  };

  const handleClick = () => {
    if (isClickable) {
      setIsNavigating(true);
      onClick(index);
      
      // Reset navigation state after animation
      setTimeout(() => {
        setIsNavigating(false);
      }, 250);
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Section Indicator */}
      <button
        ref={indicatorRef}
        onClick={handleClick}
        disabled={!isClickable}
        className={`${getIndicatorStyles().className} ${
          isClickable ? 'cursor-pointer' : 'cursor-default'
        } group`}
        style={getIndicatorStyles().style}
        aria-label={`${section.name} - ${section.status}`}
        title={`${section.name} (${section.status})`}
      >
        {getStatusIcon()}
        
        {/* Hover effect */}
        {isClickable && (
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
        )}
      </button>

      {/* Section Label */}
      <div className="mt-2 text-center">
        <span
          className={`text-sm font-medium transition-colors duration-200 ${
            isActive
              ? 'text-blue-600'
              : section.status === 'completed'
              ? 'text-gray-700'
              : 'text-gray-500'
          }`}
        >
          {section.name}
        </span>
        
        {/* Validation Errors Indicator */}
        {section.validationErrors.length > 0 && (
          <div className="flex items-center justify-center mt-1">
            <AlertCircle className="w-3 h-3 text-red-500" />
            <span className="text-xs text-red-500 ml-1">
              {section.validationErrors.length} error{section.validationErrors.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
        
        {/* Completion Percentage for In Progress */}
        {section.status === 'in_progress' && section.completionPercentage > 0 && (
          <div className="mt-1">
            <div className="w-16 h-1 bg-gray-200 rounded-full mx-auto">
              <div
                className="h-1 bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${section.completionPercentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {section.completionPercentage}%
            </span>
          </div>
        )}
      </div>

      {/* Connecting Line */}
      {showConnectingLine && !isLastSection && (
        <div 
          ref={lineRef}
          className={getConnectingLineStyles().className}
          style={getConnectingLineStyles().style}
        />
      )}
    </div>
  );
};

export default SectionIndicator;