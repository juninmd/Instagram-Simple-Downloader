const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('button handles error state and shows shake animation', async ({ page }) => {
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf-8');
  const utilsJs = read('utils.js');
  const uiJs = read('ui.js');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <div id="content"></div>
    </body>
    </html>
  `);

  await page.evaluate(() => {
    window.browser = {
      runtime: {
        sendMessage: () => Promise.reject(new Error('Simulated network error'))
      }
    };
  });

  let modifiedUiJs = uiJs.replace(/await browser\.runtime/g, 'await window.browser.runtime');

  const fullScript = utilsJs + '\n' + modifiedUiJs;

  await page.evaluate(fullScript);

  await page.evaluate(() => {
    const content = document.getElementById('content');
    const button = window.ISD_UI.createDownloadButton('test.jpg', 'image', 1);
    content.appendChild(button);
  });

  const button = page.locator('.isd-btn').first();
  await expect(button).toBeVisible();

  await button.click();

  // Wait for the button to have the error class
  await expect(button).toHaveClass(/isd-error/);
  await expect(button).toHaveClass(/isd-shake/);

  // Verify error text
  await expect(button).toHaveText(/Error/);
});
