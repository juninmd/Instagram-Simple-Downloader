const { test, expect } = require('@playwright/test');
const { getScripts, read } = require('./test-helper');



test('background script handles unexpected URL in request', async ({ page }) => {
  const { bgJs } = getScripts();

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

  await page.evaluate(() => {
    window.bgListener({ url: 'not-a-url?query=1', type: 'image' }, null, (res) => { window.sendResponseArgs = res; });
  });

  await page.waitForTimeout(50);

  const fallbackQueryArgs = await page.evaluate(() => window.downloadArgs);
  expect(fallbackQueryArgs.url).toBe('not-a-url?query=1');
  expect(fallbackQueryArgs.filename).toBe('image.jpg');
});
