const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('focus style verification', async ({ page }) => {
  const utilsJsPath = path.join(__dirname, '..', 'utils.js');
  const utilsJsContent = fs.readFileSync(utilsJsPath, 'utf-8');

  // Extract CSS
  const cssMatch = utilsJsContent.match(/style\.textContent = `([\s\S]*?)`;/);
  if (!cssMatch) {
    throw new Error('Could not find CSS in utils.js');
  }
  const css = cssMatch[1];

  await page.setContent(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Focus Verification</title>
      <style>
        body {
          background-color: #f0f2f5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .container {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        ${css}
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Light Background</h2>
        <button class="isd-btn" style="background: linear-gradient(to bottom right, #D32F2F, #C62828);">
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span>Download Video</span>
        </button>
      </div>

      <div class="container" style="background: #000; margin-top: 20px; color: white;">
        <h2>Dark Background</h2>
        <button class="isd-btn" style="background: linear-gradient(to bottom right, #D32F2F, #C62828);">
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span>Download Video</span>
        </button>
      </div>
    </body>
    </html>
  `);

  const button = page.locator('.isd-btn').first();
  await button.focus();
  await page.locator('.container').first().screenshot({ path: 'tests/focus-light-after.png' });

  const buttonDark = page.locator('.isd-btn').nth(1);
  await buttonDark.focus();
  await page.locator('.container').nth(1).screenshot({ path: 'tests/focus-dark-after.png' });
});
