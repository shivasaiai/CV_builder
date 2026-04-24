import { useState, useCallback } from 'react';

export interface GuidanceAction {
  label: string;
  handler: () => void;
  primary?: boolean;
}

export interface GuidanceInfo {
  title: string;
  message: string;
  actions?: GuidanceAction[];
}

export interface UserGuidanceResult {
  showGuidance: boolean;
  currentGuidance: GuidanceInfo | null;
  dismissGuidance: () => void;
  requestGuidance: (guidance?: GuidanceInfo) => void;
}

export const useUserGuidance = (): UserGuidanceResult => {
  const [showGuidance, setShowGuidance] = useState(false);
  const [currentGuidance, setCurrentGuidance] = useState<GuidanceInfo | null>(null);

  const dismissGuidance = useCallback(() => {
    setShowGuidance(false);
    setCurrentGuidance(null);
  }, []);

  const requestGuidance = useCallback((guidance?: GuidanceInfo) => {
    if (guidance) {
      setCurrentGuidance(guidance);
      setShowGuidance(true);
    } else {
      // Show default help
      setCurrentGuidance({
        title: 'Need Help?',
        message: 'If you need assistance with any step, please refer to our documentation or contact support.',
        actions: [
          {
            label: 'Got it',
            handler: () => dismissGuidance(),
            primary: true
          }
        ]
      });
      setShowGuidance(true);
    }
  }, [dismissGuidance]);

  return {
    showGuidance,
    currentGuidance,
    dismissGuidance,
    requestGuidance
  };
};

export default useUserGuidance;