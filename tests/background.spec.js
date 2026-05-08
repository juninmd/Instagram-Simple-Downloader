const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('background script handles download messages for image and video', async ({ page }) => {
  const bgJs = fs.readFileSync(path.join(__dirname, '..', 'background.js'), 'utf-8');

  await page.setContent(`<!DOCTYPE html><html><body></body></html>`);

  await page.evaluate((script) => {
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
        onMessage: {
          addListener: (fn) => {
            window.bgListener = fn;
          }
        }
      },
      downloads: {
        download: (options, cb) => {
          window.downloadArgs = options;
          if (options.url === 'fail') {
             return Promise.reject('Simulated error');
          } else if (options.url === 'cb-fail') {
            window.browser.runtime.lastError = { message: 'Callback failed' };
            if (cb) cb();
            return;
          } else if (options.url === 'sync-fail') {
             throw new Error('Sync throw');
          }
          return Promise.resolve(123);
        }
      }
    };

    // Evaluate background script
    eval(script);
  }, bgJs);

  // Test image download
  await page.evaluate(() => {
    window.bgListener({ url: 'http://example.com/img.jpg', type: 'image' }, null, (res) => { window.sendResponseArgs = res; });
  });

  // Small wait for promise
  await page.waitForTimeout(50);

  const imgArgs = await page.evaluate(() => window.downloadArgs);
  expect(imgArgs.url).toBe('http://example.com/img.jpg');
  expect(imgArgs.filename).toBe('image.jpg');
  expect(imgArgs.saveAs).toBe(true);

  const successLogged = await page.evaluate(() => window.successLogged);
  expect(successLogged).toBe(true);

  const sendResArgsImg = await page.evaluate(() => window.sendResponseArgs);
  expect(sendResArgsImg).toEqual({ success: true, id: 123 });

  // Test video download
  await page.evaluate(() => {
    window.successLogged = false;
    window.sendResponseArgs = null;
    window.bgListener({ url: 'http://example.com/vid.mp4', type: 'video' }, null, (res) => { window.sendResponseArgs = res; });
  });

  await page.waitForTimeout(50);

  const vidArgs = await page.evaluate(() => window.downloadArgs);
  expect(vidArgs.url).toBe('http://example.com/vid.mp4');
  expect(vidArgs.filename).toBe('video.mp4');

  // Test failure
  await page.evaluate(() => {
    window.sendResponseArgs = null;
    window.bgListener({ url: 'fail', type: 'image' }, null, (res) => { window.sendResponseArgs = res; });
  });

  await page.waitForTimeout(50);

  const errorLogged = await page.evaluate(() => window.errorLogged);
  expect(errorLogged).toBe(true);

  const sendResArgsErr = await page.evaluate(() => window.sendResponseArgs);
  expect(sendResArgsErr).toEqual({ error: 'Simulated error' });

  // Test callback failure
  await page.evaluate(() => {
    window.sendResponseArgs = null;
    window.bgListener({ url: 'cb-fail', type: 'image' }, null, (res) => { window.sendResponseArgs = res; });
  });

  await page.waitForTimeout(50);

  const sendResArgsCbFail = await page.evaluate(() => window.sendResponseArgs);
  expect(sendResArgsCbFail).toEqual({ error: 'Callback failed' });

  // Test synchronous exception
  await page.evaluate(() => {
    window.sendResponseArgs = null;
    window.bgListener({ url: 'sync-fail', type: 'image' }, null, (res) => { window.sendResponseArgs = res; });
  });

  await page.waitForTimeout(50);

  const sendResArgsSyncFail = await page.evaluate(() => window.sendResponseArgs);
  expect(sendResArgsSyncFail).toEqual({ error: 'Sync throw' });
});
