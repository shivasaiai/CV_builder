import React from 'react';
import { Loader2, FileText, Palette } from 'lucide-react';

interface PreviewLoadingStateProps {
  type?: 'template' | 'data' | 'general';
  message?: string;
  progress?: number;
  templateName?: string;
  showProgress?: boolean;
}

const PreviewLoadingState: React.FC<PreviewLoadingStateProps> = ({
  type = 'general',
  message,
  progress,
  templateName,
  showProgress = false
}) => {
  const getLoadingContent = () => {
    switch (type) {
      case 'template':
        return {
          icon: <Palette className="h-8 w-8 text-blue-500" />,
          title: 'Loading Template',
          description: templateName ? `Switching to ${templateName}...` : 'Loading template...',
          color: 'blue'
        };
      
      case 'data':
        return {
          icon: <FileText className="h-8 w-8 text-green-500" />,
          title: 'Updating Preview',
          description: 'Processing your changes...',
          color: 'green'
        };
      
      default:
        return {
          icon: <Loader2 className="h-8 w-8 text-gray-500 animate-spin" />,
          title: 'Loading',
          description: message || 'Please wait...',
          color: 'gray'
        };
    }
  };

  const content = getLoadingContent();

  return (
    <div className="flex items-center justify-center h-full bg-white border-2 border-dashed border-gray-200 rounded-lg">
      <div className="text-center p-8">
        <div className="mb-4 flex justify-center">
          {content.icon}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {content.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          {content.description}
        </p>

        {showProgress && typeof progress === 'number' && (
          <div className="w-full max-w-xs mx-auto">
            <div className="bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`bg-${content.color}-500 h-2 rounded-full transition-all duration-300 ease-out`}
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {Math.round(progress)}% complete
            </p>
          </div>
        )}

        {type === 'template' && (
          <div className="mt-4">
            <div className="flex justify-center space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full bg-blue-500 animate-pulse`}
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {type === 'data' && (
          <div className="mt-4 text-xs text-gray-400">
            Optimizing for best performance...
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewLoadingState;