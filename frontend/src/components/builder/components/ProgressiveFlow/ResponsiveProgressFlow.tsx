import React, { useState, useEffect } from 'react';
import ProgressFlow from './ProgressFlow';
import { ProgressFlowProps } from './types';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';

interface ResponsiveProgressFlowProps extends ProgressFlowProps {
  variant?: 'sidebar' | 'horizontal' | 'compact';
}

const ResponsiveProgressFlow: React.FC<ResponsiveProgressFlowProps> = ({
  variant = 'sidebar',
  ...props
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Mobile horizontal layout
  if (isMobile || variant === 'horizontal') {
    return (
      <div className="w-full bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Progress</h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {!isCollapsed && (
          <div className="flex items-center space-x-4 overflow-x-auto pb-2">
            {props.sections.map((section, index) => (
              <div key={section.id} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => props.onSectionClick(index)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                    section.status === 'completed'
                      ? 'bg-blue-500 text-white'
                      : index === props.currentSection
                      ? 'bg-blue-500 text-white ring-2 ring-blue-200'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {section.status === 'completed' ? '✓' : index + 1}
                </button>
                
                {index < props.sections.length - 1 && (
                  <div
                    className={`w-8 h-px mx-2 transition-colors duration-300 ${
                      section.status === 'completed'
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {!isCollapsed && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{props.sections[props.currentSection]?.name}</span>
              <span>
                {props.currentSection + 1} of {props.sections.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((props.currentSection + 1) / props.sections.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Compact variant for smaller spaces
  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">
            Step {props.currentSection + 1} of {props.sections.length}
          </h3>
          <div className="flex space-x-1">
            <button
              onClick={() => props.onSectionClick(Math.max(0, props.currentSection - 1))}
              disabled={props.currentSection === 0}
              className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => props.onSectionClick(Math.min(props.sections.length - 1, props.currentSection + 1))}
              disabled={props.currentSection === props.sections.length - 1}
              className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {props.sections.map((section, index) => (
            <div
              key={section.id}
              className={`flex items-center space-x-3 p-2 rounded-md transition-colors duration-200 ${
                index === props.currentSection
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  section.status === 'completed'
                    ? 'bg-blue-500 text-white'
                    : index === props.currentSection
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {section.status === 'completed' ? '✓' : index + 1}
              </div>
              <span
                className={`text-sm ${
                  index === props.currentSection
                    ? 'font-medium text-blue-700'
                    : 'text-gray-700'
                }`}
              >
                {section.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default sidebar layout
  return <ProgressFlow {...props} />;
};

export default ResponsiveProgressFlow;