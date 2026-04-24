import { FAQItem, TroubleshootingItem, HelpResource } from './HelpSystem';

export const defaultFAQs: FAQItem[] = [
  {
    id: 'upload-formats',
    question: 'What file formats can I upload?',
    answer: 'You can upload PDF files, Word documents (.docx, .doc), text files (.txt), RTF files, and image files (JPG, PNG, GIF, BMP, TIFF). PDF files with selectable text work best for accurate parsing.',
    category: 'upload',
    tags: ['file formats', 'upload', 'pdf', 'word', 'image']
  },
  {
    id: 'file-size-limit',
    question: 'What is the maximum file size I can upload?',
    answer: 'The maximum file size is 50MB. Most resume files are much smaller than this limit. If your file is too large, try compressing it or saving it in a different format.',
    category: 'upload',
    tags: ['file size', 'limit', 'upload']
  },
  {
    id: 'password-protected-pdf',
    question: 'Can I upload a password-protected PDF?',
    answer: 'No, password-protected PDFs cannot be processed. Please remove the password protection or save the PDF without a password before uploading.',
    category: 'upload',
    tags: ['password', 'pdf', 'protected', 'security']
  },
  {
    id: 'parsing-accuracy',
    question: 'Why is some information missing or incorrect after upload?',
    answer: 'Parsing accuracy depends on the file quality and format. PDF files with selectable text are most accurate. Scanned documents or images use OCR which may have lower accuracy. You can manually edit any incorrect information.',
    category: 'parsing',
    tags: ['accuracy', 'parsing', 'ocr', 'missing information']
  },
  {
    id: 'edit-sections',
    question: 'How do I edit the information after upload?',
    answer: 'After uploading, you can click on any section to edit it. Use the navigation flow to move between sections, or click directly on the section you want to modify in the preview.',
    category: 'editing',
    tags: ['edit', 'sections', 'modify', 'update']
  },
  {
    id: 'template-switching',
    question: 'Can I change templates without losing my data?',
    answer: 'Yes! You can switch between templates at any time without losing your information. Your data is preserved when changing templates, and you can preview how it looks in different styles.',
    category: 'templates',
    tags: ['templates', 'switch', 'data preservation', 'design']
  },
  {
    id: 'download-formats',
    question: 'What format will my resume be downloaded in?',
    answer: 'Your resume will be downloaded as a high-quality PDF file that is optimized for both human readers and Applicant Tracking Systems (ATS). PDF is the most widely accepted format for resumes.',
    category: 'download',
    tags: ['download', 'pdf', 'format', 'ats']
  },
  {
    id: 'ats-friendly',
    question: 'Are the resumes ATS-friendly?',
    answer: 'Yes, all our templates are designed to be ATS (Applicant Tracking System) friendly. They use standard fonts, clear section headings, and proper formatting that ATS systems can easily parse.',
    category: 'ats',
    tags: ['ats', 'applicant tracking system', 'compatibility', 'parsing']
  },
  {
    id: 'data-privacy',
    question: 'Is my personal information secure?',
    answer: 'Yes, your privacy is our priority. All resume processing happens in your browser - your files are not uploaded to our servers. Your personal information stays on your device.',
    category: 'privacy',
    tags: ['privacy', 'security', 'data protection', 'local processing']
  },
  {
    id: 'browser-compatibility',
    question: 'Which browsers are supported?',
    answer: 'The resume builder works best on modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, please use the latest version of your browser.',
    category: 'technical',
    tags: ['browser', 'compatibility', 'chrome', 'firefox', 'safari', 'edge']
  }
];

export const defaultTroubleshooting: TroubleshootingItem[] = [
  {
    id: 'upload-fails',
    problem: 'File upload fails or gets stuck',
    symptoms: [
      'Upload progress bar stops moving',
      'Error message appears during upload',
      'File appears to upload but nothing happens',
      'Browser becomes unresponsive during upload'
    ],
    solutions: [
      {
        step: 'Check file size and format',
        description: 'Ensure your file is under 50MB and in a supported format (PDF, DOCX, DOC, TXT, RTF, or image files).'
      },
      {
        step: 'Try a different browser',
        description: 'Switch to Chrome, Firefox, Safari, or Edge if you\'re using a different browser.'
      },
      {
        step: 'Clear browser cache',
        description: 'Clear your browser cache and cookies, then try uploading again.'
      },
      {
        step: 'Check internet connection',
        description: 'Ensure you have a stable internet connection. Large files may take longer to process.'
      },
      {
        step: 'Refresh and retry',
        description: 'Refresh the page and try uploading the file again.'
      }
    ],
    category: 'upload',
    severity: 'medium'
  },
  {
    id: 'poor-text-extraction',
    problem: 'Text extraction is incomplete or inaccurate',
    symptoms: [
      'Missing sections or information',
      'Garbled or incorrect text',
      'Text appears in wrong sections',
      'Special characters are corrupted'
    ],
    solutions: [
      {
        step: 'Use a text-based PDF',
        description: 'If possible, save your resume as a PDF with selectable text rather than a scanned image.'
      },
      {
        step: 'Improve image quality',
        description: 'For image files, ensure high resolution (at least 300 DPI) and good contrast.'
      },
      {
        step: 'Check original formatting',
        description: 'Ensure your original resume has clear section headings and consistent formatting.'
      },
      {
        step: 'Manual editing',
        description: 'After upload, manually review and edit each section to correct any inaccuracies.'
      },
      {
        step: 'Try different file format',
        description: 'If you have the resume in multiple formats, try uploading a Word document instead of PDF.'
      }
    ],
    category: 'parsing',
    severity: 'medium'
  },
  {
    id: 'preview-not-updating',
    problem: 'Preview doesn\'t update when making changes',
    symptoms: [
      'Changes don\'t appear in preview',
      'Preview shows old information',
      'Preview appears blank or broken',
      'Template changes don\'t apply'
    ],
    solutions: [
      {
        step: 'Wait for auto-save',
        description: 'Changes are automatically saved. Wait a few seconds for the preview to update.'
      },
      {
        step: 'Refresh the preview',
        description: 'Click outside the editing area or switch to a different section to trigger a preview update.'
      },
      {
        step: 'Check browser console',
        description: 'Open browser developer tools (F12) and check for any error messages in the console.'
      },
      {
        step: 'Try different template',
        description: 'Switch to a different template to see if the issue is template-specific.'
      },
      {
        step: 'Refresh the page',
        description: 'If the issue persists, refresh the page. Your changes should be automatically saved.'
      }
    ],
    category: 'preview',
    severity: 'low'
  },
  {
    id: 'download-issues',
    problem: 'Cannot download resume or download fails',
    symptoms: [
      'Download button doesn\'t work',
      'Downloaded file is corrupted',
      'Download starts but never completes',
      'PDF appears blank or malformed'
    ],
    solutions: [
      {
        step: 'Check browser permissions',
        description: 'Ensure your browser allows downloads from this site. Check popup blockers and download settings.'
      },
      {
        step: 'Try different browser',
        description: 'Switch to a different browser to see if the issue is browser-specific.'
      },
      {
        step: 'Clear browser cache',
        description: 'Clear your browser cache and cookies, then try downloading again.'
      },
      {
        step: 'Check preview first',
        description: 'Ensure the preview looks correct before downloading. If preview is broken, fix that first.'
      },
      {
        step: 'Wait for processing',
        description: 'Large resumes may take a few seconds to generate. Wait for the download to complete.'
      }
    ],
    category: 'download',
    severity: 'high'
  },
  {
    id: 'performance-slow',
    problem: 'Application is slow or unresponsive',
    symptoms: [
      'Long loading times',
      'Typing lag in text fields',
      'Preview updates slowly',
      'Browser becomes unresponsive'
    ],
    solutions: [
      {
        step: 'Close other browser tabs',
        description: 'Close unnecessary browser tabs to free up memory and processing power.'
      },
      {
        step: 'Check system resources',
        description: 'Ensure your computer has sufficient available memory and isn\'t running too many programs.'
      },
      {
        step: 'Use supported browser',
        description: 'Switch to Chrome, Firefox, Safari, or Edge for better performance.'
      },
      {
        step: 'Reduce file size',
        description: 'If working with large files, try compressing images or using a smaller file.'
      },
      {
        step: 'Refresh the application',
        description: 'Refresh the page to clear any memory leaks or temporary issues.'
      }
    ],
    category: 'performance',
    severity: 'medium'
  }
];

export const defaultResources: HelpResource[] = [
  {
    id: 'user-guide',
    title: 'Complete User Guide',
    description: 'Step-by-step guide to using the resume builder effectively',
    url: '/help/user-guide',
    type: 'guide',
    category: 'general',
    duration: '10 min read'
  },
  {
    id: 'video-tutorial',
    title: 'Video Tutorial: Getting Started',
    description: 'Watch how to create your first resume from start to finish',
    url: '/help/video-tutorial',
    type: 'video',
    category: 'general',
    duration: '5 min'
  },
  {
    id: 'writing-tips',
    title: 'Resume Writing Best Practices',
    description: 'Tips for writing effective resume content that gets noticed',
    url: '/help/writing-tips',
    type: 'article',
    category: 'writing',
    duration: '8 min read'
  },
  {
    id: 'ats-optimization',
    title: 'ATS Optimization Guide',
    description: 'How to make your resume ATS-friendly and pass automated screening',
    url: '/help/ats-optimization',
    type: 'guide',
    category: 'ats',
    duration: '12 min read'
  },
  {
    id: 'template-selection',
    title: 'Choosing the Right Template',
    description: 'Guide to selecting the best template for your industry and experience level',
    url: '/help/template-selection',
    type: 'article',
    category: 'templates',
    duration: '6 min read'
  },
  {
    id: 'troubleshooting-video',
    title: 'Common Issues and Solutions',
    description: 'Video walkthrough of troubleshooting common problems',
    url: '/help/troubleshooting-video',
    type: 'video',
    category: 'troubleshooting',
    duration: '8 min'
  },
  {
    id: 'linkedin-guide',
    title: 'LinkedIn Profile Optimization',
    description: 'How to align your resume with your LinkedIn profile',
    url: 'https://linkedin.com/help/linkedin/answer/112133',
    type: 'external',
    category: 'career',
    duration: '15 min read'
  },
  {
    id: 'interview-prep',
    title: 'Interview Preparation Guide',
    description: 'How to use your resume to prepare for job interviews',
    url: '/help/interview-prep',
    type: 'guide',
    category: 'career',
    duration: '20 min read'
  },
  {
    id: 'industry-specific',
    title: 'Industry-Specific Resume Tips',
    description: 'Tailored advice for different industries and job roles',
    url: '/help/industry-specific',
    type: 'article',
    category: 'industry',
    duration: '10 min read'
  },
  {
    id: 'api-documentation',
    title: 'Developer API Documentation',
    description: 'Technical documentation for developers integrating with our API',
    url: '/help/api-docs',
    type: 'guide',
    category: 'technical',
    duration: '30 min read'
  }
];

export const helpContentBySection = {
  upload: {
    title: 'Upload Your Resume',
    description: 'Upload your existing resume to get started quickly.',
    steps: [
      'Click the upload area or drag and drop your file',
      'Wait for the file to be processed and parsed',
      'Review the extracted information',
      'Make any necessary corrections'
    ],
    tips: [
      'PDF files with selectable text work best',
      'Ensure clear section headings in your resume',
      'High-resolution images produce better OCR results'
    ],
    troubleshooting: [
      {
        problem: 'Upload fails',
        solution: 'Check file size (max 50MB) and format'
      },
      {
        problem: 'Text extraction incomplete',
        solution: 'Try a higher quality version or text-based PDF'
      }
    ]
  },
  
  experience: {
    title: 'Work Experience',
    description: 'Add your professional work history with detailed descriptions.',
    steps: [
      'Enter job title and company name',
      'Add start and end dates',
      'Write bullet points describing achievements',
      'Use action verbs and quantify results'
    ],
    tips: [
      'Start each bullet with an action verb',
      'Include specific numbers and metrics',
      'Focus on achievements, not just duties',
      'Tailor content to target job'
    ]
  },
  
  education: {
    title: 'Education',
    description: 'Add your educational background and certifications.',
    steps: [
      'Enter degree and field of study',
      'Add institution name and location',
      'Include graduation date',
      'Add relevant coursework or honors'
    ],
    tips: [
      'List most recent education first',
      'Include GPA if 3.5 or higher',
      'Add relevant certifications',
      'Include ongoing education'
    ]
  },
  
  skills: {
    title: 'Skills',
    description: 'Highlight your technical and soft skills.',
    steps: [
      'Add technical skills relevant to your field',
      'Include soft skills that show leadership',
      'Group similar skills together',
      'Prioritize skills from job descriptions'
    ],
    tips: [
      'Be honest about skill levels',
      'Use industry-standard terms',
      'Keep list focused and relevant',
      'Update skills regularly'
    ]
  }
};