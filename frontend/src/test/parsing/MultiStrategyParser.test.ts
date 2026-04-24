import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MultiStrategyParser } from '@/components/builder/services/parsing/MultiStrategyParser';
import { ParsingStrategy, ParserConfiguration, ProgressCallback } from '@/components/builder/services/parsing/interfaces';
import { TEST_DATA_SETS, createMockFile } from './test-data';

// Mock strategies for testing
class MockTextStrategy implements ParsingStrategy {
  readonly name = 'MockTextStrategy';
  readonly priority = 80;
  readonly supportedTypes = ['text/plain'];

  canHandle(file: File): boolean {
    return file.type === 'text/plain';
  }

  getConfidenceScore(file: File): number {
    return this.canHandle(file) ? 90 : 0;
  }

  async parse(file: File, onProgress?: ProgressCallback): Promise<string> {
    if (onProgress) onProgress(0, 100, 'Starting text parse');
    
    if (file.name.includes('error')) {
      throw new Error('Mock parsing error');
    }
    
    if (file.size === 0) {
      throw new Error('Empty file');
    }
    
    const text = await file.text();
    if (onProgress) onProgress(100, 100, 'Text parse complete');
    
    return text;
  }
}

class MockPDFStrategy implements ParsingStrategy {
  readonly name = 'MockPDFStrategy';
  readonly priority = 70;
  readonly supportedTypes = ['application/pdf'];

  canHandle(file: File): boolean {
    return file.type === 'application/pdf';
  }

  getConfidenceScore(file: File): number {
    return this.canHandle(file) ? 85 : 0;
  }

  async parse(file: File, onProgress?: ProgressCallback): Promise<string> {
    if (onProgress) onProgress(0, 100, 'Starting PDF parse');
    
    if (file.name.includes('password')) {
      throw new Error('Password protected PDF');
    }
    
    // Simulate PDF parsing
    await new Promise(resolve => setTimeout(resolve, 50));
    
    if (onProgress) onProgress(100, 100, 'PDF parse complete');
    return 'Extracted PDF content';
  }
}

class MockOCRStrategy implements ParsingStrategy {
  readonly name = 'MockOCRStrategy';
  readonly priority = 30;
  readonly supportedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

  canHandle(file: File): boolean {
    return this.supportedTypes.includes(file.type);
  }

  getConfidenceScore(file: File): number {
    return this.canHandle(file) ? 40 : 0;
  }

  async parse(file: File, onProgress?: ProgressCallback): Promise<string> {
    if (onProgress) onProgress(0, 100, 'Starting OCR');
    
    // Simulate OCR processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (file.name.includes('unreadable')) {
      throw new Error('OCR failed - unreadable image');
    }
    
    if (onProgress) onProgress(100, 100, 'OCR complete');
    return 'OCR extracted text with some artifacts';
  }
}

describe('MultiStrategyParser', () => {
  let parser: MultiStrategyParser;
  let mockConfiguration: Partial<ParserConfiguration>;

  beforeEach(() => {
    mockConfiguration = {
      strategies: [
        new MockTextStrategy(),
        new MockPDFStrategy(),
        new MockOCRStrategy()
      ],
      fallbackOptions: [],
      maxRetries: 3,
      timeoutMs: 5000,
      enableOCR: true
    };

    parser = new MultiStrategyParser(mockConfiguration);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultParser = new MultiStrategyParser();
      const stats = defaultParser.getStatistics();
      
      expect(stats.availableStrategies).toBeDefined();
      expect(stats.configuration).toBeDefined();
    });

    it('should initialize with custom configuration', () => {
      const stats = parser.getStatistics();
      
      expect(stats.availableStrategies).toContain('MockTextStrategy');
      expect(stats.availableStrategies).toContain('MockPDFStrategy');
      expect(stats.availableStrategies).toContain('MockOCRStrategy');
      expect(stats.configuration.maxRetries).toBe(3);
    });

    it('should validate configuration on initialization', () => {
      const invalidConfig = {
        strategies: [],
        maxRetries: -1
      };

      expect(() => new MultiStrategyParser(invalidConfig)).toThrow();
    });
  });

  describe('parseFile', () => {
    it('should successfully parse text files with primary strategy', async () => {
      const testFile = createMockFile(TEST_DATA_SETS[0].files[0]);
      const result = await parser.parseFile(testFile);

      expect(result.text).toBeDefined();
      expect(result.method).toBe('MockTextStrategy');
      expect(result.confidence).toBeGreaterThan(80);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should call progress callback during parsing', async () => {
      const testFile = createMockFile(TEST_DATA_SETS[0].files[0]);
      const progressCallback = vi.fn();

      await parser.parseFile(testFile, progressCallback);

      expect(progressCallback).toHaveBeenCalledWith(0, 100, 'Initializing parser...');
      expect(progressCallback).toHaveBeenCalledWith(10, 100, 'Using MockTextStrategy strategy...');
    });

    it('should use fallback strategy when primary fails', async () => {
      const errorFile = new File(['content'], 'error.txt', { type: 'text/plain' });
      
      // Mock the fallback behavior
      const mockOCRStrategy = new MockOCRStrategy();
      mockOCRStrategy.canHandle = () => true;
      
      const parserWithFallback = new MultiStrategyParser({
        ...mockConfiguration,
        fallbackOptions: [{
          name: 'OCR Fallback',
          strategy: mockOCRStrategy,
          condition: () => true,
          priority: 1
        }]
      });

      const result = await parserWithFallback.parseFile(errorFile);
      
      expect(result.method).toContain('fallback');
      expect(result.warnings).toContain('Primary strategy failed, used MockOCRStrategy as fallback');
    });

    it('should handle file validation errors', async () => {
      const emptyFile = new File([], 'empty.txt', { type: 'text/plain' });

      await expect(parser.parseFile(emptyFile)).rejects.toThrow();
    });

    it('should handle unsupported file types', async () => {
      const unsupportedFile = new File(['content'], 'test.xyz', { type: 'application/unknown' });

      await expect(parser.parseFile(unsupportedFile)).rejects.toThrow('Unsupported file type');
    });

    it('should handle timeout scenarios', async () => {
      const slowParser = new MultiStrategyParser({
        ...mockConfiguration,
        timeoutMs: 10 // Very short timeout
      });

      const testFile = createMockFile(TEST_DATA_SETS[0].files[0]);

      await expect(slowParser.parseFile(testFile)).rejects.toThrow();
    });

    it('should handle all strategies failing', async () => {
      const problematicFile = new File(['content'], 'error-unreadable.txt', { type: 'text/plain' });

      await expect(parser.parseFile(problematicFile)).rejects.toThrow('Failed to parse');
    });
  });

  describe('error handling and recovery', () => {
    it('should classify errors appropriately', async () => {
      const passwordFile = new File(['content'], 'password.pdf', { type: 'application/pdf' });

      try {
        await parser.parseFile(passwordFile);
      } catch (error: any) {
        expect(error.message).toContain('Password protected PDF');
      }
    });

    it('should provide helpful error suggestions', async () => {
      const unsupportedFile = new File(['content'], 'test.xyz', { type: 'application/unknown' });

      try {
        await parser.parseFile(unsupportedFile);
      } catch (error: any) {
        expect(error.suggestions).toBeDefined();
        expect(error.suggestions.length).toBeGreaterThan(0);
      }
    });

    it('should log errors for debugging', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorFile = new File(['content'], 'error.txt', { type: 'text/plain' });

      try {
        await parser.parseFile(errorFile);
      } catch (error) {
        // Error expected
      }

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('performance and optimization', () => {
    it('should complete parsing within reasonable time', async () => {
      const testFile = createMockFile(TEST_DATA_SETS[0].files[0]);
      const startTime = performance.now();

      await parser.parseFile(testFile);

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle large files efficiently', async () => {
      const largeFile = createMockFile(TEST_DATA_SETS[1].files[2]); // very-large-file.txt
      const startTime = performance.now();

      const result = await parser.parseFile(largeFile);

      const endTime = performance.now();
      expect(result.text).toBeDefined();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('configuration management', () => {
    it('should allow configuration updates', () => {
      const newConfig = { maxRetries: 5, timeoutMs: 10000 };
      parser.updateConfiguration(newConfig);

      const stats = parser.getStatistics();
      expect(stats.configuration.maxRetries).toBe(5);
      expect(stats.configuration.timeoutMs).toBe(10000);
    });

    it('should provide parser statistics', () => {
      const stats = parser.getStatistics();

      expect(stats.availableStrategies).toBeInstanceOf(Array);
      expect(stats.fallbackOptions).toBeInstanceOf(Array);
      expect(stats.configuration).toBeDefined();
    });
  });

  describe('integration with test data sets', () => {
    it('should handle all test scenarios from basic-text-files', async () => {
      const basicTextDataSet = TEST_DATA_SETS[0];

      for (const testFile of basicTextDataSet.files) {
        const mockFile = createMockFile(testFile);
        
        if (testFile.characteristics.includes('minimal-content')) {
          // Expect warnings but not failures for minimal content
          const result = await parser.parseFile(mockFile);
          expect(result.warnings.length).toBeGreaterThan(0);
        } else {
          const result = await parser.parseFile(mockFile);
          expect(result.text).toBeDefined();
          expect(result.confidence).toBeGreaterThan(0);
        }
      }
    });

    it('should handle problematic files gracefully', async () => {
      const problematicDataSet = TEST_DATA_SETS[1];

      for (const testFile of problematicDataSet.files) {
        const mockFile = createMockFile(testFile);
        
        if (testFile.expectedChallenges.includes('validation-failure')) {
          await expect(parser.parseFile(mockFile)).rejects.toThrow();
        } else {
          // Should handle gracefully even if with warnings
          try {
            const result = await parser.parseFile(mockFile);
            expect(result).toBeDefined();
          } catch (error) {
            // Errors are acceptable for problematic files, but should be classified
            expect(error).toHaveProperty('code');
          }
        }
      }
    });
  });
});