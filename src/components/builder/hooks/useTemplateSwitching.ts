import { useState, useCallback, useRef } from 'react';
import { ResumeData, TemplateColors } from '../types';
import { TemplateSwitchingService, TemplateSwitchResult, TemplateSwitchOptions } from '../services/TemplateSwitchingService';

export interface TemplateSwitchingState {
  isLoading: boolean;
  currentTemplate: string;
  previousTemplate?: string;
  switchInProgress: boolean;
  lastSwitchResult?: TemplateSwitchResult;
  transitionAnimation: boolean;
}

export interface TemplateSwitchingActions {
  switchTemplate: (newTemplate: string, options?: Partial<TemplateSwitchOptions>) => Promise<TemplateSwitchResult>;
  validateSwitch: (newTemplate: string) => Promise<{ canSwitch: boolean; warnings: string[]; recommendations: string[] }>;
  cancelSwitch: () => void;
  clearSwitchResult: () => void;
  enableTransitionAnimation: (enabled: boolean) => void;
}

export interface UseTemplateSwitchingOptions {
  initialTemplate: string;
  resumeData: ResumeData;
  templateColors: TemplateColors;
  onTemplateChange: (template: string) => void;
  onDataChange: (data: ResumeData) => void;
  onError?: (error: string) => void;
  onSuccess?: (result: TemplateSwitchResult) => void;
  defaultSwitchOptions?: Partial<TemplateSwitchOptions>;
}

export const useTemplateSwitching = (options: UseTemplateSwitchingOptions) => {
  const {
    initialTemplate,
    resumeData,
    templateColors,
    onTemplateChange,
    onDataChange,
    onError,
    onSuccess,
    defaultSwitchOptions = {}
  } = options;

  const [state, setState] = useState<TemplateSwitchingState>({
    isLoading: false,
    currentTemplate: initialTemplate,
    switchInProgress: false,
    transitionAnimation: true
  });

  const switchTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const switchTemplate = useCallback(async (
    newTemplate: string,
    switchOptions: Partial<TemplateSwitchOptions> = {}
  ): Promise<TemplateSwitchResult> => {
    // Cancel any ongoing switch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setState(prev => ({
      ...prev,
      isLoading: true,
      switchInProgress: true,
      previousTemplate: prev.currentTemplate
    }));

    try {
      // Validate the switch first
      const validation = await TemplateSwitchingService.validateTemplateSwitch(
        state.currentTemplate,
        newTemplate,
        resumeData
      );

      if (!validation.canSwitch) {
        throw new Error(validation.warnings[0] || 'Cannot switch to this template');
      }

      // Check if operation was aborted
      if (signal.aborted) {
        throw new Error('Template switch was cancelled');
      }

      // Add transition delay if animation is enabled
      if (state.transitionAnimation) {
        await new Promise(resolve => {
          switchTimeoutRef.current = setTimeout(resolve, 150);
        });
      }

      // Check if operation was aborted during delay
      if (signal.aborted) {
        throw new Error('Template switch was cancelled');
      }

      // Perform the actual template switch
      const mergedOptions = { ...defaultSwitchOptions, ...switchOptions };
      const result = await TemplateSwitchingService.switchTemplate(
        state.currentTemplate,
        newTemplate,
        resumeData,
        templateColors,
        mergedOptions
      );

      if (!result.success) {
        throw new Error(result.errors[0] || 'Template switch failed');
      }

      // Check if operation was aborted after switch
      if (signal.aborted) {
        throw new Error('Template switch was cancelled');
      }

      // Update state and notify parent components
      setState(prev => ({
        ...prev,
        isLoading: false,
        switchInProgress: false,
        currentTemplate: newTemplate,
        lastSwitchResult: result
      }));

      // Update parent state
      onTemplateChange(newTemplate);
      onDataChange(result.preservedData);
      onSuccess?.(result);

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        switchInProgress: false,
        lastSwitchResult: {
          success: false,
          preservedData: resumeData,
          warnings: [],
          errors: [errorMessage],
          migrationNotes: []
        }
      }));

      onError?.(errorMessage);
      
      return {
        success: false,
        preservedData: resumeData,
        warnings: [],
        errors: [errorMessage],
        migrationNotes: []
      };
    }
  }, [
    state.currentTemplate,
    state.transitionAnimation,
    resumeData,
    templateColors,
    onTemplateChange,
    onDataChange,
    onError,
    onSuccess,
    defaultSwitchOptions
  ]);

  const validateSwitch = useCallback(async (newTemplate: string) => {
    return await TemplateSwitchingService.validateTemplateSwitch(
      state.currentTemplate,
      newTemplate,
      resumeData
    );
  }, [state.currentTemplate, resumeData]);

  const cancelSwitch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (switchTimeoutRef.current) {
      clearTimeout(switchTimeoutRef.current);
    }

    setState(prev => ({
      ...prev,
      isLoading: false,
      switchInProgress: false
    }));
  }, []);

  const clearSwitchResult = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastSwitchResult: undefined
    }));
  }, []);

  const enableTransitionAnimation = useCallback((enabled: boolean) => {
    setState(prev => ({
      ...prev,
      transitionAnimation: enabled
    }));
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (switchTimeoutRef.current) {
      clearTimeout(switchTimeoutRef.current);
    }
  }, []);

  // Update current template when external template changes
  const updateCurrentTemplate = useCallback((template: string) => {
    setState(prev => ({
      ...prev,
      currentTemplate: template
    }));
  }, []);

  const actions: TemplateSwitchingActions = {
    switchTemplate,
    validateSwitch,
    cancelSwitch,
    clearSwitchResult,
    enableTransitionAnimation
  };

  return {
    state,
    actions,
    updateCurrentTemplate,
    cleanup
  };
};

export default useTemplateSwitching;