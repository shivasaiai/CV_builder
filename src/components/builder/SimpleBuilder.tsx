import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTemplateGrid, setShowTemplateGrid] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const userType = searchParams.get('userType') || 'experienced';
  const allowResumeUpload = userType !== 'fresher';
  
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
    const currentIndex = builderState.activeIndex;

    // Always allow navigating backwards or staying on same section
    if (index <= currentIndex) {
      setShowValidationErrors(false);
      setActiveSection(index);
      return;
    }

    // Enforce sequential flow: only allow moving forward by 1 when current section is valid
    const canAdvanceFromCurrent = validateSection(currentIndex);
    if (!canAdvanceFromCurrent || index !== currentIndex + 1) {
      setShowValidationErrors(true);
      return;
    }

    setShowValidationErrors(false);
    setActiveSection(index);
  }, [builderState.activeIndex, setActiveSection, validateSection]);

  const handleNext = useCallback(() => {
    const currentIndex = builderState.activeIndex;
    const canAdvanceFromCurrent = validateSection(currentIndex);

    if (!canAdvanceFromCurrent) {
      setShowValidationErrors(true);
      return;
    }

    setShowValidationErrors(false);
    goToNextSection();
  }, [builderState.activeIndex, goToNextSection, validateSection]);

  const handleBack = useCallback(() => {
    setShowValidationErrors(false);
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
    console.log('🎯 SimpleBuilder: Changing template to:', templateId);
    console.log('🎯 SimpleBuilder: Current builderState.activeTemplate:', builderState.activeTemplate);
    setIsTemplateChanging(true);
    
    // Immediately update the template
    setActiveTemplate(templateId);
    console.log('🎯 SimpleBuilder: setActiveTemplate called');
    
    // Add a small delay for smooth transition effect
    setTimeout(() => {
      setIsTemplateChanging(false);
      console.log('🎯 SimpleBuilder: Template change completed');
    }, 500);
  }, [setActiveTemplate, builderState.activeTemplate]);

  // Debug: Track when activeTemplate changes
  useEffect(() => {
    console.log('🔄 SimpleBuilder: builderState.activeTemplate changed to:', builderState.activeTemplate);
  }, [builderState.activeTemplate]);

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
        <div className="w-70 bg-slate-900 text-white flex-shrink-0 flex flex-col">
          <BuilderSidebar
            activeIndex={builderState.activeIndex}
            resumeCompleteness={resumeCompleteness}
            resumeData={resumeData}
            finalizeCompleted={!!builderState.finalizeCompleted}
            onSectionClick={handleSectionClick}
            onThemeChange={handleThemeChange}
            onUploadClick={allowResumeUpload ? () => setShowUploadModal(true) : undefined}
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
              onUploadClick={allowResumeUpload ? () => setShowUploadModal(true) : undefined}
              validationErrors={showValidationErrors ? getValidationErrors(builderState.activeIndex) : []}
            />
          </div>
        </div>

        {/* Right Preview Area - Smaller */}
        <div className="w-1/4 bg-gray-50 flex-shrink-0">
          <div className="h-full p-4 flex flex-col relative">

            {/* Current Template Debug Info removed */}

            {/* Preview Statistics removed */}
            
            {/* Preview Container */}
            <div className="bg-white rounded-lg shadow-sm flex-1">
              <div className="p-3 border-b bg-gray-50 rounded-t-lg">
                <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-xs text-gray-500">See changes in real-time</p>
                    <p className="text-xs text-gray-400">Current: {builderState.activeTemplate}</p>
                  </div>
                </div>
                
              </div>
              
              <div className="p-3 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">Customize</div>
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
                    
                    {/* Debug: Direct Template Test */}
                    <button 
                      onClick={() => {
                        console.log('🧪 Direct test: Switching to Creative Flare');
                        handleTemplateChange('Creative Flare');
                      }}
                      className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                      title="Test direct template change"
                    >
                      🧪
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