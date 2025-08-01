import * as pdfjsLib from 'pdfjs-dist';

/**
 * PDF Analysis and Detection System
 * Provides comprehensive PDF analysis for optimal parsing strategy selection
 */

export interface PDFAnalysisResult {
  isPasswordProtected: boolean;
  isImageBased: boolean;
  hasSelectableText: boolean;
  pageCount: number;
  estimatedTextDensity: number;
  documentMetadata: PDFMetadata;
  layoutComplexity: 'simple' | 'moderate' | 'complex';
  recommendedStrategy: 'text_extraction' | 'ocr' | 'hybrid';
  warnings: string[];
  processingHints: string[];
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  keywords?: string;
  subject?: string;
  pdfVersion?: string;
  isLinearized?: boolean;
  isEncrypted?: boolean;
  permissions?: PDFPermissions;
}

export interface PDFPermissions {
  printing: boolean;
  modifying: boolean;
  copying: boolean;
  annotating: boolean;
  fillingForms: boolean;
  copyingForAccessibility: boolean;
  documentAssembly: boolean;
  printingHighQuality: boolean;
}

export interface PageAnalysis {
  pageNumber: number;
  textItems: number;
  imageItems: number;
  textDensity: number;
  hasComplexLayout: boolean;
  estimatedReadingOrder: 'simple' | 'complex';
  containsImages: boolean;
  containsTables: boolean;
}

/**
 * Advanced PDF analyzer for resume parsing optimization
 */
export class PDFAnalyzer {
  
  /**
   * Perform comprehensive PDF analysis
   */
  public static async analyzePDF(file: File): Promise<PDFAnalysisResult> {
    console.log('🔍 Starting comprehensive PDF analysis...');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Initial PDF loading and basic checks
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 0,
        cMapPacked: true,
        standardFontDataUrl: null
      });
      
      const pdf = await loadingTask.promise;
      
      // Extract metadata
      const metadata = await this.extractMetadata(pdf);
      
      // Check for password protection
      const isPasswordProtected = metadata.isEncrypted || false;
      
      if (isPasswordProtected) {
        return {
          isPasswordProtected: true,
          isImageBased: false,
          hasSelectableText: false,
          pageCount: pdf.numPages,
          estimatedTextDensity: 0,
          documentMetadata: metadata,
          layoutComplexity: 'simple',
          recommendedStrategy: 'ocr',
          warnings: ['PDF is password protected and cannot be processed'],
          processingHints: ['Remove password protection', 'Use an unlocked version']
        };
      }
      
      // Analyze pages
      const pageAnalyses = await this.analyzePages(pdf);
      
      // Determine document characteristics
      const analysis = this.synthesizeAnalysis(pageAnalyses, metadata);
      
      console.log('✅ PDF analysis completed:', analysis);
      
      return analysis;
      
    } catch (error) {
      console.error('❌ PDF analysis failed:', error);
      
      // Return fallback analysis
      return {
        isPasswordProtected: false,
        isImageBased: true, // Assume image-based if analysis fails
        hasSelectableText: false,
        pageCount: 1,
        estimatedTextDensity: 0,
        documentMetadata: {},
        layoutComplexity: 'complex',
        recommendedStrategy: 'ocr',
        warnings: [`PDF analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        processingHints: ['Try OCR processing', 'Verify PDF is not corrupted']
      };
    }
  }

  /**
   * Extract comprehensive PDF metadata
   */
  private static async extractMetadata(pdf: any): Promise<PDFMetadata> {
    try {
      const metadata = await pdf.getMetadata();
      const info = metadata.info || {};
      const metadataObj = metadata.metadata || {};
      
      return {
        title: info.Title || undefined,
        author: info.Author || undefined,
        creator: info.Creator || undefined,
        producer: info.Producer || undefined,
        creationDate: info.CreationDate ? new Date(info.CreationDate) : undefined,
        modificationDate: info.ModDate ? new Date(info.ModDate) : undefined,
        keywords: info.Keywords || undefined,
        subject: info.Subject || undefined,
        pdfVersion: info.PDFFormatVersion || undefined,
        isLinearized: info.IsLinearized || false,
        isEncrypted: info.IsAcroFormPresent || false,
        permissions: await this.extractPermissions(pdf)
      };
    } catch (error) {
      console.warn('Failed to extract PDF metadata:', error);
      return {};
    }
  }

  /**
   * Extract PDF permissions
   */
  private static async extractPermissions(pdf: any): Promise<PDFPermissions> {
    try {
      // PDF.js doesn't directly expose permissions, so we'll use defaults
      // In a production system, you might use a more comprehensive PDF library
      return {
        printing: true,
        modifying: true,
        copying: true,
        annotating: true,
        fillingForms: true,
        copyingForAccessibility: true,
        documentAssembly: true,
        printingHighQuality: true
      };
    } catch (error) {
      console.warn('Failed to extract PDF permissions:', error);
      return {
        printing: false,
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        copyingForAccessibility: false,
        documentAssembly: false,
        printingHighQuality: false
      };
    }
  }

  /**
   * Analyze individual pages for content and layout
   */
  private static async analyzePages(pdf: any): Promise<PageAnalysis[]> {
    const pageAnalyses: PageAnalysis[] = [];
    const maxPagesToAnalyze = Math.min(pdf.numPages, 5); // Analyze first 5 pages for performance
    
    for (let pageNum = 1; pageNum <= maxPagesToAnalyze; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const analysis = await this.analyzePage(page, pageNum);
        pageAnalyses.push(analysis);
      } catch (error) {
        console.warn(`Failed to analyze page ${pageNum}:`, error);
        // Add minimal analysis for failed page
        pageAnalyses.push({
          pageNumber: pageNum,
          textItems: 0,
          imageItems: 0,
          textDensity: 0,
          hasComplexLayout: true,
          estimatedReadingOrder: 'complex',
          containsImages: false,
          containsTables: false
        });
      }
    }
    
    return pageAnalyses;
  }

  /**
   * Analyze a single PDF page
   */
  private static async analyzePage(page: any, pageNumber: number): Promise<PageAnalysis> {
    try {
      // Get text content
      const textContent = await page.getTextContent();
      const textItems = textContent.items || [];
      
      // Get page viewport for layout analysis
      const viewport = page.getViewport({ scale: 1.0 });
      const pageArea = viewport.width * viewport.height;
      
      // Calculate text density
      const totalTextLength = textItems.reduce((sum: number, item: any) => 
        sum + (item.str ? item.str.length : 0), 0
      );
      const textDensity = pageArea > 0 ? totalTextLength / pageArea : 0;
      
      // Analyze layout complexity
      const layoutAnalysis = this.analyzePageLayout(textItems, viewport);
      
      // Check for images (simplified - PDF.js doesn't easily expose image info)
      const containsImages = await this.checkForImages(page);
      
      // Detect tables (heuristic based on text positioning)
      const containsTables = this.detectTables(textItems);
      
      return {
        pageNumber,
        textItems: textItems.length,
        imageItems: containsImages ? 1 : 0, // Simplified
        textDensity,
        hasComplexLayout: layoutAnalysis.isComplex,
        estimatedReadingOrder: layoutAnalysis.readingOrder,
        containsImages,
        containsTables
      };
      
    } catch (error) {
      console.warn(`Page ${pageNumber} analysis failed:`, error);
      return {
        pageNumber,
        textItems: 0,
        imageItems: 0,
        textDensity: 0,
        hasComplexLayout: true,
        estimatedReadingOrder: 'complex',
        containsImages: false,
        containsTables: false
      };
    }
  }

  /**
   * Analyze page layout complexity
   */
  private static analyzePageLayout(textItems: any[], viewport: any): {
    isComplex: boolean;
    readingOrder: 'simple' | 'complex';
  } {
    if (textItems.length === 0) {
      return { isComplex: false, readingOrder: 'simple' };
    }

    // Analyze text positioning patterns
    const positions = textItems.map((item: any) => ({
      x: item.transform ? item.transform[4] : 0,
      y: item.transform ? item.transform[5] : 0,
      width: item.width || 0,
      height: item.height || 0
    }));

    // Check for multiple columns (simplified heuristic)
    const xPositions = positions.map(p => p.x).sort((a, b) => a - b);
    const uniqueXPositions = [...new Set(xPositions.map(x => Math.round(x / 10) * 10))];
    const hasMultipleColumns = uniqueXPositions.length > 3;

    // Check for scattered text (indicates complex layout)
    const yPositions = positions.map(p => p.y).sort((a, b) => b - a);
    const yVariance = this.calculateVariance(yPositions);
    const hasScatteredText = yVariance > viewport.height * 0.1;

    const isComplex = hasMultipleColumns || hasScatteredText || textItems.length > 200;
    const readingOrder = isComplex ? 'complex' : 'simple';

    return { isComplex, readingOrder };
  }

  /**
   * Check for images in the page (simplified)
   */
  private static async checkForImages(page: any): Promise<boolean> {
    try {
      // This is a simplified check - PDF.js doesn't easily expose image information
      // In a production system, you might use additional libraries or techniques
      const operatorList = await page.getOperatorList();
      
      // Look for image-related operators
      const imageOperators = ['paintImageXObject', 'paintInlineImageXObject', 'paintImageMaskXObject'];
      const hasImages = operatorList.fnArray.some((fn: number, index: number) => {
        const opName = operatorList.fnArray[index];
        return imageOperators.includes(opName);
      });
      
      return hasImages;
    } catch (error) {
      console.warn('Failed to check for images:', error);
      return false;
    }
  }

  /**
   * Detect tables based on text positioning (heuristic)
   */
  private static detectTables(textItems: any[]): boolean {
    if (textItems.length < 10) return false;

    // Group items by approximate Y position (rows)
    const rowGroups = new Map<number, any[]>();
    
    textItems.forEach(item => {
      if (item.transform) {
        const y = Math.round(item.transform[5] / 5) * 5; // Group by 5-unit intervals
        if (!rowGroups.has(y)) {
          rowGroups.set(y, []);
        }
        rowGroups.get(y)!.push(item);
      }
    });

    // Check if we have multiple rows with similar column structures
    const rows = Array.from(rowGroups.values()).filter(row => row.length > 2);
    if (rows.length < 3) return false;

    // Check for consistent column positions across rows
    const columnPositions = rows.map(row => 
      row.map(item => Math.round(item.transform[4] / 10) * 10).sort((a, b) => a - b)
    );

    // Simple heuristic: if multiple rows have similar column structures, it's likely a table
    const firstRowColumns = columnPositions[0];
    const similarRows = columnPositions.filter(rowCols => 
      rowCols.length === firstRowColumns.length &&
      rowCols.every((col, index) => Math.abs(col - firstRowColumns[index]) < 20)
    );

    return similarRows.length >= 3;
  }

  /**
   * Calculate variance for layout analysis
   */
  private static calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }

  /**
   * Synthesize overall analysis from page analyses
   */
  private static synthesizeAnalysis(
    pageAnalyses: PageAnalysis[], 
    metadata: PDFMetadata
  ): PDFAnalysisResult {
    const totalPages = pageAnalyses.length;
    const totalTextItems = pageAnalyses.reduce((sum, page) => sum + page.textItems, 0);
    const averageTextDensity = pageAnalyses.reduce((sum, page) => sum + page.textDensity, 0) / totalPages;
    
    // Determine if document is image-based
    const pagesWithText = pageAnalyses.filter(page => page.textItems > 0).length;
    const textPageRatio = pagesWithText / totalPages;
    const isImageBased = textPageRatio < 0.5 || averageTextDensity < 0.001;
    
    // Determine if document has selectable text
    const hasSelectableText = totalTextItems > 50 && !isImageBased;
    
    // Determine layout complexity
    const complexPages = pageAnalyses.filter(page => page.hasComplexLayout).length;
    const complexityRatio = complexPages / totalPages;
    
    let layoutComplexity: 'simple' | 'moderate' | 'complex';
    if (complexityRatio < 0.3) {
      layoutComplexity = 'simple';
    } else if (complexityRatio < 0.7) {
      layoutComplexity = 'moderate';
    } else {
      layoutComplexity = 'complex';
    }
    
    // Determine recommended strategy
    let recommendedStrategy: 'text_extraction' | 'ocr' | 'hybrid';
    if (isImageBased) {
      recommendedStrategy = 'ocr';
    } else if (hasSelectableText && layoutComplexity === 'simple') {
      recommendedStrategy = 'text_extraction';
    } else {
      recommendedStrategy = 'hybrid';
    }
    
    // Generate warnings and processing hints
    const warnings: string[] = [];
    const processingHints: string[] = [];
    
    if (isImageBased) {
      warnings.push('Document appears to be image-based');
      processingHints.push('OCR processing will be used');
    }
    
    if (layoutComplexity === 'complex') {
      warnings.push('Complex layout detected');
      processingHints.push('Text extraction may require additional processing');
    }
    
    if (averageTextDensity < 0.01) {
      warnings.push('Low text density detected');
      processingHints.push('Document may have limited text content');
    }
    
    const pagesWithImages = pageAnalyses.filter(page => page.containsImages).length;
    if (pagesWithImages > 0) {
      processingHints.push(`${pagesWithImages} pages contain images`);
    }
    
    const pagesWithTables = pageAnalyses.filter(page => page.containsTables).length;
    if (pagesWithTables > 0) {
      processingHints.push(`${pagesWithTables} pages contain table-like structures`);
    }

    return {
      isPasswordProtected: false,
      isImageBased,
      hasSelectableText,
      pageCount: totalPages,
      estimatedTextDensity: averageTextDensity,
      documentMetadata: metadata,
      layoutComplexity,
      recommendedStrategy,
      warnings,
      processingHints
    };
  }
}