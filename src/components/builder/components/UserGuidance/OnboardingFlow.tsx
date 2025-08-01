import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Play, FileText, Upload, Edit, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  action?: {
    label: string;
    onClick: () => void;
  };
  skippable?: boolean;
}

interface OnboardingFlowProps {
  steps: OnboardingStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
  showProgress?: boolean;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete,
  onSkip,
  autoStart = false,
  showProgress = true
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasStarted, setHasStarted] = useState(autoStart);

  useEffect(() => {
    if (autoStart && isOpen) {
      setHasStarted(true);
    }
  }, [autoStart, isOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  const handleStart = () => {
    setHasStarted(true);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {hasStarted ? 'Getting Started' : 'Welcome to Resume Builder'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {hasStarted && showProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-gray-500">
                  {Math.round(progress)}% complete
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {!hasStarted ? (
            <WelcomeScreen onStart={handleStart} onSkip={handleSkip} />
          ) : (
            <StepContent
              step={currentStepData}
              stepNumber={currentStep + 1}
              totalSteps={steps.length}
            />
          )}
        </div>

        {hasStarted && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              {currentStepData.skippable && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-gray-500"
                >
                  Skip Tour
                </Button>
              )}
              
              {currentStepData.action && (
                <Button
                  variant="outline"
                  onClick={currentStepData.action.onClick}
                >
                  {currentStepData.action.label}
                </Button>
              )}

              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 ml-1" />
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const WelcomeScreen: React.FC<{
  onStart: () => void;
  onSkip: () => void;
}> = ({ onStart, onSkip }) => {
  return (
    <div className="text-center py-8">
      <div className="mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Resume Builder
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Let's take a quick tour to help you create an amazing resume in just a few minutes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <Upload className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Upload</p>
          <p className="text-xs text-gray-600">Import existing resume</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <Edit className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Edit</p>
          <p className="text-xs text-gray-600">Customize content</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Preview</p>
          <p className="text-xs text-gray-600">See live preview</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <Download className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Download</p>
          <p className="text-xs text-gray-600">Get your PDF</p>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-4">
        <Button variant="outline" onClick={onSkip}>
          Skip Tour
        </Button>
        <Button onClick={onStart} className="flex items-center">
          <Play className="h-4 w-4 mr-2" />
          Start Tour
        </Button>
      </div>
    </div>
  );
};

const StepContent: React.FC<{
  step: OnboardingStep;
  stepNumber: number;
  totalSteps: number;
}> = ({ step, stepNumber, totalSteps }) => {
  const Icon = step.icon;

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center pb-4">
        {Icon && (
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        )}
        <CardTitle className="text-lg font-semibold">
          {step.title}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {step.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="prose prose-sm max-w-none">
          {step.content}
        </div>
      </CardContent>
    </Card>
  );
};

// Predefined onboarding steps
export const defaultOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Upload Your Resume',
    description: 'Start by uploading your existing resume or create one from scratch.',
    icon: Upload,
    content: (
      <div className="space-y-4">
        <p>
          You can upload your existing resume in PDF, Word, or image format. Our smart parser
          will extract all the information and organize it into sections.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• PDF files with selectable text work best</li>
            <li>• Ensure clear section headings in your resume</li>
            <li>• High-resolution images produce better results</li>
          </ul>
        </div>
      </div>
    ),
    skippable: true
  },
  {
    id: 'sections',
    title: 'Review & Edit Sections',
    description: 'Check each section and make any necessary adjustments.',
    icon: Edit,
    content: (
      <div className="space-y-4">
        <p>
          After uploading, review each section of your resume. You can edit, add, or remove
          information as needed. The system will guide you through each section.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded">
            <h5 className="font-medium text-gray-900">Personal Info</h5>
            <p className="text-sm text-gray-600">Name, contact details</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <h5 className="font-medium text-gray-900">Experience</h5>
            <p className="text-sm text-gray-600">Work history, achievements</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <h5 className="font-medium text-gray-900">Education</h5>
            <p className="text-sm text-gray-600">Degrees, certifications</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <h5 className="font-medium text-gray-900">Skills</h5>
            <p className="text-sm text-gray-600">Technical & soft skills</p>
          </div>
        </div>
      </div>
    ),
    skippable: true
  },
  {
    id: 'preview',
    title: 'Live Preview',
    description: 'See how your resume looks in real-time as you make changes.',
    icon: FileText,
    content: (
      <div className="space-y-4">
        <p>
          The preview panel shows exactly how your resume will look. You can choose from
          multiple professional templates and see changes instantly.
        </p>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">✨ Features:</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Real-time updates as you type</li>
            <li>• Multiple professional templates</li>
            <li>• Zoom and scale controls</li>
            <li>• Print-ready formatting</li>
          </ul>
        </div>
      </div>
    ),
    skippable: true
  },
  {
    id: 'download',
    title: 'Download & Share',
    description: 'Export your resume as a PDF and start applying for jobs.',
    icon: Download,
    content: (
      <div className="space-y-4">
        <p>
          Once you're happy with your resume, download it as a high-quality PDF. The file
          will be optimized for both human readers and ATS systems.
        </p>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-900 mb-2">🎯 Ready to Apply:</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• ATS-friendly formatting</li>
            <li>• Professional appearance</li>
            <li>• Optimized file size</li>
            <li>• Print-ready quality</li>
          </ul>
        </div>
      </div>
    ),
    skippable: false
  }
];

export default OnboardingFlow;