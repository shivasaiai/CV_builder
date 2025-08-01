import React, { useEffect, useState } from 'react';
import { Check, Star, Sparkles } from 'lucide-react';

interface CompletionCelebrationProps {
  isVisible: boolean;
  sectionName: string;
  onComplete?: () => void;
  variant?: 'subtle' | 'celebration' | 'milestone';
}

const CompletionCelebration: React.FC<CompletionCelebrationProps> = ({
  isVisible,
  sectionName,
  onComplete,
  variant = 'subtle'
}) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowAnimation(true);
      const timer = setTimeout(() => {
        setShowAnimation(false);
        onComplete?.();
      }, variant === 'celebration' ? 2000 : 1000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete, variant]);

  if (!showAnimation) return null;

  const renderSubtle = () => (
    <div className="fixed top-4 right-4 z-50 animate-slideInFromRight">
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-800">
              {sectionName} completed!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCelebration = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="animate-bounceIn">
        <div className="bg-white rounded-full p-8 shadow-2xl border-4 border-blue-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-completionCelebration">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Great Job!
            </h3>
            <p className="text-gray-600">
              {sectionName} section completed
            </p>
          </div>
        </div>
      </div>
      
      {/* Confetti effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          >
            <Star 
              className="w-4 h-4 text-yellow-400" 
              style={{
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderMilestone = () => (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-fadeInUp">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 shadow-2xl text-white text-center">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 mr-2" />
          <h3 className="text-2xl font-bold">Milestone Reached!</h3>
          <Sparkles className="w-8 h-8 ml-2" />
        </div>
        <p className="text-lg opacity-90">
          {sectionName} section completed
        </p>
        <div className="mt-4 flex justify-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className="w-5 h-5 text-yellow-300 fill-current animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case 'celebration':
      return renderCelebration();
    case 'milestone':
      return renderMilestone();
    default:
      return renderSubtle();
  }
};

export default CompletionCelebration;