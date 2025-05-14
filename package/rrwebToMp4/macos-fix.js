#!/usr/bin/env node

/**
 * This script patches Puppeteer in node_modules to use your system Chrome installation
 */

const fs = require('fs');
const path = require('path');

// Find Chrome on macOS
function findChrome() {
  const browsers = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/Applications/Chromium.app/Contents/MacOS/Chromium'
  ];
  
  for (const browserPath of browsers) {
    if (fs.existsSync(browserPath)) {
      console.log(`Found browser: ${browserPath}`);
      return browserPath;
    }
  }
  
  console.error('No Chrome installation found!');
  process.exit(1);
}

// Main
const chrome = findChrome();
console.log(`Using Chrome at: ${chrome}`);

// Find the Puppeteer installation
let puppeteerPath;
try {
  // Try the local node_modules first
  if (fs.existsSync('./node_modules/puppeteer')) {
    puppeteerPath = './node_modules/puppeteer';
  } else if (fs.existsSync('../../node_modules/.pnpm/puppeteer@5.5.0/node_modules/puppeteer')) {
    // Try the pnpm location
    puppeteerPath = '../../node_modules/.pnpm/puppeteer@5.5.0/node_modules/puppeteer';
  } else {
    throw new Error('Puppeteer not found in node_modules');
  }
  
  console.log(`Found Puppeteer at: ${puppeteerPath}`);
} catch (err) {
  console.error('Error finding Puppeteer:', err);
  process.exit(1);
}

// Patch the Chromium executable path

// 1. Create a patch for the Launcher.js file
const launcherFiles = [
  path.join(puppeteerPath, 'lib/cjs/puppeteer/node/Launcher.js'),
  path.join(puppeteerPath, 'lib/Launcher.js')
];

for (const launcherFile of launcherFiles) {
  if (fs.existsSync(launcherFile)) {
    try {
      console.log(`Patching ${launcherFile}...`);
      
      let content = fs.readFileSync(launcherFile, 'utf8');
      
      // Check if already patched
      if (content.includes('FORCE_SYSTEM_CHROME')) {
        console.log(`${launcherFile} already patched.`);
        continue;
      }
      
      // Add our override code after the class definition
      const patchIndex = content.indexOf('async launch(');
      if (patchIndex === -1) {
        console.log(`Couldn't find launch method in ${launcherFile}`);
        continue;
      }
      
      // Insert our override code
      const patchCode = `
  // FORCE_SYSTEM_CHROME patch applied by macos-fix.js
  if (!options.executablePath) {
    options.executablePath = '${chrome.replace(/\\/g, '\\\\')}';
    console.log('Using Chrome at:', options.executablePath);
  }
`;
      
      const newContent = content.slice(0, patchIndex) + 
                        'async launch(options = {}) {' + 
                        patchCode + 
                        content.slice(patchIndex + 'async launch('.length);
      
      fs.writeFileSync(launcherFile, newContent);
      console.log(`Successfully patched ${launcherFile}`);
    } catch (err) {
      console.error(`Error patching ${launcherFile}:`, err);
    }
  }
}

console.log('\nPatch completed! Puppeteer should now use your system Chrome installation.');
console.log(`\nTo run your app: node index.js`);
console.log('or use: npm run macos'); 
