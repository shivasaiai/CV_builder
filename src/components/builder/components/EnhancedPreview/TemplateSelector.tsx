import React, { useState, useCallback, useMemo } from 'react';
import { ResumeData } from '../../types';
import { TemplateCompatibilityService } from '../../services/TemplateCompatibilityService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  AlertTriangle, 
  Info, 
  Star, 
  Palette,
  Layout,
  Users,
  Briefcase
} from 'lucide-react';

interface TemplateSelectorProps {
  availableTemplates: string[];
  activeTemplate: string;
  resumeData: ResumeData;
  onTemplateChange: (template: string) => void;
  onClose?: () => void;
  showCompatibility?: boolean;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  availableTemplates,
  activeTemplate,
  resumeData,
  onTemplateChange,
  onClose,
  showCompatibility = true
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(activeTemplate);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Calculate compatibility for all templates
  const templateCompatibility = useMemo(() => {
    return availableTemplates.reduce((acc, template) => {
      acc[template] = TemplateCompatibilityService.checkCompatibility(template, resumeData);
      return acc;
    }, {} as Record<string, any>);
  }, [availableTemplates, resumeData]);

  // Get template recommendations
  const recommendations = useMemo(() => {
    return TemplateCompatibilityService.getBestTemplateRecommendations(resumeData, availableTemplates);
  }, [resumeData, availableTemplates]);

  const handleTemplateSelect = useCallback((template: string) => {
    setSelectedTemplate(template);
  }, []);

  const handleApplyTemplate = useCallback(() => {
    if (selectedTemplate !== activeTemplate) {
      onTemplateChange(selectedTemplate);
    }
    if (onClose) {
      onClose();
    }
  }, [selectedTemplate, activeTemplate, onTemplateChange, onClose]);

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getCompatibilityIcon = (score: number) => {
    if (score >= 80) return <Check className="h-4 w-4" />;
    if (score >= 60) return <AlertTriangle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getProfessionalLevelIcon = (level: string) => {
    switch (level) {
      case 'entry': return <Users className="h-4 w-4" />;
      case 'mid': return <Briefcase className="h-4 w-4" />;
      case 'senior': return <Star className="h-4 w-4" />;
      case 'executive': return <Star className="h-4 w-4 text-yellow-500" />;
      default: return <Briefcase className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Choose Template</h2>
        <p className="text-gray-600">
          Select a template that best showcases your experience and skills.
        </p>
      </div>

      {/* Top Recommendations */}
      {showCompatibility && recommendations.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Star className="h-4 w-4" />
            Recommended for You
          </h3>
          <div className="flex flex-wrap gap-2">
            {recommendations.slice(0, 3).map(({ templateName, compatibility }) => (
              <Badge
                key={templateName}
                variant="secondary"
                className="cursor-pointer hover:bg-blue-100"
                onClick={() => handleTemplateSelect(templateName)}
              >
                {templateName} ({compatibility.score}% match)
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {availableTemplates.map((template) => {
          const compatibility = templateCompatibility[template];
          const features = TemplateCompatibilityService.getTemplateFeatures(template);
          const isSelected = selectedTemplate === template;
          const isActive = activeTemplate === template;

          return (
            <div
              key={template}
              className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              {/* Template Preview Thumbnail */}
              <div className="aspect-[8.5/11] bg-gray-100 rounded mb-3 flex items-center justify-center relative overflow-hidden">
                <div className="text-gray-400 text-center">
                  <Layout className="h-8 w-8 mx-auto mb-2" />
                  <span className="text-xs">Preview</span>
                </div>
                
                {/* Active Template Indicator */}
                {isActive && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Current
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">{template}</h3>
                
                {/* Professional Level */}
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  {getProfessionalLevelIcon(features.professionalLevel)}
                  <span className="capitalize">{features.professionalLevel} Level</span>
                </div>

                {/* Layout Type */}
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Palette className="h-3 w-3" />
                  <span className="capitalize">{features.layoutType.replace('-', ' ')}</span>
                </div>

                {/* Compatibility Score */}
                {showCompatibility && (
                  <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${getCompatibilityColor(compatibility.score)}`}>
                    {getCompatibilityIcon(compatibility.score)}
                    <span>{compatibility.score}% Compatible</span>
                  </div>
                )}

                {/* Supported Features */}
                <div className="flex flex-wrap gap-1">
                  {compatibility.supportedFeatures.slice(0, 3).map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs px-1 py-0">
                      {feature}
                    </Badge>
                  ))}
                  {compatibility.supportedFeatures.length > 3 && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      +{compatibility.supportedFeatures.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Warnings */}
                {compatibility.warnings.length > 0 && (
                  <div className="text-xs text-amber-600 flex items-start gap-1">
                    <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{compatibility.warnings[0]}</span>
                  </div>
                )}
              </div>

              {/* Details Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 left-2 h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(showDetails === template ? null : template);
                }}
              >
                <Info className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Template Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{showDetails}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(null)}
              >
                ×
              </Button>
            </div>

            {(() => {
              const compatibility = templateCompatibility[showDetails];
              const features = TemplateCompatibilityService.getTemplateFeatures(showDetails);

              return (
                <div className="space-y-4">
                  {/* Compatibility Score */}
                  <div className={`p-3 rounded border ${getCompatibilityColor(compatibility.score)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {getCompatibilityIcon(compatibility.score)}
                      <span className="font-medium">{compatibility.score}% Compatible</span>
                    </div>
                    <p className="text-sm">
                      {compatibility.isCompatible 
                        ? 'This template works well with your resume content.'
                        : 'This template may not display all your content optimally.'
                      }
                    </p>
                  </div>

                  {/* Supported Features */}
                  {compatibility.supportedFeatures.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">Supported Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {compatibility.supportedFeatures.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Features */}
                  {compatibility.missingFeatures.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">Not Supported</h4>
                      <div className="flex flex-wrap gap-1">
                        {compatibility.missingFeatures.map((feature) => (
                          <Badge key={feature} variant="destructive" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {compatibility.warnings.length > 0 && (
                    <div>
                      <h4 className="font-medium text-amber-700 mb-2">Warnings</h4>
                      <ul className="text-sm space-y-1">
                        {compatibility.warnings.map((warning, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 mt-0.5 text-amber-600 flex-shrink-0" />
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {compatibility.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">Recommendations</h4>
                      <ul className="text-sm space-y-1">
                        {compatibility.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Info className="h-3 w-3 mt-0.5 text-blue-600 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Template Features */}
                  <div>
                    <h4 className="font-medium mb-2">Template Details</h4>
                    <div className="text-sm space-y-1">
                      <div>Layout: <span className="capitalize">{features.layoutType.replace('-', ' ')}</span></div>
                      <div>Professional Level: <span className="capitalize">{features.professionalLevel}</span></div>
                      <div>Color Scheme: <span className="capitalize">{features.colorScheme.replace('-', ' ')}</span></div>
                      <div>Max Experiences: {features.maxExperienceEntries}</div>
                      <div>Max Skills: {features.maxSkillsCount}</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-gray-600">
          {selectedTemplate !== activeTemplate && (
            <span>Switching from "{activeTemplate}" to "{selectedTemplate}"</span>
          )}
        </div>
        
        <div className="flex gap-2">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleApplyTemplate}
            disabled={selectedTemplate === activeTemplate}
          >
            {selectedTemplate === activeTemplate ? 'Current Template' : 'Apply Template'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;