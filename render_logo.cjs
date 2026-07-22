const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function renderLogo() {
  console.log('Launching puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 2 });

  const svgContent = fs.readFileSync(path.join(__dirname, 'public/logo.svg'), 'utf8');
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; background: transparent; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
          svg { width: 512px; height: 512px; }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
    </html>
  `);

  await page.screenshot({ path: path.join(__dirname, 'public/logo.png'), omitBackground: true });
  await page.screenshot({ path: path.join(__dirname, 'public/favicon.png'), omitBackground: true });
  await page.screenshot({ path: path.join(__dirname, 'public/apple-touch-icon.png'), omitBackground: true });
  
  console.log('Successfully generated logo.png, favicon.png, apple-touch-icon.png!');
  await browser.close();
}

renderLogo().catch(console.error);
