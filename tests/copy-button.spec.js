const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('copy button simulates writeText and transitions to success state', async ({ page }) => {
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
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: (text) => Promise.resolve()
      }
    });
  });

  const fullScript = utilsJs + '\n' + uiJs;
  await page.evaluate(fullScript);

  await page.evaluate(() => {
    const content = document.getElementById('content');
    const button = window.ISD_UI.createCopyButton('https://instagram.com/p/123', 1);
    content.appendChild(button);
  });

  const button = page.locator('.isd-btn').first();
  await expect(button).toBeVisible();

  await button.click();

  // Wait for the button to have the success class
  await expect(button).toHaveClass(/isd-success/);

  // Verify success text
  await expect(button).toHaveText(/Copied!/);

  // Confetti verification
  const confettiCount = await page.locator('.isd-confetti').count();
  expect(confettiCount).toBe(12);
});
