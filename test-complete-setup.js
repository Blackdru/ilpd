#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 PDFPet Complete Setup Test\n');
console.log('='.repeat(50));

let passedTests = 0;
let totalTests = 0;

function test(name, condition, details = '') {
  totalTests++;
  if (condition) {
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
    passedTests++;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
  }
}

// Test 1: Project Structure
console.log('\n📁 Project Structure Tests');
console.log('-'.repeat(30));

test('Backend directory exists', fs.existsSync(path.join(__dirname, 'backend')));
test('Web directory exists', fs.existsSync(path.join(__dirname, 'web')));
test('Backend package.json exists', fs.existsSync(path.join(__dirname, 'backend/package.json')));
test('Web package.json exists', fs.existsSync(path.join(__dirname, 'web/package.json')));
test('Database schema exists', fs.existsSync(path.join(__dirname, 'backend/database/complete-schema.sql')));

// Test 2: Backend Files
console.log('\n🔧 Backend Files Tests');
console.log('-'.repeat(30));

const backendFiles = [
  'src/server.js',
  'src/config/supabase.js',
  'src/middleware/auth.js',
  'src/middleware/validation.js',
  'src/routes/auth.js',
  'src/routes/files.js',
  'src/routes/pdf.js',
  'src/routes/ai.js',
  'src/services/aiService.js',
  'src/services/ocrService.js',
  '.env'
];

backendFiles.forEach(file => {
  test(`Backend ${file}`, fs.existsSync(path.join(__dirname, 'backend', file)));
});

// Test 3: Frontend Files
console.log('\n🎨 Frontend Files Tests');
console.log('-'.repeat(30));

const frontendFiles = [
  'src/App.jsx',
  'src/main.jsx',
  'src/index.css',
  'src/lib/api.js',
  'src/lib/supabase.js',
  'src/contexts/AuthContext.jsx',
  'src/contexts/ThemeContext.jsx',
  'src/components/ui/textarea.jsx',
  'src/pages/Tools.jsx',
  'src/pages/AdvancedTools.jsx',
  '.env'
];

frontendFiles.forEach(file => {
  test(`Frontend ${file}`, fs.existsSync(path.join(__dirname, 'web', file)));
});

// Test 4: Environment Configuration
console.log('\n⚙️ Environment Configuration Tests');
console.log('-'.repeat(30));

try {
  require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });
  
  test('Backend .env loaded', true);
  test('SUPABASE_URL set', !!process.env.SUPABASE_URL);
  test('SUPABASE_ANON_KEY set', !!process.env.SUPABASE_ANON_KEY);
  test('SUPABASE_SERVICE_ROLE_KEY set', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  test('OPENROUTER_API_KEY set', !!process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key_here');
  test('AI_MODEL configured', !!process.env.AI_MODEL);
  test('ENABLE_AI_FEATURES enabled', process.env.ENABLE_AI_FEATURES === 'true');
  test('ENABLE_OCR enabled', process.env.ENABLE_OCR === 'true');
} catch (error) {
  test('Backend environment loading', false, error.message);
}

// Test 5: Dependencies
console.log('\n📦 Dependencies Tests');
console.log('-'.repeat(30));

test('Backend node_modules exists', fs.existsSync(path.join(__dirname, 'backend/node_modules')));
test('Frontend node_modules exists', fs.existsSync(path.join(__dirname, 'web/node_modules')));

// Test key backend dependencies
const backendDeps = [
  { name: 'express', path: 'express' },
  { name: 'supabase', path: '@supabase/supabase-js' },
  { name: 'pdf-lib', path: 'pdf-lib' },
  { name: 'tesseract.js', path: 'tesseract.js' },
  { name: 'openai', path: 'openai' },
  { name: 'sharp', path: 'sharp' }
];

backendDeps.forEach(dep => {
  try {
    require.resolve(path.join(__dirname, 'backend/node_modules', dep.path));
    test(`Backend dependency: ${dep.name}`, true);
  } catch (error) {
    test(`Backend dependency: ${dep.name}`, false);
  }
});

// Test 6: Configuration Validation
console.log('\n🔍 Configuration Validation Tests');
console.log('-'.repeat(30));

try {
  const backendPackage = JSON.parse(fs.readFileSync(path.join(__dirname, 'backend/package.json'), 'utf8'));
  const webPackage = JSON.parse(fs.readFileSync(path.join(__dirname, 'web/package.json'), 'utf8'));
  
  test('Backend package.json valid', !!backendPackage.name);
  test('Frontend package.json valid', !!webPackage.name);
  test('Backend has start script', !!backendPackage.scripts?.start);
  test('Backend has dev script', !!backendPackage.scripts?.dev);
  test('Frontend has dev script', !!webPackage.scripts?.dev);
  test('Frontend has build script', !!webPackage.scripts?.build);
} catch (error) {
  test('Package.json validation', false, error.message);
}

// Test 7: Service Health (if possible)
console.log('\n🏥 Service Health Tests');
console.log('-'.repeat(30));

try {
  const aiService = require('./backend/src/services/aiService');
  test('AI Service loads', true);
  test('AI Service enabled', aiService.isEnabled(), `Using OpenRouter: ${aiService.isUsingOpenRouter}`);
} catch (error) {
  test('AI Service loads', false, error.message);
}

try {
  const ocrService = require('./backend/src/services/ocrService');
  test('OCR Service loads', true);
  test('OCR Service enabled', ocrService.isEnabled());
} catch (error) {
  test('OCR Service loads', false, error.message);
}

// Test 8: File Structure Integrity
console.log('\n📋 File Structure Integrity Tests');
console.log('-'.repeat(30));

const criticalFiles = [
  'start-project.js',
  'README.md',
  'backend/test-startup.js',
  'web/src/components/ui/textarea.jsx'
];

criticalFiles.forEach(file => {
  test(`Critical file: ${file}`, fs.existsSync(path.join(__dirname, file)));
});

// Final Results
console.log('\n' + '='.repeat(50));
console.log('📊 TEST RESULTS');
console.log('='.repeat(50));

const successRate = Math.round((passedTests / totalTests) * 100);
console.log(`✅ Passed: ${passedTests}/${totalTests} (${successRate}%)`);

if (successRate >= 90) {
  console.log('\n🎉 EXCELLENT! Your PDFPet setup is ready to go!');
  console.log('\nTo start the project:');
  console.log('   node start-project.js');
} else if (successRate >= 75) {
  console.log('\n⚠️  GOOD! Most components are ready, but some issues need attention.');
  console.log('\nCheck the failed tests above and fix them before starting.');
} else {
  console.log('\n❌ NEEDS WORK! Several critical issues need to be resolved.');
  console.log('\nPlease fix the failed tests before proceeding.');
}

console.log('\n📚 For detailed setup instructions, see README.md');
console.log('🆘 For troubleshooting, run: node backend/test-startup.js');

console.log('\n' + '='.repeat(50));