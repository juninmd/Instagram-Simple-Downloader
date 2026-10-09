const { test, expect } = require('@playwright/test');
const { getScripts } = require('./test-helper');

test('injectStyles is idempotent', async ({ page }) => {
  const { utilsJs } = getScripts();
  await page.setContent(`<!DOCTYPE html><html><body></body></html>`);
  await page.evaluate(utilsJs);

  await page.evaluate(() => {
    window.ISD_UTILS.injectStyles();
    window.ISD_UTILS.injectStyles(); // Second call
  });

  const styleCount = await page.evaluate(() => {
    return document.querySelectorAll('style#isd-styles').length;
  });

  expect(styleCount).toBe(1);
});
