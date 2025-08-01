import React from 'react';
import { EnhancedProgressFlow } from './index';
import { ResumeData, BuilderState } from '../../types';

interface ProgressiveFlowIntegrationProps {
  resumeData: ResumeData;
  builderState: BuilderState;
  updateResumeData: (data: Partial<ResumeData>) => void;
  updateBuilderState: (state: Partial<BuilderState>) => void;
  sessionId?: string;
  variant?: 'sidebar' | 'horizontal' | 'compact';
  className?: string;
}

/**
 * Integration component that demonstrates how to use the Progressive Flow
 * in the main resume builder application.
 */
const ProgressiveFlowIntegration: React.FC<ProgressiveFlowIntegrationProps> = ({
  resumeData,
  builderState,
  updateResumeData,
  updateBuilderState,
  sessionId,
  variant = 'sidebar',
  className = ''
}) => {
  // For sidebar variant (default)
  if (variant === 'sidebar') {
    return (
      <div className={`w-full ${className}`}>
        <EnhancedProgressFlow
          resumeData={resumeData}
          builderState={builderState}
          updateResumeData={updateResumeData}
          updateBuilderState={updateBuilderState}
          sessionId={sessionId}
          currentSection={builderState.activeIndex}
          showConnectingLines={true}
          animationEnabled={true}
          enableKeyboardNavigation={true}
          enableAutoSave={true}
          celebrationVariant="subtle"
          className="px-4 py-6"
        />
      </div>
    );
  }

  // For horizontal variant (mobile/tablet)
  if (variant === 'horizontal') {
    return (
      <div className={`w-full bg-white border-b border-gray-200 ${className}`}>
        <EnhancedProgressFlow
          resumeData={resumeData}
          builderState={builderState}
          updateResumeData={updateResumeData}
          updateBuilderState={updateBuilderState}
          sessionId={sessionId}
          currentSection={builderState.activeIndex}
          showConnectingLines={false}
          animationEnabled={true}
          enableKeyboardNavigation={true}
          enableAutoSave={true}
          celebrationVariant="subtle"
          className="px-4 py-3"
        />
      </div>
    );
  }

  // For compact variant (small spaces)
  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        <EnhancedProgressFlow
          resumeData={resumeData}
          builderState={builderState}
          updateResumeData={updateResumeData}
          updateBuilderState={updateBuilderState}
          sessionId={sessionId}
          currentSection={builderState.activeIndex}
          showConnectingLines={true}
          animationEnabled={false} // Reduced animations for compact view
          enableKeyboardNavigation={true}
          enableAutoSave={true}
          celebrationVariant="subtle"
          className="p-4"
        />
      </div>
    );
  }

  return null;
};

export default ProgressiveFlowIntegration;