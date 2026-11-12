const { test, expect } = require('@playwright/test');
const fs = require('fs');
const { getScripts } = require('./test-helper');

test('aperture styles inject once and style the wrapper as a dock', async ({ page }) => {
  const { utilsJs } = getScripts();
  const aperture = fs.readFileSync(require('path').join(__dirname, '..', 'aperture.js'), 'utf-8');
  await page.setContent('<div class="isd-wrapper" style="display:flex"></div>');
  await page.evaluate(utilsJs + '\n' + aperture);
  await page.evaluate(() => { window.ISD_UTILS.injectAperture(); window.ISD_UTILS.injectAperture(); });
  await expect(page.locator('style#isd-aperture')).toHaveCount(1);
  const radius = await page.evaluate(() => getComputedStyle(document.querySelector('.isd-wrapper')).borderRadius);
  expect(radius).toBe('22px');
});
