import React, { useState } from 'react';
import { ResumeData, TemplateColors } from '../../types';
import { useTemplateManager } from '../../hooks/useTemplateManager';
import { Eye, Palette, ZoomIn, ZoomOut, Download, Grid3X3, Maximize2, RefreshCw } from 'lucide-react';

interface SimpleResumePreviewProps {
  resumeData: ResumeData;
  activeTemplate: string;
  templateColors: TemplateColors;
  showColorEditor: boolean;
  onTemplateChange: (template: string) => void;
  onColorChange: (colors: TemplateColors) => void;
  onToggleColorEditor: () => void;
  className?: string;
  fixedHeight?: number;
  templateFeatures?: any;
  errors?: any[];
  onError?: (error: any) => void;
}

const COLOR_THEMES = [
  { name: 'Ocean Blue', colors: { primary: '#0EA5E9', accent: '#0284C7' } },
  { name: 'Forest Green', colors: { primary: '#10B981', accent: '#059669' } },
  { name: 'Royal Purple', colors: { primary: '#8B5CF6', accent: '#7C3AED' } },
  { name: 'Sunset Orange', colors: { primary: '#F97316', accent: '#EA580C' } },
  { name: 'Rose Pink', colors: { primary: '#EC4899', accent: '#DB2777' } },
  { name: 'Slate Gray', colors: { primary: '#64748B', accent: '#475569' } },
  { name: 'Emerald', colors: { primary: '#10B981', accent: '#047857' } },
  { name: 'Indigo', colors: { primary: '#6366F1', accent: '#4F46E5' } },
];

const SimpleResumePreview: React.FC<SimpleResumePreviewProps> = ({
  resumeData,
  activeTemplate,
  templateColors,
  showColorEditor,
  onTemplateChange,
  onColorChange,
  onToggleColorEditor,
  className = '',
  fixedHeight = 800,
  templateFeatures,
  errors = [],
  onError
}) => {
  const [zoom, setZoom] = useState(0.75);
  const [showTemplateGrid, setShowTemplateGrid] = useState(false);
  
  const { templateNames, getTemplateComponent } = useTemplateManager(
    activeTemplate,
    onTemplateChange
  );

  const TemplateComponent = getTemplateComponent(activeTemplate);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.3));
  const handleResetZoom = () => setZoom(0.75);

  return (
    <div className={`flex flex-col h-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Enhanced Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Live Preview</h3>
                <p className="text-sm text-gray-600">See your resume in real-time</p>
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleZoomOut}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm font-mono text-gray-600 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200"
                title="Reset Zoom"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              <button
                onClick={() => setShowTemplateGrid(!showTemplateGrid)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  showTemplateGrid 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
                title="Template Gallery"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={onToggleColorEditor}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  showColorEditor 
                    ? 'bg-purple-100 text-purple-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
                title="Color Themes"
              >
                <Palette className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Template Selector */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Active Template
              </label>
              <div className="relative">
                <select
                  value={activeTemplate}
                  onChange={(e) => onTemplateChange(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                >
                  {templateNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Template Grid */}
        {showTemplateGrid && (
          <div className="border-t border-gray-200 p-6 bg-white">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Choose Template</h4>
            <div className="grid grid-cols-3 gap-4">
              {templateNames.slice(0, 6).map((template) => (
                <button
                  key={template}
                  onClick={() => {
                    onTemplateChange(template);
                    setShowTemplateGrid(false);
                  }}
                  className={`relative group p-3 rounded-xl border-2 transition-all duration-200 ${
                    template === activeTemplate
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="aspect-[8.5/11] bg-white rounded-lg shadow-sm mb-2 flex items-center justify-center">
                    <div className="text-gray-400 text-center">
                      <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-1"></div>
                      <div className="w-6 h-1 bg-gray-200 rounded mx-auto mb-1"></div>
                      <div className="w-8 h-1 bg-gray-200 rounded mx-auto"></div>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-gray-700 text-center truncate">
                    {template}
                  </p>
                  {template === activeTemplate && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Color Editor */}
        {showColorEditor && (
          <div className="border-t border-gray-200 p-6 bg-white">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Color Themes</h4>
            <div className="grid grid-cols-4 gap-3">
              {COLOR_THEMES.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => onColorChange(theme.colors)}
                  className={`group relative h-12 rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                    templateColors.primary === theme.colors.primary
                      ? 'border-gray-800 scale-105 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:scale-102'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`
                  }}
                  title={theme.name}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200"></div>
                  {templateColors.primary === theme.colors.primary && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Preview Content */}
      <div className="flex-1 min-h-0 bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="h-full flex items-center justify-center">
          <div 
            className="bg-white shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300"
            style={{ 
              width: `${8.5 * 96 * zoom}px`,
              height: `${11 * 96 * zoom}px`,
              transform: 'translateZ(0)', // Hardware acceleration
              borderRadius: '12px'
            }}
          >
            <div 
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                width: '8.5in',
                height: '11in'
              }}
            >
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
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Error Display */}
      {errors.length > 0 && (
        <div className="flex-shrink-0 p-4 bg-red-50 border-t border-red-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-red-700 font-medium">
              {errors.length} issue{errors.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleResumePreview;