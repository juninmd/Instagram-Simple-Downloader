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

    const originalConsoleLog = console.log;
    console.log = (msg) => {
      if (typeof msg === 'string') {
        if (msg.includes('Started downloading')) window.successLogged = true;
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
        download: (options) => {
          window.downloadArgs = options;
          if (options.url === 'fail') {
             return Promise.reject('Simulated error');
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
    window.bgListener({ url: 'http://example.com/img.jpg', type: 'image' });
  });

  // Small wait for promise
  await page.waitForTimeout(50);

  const imgArgs = await page.evaluate(() => window.downloadArgs);
  expect(imgArgs.url).toBe('http://example.com/img.jpg');
  expect(imgArgs.filename).toBe('image.jpg');
  expect(imgArgs.saveAs).toBe(true);

  const successLogged = await page.evaluate(() => window.successLogged);
  expect(successLogged).toBe(true);

  // Test video download
  await page.evaluate(() => {
    window.successLogged = false;
    window.bgListener({ url: 'http://example.com/vid.mp4', type: 'video' });
  });

  await page.waitForTimeout(50);

  const vidArgs = await page.evaluate(() => window.downloadArgs);
  expect(vidArgs.url).toBe('http://example.com/vid.mp4');
  expect(vidArgs.filename).toBe('video.mp4');

  // Test failure
  await page.evaluate(() => {
    window.bgListener({ url: 'fail', type: 'image' });
  });

  await page.waitForTimeout(50);

  const errorLogged = await page.evaluate(() => window.errorLogged);
  expect(errorLogged).toBe(true);
});
