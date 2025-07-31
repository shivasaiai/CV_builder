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
      {/* Upload Resume button only for non-Heading sections (Heading has its own) */}
      {onUploadClick && activeSection !== 'Heading' && (
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
            return <div>Section not found</div>;
        }
      })()}
    </div>
  );
};

export default SectionRenderer; 