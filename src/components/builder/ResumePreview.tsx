import { useRef, useEffect, useState, useCallback } from 'react';
import { ResumeData, TemplateColors } from './types';
import { useTemplateManager } from './hooks/useTemplateManager';
import { COLOR_THEMES } from './constants';

interface ResumePreviewProps {
  resumeData: ResumeData;
  activeTemplate: string;
  templateColors: TemplateColors;
  showColorEditor: boolean;
  onTemplateChange: (template: string) => void;
  onColorChange: (colors: TemplateColors) => void;
  onToggleColorEditor: () => void;
}

const ResumePreview = ({
  resumeData,
  activeTemplate,
  templateColors,
  showColorEditor,
  onTemplateChange,
  onColorChange,
  onToggleColorEditor
}: ResumePreviewProps) => {
  const [scale, setScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewContentRef = useRef<HTMLDivElement>(null);
  
  const { getTemplateComponent, templateNames } = useTemplateManager(
    activeTemplate, 
    onTemplateChange
  );

  // Calculate scale for preview
  const calculateScale = useCallback(() => {
    if (previewContainerRef.current && previewContentRef.current) {
      const container = previewContainerRef.current;
      const content = previewContentRef.current;

      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      const contentWidth = content.scrollWidth;
      const contentHeight = content.scrollHeight;

      if (contentHeight === 0 || contentWidth === 0) return;

      const scaleX = (containerWidth - 32) / contentWidth;
      const scaleY = (containerHeight - 32) / contentHeight;
      const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%

      setScale(newScale);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(calculateScale, 100);
    window.addEventListener("resize", calculateScale);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateScale);
    };
  }, [calculateScale, activeTemplate]);

  // Render the currently active template
  const renderTemplate = () => {
    try {
      const TemplateComponent = getTemplateComponent(activeTemplate);
      
      return (
        <TemplateComponent
          contact={resumeData.contact}
          summary={resumeData.summary}
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
      );
    } catch (error) {
      console.error('Error rendering template:', error);
      return (
        <div className="p-4 text-center text-red-500">
          Error loading template: {activeTemplate}
        </div>
      );
    }
  };

  return (
    <div className="w-1/3">
      <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
        {/* Preview Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Preview</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleColorEditor}
              className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              title="Customize Colors"
            >
              🎨
            </button>
          </div>
        </div>

        {/* Color Editor */}
        {showColorEditor && (
          <div className="p-4 border-b bg-gray-50">
            <h4 className="text-sm font-medium mb-3">Color Themes</h4>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_THEMES.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => onColorChange(theme.colors)}
                  className="w-full h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                  style={{
                    background: `linear-gradient(45deg, ${theme.colors.primary} 50%, ${theme.colors.accent} 50%)`
                  }}
                  title={theme.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Preview Content */}
        <div 
          ref={previewContainerRef}
          className="flex-1 p-4 overflow-hidden"
        >
          <div
            ref={previewContentRef}
            className="origin-top-left transition-transform duration-200"
            style={{
              transform: `scale(${scale})`,
              width: '8.5in',
              minHeight: '11in',
              backgroundColor: 'white'
            }}
          >
            <div key={activeTemplate}>
              {renderTemplate()}
            </div>
          </div>
        </div>

        {/* Template Selector */}
        <div className="p-4 border-t">
          <label className="block text-sm font-medium mb-2">Template</label>
          <select
            value={activeTemplate}
            onChange={(e) => onTemplateChange(e.target.value)}
            className="w-full p-2 border rounded text-sm"
          >
            {templateNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hidden PDF Generation Content */}
      <div style={{ position: 'fixed', left: '100vw', top: 0, zIndex: -1 }}>
        <div id="pdf-generator-content" className="bg-white" style={{ width: '8.5in', height: 'auto' }}>
          <div key={`pdf-${activeTemplate}`}>
            {renderTemplate()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview; 