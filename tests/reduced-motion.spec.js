const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('reduced motion handling', () => {
  let utilsJs, uiJs;

  test.beforeAll(() => {
    const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf-8');
    utilsJs = read('utils.js');
    uiJs = read('ui.js');
  });

  test('button retains visibility when error shake occurs under reduced motion', async ({ page }) => {
    await page.setContent(`<!DOCTYPE html><html><body><div id="content"></div></body></html>`);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.evaluate(() => {
      window.browser = {
        runtime: {
          sendMessage: (msg, cb) => {
            if (cb) cb({ error: 'fail' });
            return true;
          }
        }
      };
    });

    const fullScript = utilsJs + '\n' + uiJs;
    await page.evaluate(fullScript);

    await page.evaluate(() => {
      const content = document.getElementById('content');
      const btn = window.ISD_UI.createDownloadButton('fail', 'image', 1);
      content.appendChild(btn);
    });

    const button = page.locator('.isd-btn').first();
    await button.click();

    await expect(button).toHaveClass(/isd-error/);
    await expect(button).toHaveClass(/isd-shake/);

    await expect(button).toBeVisible();
  });

  test('success checkmark remains visible without pop animation under reduced motion', async ({ page }) => {
    await page.setContent(`<!DOCTYPE html><html><body><div id="content"></div></body></html>`);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.evaluate(() => {
      window.browser = {
        runtime: {
          sendMessage: (msg, cb) => {
            setTimeout(() => {
              if (cb) cb({ success: true, id: 123 });
            }, 50);
            return true;
          }
        }
      };
    });

    const fullScript = utilsJs + '\n' + uiJs;
    await page.evaluate(fullScript);

    await page.evaluate(() => {
      const content = document.getElementById('content');
      const btn = window.ISD_UI.createDownloadButton('success', 'image', 1);
      content.appendChild(btn);
    });

    const button = page.locator('.isd-btn').first();
    await button.click();

    await expect(button).toHaveClass(/isd-success/, { timeout: 5000 });

    const checkSvg = button.locator('svg.isd-pop');

    await expect(checkSvg).toBeVisible();
  });
});
