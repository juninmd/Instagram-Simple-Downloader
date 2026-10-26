const { test, expect } = require('@playwright/test');
const { getScripts } = require('./test-helper');

test('background script handles native Promise resolution from download', async ({ page }) => {
  const { bgUtilsJs, bgJs } = getScripts();

  await page.setContent(`<!DOCTYPE html><html><body></body></html>`);

  await page.evaluate(([bgUtilsScript, script]) => {
    window.downloadArgs = null;
    window.sendResponseArgs = null;

    window.browser = {
      runtime: {
        id: 'test-ext-id',
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

    window.validSender = {
      id: 'test-ext-id',
      tab: { url: 'https://www.instagram.com/p/C123/' }
    };

    // Evaluate background script
    eval(bgUtilsScript + "\n" + script);
  }, [bgUtilsJs, bgJs]);

  await page.evaluate(() => {
    window.bgListener({ url: 'https://scontent-gru1-1.cdninstagram.com/v/t51/prom.jpg', type: 'image' }, window.validSender, (res) => { window.sendResponseArgs = res; });
  });

  await page.waitForTimeout(50);

  const sendResArgsImg = await page.evaluate(() => window.sendResponseArgs);
  expect(sendResArgsImg).toEqual({ success: true, id: 777 });
});
