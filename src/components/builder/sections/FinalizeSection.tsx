import { SectionProps } from '../types';

const FinalizeSection = ({ 
  resumeData, 
  builderState,
  updateResumeData, 
  updateBuilderState,
  onNext, 
  onBack 
}: SectionProps) => {
  const handleDownloadPDF = () => {
    // TODO: Implement PDF download functionality
    console.log('Download PDF clicked');
  };

  return (
    <div className="max-w-2xl w-full flex flex-col items-center justify-center h-[80vh]">
      <h1 className="text-4xl font-bold mb-2 text-gray-900">
        Finalize
      </h1>
      <p className="text-xl text-gray-500 mb-8">
        Review and finish your resume
      </p>
      
      <div className="w-full text-center p-8 bg-gray-100 rounded mb-8">
        <p className="text-gray-600">Finalize section implementation coming soon...</p>
        <p className="text-sm text-gray-500 mt-2">
          Resume completeness: Complete
        </p>
      </div>
      
      <div className="flex gap-4 mt-8 w-full justify-end">
        <button 
          className="px-6 py-2 rounded bg-blue-600 text-white" 
          onClick={handleDownloadPDF}
        >
          Finish & Download PDF
        </button>
      </div>
    </div>
  );
};

export default FinalizeSection; 