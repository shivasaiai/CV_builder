import { SectionProps } from '../types';

const SkillsSection = ({ 
  resumeData, 
  builderState,
  updateResumeData, 
  updateBuilderState,
  onNext, 
  onBack 
}: SectionProps) => {
  return (
    <div className="max-w-2xl w-full flex flex-col items-center justify-center h-[80vh]">
      <h1 className="text-4xl font-bold mb-2 text-gray-900">
        What skills should we add?
      </h1>
      <p className="text-xl text-gray-500 mb-8">
        Add skills that are relevant to your target job
      </p>
      
      <div className="w-full text-center p-8 bg-gray-100 rounded">
        <p className="text-gray-600">Skills section implementation coming soon...</p>
        <p className="text-sm text-gray-500 mt-2">
          Current skills: {resumeData.skills.length}
        </p>
      </div>
      
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
};

export default SkillsSection; 