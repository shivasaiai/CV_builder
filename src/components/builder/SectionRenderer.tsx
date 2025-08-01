import { SectionProps, SectionType } from './types';
import HeadingSection from './sections/HeadingSection';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import SkillsSection from './sections/SkillsSection';
import SummarySection from './sections/SummarySection';
import FinalizeSection from './sections/FinalizeSection';
// ErrorAlert removed for simplicity

interface SectionRendererProps extends SectionProps {
  activeSection: SectionType | any;
  onUploadClick?: () => void;
  // Enhanced props
  validationErrors?: string[];
  sectionStatus?: 'not_started' | 'in_progress' | 'completed';
  onSectionComplete?: () => void;
}

const SectionRenderer = ({
  activeSection,
  resumeData,
  builderState,
  updateResumeData,
  updateBuilderState,
  onNext,
  onBack,
  onUploadClick,
  validationErrors = [],
  sectionStatus = 'not_started',
  onSectionComplete
}: SectionRendererProps) => {
  const sectionProps = {
    resumeData,
    builderState,
    updateResumeData,
    updateBuilderState,
    onNext,
    onBack,
    validationErrors,
    sectionStatus,
    onSectionComplete
  };

  // Get section name for comparison
  const sectionName = typeof activeSection === 'string' ? activeSection : activeSection?.name || 'Unknown';

  return (
    <div>
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6">
          {validationErrors.map((error, index) => (
            <div 
              key={index} 
              className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
            >
              {error}
            </div>
          ))}
        </div>
      )}

      {/* Section Status Indicator */}
      {sectionStatus && (
        <div className="mb-4 flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            sectionStatus === 'completed' ? 'bg-green-500' :
            sectionStatus === 'in_progress' ? 'bg-yellow-500' :
            'bg-gray-300'
          }`} />
          <span className="text-sm text-gray-600 capitalize">
            {sectionStatus.replace('_', ' ')}
          </span>
        </div>
      )}

      {/* Upload Resume button only for non-Heading sections (Heading has its own) */}
      {onUploadClick && sectionName !== 'Heading' && (
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
        switch (sectionName) {
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
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-600 mb-2">
                  Section not found
                </h2>
                <p className="text-gray-500">
                  The requested section "{sectionName}" could not be loaded.
                </p>
              </div>
            );
        }
      })()}
    </div>
  );
};

export default SectionRenderer; 