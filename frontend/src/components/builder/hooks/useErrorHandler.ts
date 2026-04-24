import { useCallback, useState } from 'react';

export interface ErrorInfo {
  type: string;
  message: string;
  details?: any;
  timestamp?: number;
}

export interface ErrorHandlerResult {
  errors: ErrorInfo[];
  handleError: (error: ErrorInfo) => void;
  clearErrors: () => void;
  clearError: (index: number) => void;
}

export const useErrorHandler = (): ErrorHandlerResult => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const handleError = useCallback((error: ErrorInfo) => {
    const errorWithTimestamp = {
      ...error,
      timestamp: Date.now()
    };
    
    console.error('Error handled:', errorWithTimestamp);
    
    setErrors(prev => [...prev, errorWithTimestamp]);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearError = useCallback((index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    errors,
    handleError,
    clearErrors,
    clearError
  };
};

export default useErrorHandler;