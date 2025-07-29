import { useState } from "react";
import { useParams } from "react-router-dom";
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
    importResumeData(importedData);
    setShowUploadModal(false);
    // Navigate to first section to review imported data
    setActiveSection(0);
  };

  const handleCloseUpload = () => {
    setShowUploadModal(false);
  };

  const currentSection = SECTIONS[builderState.activeIndex];

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
        // onUploadClick={handleUploadClick} // Remove this line
      />

      {/* Main Content */}
      <main className="flex-1 p-12 flex">
        <div className="w-2/3 pr-8">
          <div className="mb-8">
            <button onClick={handleBack} className="text-blue-500">
              &larr; Go Back
            </button>
          </div>

          {/* Show Upload Resume button after template selection */}
          {builderState.activeTemplate && (
            <div className="mb-8">
              <button
                onClick={handleUploadClick}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Upload Resume
              </button>
            </div>
          )}

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
        </div>

        {/* Live Preview */}
        <ResumePreview
          resumeData={resumeData}
          activeTemplate={builderState.activeTemplate}
          templateColors={builderState.templateColors}
          showColorEditor={builderState.showColorEditor}
          onTemplateChange={handleTemplateChange}
          onColorChange={setTemplateColors}
          onToggleColorEditor={toggleColorEditor}
        />
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