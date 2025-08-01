import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X, ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface HelpContent {
  title: string;
  description: string;
  steps?: string[];
  tips?: string[];
  relatedLinks?: Array<{
    label: string;
    url: string;
    external?: boolean;
  }>;
  videoUrl?: string;
  troubleshooting?: Array<{
    problem: string;
    solution: string;
  }>;
}

interface ContextualHelpProps {
  content: HelpContent;
  trigger?: 'hover' | 'click';
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  content,
  trigger = 'click',
  position = 'top',
  size = 'md',
  className = '',
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-64 max-h-80';
      case 'lg':
        return 'w-96 max-h-96';
      default:
        return 'w-80 max-h-88';
    }
  };

  const HelpTrigger = children || (
    <Button
      variant="ghost"
      size="sm"
      className={`h-6 w-6 p-0 text-gray-400 hover:text-gray-600 ${className}`}
    >
      <HelpCircle className="h-4 w-4" />
    </Button>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          onMouseEnter={trigger === 'hover' ? () => setIsOpen(true) : undefined}
          onMouseLeave={trigger === 'hover' ? () => setIsOpen(false) : undefined}
          onClick={trigger === 'click' ? () => setIsOpen(!isOpen) : undefined}
          className="inline-block cursor-help"
        >
          {HelpTrigger}
        </div>
      </PopoverTrigger>

      <PopoverContent
        side={position}
        className={`${getSizeClasses()} p-0 overflow-hidden`}
        sideOffset={8}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-sm font-semibold text-gray-900">
                  {content.title}
                </CardTitle>
                <CardDescription className="text-xs text-gray-600 mt-1">
                  {content.description}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0 space-y-3 max-h-64 overflow-y-auto">
            {/* Steps */}
            {content.steps && content.steps.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">How to:</h4>
                <ol className="space-y-1">
                  {content.steps.slice(0, showFullContent ? undefined : 3).map((step, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start">
                      <span className="flex-shrink-0 w-4 h-4 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                {content.steps.length > 3 && !showFullContent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullContent(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto mt-2"
                  >
                    Show {content.steps.length - 3} more steps
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            )}

            {/* Tips */}
            {content.tips && content.tips.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">💡 Tips:</h4>
                <ul className="space-y-1">
                  {content.tips.map((tip, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start">
                      <span className="flex-shrink-0 w-1 h-1 bg-gray-400 rounded-full mr-2 mt-2"></span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Troubleshooting */}
            {content.troubleshooting && content.troubleshooting.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">🔧 Troubleshooting:</h4>
                <div className="space-y-2">
                  {content.troubleshooting.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded p-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">
                        Problem: {item.problem}
                      </p>
                      <p className="text-xs text-gray-600">
                        Solution: {item.solution}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video */}
            {content.videoUrl && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">📹 Video Guide:</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(content.videoUrl, '_blank')}
                  className="text-xs w-full"
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Watch Tutorial
                </Button>
              </div>
            )}

            {/* Related Links */}
            {content.relatedLinks && content.relatedLinks.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">📚 Related:</h4>
                <div className="space-y-1">
                  {content.relatedLinks.map((link, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(link.url, link.external ? '_blank' : '_self')}
                      className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto justify-start w-full"
                    >
                      {link.external && <ExternalLink className="h-3 w-3 mr-1" />}
                      {link.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

// Predefined help content for common scenarios
export const helpContent = {
  fileUpload: {
    title: 'Upload Your Resume',
    description: 'Upload a PDF, Word document, or image file of your existing resume.',
    steps: [
      'Click the upload area or drag and drop your file',
      'Wait for the file to be processed and parsed',
      'Review the extracted information in each section',
      'Make any necessary corrections or additions'
    ],
    tips: [
      'PDF files with selectable text work best',
      'Ensure your resume has clear section headings',
      'High-resolution images produce better OCR results',
      'Files should be under 50MB in size'
    ],
    troubleshooting: [
      {
        problem: 'File upload fails',
        solution: 'Check file size (max 50MB) and format (PDF, DOCX, DOC, images)'
      },
      {
        problem: 'Text extraction is incomplete',
        solution: 'Try uploading a higher quality version or a text-based PDF'
      },
      {
        problem: 'Password-protected PDF',
        solution: 'Remove password protection or save as a new unprotected PDF'
      }
    ],
    relatedLinks: [
      {
        label: 'Supported File Formats',
        url: '/help/file-formats'
      },
      {
        label: 'Troubleshooting Guide',
        url: '/help/troubleshooting'
      }
    ]
  },

  experienceSection: {
    title: 'Work Experience',
    description: 'Add your professional work history with detailed descriptions.',
    steps: [
      'Enter your job title and company name',
      'Add start and end dates (or mark as current)',
      'Write bullet points describing your achievements',
      'Use action verbs and quantify results when possible'
    ],
    tips: [
      'Start each bullet point with an action verb',
      'Include specific numbers and metrics',
      'Focus on achievements, not just responsibilities',
      'Tailor content to the job you\'re applying for'
    ],
    relatedLinks: [
      {
        label: 'Writing Effective Bullet Points',
        url: '/help/bullet-points'
      },
      {
        label: 'Action Verbs List',
        url: '/help/action-verbs'
      }
    ]
  },

  skillsSection: {
    title: 'Skills & Expertise',
    description: 'Highlight your technical and soft skills relevant to your target role.',
    steps: [
      'Add technical skills relevant to your field',
      'Include soft skills that demonstrate leadership',
      'Group similar skills together',
      'Prioritize skills mentioned in job descriptions'
    ],
    tips: [
      'Be honest about your skill level',
      'Include both technical and soft skills',
      'Use industry-standard terminology',
      'Keep the list focused and relevant'
    ]
  },

  templateSelection: {
    title: 'Choose a Template',
    description: 'Select a professional template that matches your industry and style.',
    steps: [
      'Browse available templates',
      'Consider your industry standards',
      'Preview how your content looks',
      'Switch templates anytime without losing data'
    ],
    tips: [
      'Conservative templates work well for traditional industries',
      'Creative templates suit design and marketing roles',
      'Ensure good readability and ATS compatibility',
      'Your content matters more than the template'
    ]
  },

  previewAndDownload: {
    title: 'Preview & Download',
    description: 'Review your resume and download it in your preferred format.',
    steps: [
      'Review all sections for accuracy',
      'Check formatting and layout',
      'Download as PDF for best compatibility',
      'Test with ATS systems if possible'
    ],
    tips: [
      'PDF format is most widely accepted',
      'Print a copy to check formatting',
      'Keep file name professional',
      'Save multiple versions for different applications'
    ]
  }
};

export default ContextualHelp;