#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting PDFPet Project...\n');

// Check if we're in the right directory
const projectRoot = __dirname;
const backendPath = path.join(projectRoot, 'backend');
const webPath = path.join(projectRoot, 'web');

if (!fs.existsSync(backendPath) || !fs.existsSync(webPath)) {
  console.error('❌ Error: backend or web directory not found');
  console.error('Make sure you\'re running this from the project root directory');
  process.exit(1);
}

// Function to start a process
function startProcess(name, command, args, cwd, color = '\x1b[0m') {
  console.log(`${color}🔄 Starting ${name}...${'\x1b[0m'}`);
  
  const process = spawn(command, args, {
    cwd,
    stdio: 'pipe',
    shell: true
  });

  // Prefix output with service name and color
  process.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      console.log(`${color}[${name}]${'\x1b[0m'} ${line}`);
    });
  });

  process.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      console.log(`${color}[${name}]${'\x1b[0m'} ${'\x1b[31m'}ERROR:${'\x1b[0m'} ${line}`);
    });
  });

  process.on('close', (code) => {
    if (code !== 0) {
      console.log(`${color}[${name}]${'\x1b[0m'} ${'\x1b[31m'}Process exited with code ${code}${'\x1b[0m'}`);
    } else {
      console.log(`${color}[${name}]${'\x1b[0m'} ${'\x1b[32m'}Process completed successfully${'\x1b[0m'}`);
    }
  });

  return process;
}

// Check if dependencies are installed
console.log('📦 Checking dependencies...\n');

const backendPackageJson = path.join(backendPath, 'package.json');
const webPackageJson = path.join(webPath, 'package.json');
const backendNodeModules = path.join(backendPath, 'node_modules');
const webNodeModules = path.join(webPath, 'node_modules');

if (!fs.existsSync(backendNodeModules)) {
  console.log('⚠️  Backend dependencies not installed. Installing...');
  const backendInstall = spawn('npm', ['install'], { cwd: backendPath, stdio: 'inherit', shell: true });
  backendInstall.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Backend dependencies installed');
      startServices();
    } else {
      console.error('❌ Failed to install backend dependencies');
      process.exit(1);
    }
  });
} else if (!fs.existsSync(webNodeModules)) {
  console.log('⚠️  Web dependencies not installed. Installing...');
  const webInstall = spawn('npm', ['install'], { cwd: webPath, stdio: 'inherit', shell: true });
  webInstall.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Web dependencies installed');
      startServices();
    } else {
      console.error('❌ Failed to install web dependencies');
      process.exit(1);
    }
  });
} else {
  console.log('✅ Dependencies already installed');
  startServices();
}

function startServices() {
  console.log('\n🎯 Starting services...\n');

  // Start backend server
  const backendProcess = startProcess(
    'Backend',
    'npm',
    ['run', 'dev'],
    backendPath,
    '\x1b[34m' // Blue
  );

  // Wait a bit for backend to start, then start frontend
  setTimeout(() => {
    const webProcess = startProcess(
      'Frontend',
      'npm',
      ['run', 'dev'],
      webPath,
      '\x1b[32m' // Green
    );

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Shutting down services...');
      backendProcess.kill('SIGINT');
      webProcess.kill('SIGINT');
      
      setTimeout(() => {
        console.log('👋 Goodbye!');
        process.exit(0);
      }, 2000);
    });

    // Show startup complete message
    setTimeout(() => {
      console.log('\n' + '='.repeat(60));
      console.log('🎉 PDFPet is now running!');
      console.log('');
      console.log('📱 Frontend: http://localhost:5173');
      console.log('🔧 Backend:  http://localhost:5000');
      console.log('🏥 Health:   http://localhost:5000/health');
      console.log('');
      console.log('Press Ctrl+C to stop all services');
      console.log('='.repeat(60) + '\n');
    }, 5000);

  }, 3000);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});