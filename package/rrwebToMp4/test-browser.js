const manager = require('./src/index');

console.log('Testing browser launch...');

// The Manager class already tries to launch the browser on instantiation
// We just need to check if it launched successfully

setTimeout(() => {
  if (manager.browser) {
    console.log('Browser launched successfully!');
    manager.browser.close().then(() => {
      console.log('Browser closed.');
      process.exit(0);
    });
  } else {
    console.error('Browser failed to launch within timeout.');
    process.exit(1);
  }
}, 5000); 
