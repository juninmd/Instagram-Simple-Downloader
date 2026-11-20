const { test, expect } = require('@playwright/test');
const { getScripts } = require('./test-helper');

async function sentUrlFor(page, srcset, currentSrc) {
  const { utilsJs, uiBaseJs, uiJs, observerJs } = getScripts();
  await page.setContent(`<article><img srcset="${srcset}" src="fallback.jpg" /></article>`);
  await page.evaluate((cur) => {
    Object.defineProperty(document.querySelector('img'), 'currentSrc', { value: cur });
    window.browser = { runtime: { sendMessage: (msg, cb) => { window.lastSentUrl = msg.url; if (cb) cb({ success: true }); } } };
  }, currentSrc);
  const script = observerJs.replace(/const pathname = window\.location\.pathname;/s, "const pathname = '/p/123/';");
  await page.evaluate(utilsJs + '\n' + uiBaseJs + '\n' + uiJs + '\n' + script);
  await page.locator('.isd-btn[title*="Image #1 - Download"]').click();
  return page.evaluate(() => window.lastSentUrl);
}

test('downloads the largest w candidate, not the one the browser picked', async ({ page }) => {
  expect(await sentUrlFor(page, 'a.jpg 320w, b.jpg 1080w, c.jpg 640w', 'a.jpg')).toBe('b.jpg');
});

test('handles candidates without a space after the comma and URLs containing commas', async ({ page }) => {
  expect(await sentUrlFor(page, 'https://cdn/x.jpg?a=1,2 640w,https://cdn/y.jpg?b=3,4 1440w', 'x')).toBe('https://cdn/y.jpg?b=3,4');
});

test('falls back to the largest x candidate when there are no w descriptors', async ({ page }) => {
  expect(await sentUrlFor(page, 'lo.jpg 1x, hi.jpg 2x', 'lo.jpg')).toBe('hi.jpg');
});

test('falls back to currentSrc when the srcset has no valid descriptor', async ({ page }) => {
  expect(await sentUrlFor(page, 'junk', 'picked.jpg')).toBe('picked.jpg');
});
