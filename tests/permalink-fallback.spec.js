const { test, expect } = require('@playwright/test');
const { getScripts } = require('./test-helper');

const PX = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

test('injects buttons on logged-out permalink layout (no article, no srcset)', async ({ page }) => {
  const { utilsJs, uiBaseJs, uiJs, observerJs } = getScripts();
  await page.setContent(`<main><div><img id="av" src="${PX}"><img id="main" src="${PX}"></div></main>`);
  await page.evaluate(() => {
    Object.defineProperty(document.getElementById('main'), 'naturalWidth', { value: 545 });
    document.getElementById('main').src += '#cdninstagram';
  });
  const js = observerJs.replace(/const pathname = window\.location\.pathname;/s, "const pathname = '/p/abc/';");
  await page.evaluate([utilsJs, uiBaseJs, uiJs, js].join('\n'));
  await expect(page.locator('.isd-btn')).toHaveCount(2);
  await expect(page.locator('.isd-btn').first()).toContainText('Image #1');
});

test('permalink fallback ignores small images', async ({ page }) => {
  const { utilsJs, uiBaseJs, uiJs, observerJs } = getScripts();
  await page.setContent(`<main><img src="${PX}#cdninstagram"></main>`);
  const js = observerJs.replace(/const pathname = window\.location\.pathname;/s, "const pathname = '/p/abc/';");
  await page.evaluate([utilsJs, uiBaseJs, uiJs, js].join('\n'));
  await expect(page.locator('.isd-btn')).toHaveCount(0);
});
