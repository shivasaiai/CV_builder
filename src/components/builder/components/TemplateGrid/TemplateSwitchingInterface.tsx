import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  ArrowRight, 
  Undo2,
  Settings
} from 'lucide-react';
import { useTemplateSwitching } from '../../hooks/useTemplateSwitching';
import { ResumeData, TemplateColors } from '../../types';
import { TemplateSwitchOptions } from '../../services/TemplateSwitchingService';

interface TemplateSwitchingInterfaceProps {
  currentTemplate: string;
  targetTemplate: string;
  resumeData: ResumeData;
  templateColors: TemplateColors;
  onTemplateChange: (template: string) => void;
  onDataChange: (data: ResumeData) => void;
  onCancel: () => void;
  onComplete: () => void;
  className?: string;
  showAdvancedOptions?: boolean;
}

export const TemplateSwitchingInterface: React.FC<TemplateSwitchingInterfaceProps> = ({
  currentTemplate,
  targetTemplate,
  resumeData,
  templateColors,
  onTemplateChange,
  onDataChange,
  onCancel,
  onComplete,
  className,
  showAdvancedOptions = false
}) => {
  const [switchOptions, setSwitchOptions] = useState<Partial<TemplateSwitchOptions>>({
    preserveColors: true,
    preserveCustomSections: true,
    validateCompatibility: true,
    showWarnings: true
  });
  
  const [validationResult, setValidationResult] = useState<{
    canSwitch: boolean;
    warnings: string[];
    recommendations: string[];
  } | null>(null);

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const { state, actions } = useTemplateSwitching({
    initialTemplate: currentTemplate,
    resumeData,
    templateColors,
    onTemplateChange,
    onDataChange,
    onError: (error) => {
      console.error('Template switching error:', error);
    },
    onSuccess: (result) => {
      setProgress(100);
      setCurrentStep('Switch completed successfully');
      setTimeout(() => {
        onComplete();
      }, 1500);
    },
    defaultSwitchOptions: switchOptions
  });

  // Validate switch on mount and when options change
  useEffect(() => {
    const validateSwitch = async () => {
      const result = await actions.validateSwitch(targetTemplate);
      setValidationResult(result);
    };
    
    validateSwitch();
  }, [targetTemplate, actions]);

  // Update progress during switch
  useEffect(() => {
    if (state.switchInProgress) {
      const steps = [
        'Validating compatibility...',
        'Preparing data migration...',
        'Switching template...',
        'Preserving customizations...',
        'Finalizing changes...'
      ];
      
      let stepIndex = 0;
      const interval = setInterval(() => {
        if (stepIndex < steps.length) {
          setCurrentStep(steps[stepIndex]);
          setProgress((stepIndex + 1) * 20);
          stepIndex++;
        } else {
          clearInterval(interval);
        }
      }, 300);

      return () => clearInterval(interval);
    }
  }, [state.switchInProgress]);

  const handleSwitchTemplate = useCallback(async () => {
    setProgress(0);
    setCurrentStep('Starting template switch...');
    await actions.switchTemplate(targetTemplate, switchOptions);
  }, [actions, targetTemplate, switchOptions]);

  const handleCancel = useCallback(() => {
    actions.cancelSwitch();
    onCancel();
  }, [actions, onCancel]);

  const handleOptionChange = useCallback((option: keyof TemplateSwitchOptions, value: boolean) => {
    setSwitchOptions(prev => ({
      ...prev,
      [option]: value
    }));
  }, []);

  if (state.switchInProgress) {
    return (
      <div className={cn('space-y-6 p-6 bg-white rounded-lg border', className)}>
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <h3 className="text-lg font-semibold">Switching Template</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>{currentTemplate}</span>
              <ArrowRight className="w-4 h-4" />
              <span className="font-medium">{targetTemplate}</span>
            </div>
            
            <Progress value={progress} className="w-full max-w-md mx-auto" />
            
            <p className="text-sm text-muted-foreground">
              {currentStep}
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button variant="outline" onClick={handleCancel} disabled={progress > 80}>
            Cancel Switch
          </Button>
        </div>
      </div>
    );
  }

  if (state.lastSwitchResult && !state.lastSwitchResult.success) {
    return (
      <div className={cn('space-y-4 p-6 bg-white rounded-lg border', className)}>
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Switch Failed</h3>
        </div>

        <Alert className="border-red-200 bg-red-50">
          <AlertDescription>
            {state.lastSwitchResult.errors[0] || 'An unknown error occurred during template switching'}
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button onClick={() => actions.clearSwitchResult()}>
            Try Again
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6 p-6 bg-white rounded-lg border', className)}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Switch Template</h3>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{currentTemplate}</Badge>
          <ArrowRight className="w-4 h-4" />
          <Badge variant="default">{targetTemplate}</Badge>
        </div>
      </div>

      {/* Validation Results */}
      {validationResult && (
        <div className="space-y-3">
          {validationResult.warnings.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium text-yellow-800">Compatibility Warnings:</p>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-0.5">•</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {validationResult.recommendations.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium text-blue-800">Recommendations:</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {validationResult.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Advanced Options */}
      {showAdvancedOptions && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Settings className="w-4 h-4" />
            Switch Options
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={switchOptions.preserveColors}
                onChange={(e) => handleOptionChange('preserveColors', e.target.checked)}
                className="rounded border-gray-300"
              />
              Preserve Colors
            </label>
            
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={switchOptions.preserveCustomSections}
                onChange={(e) => handleOptionChange('preserveCustomSections', e.target.checked)}
                className="rounded border-gray-300"
              />
              Keep Custom Sections
            </label>
            
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={switchOptions.validateCompatibility}
                onChange={(e) => handleOptionChange('validateCompatibility', e.target.checked)}
                className="rounded border-gray-300"
              />
              Validate Compatibility
            </label>
            
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={switchOptions.showWarnings}
                onChange={(e) => handleOptionChange('showWarnings', e.target.checked)}
                className="rounded border-gray-300"
              />
              Show Warnings
            </label>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Button
          onClick={handleSwitchTemplate}
          disabled={!validationResult?.canSwitch || state.isLoading}
          className="gap-2"
        >
          {state.isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Switch Template
        </Button>
        
        <Button variant="outline" onClick={handleCancel}>
          <Undo2 className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      {/* Data Preservation Info */}
      <div className="text-center text-xs text-muted-foreground">
        Your resume data will be preserved during the template switch
      </div>
    </div>
  );
};

export default TemplateSwitchingInterface;