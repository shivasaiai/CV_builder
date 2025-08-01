import React from 'react';
import { CheckCircle, Circle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'error' | 'loading';

export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: ProgressStatus;
  progress?: number; // 0-100 for in_progress status
  errorMessage?: string;
  estimatedTime?: string;
  optional?: boolean;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStepId?: string;
  orientation?: 'horizontal' | 'vertical';
  showProgress?: boolean;
  showEstimatedTime?: boolean;
  className?: string;
  onStepClick?: (stepId: string) => void;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStepId,
  orientation = 'horizontal',
  showProgress = true,
  showEstimatedTime = false,
  className = '',
  onStepClick
}) => {
  const getStatusIcon = (status: ProgressStatus, isActive: boolean) => {
    const baseClasses = "h-5 w-5";
    
    switch (status) {
      case 'completed':
        return <CheckCircle className={`${baseClasses} text-green-600`} />;
      case 'in_progress':
      case 'loading':
        return status === 'loading' 
          ? <Loader2 className={`${baseClasses} text-blue-600 animate-spin`} />
          : <Clock className={`${baseClasses} text-blue-600`} />;
      case 'error':
        return <AlertCircle className={`${baseClasses} text-red-600`} />;
      default:
        return <Circle className={`${baseClasses} ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />;
    }
  };

  const getStatusColor = (status: ProgressStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 border-green-200 bg-green-50';
      case 'in_progress':
      case 'loading':
        return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'error':
        return 'text-red-600 border-red-200 bg-red-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const getConnectorColor = (currentStatus: ProgressStatus, nextStatus: ProgressStatus) => {
    if (currentStatus === 'completed') {
      return 'bg-green-400';
    } else if (currentStatus === 'in_progress' || currentStatus === 'loading') {
      return 'bg-blue-400';
    } else if (currentStatus === 'error') {
      return 'bg-red-400';
    }
    return 'bg-gray-300';
  };

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const overallProgress = (completedSteps / totalSteps) * 100;

  if (orientation === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Overall Progress */}
        {showProgress && (
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm text-gray-500">{completedSteps}/{totalSteps}</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(overallProgress)}% complete
              </p>
            </CardContent>
          </Card>
        )}

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isActive = step.id === currentStepId;
            const isClickable = onStepClick && (step.status === 'completed' || step.status === 'in_progress');
            
            return (
              <div key={step.id} className="relative">
                <Card 
                  className={`transition-all duration-200 ${getStatusColor(step.status)} ${
                    isActive ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                  } ${isClickable ? 'cursor-pointer hover:shadow-md' : ''}`}
                  onClick={isClickable ? () => onStepClick(step.id) : undefined}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getStatusIcon(step.status, isActive)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            {step.title}
                            {step.optional && (
                              <span className="ml-2 text-xs text-gray-500">(Optional)</span>
                            )}
                          </h3>
                          {showEstimatedTime && step.estimatedTime && step.status === 'not_started' && (
                            <span className="text-xs text-gray-500">{step.estimatedTime}</span>
                          )}
                        </div>
                        
                        {step.description && (
                          <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                        )}
                        
                        {step.status === 'error' && step.errorMessage && (
                          <p className="text-xs text-red-600 mt-1">{step.errorMessage}</p>
                        )}
                        
                        {step.status === 'in_progress' && step.progress !== undefined && (
                          <div className="mt-2">
                            <Progress value={step.progress} className="h-1" />
                            <p className="text-xs text-gray-500 mt-1">{step.progress}% complete</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-full w-0.5 h-3 -translate-x-0.5">
                    <div className={`w-full h-full ${getConnectorColor(step.status, steps[index + 1].status)}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className={`${className}`}>
      {/* Overall Progress */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{completedSteps}/{totalSteps} completed</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      )}

      {/* Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStepId;
          const isClickable = onStepClick && (step.status === 'completed' || step.status === 'in_progress');
          
          return (
            <React.Fragment key={step.id}>
              <div 
                className={`flex flex-col items-center text-center max-w-32 ${
                  isClickable ? 'cursor-pointer' : ''
                }`}
                onClick={isClickable ? () => onStepClick(step.id) : undefined}
              >
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2 transition-all duration-200
                  ${getStatusColor(step.status)}
                  ${isActive ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                  ${isClickable ? 'hover:scale-105' : ''}
                `}>
                  {getStatusIcon(step.status, isActive)}
                </div>
                
                <h3 className="text-xs font-medium text-gray-900 mb-1">
                  {step.title}
                  {step.optional && <span className="text-gray-500"> (Optional)</span>}
                </h3>
                
                {step.description && (
                  <p className="text-xs text-gray-600 mb-1">{step.description}</p>
                )}
                
                {showEstimatedTime && step.estimatedTime && step.status === 'not_started' && (
                  <span className="text-xs text-gray-500">{step.estimatedTime}</span>
                )}
                
                {step.status === 'error' && step.errorMessage && (
                  <p className="text-xs text-red-600">{step.errorMessage}</p>
                )}
                
                {step.status === 'in_progress' && step.progress !== undefined && (
                  <div className="w-full mt-1">
                    <Progress value={step.progress} className="h-1" />
                    <p className="text-xs text-gray-500 mt-1">{step.progress}%</p>
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 -mt-8">
                  <div className={`w-full h-full ${getConnectorColor(step.status, steps[index + 1].status)}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// Loading state component
export const LoadingIndicator: React.FC<{
  message?: string;
  progress?: number;
  className?: string;
}> = ({ message = 'Loading...', progress, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
      <p className="text-sm text-gray-600 mb-2">{message}</p>
      {progress !== undefined && (
        <div className="w-full max-w-xs">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 text-center mt-1">{Math.round(progress)}%</p>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;