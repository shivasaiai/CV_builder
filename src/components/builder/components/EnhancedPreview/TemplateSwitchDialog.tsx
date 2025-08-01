import React from 'react';
import { ResumeData } from '../../types';
import { TemplateCompatibilityService } from '../../services/TemplateCompatibilityService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  ArrowRight,
  X
} from 'lucide-react';

interface TemplateSwitchDialogProps {
  fromTemplate: string;
  toTemplate: string;
  resumeData: ResumeData;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

const TemplateSwitchDialog: React.FC<TemplateSwitchDialogProps> = ({
  fromTemplate,
  toTemplate,
  resumeData,
  onConfirm,
  onCancel,
  isOpen
}) => {
  if (!isOpen) return null;

  const switchValidation = TemplateCompatibilityService.validateTemplateSwitch(
    fromTemplate,
    toTemplate,
    resumeData
  );

  const fromCompatibility = TemplateCompatibilityService.checkCompatibility(fromTemplate, resumeData);
  const toCompatibility = TemplateCompatibilityService.checkCompatibility(toTemplate, resumeData);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Confirm Template Change</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{fromTemplate}</span>
              <ArrowRight className="h-4 w-4" />
              <span className="font-medium">{toTemplate}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Compatibility Comparison */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Current Template</h3>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(fromCompatibility.score)}`}>
                {fromCompatibility.score}%
              </div>
              <div className="text-sm text-gray-600">Compatibility</div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">New Template</h3>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(toCompatibility.score)}`}>
                {toCompatibility.score}%
              </div>
              <div className="text-sm text-gray-600">Compatibility</div>
              {toCompatibility.score > fromCompatibility.score && (
                <Badge className="mt-1 bg-green-100 text-green-800">
                  +{toCompatibility.score - fromCompatibility.score}% Better
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Data Loss Warnings */}
        {switchValidation.dataLoss.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-800">Potential Data Loss</h3>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {switchValidation.dataLoss.map((loss, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                  {loss}
                </li>
              ))}
            </ul>
            <p className="text-xs text-red-600 mt-2">
              Your data will not be deleted, but may not be displayed in the new template.
            </p>
          </div>
        )}

        {/* Improvements */}
        {switchValidation.improvements.length > 0 && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Improvements</h3>
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              {switchValidation.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* General Warnings */}
        {switchValidation.warnings.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">Changes to Expect</h3>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              {switchValidation.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Feature Comparison */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Feature Comparison</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Template Features</h4>
              <div className="flex flex-wrap gap-1">
                {fromCompatibility.supportedFeatures.map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">New Template Features</h4>
              <div className="flex flex-wrap gap-1">
                {toCompatibility.supportedFeatures.map((feature) => {
                  const isNew = !fromCompatibility.supportedFeatures.includes(feature);
                  return (
                    <Badge 
                      key={feature} 
                      variant="outline" 
                      className={`text-xs ${isNew ? 'bg-green-50 border-green-300 text-green-700' : ''}`}
                    >
                      {feature}
                      {isNew && <span className="ml-1">✨</span>}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            className={
              switchValidation.dataLoss.length > 0 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }
          >
            {switchValidation.dataLoss.length > 0 ? 'Switch Anyway' : 'Switch Template'}
          </Button>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-500 mt-3 text-center">
          You can always switch back to your previous template without losing any data.
        </p>
      </div>
    </div>
  );
};

export default TemplateSwitchDialog;