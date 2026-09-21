const { test, expect } = require('@playwright/test');
const { getScripts, read } = require('./test-helper');



test('createConfetti respects prefers-reduced-motion', async ({ page }) => {
  const { utilsJs } = getScripts();
  await page.setContent(`<!DOCTYPE html><html><body></body></html>`);

  await page.emulateMedia({ reducedMotion: 'reduce' });

  await page.evaluate(utilsJs);
  await page.evaluate(() => {
    window.ISD_UTILS.createConfetti({ left: 0, top: 0, width: 100, height: 100 });
  });

  const confettiCount = await page.locator('.isd-confetti').count();
  expect(confettiCount).toBe(0);
});

test('createConfetti safely handles missing window.matchMedia', async ({ page }) => {
  const { utilsJs } = getScripts();
  await page.setContent(`<!DOCTYPE html><html><body></body></html>`);

  await page.evaluate(() => {
    delete window.matchMedia;
  });

  await page.evaluate(utilsJs);
  await page.evaluate(() => {
    window.ISD_UTILS.createConfetti({ left: 0, top: 0, width: 100, height: 100 });
  });

  const confettiCount = await page.locator('.isd-confetti').count();
  expect(confettiCount).toBe(12);
});
