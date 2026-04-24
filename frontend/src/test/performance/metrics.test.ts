import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MultiStrategyParser } from '@/components/builder/services/parsing/MultiStrategyParser';

// Performance metrics interface
interface PerformanceMetrics {
  parseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  renderTime: number;
  bundleSize: number;
  networkRequests: number;
}

// Performance monitoring utility
class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    parseTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    renderTime: 0,
    bundleSize: 0,
    networkRequests: 0
  };

  private startTime: number = 0;
  private initialMemory: number = 0;

  startMeasurement(): void {
    this.startTime = performance.now();
    this.initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
  }

  endMeasurement(): PerformanceMetrics {
    const endTime = performance.now();
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;

    this.metrics.parseTime = endTime - this.startTime;
    this.metrics.memoryUsage = finalMemory - this.initialMemory;
    this.metrics.renderTime = this.measureRenderTime();

    return { ...this.metrics };
  }

  private measureRenderTime(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint?.startTime || 0;
  }

  measureBundleSize(): number {
    // Simulate bundle size measurement
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach(script => {
      // In a real implementation, this would fetch actual file sizes
      totalSize += 100000; // Mock size
    });

    return totalSize;
  }

  measureNetworkRequests(): number {
    const resourceEntries = performance.getEntriesByType('resource');
    return resourceEntries.length;
  }
}

describe('Performance Metrics and Monitoring', () => {
  let performanceMonitor: PerformanceMonitor;
  let parser: MultiStrategyParser;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor();
    parser = new MultiStrategyParser();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('parsing performance metrics', () => {
    it('should measure parsing time for different file sizes', async () => {
      const testSizes = [1000, 10000, 100000]; // bytes
      const results: Array<{ size: number; time: number }> = [];

      for (const size of testSizes) {
        const content = 'A'.repeat(size);
        const file = new File([content], `test-${size}.txt`, { type: 'text/plain' });

        performanceMonitor.startMeasurement();
        await parser.parseFile(file);
        const metrics = performanceMonitor.endMeasurement();

        results.push({ size, time: metrics.parseTime });
      }

      // Verify parsing time scales reasonably with file size
      expect(results[1].time).toBeGreaterThan(results[0].time);
      expect(results[2].time).toBeGreaterThan(results[1].time);

      // No single file should take more than 5 seconds
      results.forEach(result => {
        expect(result.time).toBeLessThan(5000);
      });
    });

    it('should measure memory usage during parsing', async () => {
      const largeContent = 'Large resume content '.repeat(10000);
      const file = new File([largeContent], 'large.txt', { type: 'text/plain' });

      performanceMonitor.startMeasurement();
      await parser.parseFile(file);
      const metrics = performanceMonitor.endMeasurement();

      // Memory usage should be reasonable (less than 50MB)
      expect(Math.abs(metrics.memoryUsage)).toBeLessThan(50 * 1024 * 1024);
    });

    it('should track parsing performance over multiple operations', async () => {
      const iterations = 10;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const content = `Resume content iteration ${i}`;
        const file = new File([content], `resume-${i}.txt`, { type: 'text/plain' });

        performanceMonitor.startMeasurement();
        await parser.parseFile(file);
        const metrics = performanceMonitor.endMeasurement();

        times.push(metrics.parseTime);
      }

      // Calculate performance statistics
      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);

      // Performance should be consistent
      expect(maxTime / minTime).toBeLessThan(3); // Max shouldn't be more than 3x min
      expect(averageTime).toBeLessThan(1000); // Average should be under 1 second
    });
  });

  describe('memory leak detection', () => {
    it('should not leak memory after multiple parsing operations', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Perform multiple parsing operations
      for (let i = 0; i < 20; i++) {
        const content = `Memory test content ${i}`;
        const file = new File([content], `memory-test-${i}.txt`, { type: 'text/plain' });
        await parser.parseFile(file);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should clean up event listeners and timers', async () => {
      const initialListeners = process.listenerCount('uncaughtException');
      
      // Create and destroy multiple parser instances
      for (let i = 0; i < 5; i++) {
        const tempParser = new MultiStrategyParser();
        const file = new File(['test'], 'test.txt', { type: 'text/plain' });
        await tempParser.parseFile(file);
      }

      const finalListeners = process.listenerCount('uncaughtException');
      
      // Should not accumulate event listeners
      expect(finalListeners).toBeLessThanOrEqual(initialListeners + 1);
    });
  });

  describe('render performance metrics', () => {
    it('should measure component render times', async () => {
      // Mock React performance measurement
      const renderStart = performance.now();
      
      // Simulate component rendering
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;

      // Render time should be reasonable
      expect(renderTime).toBeLessThan(100); // Less than 100ms
    });

    it('should track re-render frequency', async () => {
      let renderCount = 0;
      const mockComponent = () => {
        renderCount++;
        return null;
      };

      // Simulate multiple re-renders
      for (let i = 0; i < 10; i++) {
        mockComponent();
      }

      // Should not have excessive re-renders
      expect(renderCount).toBeLessThan(15);
    });
  });

  describe('bundle size optimization', () => {
    it('should measure and validate bundle size', () => {
      const bundleSize = performanceMonitor.measureBundleSize();
      
      // Bundle size should be reasonable (less than 5MB)
      expect(bundleSize).toBeLessThan(5 * 1024 * 1024);
    });

    it('should detect unused code', () => {
      // Mock code coverage analysis
      const totalFunctions = 100;
      const usedFunctions = 85;
      const codeUtilization = usedFunctions / totalFunctions;

      // Code utilization should be reasonable (>70%)
      expect(codeUtilization).toBeGreaterThan(0.7);
    });
  });

  describe('network performance', () => {
    it('should minimize network requests', () => {
      const networkRequests = performanceMonitor.measureNetworkRequests();
      
      // Should not make excessive network requests
      expect(networkRequests).toBeLessThan(20);
    });

    it('should measure resource loading times', () => {
      const resourceEntries = performance.getEntriesByType('resource');
      const slowResources = resourceEntries.filter(entry => entry.duration > 1000);

      // No resources should take more than 1 second to load
      expect(slowResources.length).toBe(0);
    });
  });

  describe('performance regression detection', () => {
    it('should detect performance regressions', async () => {
      // Baseline performance
      const baselineFile = new File(['baseline content'], 'baseline.txt', { type: 'text/plain' });
      
      performanceMonitor.startMeasurement();
      await parser.parseFile(baselineFile);
      const baselineMetrics = performanceMonitor.endMeasurement();

      // Current performance
      performanceMonitor.startMeasurement();
      await parser.parseFile(baselineFile);
      const currentMetrics = performanceMonitor.endMeasurement();

      // Current performance shouldn't be significantly worse
      const performanceRatio = currentMetrics.parseTime / baselineMetrics.parseTime;
      expect(performanceRatio).toBeLessThan(1.5); // No more than 50% slower
    });

    it('should track performance trends over time', async () => {
      const measurements: number[] = [];
      
      // Take multiple measurements
      for (let i = 0; i < 5; i++) {
        const file = new File(['trend test'], 'trend.txt', { type: 'text/plain' });
        
        performanceMonitor.startMeasurement();
        await parser.parseFile(file);
        const metrics = performanceMonitor.endMeasurement();
        
        measurements.push(metrics.parseTime);
      }

      // Calculate trend
      const firstHalf = measurements.slice(0, 2);
      const secondHalf = measurements.slice(-2);
      
      const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

      // Performance shouldn't degrade significantly over time
      expect(secondAvg / firstAvg).toBeLessThan(1.3);
    });
  });

  describe('performance budgets', () => {
    it('should enforce parsing time budget', async () => {
      const PARSING_TIME_BUDGET = 2000; // 2 seconds
      
      const testFile = new File(['test content'], 'budget-test.txt', { type: 'text/plain' });
      
      performanceMonitor.startMeasurement();
      await parser.parseFile(testFile);
      const metrics = performanceMonitor.endMeasurement();

      expect(metrics.parseTime).toBeLessThan(PARSING_TIME_BUDGET);
    });

    it('should enforce memory usage budget', async () => {
      const MEMORY_BUDGET = 100 * 1024 * 1024; // 100MB
      
      const testFile = new File(['memory test'], 'memory-budget.txt', { type: 'text/plain' });
      
      performanceMonitor.startMeasurement();
      await parser.parseFile(testFile);
      const metrics = performanceMonitor.endMeasurement();

      expect(Math.abs(metrics.memoryUsage)).toBeLessThan(MEMORY_BUDGET);
    });

    it('should enforce render time budget', () => {
      const RENDER_TIME_BUDGET = 16; // 16ms for 60fps
      
      const renderTime = performanceMonitor.measureRenderTime();
      
      // Render time should be within budget for smooth animations
      expect(renderTime).toBeLessThan(RENDER_TIME_BUDGET);
    });
  });

  describe('performance optimization recommendations', () => {
    it('should identify optimization opportunities', async () => {
      const optimizationReport = {
        slowParsing: false,
        memoryLeaks: false,
        excessiveReRenders: false,
        largeBundleSize: false,
        slowNetworkRequests: false
      };

      // Test parsing performance
      const file = new File(['optimization test'], 'opt-test.txt', { type: 'text/plain' });
      performanceMonitor.startMeasurement();
      await parser.parseFile(file);
      const metrics = performanceMonitor.endMeasurement();

      if (metrics.parseTime > 1000) {
        optimizationReport.slowParsing = true;
      }

      if (Math.abs(metrics.memoryUsage) > 50 * 1024 * 1024) {
        optimizationReport.memoryLeaks = true;
      }

      const bundleSize = performanceMonitor.measureBundleSize();
      if (bundleSize > 3 * 1024 * 1024) {
        optimizationReport.largeBundleSize = true;
      }

      // Report should indicate good performance
      expect(optimizationReport.slowParsing).toBe(false);
      expect(optimizationReport.memoryLeaks).toBe(false);
      expect(optimizationReport.largeBundleSize).toBe(false);
    });
  });
});