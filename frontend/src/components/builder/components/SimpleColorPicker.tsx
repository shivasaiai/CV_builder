import React, { useState } from 'react';
import { ResumeData, TemplateColors } from '../types';

interface SimpleColorPickerProps {
  resumeData: ResumeData;
  onThemeChange: (theme: Partial<ResumeData['theme']>) => void;
  onClose: () => void;
  className?: string;
}

const predefinedColors = [
  { name: 'Blue Professional', primary: '#1e40af', secondary: '#3b82f6', accent: '#60a5fa' },
  { name: 'Green Modern', primary: '#059669', secondary: '#10b981', accent: '#34d399' },
  { name: 'Purple Creative', primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' },
  { name: 'Red Dynamic', primary: '#dc2626', secondary: '#ef4444', accent: '#f87171' },
  { name: 'Orange Energy', primary: '#ea580c', secondary: '#f97316', accent: '#fb923c' },
  { name: 'Teal Fresh', primary: '#0d9488', secondary: '#14b8a6', accent: '#5eead4' },
  { name: 'Indigo Classic', primary: '#4338ca', secondary: '#6366f1', accent: '#818cf8' },
  { name: 'Pink Vibrant', primary: '#db2777', secondary: '#ec4899', accent: '#f472b6' },
  { name: 'Gray Minimal', primary: '#374151', secondary: '#6b7280', accent: '#9ca3af' },
  { name: 'Emerald Clean', primary: '#047857', secondary: '#059669', accent: '#6ee7b7' },
  { name: 'Cyan Cool', primary: '#0891b2', secondary: '#06b6d4', accent: '#67e8f9' },
  { name: 'Rose Elegant', primary: '#be185d', secondary: '#e11d48', accent: '#fb7185' }
];

const SimpleColorPicker: React.FC<SimpleColorPickerProps> = ({
  resumeData,
  onThemeChange,
  onClose,
  className
}) => {
  const [selectedColor, setSelectedColor] = useState<typeof predefinedColors[0] | null>(null);

  const handleColorSelect = (colorScheme: typeof predefinedColors[0]) => {
    console.log('Color scheme selected:', colorScheme.name);
    setSelectedColor(colorScheme);
    
    const newColors: TemplateColors = {
      primary: colorScheme.primary,
      secondary: colorScheme.secondary,
      accent: colorScheme.accent,
      text: '#1f2937',
      background: '#ffffff'
    };

    onThemeChange({ colors: newColors });
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-gray-700">Choose Color Theme</div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg"
        >
          ×
        </button>
      </div>
      
      {/* Color Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {predefinedColors.map((colorScheme, index) => (
          <button
            key={index}
            onClick={() => handleColorSelect(colorScheme)}
            className={`group relative p-2 rounded-md transition-all hover:ring-2 hover:ring-blue-400 ${
              selectedColor === colorScheme ? 'ring-2 ring-blue-500' : ''
            }`}
            title={colorScheme.name}
          >
            {/* Color Preview */}
            <div className="flex flex-col space-y-1">
              <div 
                className="h-4 w-full rounded-sm" 
                style={{ backgroundColor: colorScheme.primary }}
              />
              <div className="flex space-x-1">
                <div 
                  className="h-2 w-1/2 rounded-sm" 
                  style={{ backgroundColor: colorScheme.secondary }}
                />
                <div 
                  className="h-2 w-1/2 rounded-sm" 
                  style={{ backgroundColor: colorScheme.accent }}
                />
              </div>
            </div>
            
            {/* Color Name */}
            <div className="text-xs text-gray-400 mt-1 truncate group-hover:text-gray-300">
              {colorScheme.name.split(' ')[0]}
            </div>
          </button>
        ))}
      </div>

      {/* Custom Color Input */}
      <div className="mb-4">
        <div className="text-xs text-gray-600 mb-2">Custom Primary Color</div>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            onChange={(e) => {
              const customColor = e.target.value;
              const newColors: TemplateColors = {
                primary: customColor,
                secondary: customColor + '80', // Add opacity
                accent: customColor + '60',
                text: '#1f2937',
                background: '#ffffff'
              };
              onThemeChange({ colors: newColors });
            }}
          />
          <span className="text-xs text-gray-600">Pick custom color</span>
        </div>
      </div>

      {/* Selected Theme Info */}
      {selectedColor && (
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
          Selected: {selectedColor.name}
        </div>
      )}
    </div>
  );
};

export default SimpleColorPicker;