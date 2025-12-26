import { SectionProps } from '../types';
import html2pdf from 'html2pdf.js';

const FinalizeSection = ({ 
  resumeData, 
  builderState,
  updateResumeData, 
  updateBuilderState,
  onNext, 
  onBack 
}: SectionProps) => {
  const handleDownloadPDF = () => {
    console.log('Download PDF clicked');

    const element = document.getElementById('pdf-generator-content');
    if (!element) {
      console.error('❌ PDF generation element not found (id="pdf-generator-content")');
      return;
    }

    const contentHeight = element.scrollHeight;
    const contentWidth = element.scrollWidth;

    if (!contentHeight || !contentWidth) {
      console.error('❌ PDF content has zero size, aborting download');
      return;
    }

    // Convert pixels to inches (assuming 96 DPI)
    const heightInInches = contentHeight / 96;
    const widthInInches = contentWidth / 96;

    const opt = {
      margin: 0,
      filename: 'resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        height: contentHeight,
        width: contentWidth
      },
      jsPDF: {
        unit: 'in',
        format: [widthInInches, heightInInches],
        orientation: 'portrait',
        compress: true
      }
    };

    // Mark finalize as completed once download is initiated successfully.
    updateBuilderState({ finalizeCompleted: true });

    // Trigger PDF generation from the hidden preview in EnhancedResumePreview
    // @ts-ignore - html2pdf has no default TS types in this project
    html2pdf().from(element).set(opt).save();
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