import React from 'react';

interface Section {
  id: string;
  name: string;
  status: 'not_started' | 'in_progress' | 'completed';
  required: boolean;
}

interface SimpleProgressFlowProps {
  sections: Section[];
  currentSection: number;
  onSectionClick: (index: number) => void;
  resumeCompleteness: number;
  activeTemplate: string;
  availableTemplates: string[];
  onTemplateChange: (template: string) => void;
  onUploadClick: () => void;
  errors?: any[];
  showGuidance?: boolean;
  onRequestGuidance?: () => void;
}

const SimpleProgressFlow: React.FC<SimpleProgressFlowProps> = ({
  sections,
  currentSection,
  onSectionClick,
  resumeCompleteness,
  activeTemplate,
  availableTemplates,
  onTemplateChange,
  onUploadClick,
  errors = [],
  showGuidance = false,
  onRequestGuidance
}) => {
  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-2">Resume Builder</h2>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${resumeCompleteness}%` }}
          />
        </div>
        <p className="text-sm text-gray-300 mt-2">{resumeCompleteness}% Complete</p>
      </div>

      {/* Upload Button */}
      <button
        onClick={onUploadClick}
        className="w-full mb-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        📄 Upload Resume
      </button>

      {/* Template Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Template
        </label>
        <select
          value={activeTemplate}
          onChange={(e) => onTemplateChange(e.target.value)}
          className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
        >
          {availableTemplates.map((template) => (
            <option key={template} value={template}>
              {template}
            </option>
          ))}
        </select>
      </div>

      {/* Sections */}
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-300 mb-4">SECTIONS</h3>
        <div className="space-y-2">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => onSectionClick(index)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                index === currentSection
                  ? 'bg-blue-600 text-white'
                  : section.status === 'completed'
                  ? 'bg-green-600 text-white'
                  : section.status === 'in_progress'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{section.name}</span>
                <div className="flex items-center space-x-2">
                  {section.status === 'completed' && (
                    <span className="text-green-300">✓</span>
                  )}
                  {section.status === 'in_progress' && (
                    <span className="text-yellow-300">●</span>
                  )}
                  {section.required && (
                    <span className="text-xs text-gray-400">*</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-600 rounded-lg">
          <p className="text-sm text-white font-medium">Issues Found:</p>
          <ul className="text-xs text-red-100 mt-1">
            {errors.slice(0, 3).map((error, index) => (
              <li key={index}>• {error.message || error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SimpleProgressFlow;