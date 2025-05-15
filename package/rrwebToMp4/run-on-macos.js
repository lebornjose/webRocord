#!/usr/bin/env node

/**
 * This is a helper script for running rrweb-to-mp4 on macOS, particularly Apple Silicon Macs.
 * It sets up the environment correctly and launches the application.
 */

const fs = require('fs');
const { spawn, execSync } = require('child_process');
const path = require('path');

// Find an appropriate Chrome executable
function findChromePath() {
  const macOSChromePaths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/Applications/Vivaldi.app/Contents/MacOS/Vivaldi'
  ];
  
  for (const chromePath of macOSChromePaths) {
    if (fs.existsSync(chromePath)) {
      console.log(`Found Chrome at: ${chromePath}`);
      return chromePath;
    }
  }
  
  console.warn('No Chrome installation found!');
  return null;
}

// Main
const chromePath = findChromePath();

if (!chromePath) {
  console.error('Could not find a suitable Chrome installation.');
  console.error('Please install Google Chrome and try again.');
  process.exit(1);
}

// Set up the environment
process.env.PUPPETEER_EXECUTABLE_PATH = chromePath;
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';

console.log('Launching application with Puppeteer configured to use:');
console.log(`  ${chromePath}`);

// Launch the application
// Replace "index.js" with your actual entry point
const appProcess = spawn('node', ['index.js'], {
  stdio: 'inherit',
  env: process.env
});

appProcess.on('error', (err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});

appProcess.on('close', (code) => {
  console.log(`Application exited with code ${code}`);
  process.exit(code);
}); 
