const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('background script handles native Promise resolution from download', async ({ page }) => {
  const bgJs = fs.readFileSync(path.join(__dirname, '..', 'background.js'), 'utf-8');

  await page.setContent(`<!DOCTYPE html><html><body></body></html>`);

  await page.evaluate((script) => {
    window.downloadArgs = null;
    window.sendResponseArgs = null;

    window.browser = {
      runtime: {
        onMessage: {
          addListener: (fn) => { window.bgListener = fn; }
        }
      },
      downloads: {
        // Native Promise style resolving without invoking callback directly
        download: (options) => {
          window.downloadArgs = options;
          return Promise.resolve(777);
        }
      }
    };

    // Evaluate background script
    eval(script);
  }, bgJs);

  await page.evaluate(() => {
    window.bgListener({ url: 'http://example.com/prom.jpg', type: 'image' }, null, (res) => { window.sendResponseArgs = res; });
  });

  await page.waitForTimeout(50);

  const sendResArgsImg = await page.evaluate(() => window.sendResponseArgs);
  expect(sendResArgsImg).toEqual({ success: true, id: 777 });
});
