const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('background script handles unexpected URL in request', async ({ page }) => {
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
        download: (options, cb) => {
          window.downloadArgs = options;
          if (cb) cb(888);
        }
      }
    };

    eval(script);
  }, bgJs);

  await page.evaluate(() => {
    window.bgListener({ url: 'not-a-url', type: 'video' }, null, (res) => { window.sendResponseArgs = res; });
  });

  await page.waitForTimeout(50);

  const fallbackArgs = await page.evaluate(() => window.downloadArgs);
  expect(fallbackArgs.url).toBe('not-a-url');
  expect(fallbackArgs.filename).toBe('video.mp4');
});
