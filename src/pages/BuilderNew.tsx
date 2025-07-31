import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { 
  BuilderSidebar, 
  SectionRenderer, 
  ResumePreview,
  useBuilderState,
  useResumeData,
  useTemplateManager,
  SECTIONS 
} from "@/components/builder";
import ResumeUpload from "@/components/builder/ResumeUpload";
import { ResumeData } from "@/components/builder/types";

const BuilderNew = () => {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Custom hooks for state management
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
  } = useResumeData();

  const { templateNames } = useTemplateManager(
    builderState.activeTemplate,
    setActiveTemplate
  );

  const currentSection = SECTIONS[builderState.activeIndex];

  // Handle color from URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const colorParam = urlParams.get('color');
    if (colorParam) {
      const decodedColor = decodeURIComponent(colorParam);
      // Set the primary color and update template colors
      setTemplateColors({
        ...builderState.templateColors,
        primary: decodedColor
      });
    }
  }, []); // Run only on mount

  // Navigation handlers
  const handleSectionClick = (index: number) => {
    setActiveSection(index);
  };

  const handleTemplateChange = (template: string) => {
    setActiveTemplate(template);
  };

  const handleNext = () => {
    goToNextSection();
  };

  const handleBack = () => {
    goToPreviousSection();
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleResumeUploaded = (importedData: Partial<ResumeData>) => {
    console.log('=== BuilderNew.handleResumeUploaded ===');
    console.log('Received importedData:', importedData);
    console.log('Work experiences in imported data:', importedData.workExperiences?.length || 0);
    if (importedData.workExperiences && importedData.workExperiences.length > 0) {
      console.log('First work experience:', importedData.workExperiences[0]);
    }
    
    importResumeData(importedData);
    setShowUploadModal(false);
    // Navigate to first section to review imported data
    setActiveSection(0);
    
    console.log('Called importResumeData and navigated to section 0');
  };

  const handleCloseUpload = () => {
    setShowUploadModal(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7F9]">
      {/* Sidebar */}
      <BuilderSidebar
        activeIndex={builderState.activeIndex}
        resumeCompleteness={resumeCompleteness}
        activeTemplate={builderState.activeTemplate}
        availableTemplates={templateNames}
        onSectionClick={handleSectionClick}
        onTemplateChange={handleTemplateChange}
        onUploadClick={handleUploadClick}
      />

      {/* Main Content */}
      <main className="flex-1 p-12 flex">
        <div className="w-2/3 pr-8">
          <div className="mb-8">
            <button onClick={handleBack} className="text-blue-500">
              &larr; Go Back
            </button>
          </div>

          {currentSection ? (
            <SectionRenderer
              activeSection={currentSection}
              resumeData={resumeData}
              builderState={builderState}
              updateResumeData={updateResumeData}
              updateBuilderState={updateBuilderState}
              onNext={handleNext}
              onBack={handleBack}
              onUploadClick={handleUploadClick}
            />
          ) : (
            <div className="max-w-2xl w-full flex flex-col items-center justify-center h-[80vh]">
              <h1 className="text-4xl font-bold mb-2 text-red-600">Loading Error</h1>
              <p className="text-xl text-gray-500 mb-8">
                Section not found. Please check console for details.
              </p>
              <div className="text-sm text-gray-400">
                <p>Active Index: {builderState.activeIndex}</p>
                <p>Sections Length: {SECTIONS.length}</p>
                <p>Current Section: {currentSection || 'undefined'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview */}
        {builderState.activeTemplate ? (
          <ResumePreview
            resumeData={resumeData}
            activeTemplate={builderState.activeTemplate}
            templateColors={builderState.templateColors}
            showColorEditor={builderState.showColorEditor}
            onTemplateChange={handleTemplateChange}
            onColorChange={setTemplateColors}
            onToggleColorEditor={toggleColorEditor}
          />
        ) : (
          <div className="w-1/3 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Loading Template...</h3>
              <p className="text-gray-500">Please wait while we load your template.</p>
            </div>
          </div>
        )}
      </main>

      {/* Resume Upload Modal */}
      <ResumeUpload
        isOpen={showUploadModal}
        onResumeUploaded={handleResumeUploaded}
        onClose={handleCloseUpload}
      />
    </div>
  );
};

export default BuilderNew; 