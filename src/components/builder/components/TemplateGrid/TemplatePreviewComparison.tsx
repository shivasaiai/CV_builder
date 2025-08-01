import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import { AVAILABLE_TEMPLATES } from '../../hooks/useTemplateManager';
import { ResumeData, TemplateColors } from '../../types';

interface TemplatePreviewComparisonProps {
  currentTemplate: string;
  targetTemplate: string;
  resumeData: ResumeData;
  templateColors: TemplateColors;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
  showFullPreview?: boolean;
}

export const TemplatePreviewComparison: React.FC<TemplatePreviewComparisonProps> = ({
  currentTemplate,
  targetTemplate,
  resumeData,
  templateColors,
  onConfirm,
  onCancel,
  className,
  showFullPreview = false
}) => {
  const [previewMode, setPreviewMode] = useState<'side-by-side' | 'overlay' | 'current' | 'target'>('side-by-side');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCurrentPreview, setShowCurrentPreview] = useState(true);
  const [showTargetPreview, setShowTargetPreview] = useState(true);

  const CurrentTemplateComponent = AVAILABLE_TEMPLATES[currentTemplate as keyof typeof AVAILABLE_TEMPLATES];
  const TargetTemplateComponent = AVAILABLE_TEMPLATES[targetTemplate as keyof typeof AVAILABLE_TEMPLATES];

  const handlePreviewModeChange = useCallback((mode: typeof previewMode) => {
    setPreviewMode(mode);
    
    // Auto-adjust visibility based on mode
    if (mode === 'current') {
      setShowCurrentPreview(true);
      setShowTargetPreview(false);
    } else if (mode === 'target') {
      setShowCurrentPreview(false);
      setShowTargetPreview(true);
    } else {
      setShowCurrentPreview(true);
      setShowTargetPreview(true);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const previewScale = showFullPreview ? 0.6 : 0.32;
  const previewHeight = showFullPreview ? '600px' : '400px';
  const previewWidth = showFullPreview ? '420px' : '280px';

  const renderPreview = (
    TemplateComponent: React.ComponentType<any>,
    templateName: string,
    isTarget: boolean = false
  ) => (
    <div className="relative group">
      {/* Template Label */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm">
            {templateName}
          </h4>
          <Badge variant={isTarget ? 'default' : 'outline'} className="text-xs">
            {isTarget ? 'New' : 'Current'}
          </Badge>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => isTarget ? setShowTargetPreview(!showTargetPreview) : setShowCurrentPreview(!showCurrentPreview)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {(isTarget ? showTargetPreview : showCurrentPreview) ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Preview Container */}
      <div
        className={cn(
          'relative overflow-hidden rounded-lg shadow-lg border transition-all duration-300',
          isTarget ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200',
          (isTarget ? showTargetPreview : showCurrentPreview) ? 'opacity-100' : 'opacity-30'
        )}
        style={{ height: previewHeight, width: previewWidth }}
      >
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 transform origin-top w-[8.5in] h-[11in]"
          style={{ transform: `translateX(-50%) scale(${previewScale})` }}
        >
          <TemplateComponent 
            {...resumeData}
            primaryColor={templateColors.primary || '#1e40af'}
          />
        </div>

        {/* Overlay for hidden previews */}
        {!(isTarget ? showTargetPreview : showCurrentPreview) && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <EyeOff className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Preview Hidden</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn(
      'space-y-6 p-6 bg-white rounded-lg border',
      isFullscreen && 'fixed inset-4 z-50 overflow-auto',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h3 className="text-lg font-semibold mb-2">Template Comparison</h3>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>{currentTemplate}</span>
            <ArrowRight className="w-4 h-4" />
            <span className="font-medium">{targetTemplate}</span>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFullscreen}
          className="gap-2"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
          {isFullscreen ? 'Exit' : 'Fullscreen'}
        </Button>
      </div>

      {/* Preview Mode Controls */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button
            variant={previewMode === 'side-by-side' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handlePreviewModeChange('side-by-side')}
            className="text-xs"
          >
            Side by Side
          </Button>
          <Button
            variant={previewMode === 'overlay' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handlePreviewModeChange('overlay')}
            className="text-xs"
          >
            Overlay
          </Button>
          <Button
            variant={previewMode === 'current' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handlePreviewModeChange('current')}
            className="text-xs"
          >
            Current Only
          </Button>
          <Button
            variant={previewMode === 'target' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handlePreviewModeChange('target')}
            className="text-xs"
          >
            New Only
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex justify-center">
        {previewMode === 'side-by-side' && (
          <div className="flex gap-6 items-start">
            {renderPreview(CurrentTemplateComponent, currentTemplate, false)}
            {renderPreview(TargetTemplateComponent, targetTemplate, true)}
          </div>
        )}

        {previewMode === 'overlay' && (
          <div className="relative">
            <div className={cn(
              'transition-opacity duration-300',
              showCurrentPreview ? 'opacity-100' : 'opacity-0'
            )}>
              {renderPreview(CurrentTemplateComponent, currentTemplate, false)}
            </div>
            <div className={cn(
              'absolute top-0 left-0 transition-opacity duration-300',
              showTargetPreview ? 'opacity-100' : 'opacity-0'
            )}>
              {renderPreview(TargetTemplateComponent, targetTemplate, true)}
            </div>
            
            {/* Overlay Controls */}
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                variant={showCurrentPreview ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowCurrentPreview(!showCurrentPreview)}
                className="text-xs"
              >
                Current
              </Button>
              <Button
                variant={showTargetPreview ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowTargetPreview(!showTargetPreview)}
                className="text-xs"
              >
                New
              </Button>
            </div>
          </div>
        )}

        {previewMode === 'current' && (
          renderPreview(CurrentTemplateComponent, currentTemplate, false)
        )}

        {previewMode === 'target' && (
          renderPreview(TargetTemplateComponent, targetTemplate, true)
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center pt-4 border-t">
        <Button onClick={onConfirm} className="gap-2">
          <ArrowRight className="w-4 h-4" />
          Switch to {targetTemplate}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Keep {currentTemplate}
        </Button>
      </div>

      {/* Info */}
      <div className="text-center text-xs text-muted-foreground">
        Your resume data and customizations will be preserved during the switch
      </div>
    </div>
  );
};

export default TemplatePreviewComparison;