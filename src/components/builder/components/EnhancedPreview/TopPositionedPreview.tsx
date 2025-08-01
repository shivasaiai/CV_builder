import React, { useRef, useEffect, useState } from 'react';
import { ResumeData, TemplateColors } from '../../types';
import { useTemplateManager } from '../../hooks/useTemplateManager';
import { useScaleManager } from '../../hooks/useScaleManager';

interface TopPositionedPreviewProps {
  resumeData: ResumeData;
  activeTemplate: string;
  templateColors: TemplateColors;
  onTemplateChange: (template: string) => void;
  className?: string;
  fixedHeight?: number;
}

const TopPositionedPreview: React.FC<TopPositionedPreviewProps> = ({
  resumeData,
  activeTemplate,
  templateColors,
  onTemplateChange,
  className = '',
  fixedHeight = 500
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { getTemplateComponent } = useTemplateManager(activeTemplate, onTemplateChange);
  
  const scaleManager = useScaleManager({
    initialScale: 0.4,
    persistScale: true,
    storageKey: `top-preview-scale-${activeTemplate}`,
    autoFit: true
  });

  // Auto-fit when container size changes
  useEffect(() => {
    const handleResize = () => {
      if (previewRef.current) {
        const container = previewRef.current;
        const containerRect = container.getBoundingClientRect();
        const contentWidth = 8.5 * 96; // 8.5 inches at 96 DPI
        const contentHeight = 11 * 96; // 11 inches at 96 DPI
        
        scaleManager.autoFit(
          containerRect.width - 32, // Account for padding
          containerRect.height - 32,
          contentWidth,
          contentHeight
        );
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (previewRef.current) {
      resizeObserver.observe(previewRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [scaleManager, activeTemplate]);

  const TemplateComponent = getTemplateComponent(activeTemplate);

  return (
    <div 
      ref={previewRef}
      className={`bg-gray-100 rounded-lg border overflow-hidden relative ${className}`}
      style={{ height: fixedHeight }}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Preview container */}
      <div className="h-full w-full flex items-center justify-center p-4">
        <div
          style={{
            transform: `scale(${scaleManager.scale})`,
            transformOrigin: 'center center',
            transition: scaleManager.isTransitioning ? 'transform 0.3s ease-in-out' : 'none'
          }}
        >
          <div 
            className="bg-white shadow-lg"
            style={{ 
              width: '8.5in', 
              minHeight: '11in',
              maxWidth: '8.5in'
            }}
          >
            <TemplateComponent
              contact={resumeData.contact}
              summary={resumeData.contact.summary || ''}
              skills={resumeData.skills}
              experience={resumeData.workExperiences[0] || {}}
              education={resumeData.education}
              colors={templateColors}
              primaryColor={templateColors.primary}
              projects={resumeData.projects}
              certifications={resumeData.certifications}
              languages={resumeData.languages}
              volunteerExperience={resumeData.volunteerExperiences}
              publications={resumeData.publications}
              awards={resumeData.awards}
              references={resumeData.references}
              activeSections={resumeData.activeSections}
            />
          </div>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={scaleManager.zoomOut}
          disabled={!scaleManager.canZoomOut}
          className="px-2 py-1 bg-white/80 hover:bg-white text-gray-700 rounded text-sm disabled:opacity-50"
        >
          −
        </button>
        <span className="px-2 py-1 bg-white/80 text-gray-700 rounded text-sm">
          {Math.round(scaleManager.scale * 100)}%
        </span>
        <button
          onClick={scaleManager.zoomIn}
          disabled={!scaleManager.canZoomIn}
          className="px-2 py-1 bg-white/80 hover:bg-white text-gray-700 rounded text-sm disabled:opacity-50"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default TopPositionedPreview;