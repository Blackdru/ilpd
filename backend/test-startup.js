#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

console.log('🔍 Testing PDFPet Backend Startup...\n');

// Test 1: Check if all required files exist
console.log('1. Checking required files...');
const requiredFiles = [
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

let missingFiles = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(__dirname, file))) {
    missingFiles.push(file);
  }
}

if (missingFiles.length > 0) {
  console.log('❌ Missing files:');
  missingFiles.forEach(file => console.log(`   - ${file}`));
} else {
  console.log('✅ All required files present');
}

// Test 2: Check environment variables
console.log('\n2. Checking environment variables...');
require('dotenv').config();

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const optionalEnvVars = [
  'OPENAI_API_KEY',
  'OPENROUTER_API_KEY',
  'ENABLE_AI_FEATURES',
  'ENABLE_OCR'
];

let missingEnvVars = [];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    missingEnvVars.push(envVar);
  }
}

if (missingEnvVars.length > 0) {
  console.log('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.log(`   - ${envVar}`));
} else {
  console.log('✅ All required environment variables present');
}

console.log('\n   Optional environment variables:');
for (const envVar of optionalEnvVars) {
  const value = process.env[envVar];
  const status = value && value !== `your_${envVar.toLowerCase()}_here` ? '✅' : '⚠️';
  console.log(`   ${status} ${envVar}: ${value ? 'Set' : 'Not set'}`);
}

// Test 3: Check dependencies
console.log('\n3. Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const dependencies = Object.keys(packageJson.dependencies || {});
  
  let missingDeps = [];
  for (const dep of dependencies) {
    try {
      require.resolve(dep);
    } catch (error) {
      missingDeps.push(dep);
    }
  }
  
  if (missingDeps.length > 0) {
    console.log('❌ Missing dependencies:');
    missingDeps.forEach(dep => console.log(`   - ${dep}`));
    console.log('\n   Run: npm install');
  } else {
    console.log('✅ All dependencies installed');
  }
} catch (error) {
  console.log('❌ Error checking dependencies:', error.message);
}

// Test 4: Test Supabase connection
console.log('\n4. Testing Supabase connection...');
try {
  const { supabase } = require('./src/config/supabase');
  
  // Test connection with a simple query
  supabase.from('users').select('count', { count: 'exact', head: true })
    .then(({ error }) => {
      if (error) {
        console.log('❌ Supabase connection failed:', error.message);
      } else {
        console.log('✅ Supabase connection successful');
      }
    })
    .catch(error => {
      console.log('❌ Supabase connection error:', error.message);
    });
} catch (error) {
  console.log('❌ Error loading Supabase config:', error.message);
}

// Test 5: Test AI service
console.log('\n5. Testing AI service...');
try {
  const aiService = require('./src/services/aiService');
  
  if (aiService.isEnabled()) {
    console.log('✅ AI service is enabled');
    console.log(`   Using model: ${aiService.model}`);
    console.log(`   Using OpenRouter: ${aiService.isUsingOpenRouter ? 'Yes' : 'No'}`);
    console.log(`   Using OpenAI: ${aiService.isUsingOpenAI ? 'Yes' : 'No'}`);
  } else {
    console.log('⚠️  AI service is disabled (no API key configured)');
  }
} catch (error) {
  console.log('❌ Error loading AI service:', error.message);
}

// Test 6: Test OCR service
console.log('\n6. Testing OCR service...');
try {
  const ocrService = require('./src/services/ocrService');
  
  if (ocrService.isEnabled()) {
    console.log('✅ OCR service is enabled');
    console.log(`   Supported languages: ${ocrService.languages}`);
    
    // Test Tesseract health
    ocrService.checkTesseractHealth()
      .then(isHealthy => {
        if (isHealthy) {
          console.log('✅ Tesseract.js is working properly');
        } else {
          console.log('❌ Tesseract.js health check failed');
        }
      })
      .catch(error => {
        console.log('❌ Tesseract.js error:', error.message);
      });
  } else {
    console.log('⚠️  OCR service is disabled');
  }
} catch (error) {
  console.log('❌ Error loading OCR service:', error.message);
}

// Test 7: Try to start server (dry run)
console.log('\n7. Testing server startup...');
try {
  // Don't actually start the server, just test if it can be loaded
  const serverPath = path.join(__dirname, 'src/server.js');
  delete require.cache[require.resolve(serverPath)];
  
  // Mock the listen function to prevent actual server start
  const express = require('express');
  const originalListen = express.application.listen;
  express.application.listen = function(port, callback) {
    console.log('✅ Server configuration is valid');
    console.log(`   Would start on port: ${port}`);
    if (callback) callback();
    return { close: () => {} };
  };
  
  require(serverPath);
  
  // Restore original listen function
  express.application.listen = originalListen;
  
} catch (error) {
  console.log('❌ Server startup test failed:', error.message);
}

console.log('\n🏁 Startup test completed!');
console.log('\nTo start the server for real, run:');
console.log('   npm run dev   (development)');
console.log('   npm start     (production)');