import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseStrategy } from '@/components/builder/services/parsing/strategies/BaseStrategy';
import { ProgressCallback } from '@/components/builder/services/parsing/interfaces';
import { ParserError, ErrorCode, ErrorSeverity } from '@/components/builder/services/ParserErrors';

// Mock implementation of BaseStrategy for testing
class TestStrategy extends BaseStrategy {
  public readonly name = 'TestStrategy';
  public readonly priority = 50;
  public readonly supportedTypes = ['text/plain', 'application/test'];

  protected getExpectedExtensions(): string[] {
    return ['txt', 'test'];
  }

  public async parse(file: File, onProgress?: ProgressCallback): Promise<string> {
    if (onProgress) onProgress(0, 100, 'Starting test parse');
    
    // Simulate parsing delay
    await new Promise(resolve => setTimeout(resolve, 10));
    
    if (file.name.includes('error')) {
      throw new Error('Test parsing error');
    }
    
    if (onProgress) onProgress(100, 100, 'Test parse complete');
    return `Parsed content from ${file.name}`;
  }
}

describe('BaseStrategy', () => {
  let strategy: TestStrategy;
  let mockFile: File;

  beforeEach(() => {
    strategy = new TestStrategy();
    mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
  });

  describe('canHandle', () => {
    it('should return true for supported MIME types', () => {
      const textFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      expect(strategy.canHandle(textFile)).toBe(true);
    });

    it('should return true for supported file extensions', () => {
      const testFile = new File(['content'], 'test.test', { type: 'application/octet-stream' });
      expect(strategy.canHandle(testFile)).toBe(true);
    });

    it('should return false for unsupported types', () => {
      const imageFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      expect(strategy.canHandle(imageFile)).toBe(false);
    });
  });

  describe('getConfidenceScore', () => {
    it('should return 0 for unsupported files', () => {
      const imageFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      expect(strategy.getConfidenceScore(imageFile)).toBe(0);
    });

    it('should return high confidence for exact MIME type matches', () => {
      const textFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const confidence = strategy.getConfidenceScore(textFile);
      expect(confidence).toBeGreaterThan(70);
    });

    it('should reduce confidence for very large files', () => {
      const largeContent = 'x'.repeat(15 * 1024 * 1024); // 15MB
      const largeFile = new File([largeContent], 'large.txt', { type: 'text/plain' });
      const normalFile = new File(['content'], 'normal.txt', { type: 'text/plain' });
      
      expect(strategy.getConfidenceScore(largeFile)).toBeLessThan(
        strategy.getConfidenceScore(normalFile)
      );
    });

    it('should reduce confidence for very small files', () => {
      const tinyFile = new File(['x'], 'tiny.txt', { type: 'text/plain' });
      const normalFile = new File(['normal content'], 'normal.txt', { type: 'text/plain' });
      
      expect(strategy.getConfidenceScore(tinyFile)).toBeLessThan(
        strategy.getConfidenceScore(normalFile)
      );
    });
  });

  describe('parse', () => {
    it('should successfully parse supported files', async () => {
      const result = await strategy.parse(mockFile);
      expect(result).toBe('Parsed content from test.txt');
    });

    it('should call progress callback during parsing', async () => {
      const progressCallback = vi.fn();
      await strategy.parse(mockFile, progressCallback);
      
      expect(progressCallback).toHaveBeenCalledWith(0, 100, 'Starting test parse');
      expect(progressCallback).toHaveBeenCalledWith(100, 100, 'Test parse complete');
    });

    it('should handle parsing errors', async () => {
      const errorFile = new File(['content'], 'error.txt', { type: 'text/plain' });
      
      await expect(strategy.parse(errorFile)).rejects.toThrow('Test parsing error');
    });
  });

  describe('validateFile', () => {
    it('should pass validation for supported files', () => {
      expect(() => strategy['validateFile'](mockFile)).not.toThrow();
    });

    it('should throw error for unsupported file types', () => {
      const unsupportedFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      
      expect(() => strategy['validateFile'](unsupportedFile)).toThrow(ParserError);
    });

    it('should throw error for empty files', () => {
      const emptyFile = new File([], 'empty.txt', { type: 'text/plain' });
      
      expect(() => strategy['validateFile'](emptyFile)).toThrow();
    });
  });

  describe('validateExtractedText', () => {
    it('should return valid text unchanged', () => {
      const text = 'Valid resume content with sufficient length';
      const result = strategy['validateExtractedText'](text);
      expect(result).toBe(text.trim());
    });

    it('should throw error for empty text', () => {
      expect(() => strategy['validateExtractedText']('')).toThrow(ParserError);
    });

    it('should throw error for null/undefined text', () => {
      expect(() => strategy['validateExtractedText'](null as any)).toThrow(ParserError);
    });

    it('should warn about very short text but not throw', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const shortText = 'Short';
      
      const result = strategy['validateExtractedText'](shortText, 10);
      expect(result).toBe(shortText);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('cleanText', () => {
    it('should normalize line endings', () => {
      const text = 'Line 1\r\nLine 2\rLine 3\nLine 4';
      const cleaned = strategy['cleanText'](text);
      expect(cleaned).toBe('Line 1 Line 2 Line 3 Line 4');
    });

    it('should normalize whitespace', () => {
      const text = 'Multiple    spaces\t\tand\ttabs';
      const cleaned = strategy['cleanText'](text);
      expect(cleaned).toBe('Multiple spaces and tabs');
    });

    it('should fix common OCR artifacts', () => {
      const text = 'H|ello Wor|d with @ character';
      const cleaned = strategy['cleanText'](text);
      expect(cleaned).toBe('HIello WorId with a character');
    });

    it('should add spaces between camelCase words', () => {
      const text = 'firstName lastName companyName';
      const cleaned = strategy['cleanText'](text);
      expect(cleaned).toBe('first Name last Name company Name');
    });

    it('should add spaces between numbers and letters', () => {
      const text = '5years 2023graduation phoneNumber123';
      const cleaned = strategy['cleanText'](text);
      expect(cleaned).toBe('5 years 2023 graduation phone Number 123');
    });
  });

  describe('createTimeoutPromise', () => {
    it('should resolve when promise completes within timeout', async () => {
      const quickPromise = Promise.resolve('success');
      const result = await strategy['createTimeoutPromise'](quickPromise, 1000);
      expect(result).toBe('success');
    });

    it('should reject when promise exceeds timeout', async () => {
      const slowPromise = new Promise(resolve => setTimeout(() => resolve('late'), 200));
      
      await expect(
        strategy['createTimeoutPromise'](slowPromise, 100)
      ).rejects.toThrow('TestStrategy strategy timed out after 100ms');
    });

    it('should reject when promise rejects within timeout', async () => {
      const failingPromise = Promise.reject(new Error('Promise failed'));
      
      await expect(
        strategy['createTimeoutPromise'](failingPromise, 1000)
      ).rejects.toThrow('Promise failed');
    });
  });

  describe('handleError', () => {
    it('should convert generic errors to ParserError', () => {
      const genericError = new Error('Generic error');
      
      expect(() => strategy['handleError'](genericError, 'test context')).toThrow(ParserError);
    });

    it('should preserve ParserError instances', () => {
      const parserError = new ParserError(
        ErrorCode.TEXT_EXTRACTION_FAILED,
        'Parser error',
        ErrorSeverity.HIGH,
        {},
        true
      );
      
      expect(() => strategy['handleError'](parserError, 'test context')).toThrow(parserError);
    });
  });
});