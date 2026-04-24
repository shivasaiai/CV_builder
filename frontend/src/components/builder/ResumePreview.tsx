import React from 'react';
import { ResumeData, TemplateColors } from './types';
import { EnhancedResumePreview } from './components/EnhancedPreview';

interface ResumePreviewProps {
  resumeData: ResumeData;
  activeTemplate: string;
  templateColors: TemplateColors;
  showColorEditor: boolean;
  onTemplateChange: (template: string) => void;
  onColorChange: (colors: TemplateColors) => void;
  onToggleColorEditor: () => void;
}

const ResumePreview: React.FC<ResumePreviewProps> = (props) => {
  return (
    <div className="w-1/3">
      <div className="bg-white rounded-lg shadow-lg h-full">
        <EnhancedResumePreview
          {...props}
          className="h-full"
          fixedHeight={800} // Adjust based on your layout needs
        />
      </div>
    </div>
  );
};

export default ResumePreview; 