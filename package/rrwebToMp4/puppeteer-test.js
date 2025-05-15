
const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
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
