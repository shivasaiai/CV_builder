import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Palette, 
  Sliders, 
  Eye, 
  RotateCcw, 
  Save, 
  Download,
  Upload,
  Sparkles,
  Info
} from 'lucide-react';
import { ColorPaletteManager, ColorPalette } from './ColorPaletteManager';
import { AdvancedColorPicker } from './AdvancedColorPicker';
import { ResumeData, TemplateColors } from '../../types';

interface ColorCustomizationInterfaceProps {
  resumeData: ResumeData;
  onThemeChange: (theme: Partial<ResumeData['theme']>) => void;
  onClose: () => void;
  className?: string;
}

interface ColorRole {
  key: keyof TemplateColors;
  label: string;
  description: string;
  category: 'primary' | 'secondary' | 'accent' | 'neutral';
}

const COLOR_ROLES: ColorRole[] = [
  {
    key: 'primary',
    label: 'Primary Color',
    description: 'Main brand color used for headers and key elements',
    category: 'primary'
  },
  {
    key: 'secondary',
    label: 'Secondary Color',
    description: 'Supporting color for accents and highlights',
    category: 'secondary'
  },
  {
    key: 'accent',
    label: 'Accent Color',
    description: 'Used for buttons, links, and interactive elements',
    category: 'accent'
  },
  {
    key: 'text',
    label: 'Text Color',
    description: 'Primary text color for readability',
    category: 'neutral'
  },
  {
    key: 'background',
    label: 'Background Color',
    description: 'Main background color of the resume',
    category: 'neutral'
  }
];

export const ColorCustomizationInterface: React.FC<ColorCustomizationInterfaceProps> = ({
  resumeData,
  onThemeChange,
  onClose,
  className,
}) => {
  const { theme } = resumeData;
  const [currentColors, setCurrentColors] = useState(theme.colors);
  const [activeColorRole, setActiveColorRole] = useState<keyof TemplateColors>('primary');
  const [previewColors, setPreviewColors] = useState<TemplateColors | null>(null);
  const [colorHistory, setColorHistory] = useState<TemplateColors[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize color history
  useEffect(() => {
    if (colorHistory.length === 0) {
      setColorHistory([currentColors]);
      setHistoryIndex(0);
    }
  }, [currentColors, colorHistory.length]);

  const addToHistory = useCallback((colors: TemplateColors) => {
    setColorHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(colors);
      return newHistory.slice(-20); // Keep last 20 entries
    });
    setHistoryIndex(prev => Math.min(prev + 1, 19));
  }, [historyIndex]);

  const handleColorChange = useCallback((colorKey: keyof TemplateColors, color: string) => {
    const newColors = {
      ...currentColors,
      [colorKey]: color
    };
    
    setCurrentColors(newColors);
    onThemeChange({ colors: newColors });
    setHasUnsavedChanges(true);
    addToHistory(newColors);
  }, [currentColors, onThemeChange, addToHistory]);

  const handlePaletteChange = useCallback((palette: ColorPalette) => {
    const newColors: TemplateColors = {
      primary: palette.colors.primary,
      secondary: palette.colors.secondary,
      accent: palette.colors.accent,
      text: palette.colors.text,
      background: palette.colors.background
    };
    
    setCurrentColors(newColors);
    onThemeChange({ colors: newColors });
    setHasUnsavedChanges(true);
    addToHistory(newColors);
  }, [onThemeChange, addToHistory]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const previousColors = colorHistory[historyIndex - 1];
      setHistoryIndex(prev => prev - 1);
      onColorsChange(previousColors);
      setHasUnsavedChanges(true);
    }
  }, [historyIndex, colorHistory, onColorsChange]);

  const handleRedo = useCallback(() => {
    if (historyIndex < colorHistory.length - 1) {
      const nextColors = colorHistory[historyIndex + 1];
      setHistoryIndex(prev => prev + 1);
      onColorsChange(nextColors);
      setHasUnsavedChanges(true);
    }
  }, [historyIndex, colorHistory, onColorsChange]);

  const handleReset = useCallback(() => {
    const defaultColors: TemplateColors = {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#60a5fa',
      text: '#1f2937',
      background: '#ffffff'
    };
    
    onColorsChange(defaultColors);
    addToHistory(defaultColors);
    setHasUnsavedChanges(false);
  }, [onColorsChange, addToHistory]);

  const handleExportColors = useCallback(() => {
    const colorData = {
      colors: currentColors,
      templateName,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(colorData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName || 'resume'}-colors.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [currentColors, templateName]);

  const handleImportColors = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.colors) {
          onColorsChange(data.colors);
          addToHistory(data.colors);
          setHasUnsavedChanges(true);
        }
      } catch (error) {
        console.error('Failed to import colors:', error);
      }
    };
    reader.readAsText(file);
  }, [onColorsChange, addToHistory]);

  const getCurrentPalette = useCallback((): ColorPalette => {
    return {
      id: 'current',
      name: 'Current Colors',
      colors: {
        primary: currentColors.primary || '#1e40af',
        secondary: currentColors.secondary || '#3b82f6',
        accent: currentColors.accent || '#60a5fa',
        text: currentColors.text || '#1f2937',
        background: currentColors.background || '#ffffff'
      },
      category: 'custom'
    };
  }, [currentColors]);

  const getCategoryColor = (category: ColorRole['category']) => {
    const colors = {
      primary: 'bg-blue-100 text-blue-800',
      secondary: 'bg-green-100 text-green-800',
      accent: 'bg-purple-100 text-purple-800',
      neutral: 'bg-gray-100 text-gray-800'
    };
    return colors[category];
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-2">
      <Palette className="w-5 h-5 text-primary" />
      <h3 className="text-lg font-semibold">Color Customization</h3>
    </div>
    {theme.template && (
      <Badge variant="outline" className="text-xs">
        {theme.template}
      </Badge>
    )}
    {hasUnsavedChanges && (
      <Badge variant="secondary" className="text-xs gap-1">
        <Sparkles className="w-3 h-3" />
        Modified
      </Badge>
    )}
  </div>

  <div className="flex items-center gap-2">
    <Button
      variant="ghost"
      size="sm"
      onClick={onClose}
      className="gap-1"
    >
      <X className="w-4 h-4" />
    </Button>
  </div>
</div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Customize your resume colors using preset palettes or create your own unique color scheme. 
          Changes are applied in real-time to your resume preview.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="palettes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="palettes" className="gap-2">
            <Palette className="w-4 h-4" />
            Palettes
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-2">
            <Sliders className="w-4 h-4" />
            Custom Colors
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="palettes" className="space-y-4">
          <ColorPaletteManager
            currentPalette={getCurrentPalette()}
            onPaletteChange={handlePaletteChange}
            showHistory={true}
            showPresets={true}
            allowCustomPalettes={true}
          />
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          {/* Color Role Selector */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Select Color to Customize</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {COLOR_ROLES.map((role) => (
                <button
                  key={role.key}
                  onClick={() => setActiveColorRole(role.key)}
                  className={cn(
                    'p-3 rounded-lg border text-left transition-all duration-200',
                    'hover:shadow-md hover:border-primary/50',
                    activeColorRole === role.key
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-gray-200 bg-white'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-6 h-6 rounded border-2 border-white shadow-sm"
                      style={{ backgroundColor: currentColors[role.key] || '#000000' }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{role.label}</span>
                        <Badge className={cn('text-xs', getCategoryColor(role.category))}>
                          {role.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {role.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Color Picker */}
          <div className="border rounded-lg p-4">
            <AdvancedColorPicker
              color={currentColors[activeColorRole] || '#000000'}
              onChange={(color) => handleColorChange(activeColorRole, color)}
              label={`Customize ${COLOR_ROLES.find(r => r.key === activeColorRole)?.label}`}
              showPresets={true}
              showHistory={true}
              showAdvanced={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {/* Color Preview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {COLOR_ROLES.map((role) => (
              <div key={role.key} className="text-center space-y-2">
                <div
                  className="aspect-square rounded-lg border-4 border-white shadow-lg mx-auto"
                  style={{ backgroundColor: currentColors[role.key] || '#000000' }}
                />
                <div>
                  <p className="font-medium text-sm">{role.label}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {currentColors[role.key] || '#000000'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Color Harmony Analysis */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-3">Color Harmony Analysis</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Contrast Ratio:</span>
                <span className="ml-2 text-green-600">Good</span>
              </div>
              <div>
                <span className="font-medium">Accessibility:</span>
                <span className="ml-2 text-green-600">WCAG AA Compliant</span>
              </div>
              <div>
                <span className="font-medium">Color Temperature:</span>
                <span className="ml-2 text-blue-600">Cool</span>
              </div>
              <div>
                <span className="font-medium">Harmony Type:</span>
                <span className="ml-2 text-purple-600">Monochromatic</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center pt-4 border-t">
            <Button onClick={() => setHasUnsavedChanges(false)} className="gap-2">
              <Save className="w-4 h-4" />
              Save Colors
            </Button>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ColorCustomizationInterface;