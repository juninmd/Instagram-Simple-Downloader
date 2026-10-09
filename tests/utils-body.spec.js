const { test, expect } = require('@playwright/test');
const { getScripts } = require('./test-helper');

test('createConfetti handles missing document.body gracefully', async ({ page }) => {
  const { utilsJs } = getScripts();
  await page.setContent(`<!DOCTYPE html><html><head></head></html>`);

  await page.evaluate(() => {
    // Remove body to test the early return
    const body = document.querySelector('body');
    if (body) body.remove();
  });

  await page.evaluate(utilsJs);

  const result = await page.evaluate(() => {
    try {
      window.ISD_UTILS.createConfetti({ left: 0, top: 0, width: 100, height: 100 });
      return true;
    } catch (e) {
      return false;
    }
  });

  expect(result).toBe(true);
});
