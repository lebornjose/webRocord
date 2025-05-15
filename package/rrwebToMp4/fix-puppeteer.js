// This script helps set the correct Puppeteer executable path
const fs = require('fs');
const path = require('path');

// Check for common Chrome locations on macOS
const macOSChromePaths = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
];

// Find Chrome
let chromePath = null;
for (const path of macOSChromePaths) {
  if (fs.existsSync(path)) {
    chromePath = path;
    console.log(`Found Chrome at: ${chromePath}`);
    break;
  }
}

if (!chromePath) {
  console.error('No Chrome installation found!');
  process.exit(1);
}

// Create a simple Puppeteer test script
const testScript = `
const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      executablePath: '${chromePath}',
      args: ['--no-sandbox']
    });
    console.log('Browser launched successfully!');
    
    const page = await browser.newPage();
    await page.goto('https://example.com');
    console.log('Navigated to example.com');
    
    await browser.close();
    console.log('Browser closed successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
`;

fs.writeFileSync('puppeteer-test.js', testScript);
console.log('Created puppeteer-test.js');
console.log('Run with: PUPPETEER_EXECUTABLE_PATH=' + chromePath + ' node puppeteer-test.js'); 
