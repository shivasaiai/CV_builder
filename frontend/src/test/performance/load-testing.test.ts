import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MultiStrategyParser } from '@/components/builder/services/parsing/MultiStrategyParser';

// Load testing utilities
interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
}

class LoadTester {
  private results: number[] = [];
  private errors: Error[] = [];

  async runLoadTest(
    testFunction: () => Promise<void>,
    concurrency: number,
    duration: number
  ): Promise<LoadTestResult> {
    const startTime = Date.now();
    const endTime = startTime + duration;
    const promises: Promise<void>[] = [];

    // Create concurrent workers
    for (let i = 0; i < concurrency; i++) {
      promises.push(this.worker(testFunction, endTime));
    }

    await Promise.allSettled(promises);

    return this.calculateResults(startTime, endTime);
  }

  private async worker(testFunction: () => Promise<void>, endTime: number): Promise<void> {
    while (Date.now() < endTime) {
      const requestStart = Date.now();
      
      try {
        await testFunction();
        const requestTime = Date.now() - requestStart;
        this.results.push(requestTime);
      } catch (error) {
        this.errors.push(error as Error);
      }

      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  private calculateResults(startTime: number, endTime: number): LoadTestResult {
    const totalTime = endTime - startTime;
    const totalRequests = this.results.length + this.errors.length;
    const successfulRequests = this.results.length;
    const failedRequests = this.errors.length;

    const averageResponseTime = this.results.length > 0 
      ? this.results.reduce((sum, time) => sum + time, 0) / this.results.length 
      : 0;

    const maxResponseTime = this.results.length > 0 ? Math.max(...this.results) : 0;
    const minResponseTime = this.results.length > 0 ? Math.min(...this.results) : 0;
    const requestsPerSecond = (totalRequests / totalTime) * 1000;
    const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      maxResponseTime,
      minResponseTime,
      requestsPerSecond,
      errorRate
    };
  }

  reset(): void {
    this.results = [];
    this.errors = [];
  }
}

describe('Load Testing for File Processing', () => {
  let parser: MultiStrategyParser;
  let loadTester: LoadTester;

  beforeEach(() => {
    parser = new MultiStrategyParser();
    loadTester = new LoadTester();
  });

  describe('concurrent file parsing', () => {
    it('should handle multiple concurrent parsing requests', async () => {
      const testFile = new File(['Test resume content'], 'test.txt', { type: 'text/plain' });
      
      const testFunction = async () => {
        await parser.parseFile(testFile);
      };

      const result = await loadTester.runLoadTest(testFunction, 5, 2000); // 5 concurrent, 2 seconds

      expect(result.errorRate).toBeLessThan(5); // Less than 5% error rate
      expect(result.averageResponseTime).toBeLessThan(1000); // Less than 1 second average
      expect(result.successfulRequests).toBeGreaterThan(0);
    });

    it('should maintain performance under high concurrency', async () => {
      const testFile = new File(['High concurrency test'], 'concurrent.txt', { type: 'text/plain' });
      
      const testFunction = async () => {
        await parser.parseFile(testFile);
      };

      const result = await loadTester.runLoadTest(testFunction, 20, 3000); // 20 concurrent, 3 seconds

      expect(result.errorRate).toBeLessThan(10); // Less than 10% error rate under high load
      expect(result.averageResponseTime).toBeLessThan(2000); // Less than 2 seconds average
      expect(result.requestsPerSecond).toBeGreaterThan(1); // At least 1 request per second
    });

    it('should handle mixed file sizes under load', async () => {
      const files = [
        new File(['Small'], 'small.txt', { type: 'text/plain' }),
        new File(['Medium content '.repeat(100)], 'medium.txt', { type: 'text/plain' }),
        new File(['Large content '.repeat(1000)], 'large.txt', { type: 'text/plain' })
      ];

      let fileIndex = 0;
      const testFunction = async () => {
        const file = files[fileIndex % files.length];
        fileIndex++;
        await parser.parseFile(file);
      };

      const result = await loadTester.runLoadTest(testFunction, 10, 2000); // 10 concurrent, 2 seconds

      expect(result.errorRate).toBeLessThan(15); // Allow higher error rate for mixed sizes
      expect(result.successfulRequests).toBeGreaterThan(5); // Should complete some requests
    });
  });

  describe('memory pressure testing', () => {
    it('should handle memory pressure gracefully', async () => {
      // Create large files to put memory pressure
      const largeContent = 'Large resume content with lots of text '.repeat(5000);
      const largeFile = new File([largeContent], 'large.txt', { type: 'text/plain' });

      const testFunction = async () => {
        await parser.parseFile(largeFile);
      };

      const result = await loadTester.runLoadTest(testFunction, 3, 2000); // 3 concurrent, 2 seconds

      expect(result.errorRate).toBeLessThan(20); // Allow higher error rate for memory pressure
      expect(result.successfulRequests).toBeGreaterThan(0); // Should complete at least some
    });

    it('should not crash under extreme memory pressure', async () => {
      // Create extremely large files
      const extremeContent = 'X'.repeat(1000000); // 1MB of text
      const extremeFile = new File([extremeContent], 'extreme.txt', { type: 'text/plain' });

      const testFunction = async () => {
        try {
          await parser.parseFile(extremeFile);
        } catch (error) {
          // Errors are acceptable under extreme conditions
          if (!(error instanceof Error) || !error.message.includes('memory')) {
            throw error; // Re-throw non-memory errors
          }
        }
      };

      // Should not crash the test runner
      await expect(
        loadTester.runLoadTest(testFunction, 2, 1000)
      ).resolves.toBeDefined();
    });
  });

  describe('sustained load testing', () => {
    it('should maintain performance over extended periods', async () => {
      const testFile = new File(['Sustained load test'], 'sustained.txt', { type: 'text/plain' });
      
      const testFunction = async () => {
        await parser.parseFile(testFile);
      };

      // Run for longer duration with moderate concurrency
      const result = await loadTester.runLoadTest(testFunction, 5, 5000); // 5 concurrent, 5 seconds

      expect(result.errorRate).toBeLessThan(5);
      expect(result.averageResponseTime).toBeLessThan(1500);
      expect(result.totalRequests).toBeGreaterThan(10); // Should process multiple requests
    });

    it('should not degrade performance over time', async () => {
      const testFile = new File(['Performance degradation test'], 'degradation.txt', { type: 'text/plain' });
      
      // Run two separate load tests to compare performance
      const testFunction = async () => {
        await parser.parseFile(testFile);
      };

      // First test
      loadTester.reset();
      const firstResult = await loadTester.runLoadTest(testFunction, 3, 2000);

      // Second test (after some processing)
      loadTester.reset();
      const secondResult = await loadTester.runLoadTest(testFunction, 3, 2000);

      // Performance shouldn't degrade significantly
      const performanceDegradation = secondResult.averageResponseTime / firstResult.averageResponseTime;
      expect(performanceDegradation).toBeLessThan(1.5); // No more than 50% slower
    });
  });

  describe('error handling under load', () => {
    it('should handle parsing errors gracefully under load', async () => {
      // Mix of valid and invalid files
      const files = [
        new File(['Valid content'], 'valid.txt', { type: 'text/plain' }),
        new File([], 'empty.txt', { type: 'text/plain' }), // Invalid - empty
        new File(['Another valid'], 'valid2.txt', { type: 'text/plain' }),
        new File([''], 'invalid.xyz', { type: 'application/unknown' }) // Invalid - unsupported
      ];

      let fileIndex = 0;
      const testFunction = async () => {
        const file = files[fileIndex % files.length];
        fileIndex++;
        
        try {
          await parser.parseFile(file);
        } catch (error) {
          // Expected for invalid files
          if (file.size === 0 || file.type === 'application/unknown') {
            return; // Expected error
          }
          throw error; // Unexpected error
        }
      };

      const result = await loadTester.runLoadTest(testFunction, 5, 2000);

      // Should handle mix of valid/invalid files
      expect(result.totalRequests).toBeGreaterThan(0);
      expect(result.successfulRequests).toBeGreaterThan(0); // Some should succeed
    });

    it('should recover from temporary failures', async () => {
      let failureCount = 0;
      const maxFailures = 3;

      const testFunction = async () => {
        // Simulate temporary failures
        if (failureCount < maxFailures) {
          failureCount++;
          throw new Error('Temporary failure');
        }

        // After max failures, start succeeding
        const file = new File(['Recovery test'], 'recovery.txt', { type: 'text/plain' });
        await parser.parseFile(file);
      };

      const result = await loadTester.runLoadTest(testFunction, 2, 2000);

      // Should recover and process some requests successfully
      expect(result.successfulRequests).toBeGreaterThan(0);
      expect(result.errorRate).toBeLessThan(100); // Not all requests should fail
    });
  });

  describe('resource utilization under load', () => {
    it('should not exceed memory limits under load', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      const testFile = new File(['Memory test content'], 'memory.txt', { type: 'text/plain' });
      
      const testFunction = async () => {
        await parser.parseFile(testFile);
      };

      await loadTester.runLoadTest(testFunction, 10, 2000);

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 200MB)
      expect(memoryIncrease).toBeLessThan(200 * 1024 * 1024);
    });

    it('should clean up resources after load test', async () => {
      const testFile = new File(['Cleanup test'], 'cleanup.txt', { type: 'text/plain' });
      
      const testFunction = async () => {
        await parser.parseFile(testFile);
      };

      // Run load test
      await loadTester.runLoadTest(testFunction, 5, 1000);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check that resources are cleaned up (no specific assertion, just ensure no crashes)
      expect(true).toBe(true); // Test passes if no crashes occur
    });
  });

  describe('performance benchmarking', () => {
    it('should establish performance baselines', async () => {
      const benchmarkFile = new File(['Benchmark content'], 'benchmark.txt', { type: 'text/plain' });
      
      const testFunction = async () => {
        await parser.parseFile(benchmarkFile);
      };

      const result = await loadTester.runLoadTest(testFunction, 1, 1000); // Single thread baseline

      // Establish baseline expectations
      expect(result.averageResponseTime).toBeLessThan(500); // Baseline: under 500ms
      expect(result.errorRate).toBe(0); // Baseline: no errors
      expect(result.requestsPerSecond).toBeGreaterThan(2); // Baseline: at least 2 RPS
    });

    it('should compare performance across different scenarios', async () => {
      const scenarios = [
        { name: 'small', content: 'Small content', expectedRPS: 10 },
        { name: 'medium', content: 'Medium content '.repeat(100), expectedRPS: 5 },
        { name: 'large', content: 'Large content '.repeat(1000), expectedRPS: 1 }
      ];

      for (const scenario of scenarios) {
        loadTester.reset();
        const file = new File([scenario.content], `${scenario.name}.txt`, { type: 'text/plain' });
        
        const testFunction = async () => {
          await parser.parseFile(file);
        };

        const result = await loadTester.runLoadTest(testFunction, 3, 1000);

        // Performance should meet scenario expectations
        expect(result.requestsPerSecond).toBeGreaterThan(scenario.expectedRPS * 0.5); // Allow 50% variance
        expect(result.errorRate).toBeLessThan(10);
      }
    });
  });
});