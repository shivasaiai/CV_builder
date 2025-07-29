import { SectionProps, SectionType } from './types';
import HeadingSection from './sections/HeadingSection';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import SkillsSection from './sections/SkillsSection';
import SummarySection from './sections/SummarySection';
import FinalizeSection from './sections/FinalizeSection';

interface SectionRendererProps extends SectionProps {
  activeSection: SectionType;
  onUploadClick?: () => void;
}

const SectionRenderer = ({
  activeSection,
  resumeData,
  builderState,
  updateResumeData,
  updateBuilderState,
  onNext,
  onBack,
  onUploadClick
}: SectionRendererProps) => {
  const sectionProps = {
    resumeData,
    builderState,
    updateResumeData,
    updateBuilderState,
    onNext,
    onBack
  };

  return (
    <div>
      {/* Upload Resume button in section sidebar */}
      {onUploadClick && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={onUploadClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Upload Resume
          </button>
        </div>
      )}
      {/* Section content */}
      {(() => {
        switch (activeSection) {
          case 'Heading':
            return <HeadingSection {...sectionProps} />;
          case 'Experience':
            return <ExperienceSection {...sectionProps} />;
          case 'Education':
            return <EducationSection {...sectionProps} />;
          case 'Skills':
            return <SkillsSection {...sectionProps} />;
          case 'Summary':
            return <SummarySection {...sectionProps} />;
          case 'Finalize':
            return <FinalizeSection {...sectionProps} />;
          default:
            return (
              <div className="max-w-2xl w-full flex flex-col items-center justify-center h-[80vh]">
                <h1 className="text-4xl font-bold mb-2 text-gray-900">Section Not Found</h1>
                <p className="text-xl text-gray-500 mb-8">This section is not implemented yet.</p>
                <div className="flex gap-4 mt-8 w-full justify-between">
                  <button 
                    className="px-6 py-2 rounded bg-gray-200 text-gray-700" 
                    onClick={onBack}
                  >
                    Back
                  </button>
                  <button 
                    className="px-6 py-2 rounded bg-blue-600 text-white" 
                    onClick={onNext}
                  >
                    Continue
                  </button>
                </div>
              </div>
            );
        }
      })()}
    </div>
  );
};

export default SectionRenderer; 