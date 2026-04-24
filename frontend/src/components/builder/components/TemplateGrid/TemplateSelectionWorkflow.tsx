import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ResponsiveTemplateGrid } from './ResponsiveTemplateGrid';
import { TemplatePreviewComparison } from './TemplatePreviewComparison';
import { TemplateSwitchingInterface } from './TemplateSwitchingInterface';
import { ResumeData, TemplateColors } from '../../types';

type WorkflowStep = 'selection' | 'comparison' | 'switching' | 'complete';

interface TemplateSelectionWorkflowProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplate: string;
  resumeData: ResumeData;
  templateColors: TemplateColors;
  onTemplateChange: (template: string) => void;
  onDataChange: (data: ResumeData) => void;
  className?: string;
}

export const TemplateSelectionWorkflow: React.FC<TemplateSelectionWorkflowProps> = ({
  isOpen,
  onClose,
  currentTemplate,
  resumeData,
  templateColors,
  onTemplateChange,
  onDataChange,
  className
}) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('selection');
  const [selectedTemplate, setSelectedTemplate] = useState<string>(currentTemplate);
  const [showComparison, setShowComparison] = useState(false);

  const handleTemplateSelect = useCallback((templateName: string) => {
    setSelectedTemplate(templateName);
    
    // If selecting the same template, just close
    if (templateName === currentTemplate) {
      onClose();
      return;
    }
    
    // Show comparison if different template selected
    setShowComparison(true);
    setCurrentStep('comparison');
  }, [currentTemplate, onClose]);

  const handleComparisonConfirm = useCallback(() => {
    setCurrentStep('switching');
    setShowComparison(false);
  }, []);

  const handleComparisonCancel = useCallback(() => {
    setCurrentStep('selection');
    setShowComparison(false);
    setSelectedTemplate(currentTemplate);
  }, [currentTemplate]);

  const handleSwitchingComplete = useCallback(() => {
    setCurrentStep('complete');
    // Auto-close after a brief delay
    setTimeout(() => {
      onClose();
      setCurrentStep('selection');
      setShowComparison(false);
    }, 1000);
  }, [onClose]);

  const handleSwitchingCancel = useCallback(() => {
    setCurrentStep('selection');
    setSelectedTemplate(currentTemplate);
  }, [currentTemplate]);

  const handleClose = useCallback(() => {
    onClose();
    setCurrentStep('selection');
    setShowComparison(false);
    setSelectedTemplate(currentTemplate);
  }, [onClose, currentTemplate]);

  const getDialogTitle = () => {
    switch (currentStep) {
      case 'selection':
        return 'Choose Template';
      case 'comparison':
        return 'Compare Templates';
      case 'switching':
        return 'Switching Template';
      case 'complete':
        return 'Template Updated';
      default:
        return 'Template Selection';
    }
  };

  const getDialogSize = () => {
    switch (currentStep) {
      case 'selection':
        return 'max-w-7xl';
      case 'comparison':
        return 'max-w-6xl';
      case 'switching':
        return 'max-w-2xl';
      case 'complete':
        return 'max-w-md';
      default:
        return 'max-w-4xl';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className={cn(
          getDialogSize(),
          'max-h-[90vh] overflow-hidden flex flex-col',
          className
        )}
      >
        {/* Header */}
        <div className="flex-shrink-0 pb-4 border-b">
          <h2 className="text-2xl font-bold text-center">
            {getDialogTitle()}
          </h2>
          
          {/* Progress Indicator */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2">
              {(['selection', 'comparison', 'switching', 'complete'] as WorkflowStep[]).map((step, index) => (
                <React.Fragment key={step}>
                  <div className={cn(
                    'w-3 h-3 rounded-full transition-colors duration-300',
                    currentStep === step 
                      ? 'bg-primary' 
                      : index < (['selection', 'comparison', 'switching', 'complete'] as WorkflowStep[]).indexOf(currentStep)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                  )} />
                  {index < 3 && (
                    <div className={cn(
                      'w-8 h-0.5 transition-colors duration-300',
                      index < (['selection', 'comparison', 'switching', 'complete'] as WorkflowStep[]).indexOf(currentStep)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    )} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {currentStep === 'selection' && (
            <ResponsiveTemplateGrid
              selectedTemplate={selectedTemplate}
              onTemplateSelect={handleTemplateSelect}
              resumeData={resumeData}
              showHeader={false}
              showStats={true}
              enablePersistence={true}
            />
          )}

          {currentStep === 'comparison' && (
            <TemplatePreviewComparison
              currentTemplate={currentTemplate}
              targetTemplate={selectedTemplate}
              resumeData={resumeData}
              templateColors={templateColors}
              onConfirm={handleComparisonConfirm}
              onCancel={handleComparisonCancel}
              showFullPreview={true}
            />
          )}

          {currentStep === 'switching' && (
            <TemplateSwitchingInterface
              currentTemplate={currentTemplate}
              targetTemplate={selectedTemplate}
              resumeData={resumeData}
              templateColors={templateColors}
              onTemplateChange={onTemplateChange}
              onDataChange={onDataChange}
              onCancel={handleSwitchingCancel}
              onComplete={handleSwitchingComplete}
              showAdvancedOptions={true}
            />
          )}

          {currentStep === 'complete' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Template Updated Successfully!
              </h3>
              <p className="text-gray-600">
                Your resume is now using the <strong>{selectedTemplate}</strong> template.
              </p>
            </div>
          )}
        </div>

        {/* Footer - only show for selection step */}
        {currentStep === 'selection' && (
          <div className="flex-shrink-0 border-t pt-4 text-center text-sm text-muted-foreground">
            Select a template to preview the changes or continue with your current template
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelectionWorkflow;