import { Upload, HelpCircle } from 'lucide-react';
import { SECTIONS, ResumeData } from './types';

interface BuilderSidebarProps {
  activeIndex: number;
  resumeCompleteness: number;
  resumeData: ResumeData;
  finalizeCompleted?: boolean;
  onSectionClick: (index: number) => void;
  onThemeChange: (theme: Partial<ResumeData['theme']>) => void;
  onUploadClick?: () => void;
  // Enhanced props
  sections?: any[];
  errors?: any[];
  showGuidance?: boolean;
  onRequestGuidance?: () => void;
  useProgressiveFlow?: boolean;
}

const BuilderSidebar = ({
  activeIndex,
  resumeCompleteness,
  resumeData,
  finalizeCompleted = false,
  onSectionClick,
  onThemeChange,
  onUploadClick,
  sections,
  errors = [],
  showGuidance = false,
  onRequestGuidance,
  useProgressiveFlow = false
}: BuilderSidebarProps) => {

  const isSectionComplete = (idx: number): boolean => {
    // Summary should never be "auto-completed" just because it's optional.
    // Only mark it complete when there is actual summary text.
    if (SECTIONS[idx] === 'Summary') {
      const summaryText = (resumeData.contact.summary ?? resumeData.summary ?? '').trim();
      const wordCount = summaryText.split(/\s+/).filter(Boolean).length;
      return summaryText.length >= 50 || wordCount >= 10;
    }

    // Finalize is only complete after the user clicks "Finish & Download PDF".
    if (SECTIONS[idx] === 'Finalize') {
      return !!finalizeCompleted;
    }

    // If progressive flow supplies statuses, trust that first.
    const provided = sections?.[idx];
    if (provided && typeof provided === 'object' && 'status' in provided) {
      return (provided as any).status === 'completed';
    }

    // Fallback to simple validation based on resumeData (mirrors useResumeData.validateSection()).
    switch (SECTIONS[idx]) {
      case 'Heading':
        // Mirror the HeadingSection validation: require values + valid formats
        // eslint-disable-next-line no-useless-escape
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resumeData.contact.email || '');
        const phoneOk = /^[\+]?[1-9][\d]{0,15}$/.test((resumeData.contact.phone || '').replace(/[\s\-\(\)]/g, ''));
        return !!(
          resumeData.contact.firstName &&
          resumeData.contact.lastName &&
          resumeData.contact.email &&
          emailOk &&
          resumeData.contact.phone &&
          phoneOk
        );
      case 'Experience':
        return (
          resumeData.workExperiences.length > 0 &&
          resumeData.workExperiences.some(exp => exp.jobTitle && exp.employer && exp.startDate && (exp.current || !!exp.endDate))
        );
      case 'Education':
        return !!(resumeData.education.school && resumeData.education.degree);
      case 'Skills':
        return resumeData.skills.length >= 3;
      case 'Finalize':
        return !!finalizeCompleted;
      default:
        return false;
    }
  };

  // Sidebar progress bar should match the 6 builder sections (each ~16.7%):
  // Heading, Experience, Education, Skills, Summary, Finalize
  const computedCompleteness = (() => {
    let completedCount = 0;
    for (let i = 0; i < SECTIONS.length; i++) {
      if (isSectionComplete(i)) completedCount++;
    }
    return Math.round((completedCount / SECTIONS.length) * 100);
  })();

  // Progress line should reflect completed sections (not the currently active section).
  // We only count contiguous completion from the start to avoid "skipping ahead" visuals.
  let completedThroughIndex = -1;
  for (let i = 0; i < SECTIONS.length; i++) {
    if (isSectionComplete(i)) completedThroughIndex = i;
    else break;
  }
  
  return (
    <aside className="h-full bg-slate-900 text-white flex flex-col p-4">
      {/* Logo */}
      <div className="flex items-center mb-6 p-2">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          {/* App name removed per branding change */}
        </div>
      </div>

      {/* Upload Resume Button */}
      {onUploadClick && (
        <button
          onClick={onUploadClick}
          className="w-full mb-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Resume</span>
        </button>
      )}

      {/* Section Navigation with Progress Line */}
      <nav className="py-2">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gray-600"></div>
          {/* Active Progress Line */}
          <div 
            className="absolute left-4 top-6 w-0.5 bg-blue-500 transition-all duration-500"
            style={{ height: `${Math.max(0, (completedThroughIndex + 1) * 50 - 12)}px` }}
          ></div>
          
          {SECTIONS.map((section, idx) => {
            const isCompleted = isSectionComplete(idx);
            const isActive = idx === activeIndex;

            return (
              <div key={section} className="relative flex items-center mb-4">
                {/* Step Circle */}
                <button
                  onClick={() => onSectionClick(idx)}
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isCompleted 
                      ? 'bg-blue-500 text-white' 
                      : isActive 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </button>
                
                {/* Step Label */}
                <button
                  onClick={() => onSectionClick(idx)}
                  className={`ml-4 text-left transition-all ${
                    isActive 
                      ? 'text-white font-semibold' 
                      : isCompleted 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">{section}</div>
                  {isActive && (
                    <div className="text-xs text-blue-200 mt-1">Current step</div>
                  )}
                  {isCompleted && !isActive && (
                    <div className="text-xs text-green-400 mt-1">Completed</div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Resume Completeness */}
      <div className="mb-4 px-4">
        <div className="text-xs mb-2 text-gray-300 uppercase tracking-wide">Resume Completeness:</div>
        <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
          <div 
            className="bg-teal-400 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${computedCompleteness}%` }}
          />
        </div>
        <div className="text-right text-sm font-medium text-white">{computedCompleteness}%</div>
      </div>

      {/* Help Button */}
      {onRequestGuidance && (
        <button
          onClick={onRequestGuidance}
          className="w-full mb-4 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors flex items-center justify-center space-x-2 text-sm"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Get Help</span>
        </button>
      )}

      {/* Footer */}
      <div className="text-xs text-gray-500 space-y-1 pt-4 border-t border-slate-700">
        <p className="hover:text-gray-300 cursor-pointer">Terms & Conditions</p>
        <p className="hover:text-gray-300 cursor-pointer">Privacy Policy</p>
        <p className="mt-2">© 2025 Resume Builder</p>
      </div>
    </aside>
  );
};

export default BuilderSidebar; 