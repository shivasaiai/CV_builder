import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  error: {
    type: string;
    message: string;
    details?: any;
  };
  className?: string;
  onDismiss?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, className = '', onDismiss }) => {
  const getErrorColor = (type: string) => {
    switch (type) {
      case 'validation':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'import':
      case 'parsing':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'template_compatibility':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'validation':
        return 'text-yellow-500';
      case 'import':
      case 'parsing':
        return 'text-red-500';
      case 'template_compatibility':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`border rounded-lg p-3 animate-slideInFromLeft ${getErrorColor(error.type)} ${className}`}>
      <div className="flex items-start">
        <AlertCircle className={`w-5 h-5 mt-0.5 mr-3 ${getIconColor(error.type)} animate-pulse`} />
        <div className="flex-1">
          <p className="text-sm font-medium">{error.message}</p>
          {error.details && (
            <div className="mt-1 text-xs opacity-75 animate-fadeInUp">
              {Array.isArray(error.details) ? (
                <ul className="list-disc list-inside">
                  {error.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              ) : (
                <p>{error.details}</p>
              )}
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 p-1 hover:bg-black hover:bg-opacity-10 rounded transition-all duration-200 hover:scale-110"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;