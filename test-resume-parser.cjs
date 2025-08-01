#!/usr/bin/env node

/**
 * Comprehensive test script for resume parsing
 * Tests all resume files and documents specific issues
 */

const fs = require('fs');
const path = require('path');

// Resume files to test
const resumeFiles = [
  'design/resume/balacv.pdf',
  'design/resume/cvgen.pdf.pdf', 
  'design/resume/resume (5).pdf',
  'design/resume/resume (7).pdf',
  'design/resume/shivacv.pdf'
];

console.log('🧪 === COMPREHENSIVE RESUME PARSING TEST ===');
console.log('Testing', resumeFiles.length, 'resume files...\n');

// Test results storage
const testResults = [];

async function testResumeFile(filePath) {
  console.log(`\n📄 Testing: ${path.basename(filePath)}`);
  console.log('─'.repeat(50));
  
  const result = {
    filename: path.basename(filePath),
    filepath: filePath,
    fileSize: 0,
    exists: false,
    parseSuccess: false,
    errorMessage: null,
    extractedData: {
      contact: false,
      workExperience: false,
      education: false,
      skills: false,
      summary: false
    },
    processingTime: 0,
    notes: []
  };

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      result.errorMessage = 'File not found';
      console.log('❌ File not found');
      return result;
    }
    
    result.exists = true;
    const stats = fs.statSync(filePath);
    result.fileSize = stats.size;
    
    console.log(`✓ File exists (${(stats.size / 1024).toFixed(1)} KB)`);
    
    // Basic file validation
    if (stats.size === 0) {
      result.errorMessage = 'File is empty';
      console.log('❌ File is empty');
      return result;
    }
    
    if (stats.size > 50 * 1024 * 1024) {
      result.errorMessage = 'File too large (>50MB)';
      console.log('❌ File too large');
      return result;
    }
    
    // Check file extension
    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.pdf') {
      result.notes.push(`Unexpected extension: ${ext}`);
      console.log(`⚠️ Unexpected extension: ${ext}`);
    }
    
    console.log('✓ Basic validation passed');
    
    // For now, we'll simulate what would happen in the browser
    // Since we can't run the actual parser in Node.js (it requires browser APIs)
    console.log('📋 File ready for browser-based parsing test');
    console.log('   - File can be read by File API: ✓ (assumed)');
    console.log('   - PDF.js compatibility: ✓ (assumed)');
    console.log('   - OCR fallback available: ✓ (assumed)');
    
    result.notes.push('File passed basic validation - needs browser testing');
    
  } catch (error) {
    result.errorMessage = error.message;
    console.log('❌ Error:', error.message);
  }
  
  return result;
}

async function runAllTests() {
  console.log('Starting comprehensive tests...\n');
  
  for (const filePath of resumeFiles) {
    const result = await testResumeFile(filePath);
    testResults.push(result);
  }
  
  // Generate summary report
  console.log('\n' + '='.repeat(60));
  console.log('📊 === TEST SUMMARY REPORT ===');
  console.log('='.repeat(60));
  
  const validFiles = testResults.filter(r => r.exists);
  const totalSize = testResults.reduce((sum, r) => sum + r.fileSize, 0);
  
  console.log(`\n📈 Statistics:`);
  console.log(`   Total files: ${resumeFiles.length}`);
  console.log(`   Valid files: ${validFiles.length}`);
  console.log(`   Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Average size: ${(totalSize / validFiles.length / 1024).toFixed(1)} KB`);
  
  console.log(`\n📋 File Details:`);
  testResults.forEach((result, index) => {
    console.log(`\n${index + 1}. ${result.filename}`);
    console.log(`   Status: ${result.exists ? '✓ Valid' : '❌ Invalid'}`);
    console.log(`   Size: ${(result.fileSize / 1024).toFixed(1)} KB`);
    if (result.errorMessage) {
      console.log(`   Error: ${result.errorMessage}`);
    }
    if (result.notes.length > 0) {
      console.log(`   Notes: ${result.notes.join(', ')}`);
    }
  });
  
  console.log(`\n🔧 === NEXT STEPS FOR BROWSER TESTING ===`);
  console.log(`\n1. Start the development server:`);
  console.log(`   npm run dev`);
  console.log(`\n2. Open the resume builder and test each file:`);
  
  validFiles.forEach((result, index) => {
    console.log(`\n   ${index + 1}. Test ${result.filename}:`);
    console.log(`      - Upload file through UI`);
    console.log(`      - Document parsing success/failure`);
    console.log(`      - Note specific error messages`);
    console.log(`      - Check data extraction quality`);
  });
  
  console.log(`\n3. Common issues to look for:`);
  console.log(`   - "Could not process PDF file" generic errors`);
  console.log(`   - Password-protected PDFs`);
  console.log(`   - Image-based PDFs requiring OCR`);
  console.log(`   - Complex layouts with poor text extraction`);
  console.log(`   - Missing or incorrectly placed section data`);
  
  console.log(`\n4. Document findings in test-results.json`);
  
  // Save results to JSON file for reference
  const jsonResults = {
    testDate: new Date().toISOString(),
    totalFiles: resumeFiles.length,
    validFiles: validFiles.length,
    results: testResults
  };
  
  fs.writeFileSync('test-results.json', JSON.stringify(jsonResults, null, 2));
  console.log(`\n💾 Test results saved to test-results.json`);
}

// Run the tests
runAllTests().catch(console.error);