import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Pipette, 
  Palette, 
  Hash, 
  RotateCcw, 
  Copy, 
  Check,
  Sliders,
  Zap
} from 'lucide-react';

interface ColorValue {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
}

interface AdvancedColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onPreview?: (color: string) => void;
  className?: string;
  showPresets?: boolean;
  showHistory?: boolean;
  showAdvanced?: boolean;
  presetColors?: string[];
  label?: string;
}

const DEFAULT_PRESETS = [
  '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd',
  '#059669', '#10b981', '#34d399', '#6ee7b7',
  '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd',
  '#dc2626', '#ef4444', '#f87171', '#fca5a5',
  '#ea580c', '#f97316', '#fb923c', '#fdba74',
  '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9',
  '#be123c', '#e11d48', '#f43f5e', '#fb7185',
  '#1f2937', '#374151', '#6b7280', '#9ca3af'
];

export const AdvancedColorPicker: React.FC<AdvancedColorPickerProps> = ({
  color,
  onChange,
  onPreview,
  className,
  showPresets = true,
  showHistory = true,
  showAdvanced = true,
  presetColors = DEFAULT_PRESETS,
  label
}) => {
  const [currentColor, setCurrentColor] = useState<ColorValue>(parseColor(color));
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [isPickingFromScreen, setIsPickingFromScreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hueCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setCurrentColor(parseColor(color));
  }, [color]);

  useEffect(() => {
    drawColorPicker();
    drawHuePicker();
  }, [currentColor.hsl.h]);

  const parseColor = useCallback((colorStr: string): ColorValue => {
    const hex = colorStr.startsWith('#') ? colorStr : `#${colorStr}`;
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    
    return { hex, rgb, hsl, hsv };
  }, []);

  const drawColorPicker = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    
    // Create saturation-lightness gradient
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const saturation = x / width;
        const lightness = 1 - (y / height);
        
        const rgb = hslToRgb(currentColor.hsl.h, saturation, lightness);
        const index = (y * width + x) * 4;
        
        data[index] = rgb.r;
        data[index + 1] = rgb.g;
        data[index + 2] = rgb.b;
        data[index + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [currentColor.hsl.h]);

  const drawHuePicker = useCallback(() => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    
    for (let i = 0; i <= 360; i += 60) {
      const rgb = hslToRgb(i, 1, 0.5);
      gradient.addColorStop(i / 360, `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }, []);

  const handleColorPickerClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const saturation = x / canvas.width;
    const lightness = 1 - (y / canvas.height);
    
    const newColor = {
      ...currentColor,
      hsl: { ...currentColor.hsl, s: saturation, l: lightness }
    };
    
    const rgb = hslToRgb(newColor.hsl.h, newColor.hsl.s, newColor.hsl.l);
    newColor.rgb = rgb;
    newColor.hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    newColor.hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    
    setCurrentColor(newColor);
    onChange(newColor.hex);
    onPreview?.(newColor.hex);
  }, [currentColor, onChange, onPreview]);

  const handleHuePickerClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const hue = (x / canvas.width) * 360;
    
    const newColor = {
      ...currentColor,
      hsl: { ...currentColor.hsl, h: hue }
    };
    
    const rgb = hslToRgb(newColor.hsl.h, newColor.hsl.s, newColor.hsl.l);
    newColor.rgb = rgb;
    newColor.hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    newColor.hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    
    setCurrentColor(newColor);
    onChange(newColor.hex);
    onPreview?.(newColor.hex);
  }, [currentColor, onChange, onPreview]);

  const handleHexChange = useCallback((hex: string) => {
    if (isValidHex(hex)) {
      const newColor = parseColor(hex);
      setCurrentColor(newColor);
      onChange(newColor.hex);
      onPreview?.(newColor.hex);
    }
  }, [parseColor, onChange, onPreview]);

  const handlePresetClick = useCallback((presetColor: string) => {
    const newColor = parseColor(presetColor);
    setCurrentColor(newColor);
    onChange(newColor.hex);
    
    // Add to history
    setColorHistory(prev => {
      const filtered = prev.filter(c => c !== presetColor);
      return [presetColor, ...filtered].slice(0, 12);
    });
  }, [parseColor, onChange]);

  const copyColorToClipboard = useCallback(async (colorValue: string, format: string) => {
    try {
      await navigator.clipboard.writeText(colorValue);
      setCopiedColor(`${format}:${colorValue}`);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (error) {
      console.error('Failed to copy color:', error);
    }
  }, []);

  const generateColorVariations = useCallback(() => {
    const variations = [];
    const baseHsl = currentColor.hsl;
    
    // Lighter variations
    for (let i = 1; i <= 3; i++) {
      const lightness = Math.min(1, baseHsl.l + (i * 0.15));
      const rgb = hslToRgb(baseHsl.h, baseHsl.s, lightness);
      variations.push(rgbToHex(rgb.r, rgb.g, rgb.b));
    }
    
    // Darker variations
    for (let i = 1; i <= 3; i++) {
      const lightness = Math.max(0, baseHsl.l - (i * 0.15));
      const rgb = hslToRgb(baseHsl.h, baseHsl.s, lightness);
      variations.push(rgbToHex(rgb.r, rgb.g, rgb.b));
    }
    
    return variations;
  }, [currentColor]);

  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <Label className="text-sm font-medium">{label}</Label>
      )}

      <Tabs defaultValue="picker" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="picker" className="gap-2">
            <Palette className="w-4 h-4" />
            Picker
          </TabsTrigger>
          <TabsTrigger value="presets" className="gap-2">
            <Zap className="w-4 h-4" />
            Presets
          </TabsTrigger>
          {showAdvanced && (
            <TabsTrigger value="advanced" className="gap-2">
              <Sliders className="w-4 h-4" />
              Advanced
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="picker" className="space-y-4">
          {/* Color Preview */}
          <div className="flex items-center gap-3">
            <div 
              className="w-16 h-16 rounded-lg border-2 border-white shadow-lg"
              style={{ backgroundColor: currentColor.hex }}
            />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={currentColor.hex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="font-mono text-sm"
                  placeholder="#000000"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyColorToClipboard(currentColor.hex, 'hex')}
                  className="gap-2"
                >
                  {copiedColor === `hex:${currentColor.hex}` ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                RGB({currentColor.rgb.r}, {currentColor.rgb.g}, {currentColor.rgb.b})
              </div>
            </div>
          </div>

          {/* Main Color Picker */}
          <div className="space-y-3">
            <canvas
              ref={canvasRef}
              width={300}
              height={200}
              className="w-full h-48 rounded-lg border cursor-crosshair"
              onClick={handleColorPickerClick}
            />
            
            {/* Hue Picker */}
            <canvas
              ref={hueCanvasRef}
              width={300}
              height={20}
              className="w-full h-5 rounded cursor-pointer"
              onClick={handleHuePickerClick}
            />
          </div>

          {/* Color Variations */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Color Variations</Label>
            <div className="flex gap-1">
              {generateColorVariations().map((variation, index) => (
                <button
                  key={index}
                  className="w-8 h-8 rounded border-2 border-white shadow-sm hover:scale-110 transition-transform"
                  style={{ backgroundColor: variation }}
                  onClick={() => handlePresetClick(variation)}
                  title={variation}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          {/* Preset Colors */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Color Presets</Label>
            <div className="grid grid-cols-8 gap-2">
              {presetColors.map((preset) => (
                <button
                  key={preset}
                  className={cn(
                    'aspect-square rounded-lg border-2 transition-all duration-200',
                    'hover:scale-110 hover:shadow-md',
                    currentColor.hex.toLowerCase() === preset.toLowerCase()
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-white shadow-sm'
                  )}
                  style={{ backgroundColor: preset }}
                  onClick={() => handlePresetClick(preset)}
                  title={preset}
                />
              ))}
            </div>
          </div>

          {/* Color History */}
          {showHistory && colorHistory.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Recent Colors</Label>
              <div className="flex gap-2 flex-wrap">
                {colorHistory.map((historyColor, index) => (
                  <button
                    key={`${historyColor}-${index}`}
                    className="w-8 h-8 rounded border-2 border-white shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: historyColor }}
                    onClick={() => handlePresetClick(historyColor)}
                    title={historyColor}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {showAdvanced && (
          <TabsContent value="advanced" className="space-y-4">
            {/* RGB Inputs */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">RGB Values</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Red</Label>
                  <Input
                    type="number"
                    min="0"
                    max="255"
                    value={currentColor.rgb.r}
                    onChange={(e) => {
                      const r = parseInt(e.target.value) || 0;
                      const hex = rgbToHex(r, currentColor.rgb.g, currentColor.rgb.b);
                      handleHexChange(hex);
                    }}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Green</Label>
                  <Input
                    type="number"
                    min="0"
                    max="255"
                    value={currentColor.rgb.g}
                    onChange={(e) => {
                      const g = parseInt(e.target.value) || 0;
                      const hex = rgbToHex(currentColor.rgb.r, g, currentColor.rgb.b);
                      handleHexChange(hex);
                    }}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Blue</Label>
                  <Input
                    type="number"
                    min="0"
                    max="255"
                    value={currentColor.rgb.b}
                    onChange={(e) => {
                      const b = parseInt(e.target.value) || 0;
                      const hex = rgbToHex(currentColor.rgb.r, currentColor.rgb.g, b);
                      handleHexChange(hex);
                    }}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            {/* HSL Inputs */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">HSL Values</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Hue</Label>
                  <Input
                    type="number"
                    min="0"
                    max="360"
                    value={Math.round(currentColor.hsl.h)}
                    onChange={(e) => {
                      const h = parseInt(e.target.value) || 0;
                      const rgb = hslToRgb(h, currentColor.hsl.s, currentColor.hsl.l);
                      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                      handleHexChange(hex);
                    }}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Saturation</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round(currentColor.hsl.s * 100)}
                    onChange={(e) => {
                      const s = (parseInt(e.target.value) || 0) / 100;
                      const rgb = hslToRgb(currentColor.hsl.h, s, currentColor.hsl.l);
                      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                      handleHexChange(hex);
                    }}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Lightness</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={Math.round(currentColor.hsl.l * 100)}
                    onChange={(e) => {
                      const l = (parseInt(e.target.value) || 0) / 100;
                      const rgb = hslToRgb(currentColor.hsl.h, currentColor.hsl.s, l);
                      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                      handleHexChange(hex);
                    }}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Copy Options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Copy Color</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyColorToClipboard(currentColor.hex, 'hex')}
                  className="gap-2 text-xs"
                >
                  {copiedColor === `hex:${currentColor.hex}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  HEX
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyColorToClipboard(`rgb(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b})`, 'rgb')}
                  className="gap-2 text-xs"
                >
                  {copiedColor?.startsWith('rgb:') ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  RGB
                </Button>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

// Utility functions
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s, l };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s, v };
}

function isValidHex(hex: string): boolean {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

export default AdvancedColorPicker;