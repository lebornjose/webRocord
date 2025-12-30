const puppeteer = require('puppeteer');
const Page = require('./page')
const server = require('./server')

class Manager {
  constructor () {
    this.pageList = []; // tab 页
    this.browser = null;
    this.launch();
    server.createServer()
  }
  async launch () {
    console.log('启动无头浏览器')
    
    const launchOptions = {
      ignoreHTTPSErrors: true,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--disable-gpu'
      ]
    };
    
    // 如果 Puppeteer 的 Chromium 没有下载，使用系统 Chrome
    const fs = require('fs');
    const systemChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (fs.existsSync(systemChrome)) {
      launchOptions.executablePath = systemChrome;
      console.log('使用系统 Chrome:', systemChrome);
    }
    
    this.browser = await puppeteer.launch(launchOptions);
    return this.browser
  }
  async newPage (events, options) {
    console.log('新建 tab 页')
    const page = await this.browser.newPage()
    const pageTab = new Page ({
      page,
      events,
      options
    })
    pageTab.on('start', () => {
      console.log('开始回放')
    })
    pageTab.on('end', () => {
      console.log('结束回放，生成视频')
      // pageTab.close()
      let index = this.pageList.indexOf(pageTab)
      this.pageList.splice(index, 1)
    })
    pageTab.init()
    this.pageList.push(pageTab)
  }
 
  transform (events, options = {}) {
    if (!this.browser) {
      // 如果无头浏览器还没启动好，轮询检测
      let timer = setInterval(() => {
        if (this.browser) {
          clearInterval(timer)
          this.newPage(events, options)
        }
      }, 100)
    } else {
      this.newPage(events, options)
    }
    

  }
}

module.exports = new Manager()
