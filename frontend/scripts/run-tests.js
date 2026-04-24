#!/usr/bin/env node

/**
 * Comprehensive test runner for the resume builder enhancements
 * Runs all test suites and generates a summary report
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test suites configuration
const testSuites = [
  {
    name: 'Parsing Unit Tests',
    pattern: 'src/test/parsing/**/*.test.ts',
    description: 'Tests for PDF parsing strategies and multi-strategy parser'
  },
  {
    name: 'UI/UX Component Tests',
    pattern: 'src/test/ui/**/*.test.tsx',
    description: 'Tests for progressive flow, enhanced preview, and workflow components'
  },
  {
    name: 'Performance Tests',
    pattern: 'src/test/performance/**/*.test.ts',
    description: 'Performance benchmarking and load testing'
  },
  {
    name: 'Integration Tests',
    pattern: 'src/test/parsing/integration.test.ts',
    description: 'End-to-end parsing integration tests'
  }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader() {
  console.log(colorize('\n🧪 Resume Builder Enhancement Test Suite', 'cyan'));
  console.log(colorize('=' .repeat(50), 'cyan'));
  console.log();
}

function printSummary(results) {
  console.log(colorize('\n📊 Test Summary', 'bright'));
  console.log(colorize('-'.repeat(30), 'bright'));
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  results.forEach(result => {
    const status = result.success ? 
      colorize('✅ PASSED', 'green') : 
      colorize('❌ FAILED', 'red');
    
    console.log(`${status} ${result.name}`);
    
    if (result.success) {
      totalPassed++;
    } else {
      totalFailed++;
      console.log(colorize(`   Error: ${result.error}`, 'red'));
    }
  });
  
  console.log();
  console.log(colorize(`Total: ${totalPassed + totalFailed} suites`, 'bright'));
  console.log(colorize(`Passed: ${totalPassed}`, 'green'));
  console.log(colorize(`Failed: ${totalFailed}`, 'red'));
  
  if (totalFailed === 0) {
    console.log(colorize('\n🎉 All tests passed!', 'green'));
  } else {
    console.log(colorize('\n⚠️  Some tests failed. Please review the errors above.', 'yellow'));
  }
}

async function runTestSuite(suite) {
  console.log(colorize(`\n🔍 Running: ${suite.name}`, 'blue'));
  console.log(colorize(`   ${suite.description}`, 'bright'));
  console.log(colorize(`   Pattern: ${suite.pattern}`, 'bright'));
  
  try {
    const command = `npm test -- --run "${suite.pattern}"`;
    execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    console.log(colorize('   ✅ Passed', 'green'));
    return { name: suite.name, success: true };
  } catch (error) {
    console.log(colorize('   ❌ Failed', 'red'));
    return { 
      name: suite.name, 
      success: false, 
      error: error.message.split('\n')[0] // First line of error
    };
  }
}

async function runAllTests() {
  printHeader();
  
  const results = [];
  
  for (const suite of testSuites) {
    const result = await runTestSuite(suite);
    results.push(result);
  }
  
  printSummary(results);
  
  // Exit with error code if any tests failed
  const failedCount = results.filter(r => !r.success).length;
  process.exit(failedCount > 0 ? 1 : 0);
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(colorize('\n🧪 Resume Builder Test Runner', 'cyan'));
  console.log('\nUsage:');
  console.log('  node scripts/run-tests.js [options]');
  console.log('\nOptions:');
  console.log('  --help, -h     Show this help message');
  console.log('  --list, -l     List available test suites');
  console.log('  --suite <name> Run specific test suite');
  console.log('\nExamples:');
  console.log('  node scripts/run-tests.js');
  console.log('  node scripts/run-tests.js --suite "Parsing Unit Tests"');
  console.log('  node scripts/run-tests.js --list');
  process.exit(0);
}

if (args.includes('--list') || args.includes('-l')) {
  console.log(colorize('\n📋 Available Test Suites:', 'cyan'));
  testSuites.forEach((suite, index) => {
    console.log(colorize(`\n${index + 1}. ${suite.name}`, 'bright'));
    console.log(`   ${suite.description}`);
    console.log(`   Pattern: ${suite.pattern}`);
  });
  process.exit(0);
}

const suiteIndex = args.indexOf('--suite');
if (suiteIndex !== -1 && args[suiteIndex + 1]) {
  const suiteName = args[suiteIndex + 1];
  const suite = testSuites.find(s => s.name === suiteName);
  
  if (!suite) {
    console.error(colorize(`❌ Test suite "${suiteName}" not found.`, 'red'));
    console.log(colorize('\nAvailable suites:', 'yellow'));
    testSuites.forEach(s => console.log(`  - ${s.name}`));
    process.exit(1);
  }
  
  printHeader();
  runTestSuite(suite).then(result => {
    printSummary([result]);
    process.exit(result.success ? 0 : 1);
  });
} else {
  // Run all tests
  runAllTests();
}