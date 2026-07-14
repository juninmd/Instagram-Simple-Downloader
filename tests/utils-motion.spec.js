const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('createConfetti respects prefers-reduced-motion', async ({ page }) => {
  const utilsJs = fs.readFileSync(path.join(__dirname, '..', 'utils.js'), 'utf-8');
  await page.setContent(`<!DOCTYPE html><html><body></body></html>`);

  await page.emulateMedia({ reducedMotion: 'reduce' });

  await page.evaluate(utilsJs);
  await page.evaluate(() => {
    window.ISD_UTILS.createConfetti({ left: 0, top: 0, width: 100, height: 100 });
  });

  const confettiCount = await page.locator('.isd-confetti').count();
  expect(confettiCount).toBe(0);
});
