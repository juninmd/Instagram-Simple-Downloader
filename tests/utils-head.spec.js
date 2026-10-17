const { test, expect } = require('@playwright/test');
const { getScripts } = require('./test-helper');

test('injectStyles handles missing document.head gracefully', async ({ page }) => {
  const { utilsJs } = getScripts();
  await page.setContent(`<!DOCTYPE html><html></html>`);

  await page.evaluate(() => {
    // Remove head to test the fallback to documentElement
    const head = document.querySelector('head');
    if (head) head.remove();
  });

  await page.evaluate(utilsJs);

  const styleAppended = await page.evaluate(() => {
    try {
      window.ISD_UTILS.injectStyles();
      return !!document.getElementById('isd-styles');
    } catch (e) {
      return false;
    }
  });

  expect(styleAppended).toBe(true);
});
