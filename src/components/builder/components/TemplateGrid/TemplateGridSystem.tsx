import React from 'react';
import { cn } from '@/lib/utils';
import { AVAILABLE_TEMPLATES } from '../../hooks/useTemplateManager';
import { ResumeData } from '../../types';

interface TemplateGridSystemProps {
  selectedTemplate?: string;
  onTemplateSelect: (templateName: string) => void;
  filteredTemplates: Array<{
    id: string;
    name: string;
    category: string;
    isPremium?: boolean;
  }>;
  resumeData?: ResumeData;
  className?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  gridColumns?: number;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export const TemplateGridSystem: React.FC<TemplateGridSystemProps> = ({
  selectedTemplate,
  onTemplateSelect,
  filteredTemplates,
  resumeData,
  className,
  showSearch = true,
  showFilters = true,
  gridColumns = 3,
  viewMode = 'grid',
  onViewModeChange
}) => {
  const getGridCols = () => {
    switch (gridColumns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      default: return 'grid-cols-3';
    }
  };

  const getTemplateComponent = (templateName: string) => {
    return AVAILABLE_TEMPLATES[templateName as keyof typeof AVAILABLE_TEMPLATES];
  };

  if (viewMode === 'list') {
    return (
      <div className={cn('space-y-4', className)}>
        {filteredTemplates.map((template) => {
          const TemplateComponent = getTemplateComponent(template.name);
          const isSelected = selectedTemplate === template.name;

          return (
            <div
              key={template.id}
              className={cn(
                'flex items-center p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md',
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              )}
              onClick={() => onTemplateSelect(template.name)}
            >
              {/* Thumbnail */}
              <div className="w-16 h-20 flex-shrink-0 bg-white border rounded overflow-hidden mr-4">
                {TemplateComponent && resumeData && (
                  <div className="transform scale-[0.08] origin-top-left w-[200px] h-[250px]">
                    <TemplateComponent
                      contact={resumeData.contact}
                      summary={resumeData.contact.summary || 'Professional summary...'}
                      skills={resumeData.skills}
                      experience={resumeData.workExperiences[0] || {}}
                      education={resumeData.education}
                      primaryColor="#334D6E"
                    />
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-500">{template.category}</p>
                {template.isPremium && (
                  <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                    Premium
                  </span>
                )}
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-6', getGridCols(), className)}>
      {filteredTemplates.map((template) => {
        const TemplateComponent = getTemplateComponent(template.name);
        const isSelected = selectedTemplate === template.name;

        return (
          <div
            key={template.id}
            className={cn(
              'group relative cursor-pointer transition-all duration-200',
              isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
            )}
            onClick={() => onTemplateSelect(template.name)}
          >
            {/* Template Preview */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 overflow-hidden aspect-[8.5/11] hover:shadow-lg transition-shadow">
              {TemplateComponent && resumeData ? (
                <div className="transform scale-[0.15] origin-top-left w-[567px] h-[735px] bg-white">
                  <TemplateComponent
                    contact={resumeData.contact}
                    summary={resumeData.contact.summary || 'Professional with extensive experience in various fields...'}
                    skills={resumeData.skills}
                    experience={resumeData.workExperiences[0] || {
                      jobTitle: 'Senior Professional',
                      company: 'Company Name',
                      location: 'Location',
                      startDate: '2022-01',
                      endDate: 'Present',
                      responsibilities: ['Led development projects', 'Managed team']
                    }}
                    education={resumeData.education}
                    primaryColor="#334D6E"
                    colors={{ primary: '#334D6E', secondary: '#6B7280', accent: '#3B82F6' }}
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
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-500">Preview</span>
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="mt-3 text-center">
              <h3 className="font-medium text-gray-900 text-sm">{template.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{template.category}</p>
              {template.isPremium && (
                <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                  Premium
                </span>
              )}
            </div>

            {/* Selected Indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-5 rounded-lg transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
                <span className="text-sm font-medium text-gray-900">Click to select</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TemplateGridSystem;