const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('button handles native Promise resolution from sendMessage', async ({ page }) => {
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf-8');
  const utilsJs = read('utils.js');
  const uiJs = read('ui.js');

  await page.setContent(`<!DOCTYPE html><html><body><div id="content"></div></body></html>`);

  await page.evaluate(() => {
    window.browser = {
      runtime: {
        // Native Promise style (Firefox)
        sendMessage: (msg) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({ success: true, id: 999 });
            }, 50);
          });
        }
      }
    };
  });

  const fullScript = utilsJs + '\n' + uiJs;
  await page.evaluate(fullScript);

  await page.evaluate(() => {
    const content = document.getElementById('content');
    const button = window.ISD_UI.createDownloadButton('test2.jpg', 'image', 2);
    content.appendChild(button);
  });

  const button = page.locator('.isd-btn').first();
  await expect(button).toBeVisible();

  await button.click();

  // Wait for success
  await expect(button).toHaveClass(/isd-success/);
  await expect(button).toHaveText(/Started!/);
});

test('button handles native Promise rejection with error object from sendMessage', async ({ page }) => {
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf-8');
  const utilsJs = read('utils.js');
  const uiJs = read('ui.js');

  await page.setContent(`<!DOCTYPE html><html><body><div id="content"></div></body></html>`);

  await page.evaluate(() => {
    window.browser = {
      runtime: {
        // Native Promise style resolving with an error object
        sendMessage: (msg) => {
          return Promise.resolve({ error: 'Backend error' });
        }
      }
    };
  });

  const fullScript = utilsJs + '\n' + uiJs;
  await page.evaluate(fullScript);

  await page.evaluate(() => {
    const content = document.getElementById('content');
    const button = window.ISD_UI.createDownloadButton('test3.jpg', 'image', 3);
    content.appendChild(button);
  });

  const button = page.locator('.isd-btn').first();
  await expect(button).toBeVisible();

  await button.click();

  // Wait for error
  await expect(button).toHaveClass(/isd-error/);
  await expect(button).toHaveText(/Error/);
});
