#!/usr/bin/env node

/**
 * 简单的 Puppeteer 测试脚本
 * 验证 Puppeteer 13.7.0 是否能在 macOS 上正常工作
 */

const puppeteer = require('puppeteer');

console.log('🚀 开始测试 Puppeteer...\n');

(async () => {
  try {
    console.log('📦 Puppeteer 版本:', require('puppeteer/package.json').version);
    
    console.log('🌐 正在启动浏览器...');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    console.log('✅ 浏览器启动成功！');
    
    console.log('📄 正在创建新页面...');
    const page = await browser.newPage();
    
    console.log('🔗 正在访问测试页面...');
    await page.goto('https://example.com', { waitUntil: 'networkidle2' });
    
    const title = await page.title();
    console.log(`📌 页面标题: ${title}`);
    
    console.log('📸 正在截图...');
    await page.screenshot({ path: 'test-screenshot.png' });
    console.log('✅ 截图已保存到: test-screenshot.png');
    
    await browser.close();
    console.log('✅ 浏览器已关闭');
    
    console.log('\n🎉 所有测试通过！Puppeteer 工作正常。\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('\n错误详情:\n', error);
    process.exit(1);
  }
})();

