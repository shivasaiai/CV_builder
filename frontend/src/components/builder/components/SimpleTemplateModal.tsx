import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { AVAILABLE_TEMPLATES } from '../hooks/useTemplateManager';
import { ResumeData, TemplateColors } from '../types';

// Default colors for template grid (not affected by user customization)
const DEFAULT_TEMPLATE_COLORS: TemplateColors = {
  primary: '#1e40af',
  secondary: '#3b82f6',
  accent: '#60a5fa',
  text: '#1f2937',
  background: '#ffffff'
};

interface SimpleTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplate: string;
  onTemplateSelect: (templateName: string) => void;
  resumeData: ResumeData;
  templateColors: TemplateColors;
}

const SimpleTemplateModal: React.FC<SimpleTemplateModalProps> = ({
  isOpen,
  onClose,
  currentTemplate,
  onTemplateSelect,
  resumeData,
  templateColors
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(currentTemplate);

  if (!isOpen) return null;

  const templateNames = Object.keys(AVAILABLE_TEMPLATES);

  const handleTemplateSelect = (templateName: string) => {
    console.log('🎯 SimpleTemplateModal: Template selected:', templateName);
    console.log('🎯 SimpleTemplateModal: Current template:', currentTemplate);
    console.log('🎯 SimpleTemplateModal: Calling onTemplateSelect...');
    
    setSelectedTemplate(templateName);
    
    // Immediately update the template
    onTemplateSelect(templateName);
    
    console.log('🎯 SimpleTemplateModal: onTemplateSelect called');
    
    // Close after a brief delay to show selection
    setTimeout(() => {
      console.log('🎯 SimpleTemplateModal: Closing modal');
      onClose();
    }, 300);
  };

  const getTemplateComponent = (templateName: string) => {
    return AVAILABLE_TEMPLATES[templateName as keyof typeof AVAILABLE_TEMPLATES];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[95vw] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Choose Template</h2>
            <p className="text-gray-600 text-sm mt-1">Pick a design that fits your style</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {templateNames.map((templateName) => {
              const TemplateComponent = getTemplateComponent(templateName);
              const isSelected = currentTemplate === templateName;

              return (
                <div
                  key={templateName}
                  className={`relative group cursor-pointer transition-all duration-300 ${
                    isSelected ? 'ring-3 ring-blue-500 ring-offset-2' : ''
                  }`}
                  onClick={() => handleTemplateSelect(templateName)}
                >
                  {/* Template Preview Container */}
                  <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden aspect-[8.5/11] hover:shadow-xl hover:border-blue-400 transition-all duration-300 group-hover:scale-105">
                    {/* Template Preview - Centered */}
                    <div className="w-full h-full relative flex items-center justify-center">
                      <div className="transform scale-[0.22] origin-center">
                        <div className="w-[8.5in] h-[11in] bg-white">
                          {TemplateComponent && (
                            <TemplateComponent
                              contact={resumeData.contact}
                              summary={resumeData.contact.summary || 'Experienced professional with a proven track record...'}
                              skills={resumeData.skills}
                              experience={resumeData.workExperiences[0] || {
                                jobTitle: 'Senior Developer',
                                company: 'Tech Company',
                                location: 'New York, NY',
                                startDate: '2022-01',
                                endDate: 'Present',
                                responsibilities: ['Led development projects', 'Managed team of developers']
                              }}
                              education={resumeData.education}
                              colors={DEFAULT_TEMPLATE_COLORS}
                              primaryColor={DEFAULT_TEMPLATE_COLORS.primary}
                              projects={resumeData.projects}
                              certifications={resumeData.certifications}
                              languages={resumeData.languages}
                              volunteerExperience={resumeData.volunteerExperiences}
                              publications={resumeData.publications}
                              awards={resumeData.awards}
                              references={resumeData.references}
                              activeSections={resumeData.activeSections}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1.5 shadow-lg">
                        <Check className="w-4 h-4" />
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/80 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-xl">
                      <div className="bg-white px-3 py-2 rounded-lg shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <span className="text-sm font-semibold text-gray-900">Select Template</span>
                      </div>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="mt-2 text-center">
                    <h3 className="font-semibold text-gray-900 text-xs truncate">{templateName}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Professional</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t bg-gray-50 flex justify-between items-center rounded-b-lg">
          <div className="text-sm text-gray-600 font-medium">
            {templateNames.length} Professional Templates
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleTemplateModal;