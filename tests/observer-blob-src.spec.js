const { test, expect } = require('@playwright/test');
const { getScripts } = require('./test-helper');

test('observer ignores blob: video sources and picks them up once a real URL is set', async ({ page }) => {
  const { utilsJs, uiBaseJs, uiJs, observerJs } = getScripts();

  await page.setContent('<article><video id="v"></video></article>');
  await page.evaluate(() => {
    const video = document.getElementById('v');
    Object.defineProperty(video, 'currentSrc', { value: 'blob:https://www.instagram.com/abc', configurable: true });
  });

  const script = observerJs.replace(/const pathname = window\.location\.pathname;/s, "const pathname = '/p/123/';");
  await page.evaluate(utilsJs + '\n' + uiBaseJs + '\n' + uiJs + '\n' + script);

  // A blob: handle can never be downloaded, so no button must be created for it.
  await expect(page.locator('.isd-btn')).toHaveCount(0);
  expect(await page.evaluate(() => document.getElementById('v').hasAttribute('download-button'))).toBe(false);

  // Once Instagram swaps in a real CDN URL, the next mutation scan must add the buttons.
  await page.evaluate(() => {
    const video = document.getElementById('v');
    Object.defineProperty(video, 'currentSrc', { value: 'https://scontent.cdninstagram.com/v.mp4', configurable: true });
    document.body.appendChild(document.createElement('div'));
  });
  await expect(page.locator('.isd-btn[title*="Video #1 - Download"]')).toHaveCount(1);
});
