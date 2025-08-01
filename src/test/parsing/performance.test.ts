import { describe, it, expect, beforeEach } from 'vitest';
import { MultiStrategyParser } from '@/components/builder/services/parsing/MultiStrategyParser';
import { createMockFile, createPerformanceBenchmark, PerformanceBenchmark } from './test-data';

describe('Parsing Performance Tests', () => {
  let parser: MultiStrategyParser;
  let benchmarks: PerformanceBenchmark[] = [];

  beforeEach(() => {
    parser = new MultiStrategyParser();
    benchmarks = [];
  });

  describe('file size performance', () => {
    it('should handle small files efficiently', async () => {
      const smallContent = 'John Doe\nSoftware Engineer\njohn@email.com';
      const smallFile = new File([smallContent], 'small.txt', { type: 'text/plain' });

      const startTime = performance.now();
      const result = await parser.parseFile(smallFile);
      const endTime = performance.now();

      const benchmark = createPerformanceBenchmark(
        'small.txt',
        result.method,
        smallFile.size,
        endTime - startTime,
        true
      );

      benchmarks.push(benchmark);

      expect(benchmark.processingTime).toBeLessThan(100); // Should be very fast
      expect(result.text).toBeDefined();
    });

    it('should handle medium files within acceptable time', async () => {
      const mediumContent = `
        John Doe
        Senior Software Engineer
        Email: john.doe@email.com
        Phone: (555) 123-4567
        
        EXPERIENCE
        Senior Software Engineer | Tech Corp | 2020-2023
        - Developed web applications using React and Node.js
        - Led team of 5 developers on major product initiatives
        - Improved system performance by 40%
        
        Software Engineer | StartupCo | 2018-2020
        - Built scalable backend services using Python and Django
        - Implemented CI/CD pipelines and automated testing
        
        EDUCATION
        Bachelor of Science in Computer Science
        University of California, Berkeley | 2018
        GPA: 3.8/4.0
        
        SKILLS
        Programming Languages: JavaScript, Python, Java, TypeScript
        Frameworks: React, Node.js, Django, Express
        Tools: Git, Docker, AWS, Jenkins
      `.repeat(10);

      const mediumFile = new File([mediumContent], 'medium.txt', { type: 'text/plain' });

      const startTime = performance.now();
      const result = await parser.parseFile(mediumFile);
      const endTime = performance.now();

      const benchmark = createPerformanceBenchmark(
        'medium.txt',
        result.method,
        mediumFile.size,
        endTime - startTime,
        true
      );

      benchmarks.push(benchmark);

      expect(benchmark.processingTime).toBeLessThan(500); // Should complete within 500ms
      expect(result.text.length).toBeGreaterThan(1000);
    });

    it('should handle large files with reasonable performance', async () => {
      const baseContent = `
        John Doe - Senior Software Engineer
        Contact: john.doe@email.com | (555) 123-4567
        
        PROFESSIONAL EXPERIENCE
        Senior Software Engineer | Tech Corporation | 2020-Present
        • Developed and maintained web applications using React, Node.js, and TypeScript
        • Led cross-functional team of 8 developers and designers
        • Implemented microservices architecture reducing system latency by 45%
        • Mentored junior developers and conducted code reviews
        
        Software Engineer | Innovation Startup | 2018-2020
        • Built scalable backend services using Python, Django, and PostgreSQL
        • Designed and implemented RESTful APIs serving 100k+ daily requests
        • Established CI/CD pipelines using Jenkins and Docker
        • Collaborated with product managers and UX designers
        
        EDUCATION
        Master of Science in Computer Science | Stanford University | 2018
        Bachelor of Science in Computer Science | UC Berkeley | 2016
        
        TECHNICAL SKILLS
        Languages: JavaScript, TypeScript, Python, Java, Go, SQL
        Frameworks: React, Node.js, Django, Express, Spring Boot
        Databases: PostgreSQL, MongoDB, Redis, Elasticsearch
        Tools: Git, Docker, Kubernetes, AWS, Jenkins, Terraform
        
        PROJECTS
        E-commerce Platform | Lead Developer
        • Built full-stack e-commerce solution handling 10k+ transactions daily
        • Implemented payment processing, inventory management, and analytics
        • Technologies: React, Node.js, PostgreSQL, Stripe API
        
        Real-time Chat Application | Full-stack Developer
        • Developed real-time messaging platform with WebSocket support
        • Implemented user authentication, message encryption, and file sharing
        • Technologies: React, Socket.io, Express, MongoDB
      `;

      const largeContent = baseContent.repeat(100); // Create ~100KB file
      const largeFile = new File([largeContent], 'large.txt', { type: 'text/plain' });

      const startTime = performance.now();
      const result = await parser.parseFile(largeFile);
      const endTime = performance.now();

      const benchmark = createPerformanceBenchmark(
        'large.txt',
        result.method,
        largeFile.size,
        endTime - startTime,
        true
      );

      benchmarks.push(benchmark);

      expect(benchmark.processingTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(result.text.length).toBeGreaterThan(50000);
      expect(benchmark.fileSize).toBeGreaterThan(50000); // Should be substantial file
    });
  });

  describe('strategy performance comparison', () => {
    it('should benchmark different strategies', async () => {
      const testContent = 'John Doe\nSoftware Engineer\njohn@email.com\n(555) 123-4567';
      
      // Test text file
      const textFile = new File([testContent], 'test.txt', { type: 'text/plain' });
      
      const startTime = performance.now();
      const result = await parser.parseFile(textFile);
      const endTime = performance.now();

      const benchmark = createPerformanceBenchmark(
        'test.txt',
        result.method,
        textFile.size,
        endTime - startTime,
        true
      );

      benchmarks.push(benchmark);

      expect(benchmark.success).toBe(true);
      expect(benchmark.processingTime).toBeGreaterThan(0);
    });

    it('should track memory usage during parsing', async () => {
      const content = 'Test content for memory tracking';
      const file = new File([content], 'memory-test.txt', { type: 'text/plain' });

      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      await parser.parseFile(file);
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryDelta = finalMemory - initialMemory;

      // Memory usage should be reasonable (less than 10MB for small files)
      expect(Math.abs(memoryDelta)).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('concurrent parsing performance', () => {
    it('should handle multiple files concurrently', async () => {
      const files = Array.from({ length: 5 }, (_, i) => 
        new File([`Resume content ${i}`], `resume-${i}.txt`, { type: 'text/plain' })
      );

      const startTime = performance.now();
      
      const promises = files.map(file => parser.parseFile(file));
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Concurrent parsing should be faster than sequential
      expect(results).toHaveLength(5);
      expect(totalTime).toBeLessThan(1000); // Should complete within 1 second
      
      results.forEach((result, index) => {
        expect(result.text).toContain(`Resume content ${index}`);
      });
    });

    it('should handle mixed file types concurrently', async () => {
      const files = [
        new File(['Text resume'], 'resume1.txt', { type: 'text/plain' }),
        new File(['Another text resume'], 'resume2.txt', { type: 'text/plain' }),
        new File(['Third resume'], 'resume3.txt', { type: 'text/plain' })
      ];

      const startTime = performance.now();
      
      const results = await Promise.allSettled(
        files.map(file => parser.parseFile(file))
      );
      
      const endTime = performance.now();

      const successfulResults = results.filter(r => r.status === 'fulfilled');
      expect(successfulResults.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('performance regression detection', () => {
    it('should maintain consistent performance across runs', async () => {
      const testFile = new File(['Consistent test content'], 'consistent.txt', { type: 'text/plain' });
      const runs = 5;
      const times: number[] = [];

      for (let i = 0; i < runs; i++) {
        const startTime = performance.now();
        await parser.parseFile(testFile);
        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);

      // Performance should be consistent (max time shouldn't be more than 3x min time)
      expect(maxTime / minTime).toBeLessThan(3);
      expect(averageTime).toBeLessThan(200); // Average should be reasonable
    });

    it('should detect performance degradation', async () => {
      const baselineFile = new File(['Baseline content'], 'baseline.txt', { type: 'text/plain' });
      
      // Establish baseline
      const baselineStart = performance.now();
      await parser.parseFile(baselineFile);
      const baselineTime = performance.now() - baselineStart;

      // Test current performance
      const currentStart = performance.now();
      await parser.parseFile(baselineFile);
      const currentTime = performance.now() - currentStart;

      // Current performance shouldn't be significantly worse than baseline
      // Allow for some variance due to system conditions
      expect(currentTime).toBeLessThan(baselineTime * 2);
    });
  });

  describe('resource cleanup', () => {
    it('should not leak memory after parsing', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Parse multiple files
      for (let i = 0; i < 10; i++) {
        const file = new File([`Content ${i}`], `file-${i}.txt`, { type: 'text/plain' });
        await parser.parseFile(file);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal (less than 5MB)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });
  });

  // Helper to log performance results
  afterEach(() => {
    if (benchmarks.length > 0) {
      console.log('\n📊 Performance Benchmarks:');
      benchmarks.forEach(benchmark => {
        console.log(`  ${benchmark.fileName}: ${benchmark.processingTime.toFixed(2)}ms (${benchmark.fileSize} bytes, ${benchmark.strategy})`);
      });
    }
  });
});