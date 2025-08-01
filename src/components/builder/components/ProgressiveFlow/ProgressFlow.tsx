import React, { useEffect, useRef, useState } from 'react';
import SectionIndicator from './SectionIndicator';
import { ProgressFlowProps } from './types';
import { 
  animationStyles, 
  triggerProgressBarAnimation,
  respectsReducedMotion,
  createScrollAnimationObserver 
} from './animations';

const ProgressFlow: React.FC<ProgressFlowProps> = ({
  sections,
  currentSection,
  onSectionClick,
  showConnectingLines = true,
  animationEnabled = true,
  className = '',
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [previousCompletionCount, setPreviousCompletionCount] = useState(0);
  const reducedMotion = respectsReducedMotion();
  
  const completedCount = sections.filter(s => s.status === 'completed').length;
  const overallProgress = (completedCount / sections.length) * 100;
  // Intersection observer for scroll animations
  useEffect(() => {
    if (!containerRef.current || reducedMotion) return;

    const observer = createScrollAnimationObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [reducedMotion]);

  // Trigger progress bar animation when completion count changes
  useEffect(() => {
    if (completedCount > previousCompletionCount && progressBarRef.current && !reducedMotion) {
      triggerProgressBarAnimation(progressBarRef.current, overallProgress);
    }
    setPreviousCompletionCount(completedCount);
  }, [completedCount, previousCompletionCount, overallProgress, reducedMotion]);

  const isClickable = (index: number) => {
    // Allow clicking on completed sections and the current section
    // Also allow clicking on the next section if current is completed
    const section = sections[index];
    const currentSectionData = sections[currentSection];
    
    if (section.status === 'completed') return true;
    if (index === currentSection) return true;
    if (index === currentSection + 1 && currentSectionData?.status === 'completed') return true;
    
    return false;
  };

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col items-center py-6 ${className} ${
        isVisible && animationEnabled && !reducedMotion ? 'animate-fadeInUp' : ''
      }`}
    >
      {/* Progress Header */}
      <div className="text-center mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Resume Progress
        </h2>
        <div className="flex items-center justify-center space-x-2">
          <div className="text-sm text-gray-600">
            Step {currentSection + 1} of {sections.length}
          </div>
          <div className="w-px h-4 bg-gray-300" />
          <div className="text-sm text-gray-600">
            {completedCount} completed
          </div>
        </div>
      </div>

      {/* Progress Flow */}
      <div className="relative">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`transition-all duration-300 ${
              animationEnabled ? 'transform' : ''
            } ${
              index === currentSection && animationEnabled
                ? 'scale-105'
                : 'scale-100'
            }`}
            style={{
              marginBottom: index === sections.length - 1 ? 0 : '3rem',
            }}
          >
            <SectionIndicator
              section={section}
              index={index}
              isActive={index === currentSection}
              isClickable={isClickable(index)}
              onClick={onSectionClick}
              showConnectingLine={showConnectingLines}
              isLastSection={index === sections.length - 1}
            />
          </div>
        ))}
      </div>

      {/* Overall Progress Bar */}
      <div className="mt-8 w-full max-w-xs">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Overall Progress</span>
          <span>
            {Math.round(overallProgress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            ref={progressBarRef}
            className="bg-blue-500 h-2 rounded-full"
            style={animationStyles.progressBar(overallProgress)}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressFlow;