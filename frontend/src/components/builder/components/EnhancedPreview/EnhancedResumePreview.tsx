import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ResumeData, TemplateColors } from '../../types';
import { useTemplateManager } from '../../hooks/useTemplateManager';
import { useScaleManager } from '../../hooks/useScaleManager';
import { useRealTimePreview } from '../../hooks/useRealTimePreview';
import PreviewContainer from './PreviewContainer';
import PreviewErrorBoundary from './PreviewErrorBoundary';
import PreviewLoadingState from './PreviewLoadingState';
import TemplateSelector from './TemplateSelector';
import TemplateSwitchDialog from './TemplateSwitchDialog';
import { COLOR_THEMES } from '../../constants';
import { Button } from '@/components/ui/button';
import { Palette, RefreshCw, Zap, Grid3X3, ChevronDown } from 'lucide-react';

interface EnhancedResumePreviewProps {
  resumeData: ResumeData;
  activeTemplate: string;
  templateColors: TemplateColors;
  showColorEditor: boolean;
  onTemplateChange: (template: string) => void;
  onColorChange: (colors: TemplateColors) => void;
  onToggleColorEditor: () => void;
  className?: string;
  fixedHeight?: number;
}

const EnhancedResumePreview: React.FC<EnhancedResumePreviewProps> = ({
  resumeData,
  activeTemplate,
  templateColors,
  showColorEditor,
  onTemplateChange,
  onColorChange,
  onToggleColorEditor,
  className = '',
  fixedHeight = 600
}) => {
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<string | null>(null);
  const previewContentRef = useRef<HTMLDivElement>(null);
  
  const { getTemplateComponent, templateNames, isValidTemplate } = useTemplateManager(
    activeTemplate, 
    onTemplateChange
  );

  const scaleManager = useScaleManager({
    initialScale: 0.8,
    persistScale: true,
    storageKey: `resume-preview-scale-${activeTemplate}`,
    smoothTransitions: true,
    transitionDuration: 300,
    autoFitDelay: 150
  });

  const {
    debouncedResumeData,
    renderKey,
    previewState,
    forceUpdate
  } = useRealTimePreview(resumeData, activeTemplate, {
    debounceDelay: 250,
    enableDiffing: true,
    maxUpdateFrequency: 30,
    enableBatching: true
  });

  // Auto-fit when container or template changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (previewContentRef.current) {
        const container = previewContentRef.current.parentElement;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const contentWidth = 8.5 * 96; // 8.5 inches at 96 DPI
          const contentHeight = 11 * 96; // 11 inches at 96 DPI
          
          // Use autoFit to respect the current fit mode
          scaleManager.autoFit(
            containerRect.width,
            containerRect.height,
            contentWidth,
            contentHeight
          );
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [activeTemplate, scaleManager]);

  // Handle template change with validation
  const handleTemplateChange = useCallback(async (template: string) => {
    if (!isValidTemplate(template)) {
      console.warn(`Invalid template: ${template}`);
      return;
    }

    // If it's the same template, no need to change
    if (template === activeTemplate) {
      return;
    }

    // Check if we should show confirmation dialog
    const hasSignificantContent = (
      (resumeData.workExperiences?.length || 0) > 0 ||
      (resumeData.projects?.length || 0) > 0 ||
      (resumeData.certifications?.length || 0) > 0 ||
      (resumeData.languages?.length || 0) > 0
    );

    if (hasSignificantContent) {
      setPendingTemplate(template);
      setShowSwitchDialog(true);
      return;
    }

    // Direct change for minimal content
    await performTemplateChange(template);
  }, [activeTemplate, resumeData, isValidTemplate]);

  // Perform the actual template change
  const performTemplateChange = useCallback(async (template: string) => {
    setIsTemplateLoading(true);
    
    try {
      // Small delay to show loading state and allow for smooth transition
      await new Promise(resolve => setTimeout(resolve, 150));
      onTemplateChange(template);
      
      // Additional delay to ensure template is fully loaded
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error changing template:', error);
    } finally {
      setIsTemplateLoading(false);
    }
  }, [onTemplateChange]);

  // Handle template switch confirmation
  const handleSwitchConfirm = useCallback(async () => {
    if (pendingTemplate) {
      await performTemplateChange(pendingTemplate);
      setPendingTemplate(null);
      setShowSwitchDialog(false);
      setShowTemplateSelector(false);
    }
  }, [pendingTemplate, performTemplateChange]);

  // Handle template switch cancellation
  const handleSwitchCancel = useCallback(() => {
    setPendingTemplate(null);
    setShowSwitchDialog(false);
  }, []);

  // Render the currently active template
  const renderTemplate = useCallback(() => {
    const TemplateComponent = getTemplateComponent(activeTemplate);
    
    if (!TemplateComponent) {
      throw new Error(`Template component not found: ${activeTemplate}`);
    }
    
    return (
      <TemplateComponent
        contact={debouncedResumeData.contact}
        summary={debouncedResumeData.summary}
        skills={debouncedResumeData.skills}
        experience={debouncedResumeData.workExperiences[0] || {}}
        education={debouncedResumeData.education}
        colors={templateColors}
        primaryColor={templateColors.primary}
        projects={debouncedResumeData.projects}
        certifications={debouncedResumeData.certifications}
        languages={debouncedResumeData.languages}
        volunteerExperience={debouncedResumeData.volunteerExperiences}
        publications={debouncedResumeData.publications}
        awards={debouncedResumeData.awards}
        references={debouncedResumeData.references}
        activeSections={debouncedResumeData.activeSections}
      />
    );
  }, [activeTemplate, debouncedResumeData, templateColors, getTemplateComponent]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Preview Header */}
      <div className="flex-shrink-0 p-4 border-b bg-white rounded-t-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Preview</h3>
            {previewState.isUpdating && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Zap className="h-3 w-3" />
                <span>Updating</span>
              </div>
            )}
            {previewState.pendingUpdates && !previewState.isUpdating && (
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" title="Updates pending" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={forceUpdate}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Force Update"
              disabled={previewState.isUpdating}
            >
              <RefreshCw className={`h-4 w-4 ${previewState.isUpdating ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={onToggleColorEditor}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Customize Colors"
            >
              <Palette className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Template Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 min-w-fit">
            Template:
          </label>
          <div className="flex-1 flex gap-1">
            <select
              value={activeTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              disabled={isTemplateLoading}
              className="flex-1 p-2 border rounded-l text-sm bg-white disabled:opacity-50"
            >
              {templateNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateSelector(true)}
              disabled={isTemplateLoading}
              className="px-2 rounded-l-none border-l-0"
              title="Browse Templates"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Color Editor */}
      {showColorEditor && (
        <div className="flex-shrink-0 p-4 border-b bg-gray-50">
          <h4 className="text-sm font-medium mb-3">Color Themes</h4>
          <div className="grid grid-cols-4 gap-2">
            {COLOR_THEMES.map((theme) => (
              <button
                key={theme.name}
                onClick={() => onColorChange(theme.colors)}
                className="h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
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
      <div className="flex-1 min-h-0">
        <PreviewContainer
          scale={scaleManager.scale}
          targetScale={scaleManager.targetScale}
          isTransitioning={scaleManager.isTransitioning}
          onScaleChange={scaleManager.setScale}
          onFitToWidth={() => {
            if (previewContentRef.current) {
              const container = previewContentRef.current.parentElement;
              if (container) {
                const containerRect = container.getBoundingClientRect();
                const contentWidth = 8.5 * 96;
                scaleManager.fitToWidth(containerRect.width, contentWidth);
              }
            }
          }}
          onFitToHeight={() => {
            if (previewContentRef.current) {
              const container = previewContentRef.current.parentElement;
              if (container) {
                const containerRect = container.getBoundingClientRect();
                const contentHeight = 11 * 96;
                scaleManager.fitToHeight(containerRect.height, contentHeight);
              }
            }
          }}
          onFitToBest={() => {
            if (previewContentRef.current) {
              const container = previewContentRef.current.parentElement;
              if (container) {
                const containerRect = container.getBoundingClientRect();
                const contentWidth = 8.5 * 96;
                const contentHeight = 11 * 96;
                scaleManager.fitToBest(
                  containerRect.width,
                  containerRect.height,
                  contentWidth,
                  contentHeight
                );
              }
            }
          }}
          fixedHeight={fixedHeight}
          enableZoomControls={true}
          transitionDuration={300}
        >
          {isTemplateLoading ? (
            <PreviewLoadingState
              type="template"
              templateName={activeTemplate}
            />
          ) : (
            <PreviewErrorBoundary
              templateName={activeTemplate}
              onError={(error, errorInfo) => {
                console.error('Preview rendering error:', { error, errorInfo, activeTemplate });
              }}
            >
              <div 
                ref={previewContentRef}
                key={`${activeTemplate}-${renderKey}`}
                className={`transition-opacity duration-200 ${
                  previewState.isUpdating ? 'opacity-90' : 'opacity-100'
                }`}
              >
                {renderTemplate()}
              </div>
            </PreviewErrorBoundary>
          )}
        </PreviewContainer>
      </div>

      {/* Hidden PDF Generation Content */}
      <div style={{ position: 'fixed', left: '100vw', top: 0, zIndex: -1 }}>
        <div id="pdf-generator-content" className="bg-white" style={{ width: '8.5in', height: 'auto' }}>
          <div key={`pdf-${activeTemplate}-${renderKey}`}>
            <PreviewErrorBoundary templateName={activeTemplate}>
              {renderTemplate()}
            </PreviewErrorBoundary>
          </div>
        </div>
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <TemplateSelector
              availableTemplates={templateNames}
              activeTemplate={activeTemplate}
              resumeData={resumeData}
              onTemplateChange={handleTemplateChange}
              onClose={() => setShowTemplateSelector(false)}
              showCompatibility={true}
            />
          </div>
        </div>
      )}

      {/* Template Switch Confirmation Dialog */}
      {showSwitchDialog && pendingTemplate && (
        <TemplateSwitchDialog
          fromTemplate={activeTemplate}
          toTemplate={pendingTemplate}
          resumeData={resumeData}
          onConfirm={handleSwitchConfirm}
          onCancel={handleSwitchCancel}
          isOpen={showSwitchDialog}
        />
      )}

      {/* Performance Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 right-2 text-xs bg-black bg-opacity-75 text-white p-2 rounded">
          <div>Updates: {previewState.updateCount}</div>
          <div>Last: {previewState.lastUpdateTime ? new Date(previewState.lastUpdateTime).toLocaleTimeString() : 'Never'}</div>
          <div>Pending: {previewState.pendingUpdates ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

export default EnhancedResumePreview;