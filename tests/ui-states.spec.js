const { test, expect } = require('@playwright/test');
const fs = require('fs');
const { getScripts } = require('./test-helper');
const path = require('path');

test('button transitions through loading and success states', async ({ page }) => {
  const { utilsJs, uiBaseJs, uiJs } = getScripts();

  await page.setContent(`<!DOCTYPE html><html><body><div id="content"></div></body></html>`);

  await page.evaluate(() => {
    window.browser = {
      runtime: {
        sendMessage: (msg, cb) => {
          setTimeout(() => {
            if (cb) cb({ success: true, id: 123 });
          }, 300);
          return true;
        }
      }
    };
  });

  const fullScript = utilsJs + '\n' + uiBaseJs + '\n' + uiJs;
  await page.evaluate(fullScript);

  await page.evaluate(() => {
    const content = document.getElementById('content');
    const button = window.ISD_UI.createDownloadButton('test.jpg', 'image', 1);
    content.appendChild(button);
  });

  const button = page.locator('.isd-btn').first();
  await expect(button).toBeVisible();

  await expect(button).toHaveText(/Image #1/);

  await button.click();

  await expect(button).toHaveClass(/isd-loading/);
  await expect(button).toHaveText(/Image #1 - Downloading\.\.\./);
    await expect(button).toHaveAttribute('title', 'Image #1 - Downloading...');

  await expect(button).toHaveClass(/isd-success/);
  await expect(button).toHaveText(/Image #1 - Started!/);

  // Check that the pop animation is applied to the SVG
  const checkSvg = button.locator('svg.isd-pop');
  await expect(checkSvg).toBeVisible();
});
