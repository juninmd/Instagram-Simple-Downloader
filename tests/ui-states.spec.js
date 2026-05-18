const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('button transitions through loading and success states', async ({ page }) => {
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf-8');
  const utilsJs = read('utils.js');
  const uiJs = read('ui.js');

  await page.setContent(`<!DOCTYPE html><html><body><div id="content"></div></body></html>`);

  await page.evaluate(() => {
    window.browser = {
      runtime: {
        sendMessage: (msg, cb) => {
          setTimeout(() => {
            if (cb) cb({ success: true, id: 123 });
          }, 300);
          return true;
        }
      }
    };
  });

  const fullScript = utilsJs + '\n' + uiJs;
  await page.evaluate(fullScript);

  await page.evaluate(() => {
    const content = document.getElementById('content');
    const button = window.ISD_UI.createDownloadButton('test.jpg', 'image', 1);
    content.appendChild(button);
  });

  const button = page.locator('.isd-btn').first();
  await expect(button).toBeVisible();

  await expect(button).toHaveText(/Download Image #1/);

  await button.click();

  await expect(button).toHaveClass(/isd-loading/);
  await expect(button).toHaveText(/Downloading\.\.\./);
  await expect(button).toHaveAttribute('aria-label', 'Downloading...');
  await expect(button).toHaveAttribute('title', 'Downloading...');

  await expect(button).toHaveClass(/isd-success/);
  await expect(button).toHaveText(/Started!/);
  await expect(button).toHaveAttribute('aria-label', 'Started!');
});
