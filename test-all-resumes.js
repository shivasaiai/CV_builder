#!/usr/bin/env node

/**
 * Test script to systematically test all resume files in design/resume/
 * This will help identify specific parsing issues and improve error handling
 */

import fs from 'fs';
import path from 'path';

// Resume files to test
const resumeFiles = [
  'design/resume/balacv.pdf',
  'design/resume/cvgen.pdf.pdf', 
  'design/resume/resume (5).pdf',
  'design/resume/resume (7).pdf',
  'design/resume/shivacv.pdf'
];

console.log('🧪 === RESUME PARSING TEST SUITE ===');
console.log('Testing', resumeFiles.length, 'resume files...\n');

// Check if files exist
resumeFiles.forEach((filePath, index) => {
  console.log(`${index + 1}. Testing: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`   ✓ File exists (${(stats.size / 1024).toFixed(1)} KB)`);
    
    // Basic file analysis
    if (stats.size === 0) {
      console.log('   ❌ File is empty');
    } else if (stats.size > 50 * 1024 * 1024) {
      console.log('   ⚠️ File is very large (>50MB)');
    } else {
      console.log('   ✓ File size is acceptable');
    }
    
    // Check file extension
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.pdf') {
      console.log('   ✓ PDF file detected');
    } else {
      console.log(`   ⚠️ Unexpected extension: ${ext}`);
    }
    
  } else {
    console.log('   ❌ File not found');
  }
  
  console.log('');
});

console.log('📋 === TEST SUMMARY ===');
console.log('Files found:', resumeFiles.filter(f => fs.existsSync(f)).length, '/', resumeFiles.length);
console.log('\n🔧 Next steps:');
console.log('1. Run the resume builder application');
console.log('2. Test each file through the upload interface');
console.log('3. Document specific error messages for each file');
console.log('4. Implement targeted fixes for each error type');

console.log('\n📝 Expected test results to document:');
resumeFiles.forEach((file, index) => {
  console.log(`${index + 1}. ${path.basename(file)}:`);
  console.log('   - Parsing success: [ ] Yes [ ] No');
  console.log('   - Error message: ________________');
  console.log('   - Contact info extracted: [ ] Yes [ ] No');
  console.log('   - Work experience extracted: [ ] Yes [ ] No');
  console.log('   - Education extracted: [ ] Yes [ ] No');
  console.log('   - Skills extracted: [ ] Yes [ ] No');
  console.log('');
});