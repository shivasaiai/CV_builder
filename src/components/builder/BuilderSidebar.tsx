import { FaPiedPiper } from 'react-icons/fa';
import { Upload } from 'lucide-react';
import { SECTIONS } from './types';

interface BuilderSidebarProps {
  activeIndex: number;
  resumeCompleteness: number;
  activeTemplate: string;
  availableTemplates: string[];
  onSectionClick: (index: number) => void;
  onTemplateChange: (template: string) => void;
  onUploadClick?: () => void;
}

const BuilderSidebar = ({
  activeIndex,
  resumeCompleteness,
  activeTemplate,
  availableTemplates,
  onSectionClick,
  onTemplateChange,
  onUploadClick
}: BuilderSidebarProps) => {
  return (
    <aside className="w-1/4 bg-[#0F172A] text-white flex flex-col p-8">
      {/* Logo */}
      <div className="flex items-center text-2xl font-bold mb-8">
        <FaPiedPiper className="mr-2" />
        <span>Pied Piper</span>
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

      {/* Navigation */}
      <nav className="flex-1">
        {SECTIONS.map((section, idx) => (
          <div key={section} className="flex items-center mb-6">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                activeIndex === idx ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            >
              {idx + 1}
            </div>
            <button
              className={`text-lg ${activeIndex === idx ? 'font-bold' : ''}`}
              onClick={() => onSectionClick(idx)}
            >
              {section}
            </button>
          </div>
        ))}
      </nav>

      {/* Template Selector */}
      <div className="mb-8">
        <div className="text-sm mb-4">TEMPLATE</div>
        <div className="relative">
          <select
            value={activeTemplate}
            onChange={(e) => onTemplateChange(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 text-sm"
          >
            {availableTemplates.map((templateName) => (
              <option key={templateName} value={templateName}>
                {templateName}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Change template anytime
        </div>
      </div>

      {/* Resume Completeness */}
      <div className="mb-8">
        <div className="text-sm mb-2">RESUME COMPLETENESS</div>
        <div className="w-full bg-gray-600 rounded-full h-2.5">
          <div 
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${resumeCompleteness}%` }}
          />
        </div>
        <div className="text-right text-sm mt-1">{resumeCompleteness}%</div>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-400">
        <p>Terms And Conditions</p>
        <p>Privacy Policy</p>
        <p>Accessibility</p>
        <p>Contact Us</p>
        <p className="mt-4">© 2025, Works Limited. All rights reserved.</p>
      </div>
    </aside>
  );
};

export default BuilderSidebar; 