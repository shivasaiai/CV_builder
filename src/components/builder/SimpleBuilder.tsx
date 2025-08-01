import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import BuilderSidebar from './BuilderSidebar';
import SectionRenderer from './SectionRenderer';
import ResumeUpload from './ResumeUpload';
import TopPositionedPreview from './components/EnhancedPreview/TopPositionedPreview';
import SimpleTemplateModal from './components/SimpleTemplateModal';
import SimpleColorPicker from './components/SimpleColorPicker';
import { useBuilderState } from './hooks/useBuilderState';
import { useResumeData } from './hooks/useResumeData';
import { useTemplateManager } from './hooks/useTemplateManager';
import { ResumeData } from './types';
import { SECTIONS } from './types';

interface SimpleBuilderProps {
  sessionId?: string;
}

const SimpleBuilder: React.FC<SimpleBuilderProps> = ({ sessionId }) => {
  const { sessionId: urlSessionId } = useParams();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTemplateGrid, setShowTemplateGrid] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Debug template grid state
  React.useEffect(() => {
    console.log('Template grid modal state:', showTemplateGrid);
  }, [showTemplateGrid]);
  const [isTemplateChanging, setIsTemplateChanging] = useState(false);
  
  const effectiveSessionId = sessionId || urlSessionId || 'default';

  // State management
  const {
    builderState,
    updateBuilderState,
    setActiveSection,
    setActiveTemplate,
    setTemplateColors,
    goToNextSection,
    goToPreviousSection,
    toggleColorEditor,
  } = useBuilderState();

  const {
    resumeData,
    resumeCompleteness,
    updateResumeData,
    importResumeData,
    validateSection,
    getValidationErrors,
  } = useResumeData();

  const { templateNames } = useTemplateManager(
    builderState.activeTemplate,
    setActiveTemplate
  );

  // Handle resume upload
  const handleResumeUploaded = useCallback(async (uploadedData: Partial<ResumeData>) => {
    try {
      await importResumeData(uploadedData);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error importing resume data:', error);
    }
  }, [importResumeData]);

  // Navigation handlers
  const handleSectionClick = useCallback((index: number) => {
    setActiveSection(index);
  }, [setActiveSection]);

  const handleNext = useCallback(() => {
    goToNextSection();
  }, [goToNextSection]);

  const handleBack = useCallback(() => {
    goToPreviousSection();
  }, [goToPreviousSection]);

  // Theme change handler
  const handleThemeChange = useCallback((theme: Partial<ResumeData['theme']>) => {
    if (theme.colors) {
      setTemplateColors(theme.colors);
    }
    if (theme.template) {
      setActiveTemplate(theme.template);
    }
  }, [setTemplateColors, setActiveTemplate]);

  // Template change handler with smooth transition
  const handleTemplateChange = useCallback((templateId: string) => {
    console.log('Changing template to:', templateId);
    setIsTemplateChanging(true);
    
    // Immediately update the template
    setActiveTemplate(templateId);
    
    // Add a small delay for smooth transition effect
    setTimeout(() => {
      setIsTemplateChanging(false);
    }, 500);
  }, [setActiveTemplate]);

  const currentSection = SECTIONS[builderState.activeIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <ResumeUpload
              onResumeUploaded={handleResumeUploaded}
              onClose={() => setShowUploadModal(false)}
              isOpen={showUploadModal}
            />
          </div>
        </div>
      )}

      {/* Simple Template Modal */}
      <SimpleTemplateModal
        isOpen={showTemplateGrid}
        onClose={() => setShowTemplateGrid(false)}
        currentTemplate={builderState.activeTemplate}
        resumeData={resumeData}
        templateColors={builderState.templateColors}
        onTemplateSelect={handleTemplateChange}
      />

      <div className="flex min-h-screen">
        {/* Left Sidebar with Form */}
        <div className="w-80 bg-slate-900 text-white flex-shrink-0 flex flex-col">
          <BuilderSidebar
            activeIndex={builderState.activeIndex}
            resumeCompleteness={resumeCompleteness}
            resumeData={resumeData}
            onSectionClick={handleSectionClick}
            onThemeChange={handleThemeChange}
            onUploadClick={() => setShowUploadModal(true)}
          />
        </div>

        {/* Form Content Area - Much Larger */}
        <div className="flex-1 bg-white border-r">
          <div className="h-full p-8 overflow-y-auto">
            <SectionRenderer
              activeSection={currentSection}
              resumeData={resumeData}
              builderState={builderState}
              updateResumeData={updateResumeData}
              updateBuilderState={updateBuilderState}
              onNext={handleNext}
              onBack={handleBack}
              onUploadClick={() => setShowUploadModal(true)}
            />
          </div>
        </div>

        {/* Right Preview Area - Smaller */}
        <div className="w-80 bg-gray-50 flex-shrink-0">
          <div className="h-full p-4 flex flex-col relative">

            {/* Preview Statistics */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800 mb-1">
                  Our Resume Builder delivers results!
                </div>
                <div className="flex items-center justify-end mb-2">
                  <svg className="w-4 h-4 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L10 4.414 4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-lg font-bold text-green-600">30%</span>
                  <span className="text-sm text-gray-600 ml-1">Higher chance of getting a job</span>
                </div>
                <div className="text-xs text-gray-500">
                  The results are based on a study with over 1000 participants, among whom 287 used resume tools provided on our family sites.
                </div>
              </div>
            </div>
            
            {/* Preview Container */}
            <div className="bg-white rounded-lg shadow-sm flex-1">
              <div className="p-3 border-b bg-gray-50 rounded-t-lg">
                <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-xs text-gray-500">See changes in real-time</p>
                    <p className="text-xs text-gray-400">Current: {builderState.activeTemplate}</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {/* Color Picker Button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className={`flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200 text-xs font-medium ${
                          showColorPicker ? 'ring-2 ring-blue-400 border-blue-300 bg-blue-50' : 'text-gray-700'
                        }`}
                        title="Customize Colors"
                      >
                        <span>🎨</span>
                        <span>Colors</span>
                      </button>
                      {showColorPicker && (
                        <div className="absolute top-10 right-0 z-30">
                          <SimpleColorPicker
                            resumeData={resumeData}
                            onThemeChange={handleThemeChange}
                            onClose={() => setShowColorPicker(false)}
                            className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Template Change Button */}
                    <button 
                      onClick={() => {
                        console.log('Change template button clicked');
                        setShowTemplateGrid(true);
                      }}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 text-xs font-medium shadow-sm"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                      <span>Template</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 relative">
                {/* Loading overlay during template change */}
                {isTemplateChanging && (
                  <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded-b-lg">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-sm text-gray-600">Switching template...</p>
                    </div>
                  </div>
                )}
                
                <div className={`transition-opacity duration-300 ${isTemplateChanging ? 'opacity-30' : 'opacity-100'}`}>
                  <TopPositionedPreview
                    resumeData={resumeData}
                    activeTemplate={builderState.activeTemplate}
                    templateColors={builderState.templateColors}
                    onTemplateChange={setActiveTemplate}
                    className="h-full"
                    key={builderState.activeTemplate} // Force re-render on template change
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleBuilder;