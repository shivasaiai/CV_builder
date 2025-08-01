import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Palette, 
  Plus, 
  Trash2, 
  Save, 
  Undo2, 
  Redo2, 
  RotateCcw,
  Eye,
  Pipette,
  Sparkles
} from 'lucide-react';

export interface ColorPalette {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  category: 'professional' | 'creative' | 'modern' | 'classic' | 'custom';
  isDefault?: boolean;
  createdAt?: Date;
}

export interface ColorHistory {
  id: string;
  palette: ColorPalette;
  timestamp: Date;
  action: 'create' | 'modify' | 'delete' | 'apply';
}

interface ColorPaletteManagerProps {
  currentPalette: ColorPalette;
  onPaletteChange: (palette: ColorPalette) => void;
  onPreview?: (palette: ColorPalette) => void;
  className?: string;
  showHistory?: boolean;
  showPresets?: boolean;
  allowCustomPalettes?: boolean;
}

const DEFAULT_PALETTES: ColorPalette[] = [
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    colors: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#60a5fa',
      text: '#1f2937',
      background: '#ffffff'
    },
    category: 'professional',
    isDefault: true
  },
  {
    id: 'corporate-green',
    name: 'Corporate Green',
    colors: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#34d399',
      text: '#1f2937',
      background: '#ffffff'
    },
    category: 'professional'
  },
  {
    id: 'executive-purple',
    name: 'Executive Purple',
    colors: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#a78bfa',
      text: '#1f2937',
      background: '#ffffff'
    },
    category: 'professional'
  },
  {
    id: 'modern-teal',
    name: 'Modern Teal',
    colors: {
      primary: '#0891b2',
      secondary: '#06b6d4',
      accent: '#22d3ee',
      text: '#1f2937',
      background: '#ffffff'
    },
    category: 'modern'
  },
  {
    id: 'creative-orange',
    name: 'Creative Orange',
    colors: {
      primary: '#ea580c',
      secondary: '#f97316',
      accent: '#fb923c',
      text: '#1f2937',
      background: '#ffffff'
    },
    category: 'creative'
  },
  {
    id: 'elegant-rose',
    name: 'Elegant Rose',
    colors: {
      primary: '#be123c',
      secondary: '#e11d48',
      accent: '#f43f5e',
      text: '#1f2937',
      background: '#ffffff'
    },
    category: 'creative'
  },
  {
    id: 'classic-charcoal',
    name: 'Classic Charcoal',
    colors: {
      primary: '#1f2937',
      secondary: '#374151',
      accent: '#6b7280',
      text: '#111827',
      background: '#ffffff'
    },
    category: 'classic'
  },
  {
    id: 'warm-brown',
    name: 'Warm Brown',
    colors: {
      primary: '#7c2d12',
      secondary: '#9a3412',
      accent: '#c2410c',
      text: '#1f2937',
      background: '#ffffff'
    },
    category: 'classic'
  }
];

export const ColorPaletteManager: React.FC<ColorPaletteManagerProps> = ({
  currentPalette,
  onPaletteChange,
  onPreview,
  className,
  showHistory = true,
  showPresets = true,
  allowCustomPalettes = true
}) => {
  const [availablePalettes, setAvailablePalettes] = useState<ColorPalette[]>(DEFAULT_PALETTES);
  const [colorHistory, setColorHistory] = useState<ColorHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customPaletteName, setCustomPaletteName] = useState('');
  const [previewPalette, setPreviewPalette] = useState<ColorPalette | null>(null);

  const categories = useMemo(() => [
    { id: 'all', name: 'All Palettes', count: availablePalettes.length },
    { id: 'professional', name: 'Professional', count: availablePalettes.filter(p => p.category === 'professional').length },
    { id: 'modern', name: 'Modern', count: availablePalettes.filter(p => p.category === 'modern').length },
    { id: 'creative', name: 'Creative', count: availablePalettes.filter(p => p.category === 'creative').length },
    { id: 'classic', name: 'Classic', count: availablePalettes.filter(p => p.category === 'classic').length },
    { id: 'custom', name: 'Custom', count: availablePalettes.filter(p => p.category === 'custom').length }
  ], [availablePalettes]);

  const filteredPalettes = useMemo(() => {
    return selectedCategory === 'all' 
      ? availablePalettes 
      : availablePalettes.filter(p => p.category === selectedCategory);
  }, [availablePalettes, selectedCategory]);

  const addToHistory = useCallback((palette: ColorPalette, action: ColorHistory['action']) => {
    const historyEntry: ColorHistory = {
      id: `${Date.now()}-${Math.random()}`,
      palette: { ...palette },
      timestamp: new Date(),
      action
    };

    setColorHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(historyEntry);
      return newHistory.slice(-20); // Keep last 20 entries
    });
    
    setHistoryIndex(prev => Math.min(prev + 1, 19));
  }, [historyIndex]);

  const handlePaletteSelect = useCallback((palette: ColorPalette) => {
    onPaletteChange(palette);
    addToHistory(palette, 'apply');
  }, [onPaletteChange, addToHistory]);

  const handlePreview = useCallback((palette: ColorPalette) => {
    setPreviewPalette(palette);
    onPreview?.(palette);
  }, [onPreview]);

  const handleStopPreview = useCallback(() => {
    setPreviewPalette(null);
    onPreview?.(currentPalette);
  }, [onPreview, currentPalette]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const previousEntry = colorHistory[historyIndex - 1];
      setHistoryIndex(prev => prev - 1);
      onPaletteChange(previousEntry.palette);
    }
  }, [historyIndex, colorHistory, onPaletteChange]);

  const handleRedo = useCallback(() => {
    if (historyIndex < colorHistory.length - 1) {
      const nextEntry = colorHistory[historyIndex + 1];
      setHistoryIndex(prev => prev + 1);
      onPaletteChange(nextEntry.palette);
    }
  }, [historyIndex, colorHistory, onPaletteChange]);

  const handleCreateCustomPalette = useCallback(() => {
    if (!customPaletteName.trim()) return;

    const newPalette: ColorPalette = {
      id: `custom-${Date.now()}`,
      name: customPaletteName,
      colors: { ...currentPalette.colors },
      category: 'custom',
      createdAt: new Date()
    };

    setAvailablePalettes(prev => [...prev, newPalette]);
    addToHistory(newPalette, 'create');
    setIsCreatingCustom(false);
    setCustomPaletteName('');
    onPaletteChange(newPalette);
  }, [customPaletteName, currentPalette.colors, addToHistory, onPaletteChange]);

  const handleDeleteCustomPalette = useCallback((paletteId: string) => {
    const palette = availablePalettes.find(p => p.id === paletteId);
    if (palette && palette.category === 'custom') {
      setAvailablePalettes(prev => prev.filter(p => p.id !== paletteId));
      addToHistory(palette, 'delete');
      
      // If deleted palette was current, switch to default
      if (currentPalette.id === paletteId) {
        const defaultPalette = availablePalettes.find(p => p.isDefault) || availablePalettes[0];
        onPaletteChange(defaultPalette);
      }
    }
  }, [availablePalettes, currentPalette.id, addToHistory, onPaletteChange]);

  const getCategoryColor = (category: ColorPalette['category']) => {
    const colors = {
      professional: 'bg-blue-100 text-blue-800',
      modern: 'bg-green-100 text-green-800',
      creative: 'bg-orange-100 text-orange-800',
      classic: 'bg-gray-100 text-gray-800',
      custom: 'bg-purple-100 text-purple-800'
    };
    return colors[category];
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Color Palettes</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* History Controls */}
          {showHistory && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="gap-1"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={historyIndex >= colorHistory.length - 1}
                className="gap-1"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Create Custom Palette */}
          {allowCustomPalettes && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreatingCustom(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create
            </Button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      {showPresets && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="gap-2"
            >
              {category.name}
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      )}

      {/* Custom Palette Creation */}
      {isCreatingCustom && (
        <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
          <h4 className="font-medium text-sm">Create Custom Palette</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Palette name..."
              value={customPaletteName}
              onChange={(e) => setCustomPaletteName(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleCreateCustomPalette}
              disabled={!customPaletteName.trim()}
              size="sm"
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreatingCustom(false);
                setCustomPaletteName('');
              }}
              size="sm"
            >
              Cancel
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This will save your current color settings as a new palette
          </p>
        </div>
      )}

      {/* Palette Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPalettes.map((palette) => (
          <PaletteCard
            key={palette.id}
            palette={palette}
            isSelected={currentPalette.id === palette.id}
            isPreview={previewPalette?.id === palette.id}
            onSelect={() => handlePaletteSelect(palette)}
            onPreview={() => handlePreview(palette)}
            onStopPreview={handleStopPreview}
            onDelete={palette.category === 'custom' ? () => handleDeleteCustomPalette(palette.id) : undefined}
            getCategoryColor={getCategoryColor}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredPalettes.length === 0 && (
        <div className="text-center py-8">
          <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No palettes found</h4>
          <p className="text-gray-500 mb-4">
            {selectedCategory === 'custom' 
              ? 'Create your first custom palette'
              : 'Try selecting a different category'
            }
          </p>
          {selectedCategory === 'custom' && allowCustomPalettes && (
            <Button onClick={() => setIsCreatingCustom(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Custom Palette
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

interface PaletteCardProps {
  palette: ColorPalette;
  isSelected: boolean;
  isPreview: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onStopPreview: () => void;
  onDelete?: () => void;
  getCategoryColor: (category: ColorPalette['category']) => string;
}

const PaletteCard: React.FC<PaletteCardProps> = ({
  palette,
  isSelected,
  isPreview,
  onSelect,
  onPreview,
  onStopPreview,
  onDelete,
  getCategoryColor
}) => {
  return (
    <div className={cn(
      'group relative p-4 rounded-lg border transition-all duration-300 cursor-pointer',
      'hover:shadow-md hover:border-primary/50',
      isSelected 
        ? 'border-primary bg-primary/5 shadow-md' 
        : 'border-gray-200 bg-white',
      isPreview && 'ring-2 ring-blue-300'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm truncate">{palette.name}</h4>
          {palette.isDefault && (
            <Sparkles className="w-3 h-3 text-yellow-500" />
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Badge className={cn('text-xs', getCategoryColor(palette.category))}>
            {palette.category}
          </Badge>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
            >
              <Trash2 className="w-3 h-3 text-red-500" />
            </Button>
          )}
        </div>
      </div>

      {/* Color Preview */}
      <div className="grid grid-cols-5 gap-1 mb-3">
        {Object.entries(palette.colors).map(([key, color]) => (
          <div
            key={key}
            className="aspect-square rounded border border-white/50 shadow-sm"
            style={{ backgroundColor: color }}
            title={`${key}: ${color}`}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={onSelect}
          size="sm"
          variant={isSelected ? 'default' : 'outline'}
          className="flex-1 text-xs"
        >
          {isSelected ? 'Selected' : 'Select'}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onMouseEnter={onPreview}
          onMouseLeave={onStopPreview}
          className="gap-1 text-xs"
        >
          <Eye className="w-3 h-3" />
          Preview
        </Button>
      </div>

      {/* Preview Indicator */}
      {isPreview && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
      )}
    </div>
  );
};

export default ColorPaletteManager;