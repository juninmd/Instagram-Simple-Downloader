const { test, expect } = require('@playwright/test');
const { getScripts } = require('./test-helper');

test('background script handles download messages for image and video', async ({ page }) => {
  const { bgUtilsJs, bgJs } = getScripts();

  await page.setContent(`<!DOCTYPE html><html><body></body></html>`);

  await page.evaluate(([bgUtilsScript, script]) => {
    window.downloadArgs = null;
    window.successLogged = false;
    window.errorLogged = false;
    window.sendResponseArgs = null;

    const originalConsoleLog = console.log;
    console.log = (msg) => {
      if (typeof msg === 'string') {
        if (msg.includes('Started downloading')) window.successLogged = true;
      }
    };

    const originalConsoleError = console.error;
    console.error = (msg) => {
      if (typeof msg === 'string') {
        if (msg.includes('Download failed')) window.errorLogged = true;
      }
    };

    window.browser = {
      runtime: {
        id: 'test-ext-id',
        onMessage: {
          addListener: (fn) => {
            window.bgListener = fn;
          }
        }
      },
      downloads: {
        download: (options, cb) => {
          window.downloadArgs = options;
          if (options.url.includes('/sim-fail.jpg')) {
             return Promise.reject('Simulated error');
          } else if (options.url.includes('/cb-fail.jpg')) {
            window.browser.runtime.lastError = { message: 'Callback failed' };
            return Promise.reject(new Error('Callback failed'));
          } else if (options.url.includes('/sync-fail.jpg')) {
             throw new Error('Sync throw');
          }
          return Promise.resolve(123);
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

  // Test image download
  await page.evaluate(() => {
    window.bgListener({ url: 'https://scontent-gru1-1.cdninstagram.com/v/t51/img.jpg', type: 'image' }, window.validSender, (res) => { window.sendResponseArgs = res; });
  });

  // Small wait for promise
  await page.waitForTimeout(50);

  const imgArgs = await page.evaluate(() => window.downloadArgs);
  expect(imgArgs.url).toBe('https://scontent-gru1-1.cdninstagram.com/v/t51/img.jpg');
  expect(imgArgs.filename).toBe('img.jpg');
  expect(imgArgs.saveAs).toBe(true);

  const successLogged = await page.evaluate(() => window.successLogged);
  expect(successLogged).toBe(true);

  const sendResArgsImg = await page.evaluate(() => window.sendResponseArgs);
  expect(sendResArgsImg).toEqual({ success: true, id: 123 });

  // Test video download
  await page.evaluate(() => {
    window.successLogged = false;
    window.sendResponseArgs = null;
    window.bgListener({ url: 'https://scontent-gru1-1.cdninstagram.com/v/t51/vid.mp4', type: 'video' }, window.validSender, (res) => { window.sendResponseArgs = res; });
  });

  await page.waitForTimeout(50);

  const vidArgs = await page.evaluate(() => window.downloadArgs);
  expect(vidArgs.url).toBe('https://scontent-gru1-1.cdninstagram.com/v/t51/vid.mp4');
  expect(vidArgs.filename).toBe('vid.mp4');

  // Test video download with query parameters
  await page.evaluate(() => {
    window.successLogged = false;
    window.sendResponseArgs = null;
    window.bgListener({ url: 'https://scontent-gru1-1.cdninstagram.com/v/t51/vid-with-query.mp4?ig_cache_key=123&foo=bar', type: 'video' }, window.validSender, (res) => { window.sendResponseArgs = res; });
  });

  await page.waitForTimeout(50);

  const vidQueryArgs = await page.evaluate(() => window.downloadArgs);
  expect(vidQueryArgs.url).toBe('https://scontent-gru1-1.cdninstagram.com/v/t51/vid-with-query.mp4?ig_cache_key=123&foo=bar');
  expect(vidQueryArgs.filename).toBe('vid-with-query.mp4');

  // Test fallback for missing filename
  await page.evaluate(() => {
    window.successLogged = false;
    window.sendResponseArgs = null;
    window.bgListener({ url: 'https://scontent-gru1-1.cdninstagram.com/v/t51/', type: 'image' }, window.validSender, (res) => { window.sendResponseArgs = res; });
  });

  await page.waitForTimeout(50);

  const fallbackArgs = await page.evaluate(() => window.downloadArgs);
  expect(fallbackArgs.url).toBe('https://scontent-gru1-1.cdninstagram.com/v/t51/');
  expect(fallbackArgs.filename).toBe('image.jpg');

  // Test failure
  await page.evaluate(() => {
    window.sendResponseArgs = null;
    window.bgListener({ url: 'https://scontent-gru1-1.cdninstagram.com/v/t51/sim-fail.jpg', type: 'image' }, window.validSender, (res) => { window.sendResponseArgs = res; });
  });

  await page.waitForTimeout(50);

  const errorLogged = await page.evaluate(() => window.errorLogged);
  expect(errorLogged).toBe(true);

  const sendResArgsErr = await page.evaluate(() => window.sendResponseArgs);
  expect(sendResArgsErr).toEqual({ error: 'Simulated error' });

  // Test callback failure
  await page.evaluate(() => {
    window.sendResponseArgs = null;
    window.bgListener({ url: 'https://scontent-gru1-1.cdninstagram.com/v/t51/cb-fail.jpg', type: 'image' }, window.validSender, (res) => { window.sendResponseArgs = res; });
  });

  await page.waitForTimeout(50);

  const sendResArgsCbFail = await page.evaluate(() => window.sendResponseArgs);
  expect(sendResArgsCbFail).toEqual({ error: 'Callback failed' });

  // Test synchronous exception
  await page.evaluate(() => {
    window.sendResponseArgs = null;
    window.bgListener({ url: 'https://scontent-gru1-1.cdninstagram.com/v/t51/sync-fail.jpg', type: 'image' }, window.validSender, (res) => { window.sendResponseArgs = res; });
  });

  await page.waitForTimeout(50);

  const sendResArgsSyncFail = await page.evaluate(() => window.sendResponseArgs);
  expect(sendResArgsSyncFail).toEqual({ error: 'Sync throw' });
});
