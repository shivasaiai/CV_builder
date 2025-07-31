import { ParsingStrategy, ParserConfiguration, FallbackOption, ParsingError } from './interfaces';
import { PDFParsingStrategy } from './strategies/PDFParsingStrategy';
import { DOCXParsingStrategy } from './strategies/DOCXParsingStrategy';
import { TextParsingStrategy } from './strategies/TextParsingStrategy';
import { OCRParsingStrategy } from './strategies/OCRParsingStrategy';

/**
 * Factory class for creating and managing parsing strategies
 * Implements priority-based selection and fallback mechanisms
 */
export class StrategyFactory {
  private strategies: Map<string, ParsingStrategy> = new Map();
  private fallbackChain: FallbackOption[] = [];
  private configuration: ParserConfiguration;

  constructor(configuration: ParserConfiguration) {
    this.configuration = configuration;
    this.initializeStrategies();
    this.setupFallbackChain();
  }

  /**
   * Initialize all available parsing strategies
   */
  private initializeStrategies(): void {
    const strategies = [
      new PDFParsingStrategy(),
      new DOCXParsingStrategy(),
      new TextParsingStrategy(),
      new OCRParsingStrategy(this.configuration.ocrSettings)
    ];

    // Sort strategies by priority (higher priority first)
    strategies.sort((a, b) => b.priority - a.priority);

    // Register strategies
    strategies.forEach(strategy => {
      this.strategies.set(strategy.name, strategy);
    });

    console.log('Initialized parsing strategies:', Array.from(this.strategies.keys()));
  }

  /**
   * Setup fallback chain based on configuration
   */
  private setupFallbackChain(): void {
    this.fallbackChain = this.configuration.fallbackOptions.sort(
      (a, b) => b.priority - a.priority
    );

    console.log('Fallback chain configured:', this.fallbackChain.map(f => f.name));
  }

  /**
   * Select the best parsing strategy for a given file
   */
  public selectStrategy(file: File): ParsingStrategy {
    console.log(`Selecting strategy for file: ${file.name} (${file.type})`);

    // Get all strategies that can handle this file
    const compatibleStrategies = Array.from(this.strategies.values())
      .filter(strategy => strategy.canHandle(file))
      .map(strategy => ({
        strategy,
        confidence: strategy.getConfidenceScore(file)
      }))
      .sort((a, b) => {
        // First sort by confidence, then by priority
        if (a.confidence !== b.confidence) {
          return b.confidence - a.confidence;
        }
        return b.strategy.priority - a.strategy.priority;
      });

    if (compatibleStrategies.length === 0) {
      throw new ParsingError(
        `No compatible parsing strategy found for file: ${file.name}`,
        'NO_COMPATIBLE_STRATEGY',
        false,
        [
          'Ensure the file is a supported format (PDF, DOCX, TXT, or image)',
          'Check if the file is corrupted',
          'Try converting to a different format'
        ]
      );
    }

    const selectedStrategy = compatibleStrategies[0].strategy;
    console.log(`Selected strategy: ${selectedStrategy.name} (confidence: ${compatibleStrategies[0].confidence})`);

    return selectedStrategy;
  }

  /**
   * Get fallback strategies for a failed parsing attempt
   */
  public getFallbackStrategies(error: Error, file: File, excludeStrategies: string[] = []): ParsingStrategy[] {
    console.log(`Finding fallback strategies for error: ${error.message}`);

    const fallbackStrategies = this.fallbackChain
      .filter(fallback => {
        // Check if fallback condition is met
        if (!fallback.condition(error, file)) {
          return false;
        }

        // Exclude already tried strategies
        if (excludeStrategies.includes(fallback.strategy.name)) {
          return false;
        }

        // Check if strategy can handle the file
        return fallback.strategy.canHandle(file);
      })
      .map(fallback => fallback.strategy);

    console.log(`Found ${fallbackStrategies.length} fallback strategies:`, 
      fallbackStrategies.map(s => s.name));

    return fallbackStrategies;
  }

  /**
   * Get all available strategies
   */
  public getAllStrategies(): ParsingStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Get strategy by name
   */
  public getStrategy(name: string): ParsingStrategy | undefined {
    return this.strategies.get(name);
  }

  /**
   * Add a custom strategy
   */
  public addStrategy(strategy: ParsingStrategy): void {
    this.strategies.set(strategy.name, strategy);
    console.log(`Added custom strategy: ${strategy.name}`);
  }

  /**
   * Remove a strategy
   */
  public removeStrategy(name: string): boolean {
    const removed = this.strategies.delete(name);
    if (removed) {
      console.log(`Removed strategy: ${name}`);
    }
    return removed;
  }

  /**
   * Update configuration
   */
  public updateConfiguration(configuration: Partial<ParserConfiguration>): void {
    this.configuration = { ...this.configuration, ...configuration };
    
    // Reinitialize if strategies or fallback options changed
    if (configuration.strategies || configuration.fallbackOptions) {
      this.initializeStrategies();
      this.setupFallbackChain();
    }

    console.log('Configuration updated');
  }

  /**
   * Validate strategy configuration
   */
  public validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if we have at least one strategy
    if (this.strategies.size === 0) {
      errors.push('No parsing strategies configured');
    }

    // Check if all fallback strategies are registered
    for (const fallback of this.fallbackChain) {
      if (!this.strategies.has(fallback.strategy.name)) {
        errors.push(`Fallback strategy '${fallback.strategy.name}' is not registered`);
      }
    }

    // Check for duplicate priorities
    const priorities = Array.from(this.strategies.values()).map(s => s.priority);
    const uniquePriorities = new Set(priorities);
    if (priorities.length !== uniquePriorities.size) {
      errors.push('Duplicate strategy priorities detected');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Create ParsingError with proper typing
 */
function ParsingError(message: string, code: string, recoverable: boolean, suggestions: string[]): ParsingError {
  const error = new Error(message) as ParsingError;
  error.code = code;
  error.recoverable = recoverable;
  error.suggestions = suggestions;
  return error;
}