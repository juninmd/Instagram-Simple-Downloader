const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('button handles error state and shows shake animation', async ({ page }) => {
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf-8');
  const utilsJs = read('utils.js');
  const uiJs = read('ui.js');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <div id="content"></div>
    </body>
    </html>
  `);

  await page.evaluate(() => {
    window.browser = {
      runtime: {
        sendMessage: (msg, cb) => {
          // If a callback is passed, we shouldn't just call it with no arguments,
          // as that will resolve the wrapper Promise successfully.
          // If we want to simulate a promise rejection, we can just reject the promise.
          // Or if we want to simulate an error via callback, we'd set lastError.
          return Promise.reject(new Error('Simulated network error'));
        }
      }
    };
  });

  let modifiedUiJs = uiJs.replace(/const b = [^;]+;/s, "const b = window.browser;");

  const fullScript = utilsJs + '\n' + modifiedUiJs;

  await page.evaluate(fullScript);

  await page.evaluate(() => {
    const content = document.getElementById('content');
    const button = window.ISD_UI.createDownloadButton('test.jpg', 'image', 1);
    content.appendChild(button);
  });

  const button = page.locator('.isd-btn').first();
  await expect(button).toBeVisible();

  await button.click();

  // Wait for the button to have the error class
  await expect(button).toHaveClass(/isd-error/);
  await expect(button).toHaveClass(/isd-shake/);

  // Verify error text
  await expect(button).toHaveText(/Error/);

  // Additional test for lastError callback simulation
  await page.evaluate(() => {
    window.browser = {
      runtime: {
        sendMessage: (msg, cb) => {
          window.browser.runtime.lastError = { message: 'Callback failed message' };
          if (cb) cb();
          return undefined; // no promise to reject
        }
      }
    };
  });

  await button.click();

  await expect(button).toHaveClass(/isd-error/);
  await expect(button).toHaveClass(/isd-shake/);
});
