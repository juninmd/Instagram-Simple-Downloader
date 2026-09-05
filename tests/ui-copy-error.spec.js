const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('copy button simulates writeText failure and transitions to error state', async ({ page }) => {
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf-8');
  const utilsJs = read('utils.js');
  const uiBaseJs = read('ui-base.js');
  const uiJs = read('ui.js');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head></head>
    <body>
      <div id="content"></div>
    </body>
    </html>
  `);

  await page.evaluate(() => {
    // Mock navigator.clipboard with a rejection
    Object.assign(navigator, {
      clipboard: {
        writeText: () => Promise.reject(new Error('Clipboard write failed'))
      }
    });
  });

  const fullScript = utilsJs + '\n' + uiBaseJs + '\n' + uiJs;
  await page.evaluate(fullScript);

  await page.evaluate(() => {
    const content = document.getElementById('content');
    const article = document.createElement('article');
    const section = document.createElement('section');
    const img = document.createElement('img');
    img.src = "https://instagram.com/test.jpg";
    section.appendChild(img);
    article.appendChild(section);
    content.appendChild(article);
    window.ISD_UI.appendButtons(article, img.src, 'image', 1);
  });

  const copyBtn = page.locator('.isd-btn', { hasText: 'Copy Link' });
  await expect(copyBtn).toBeVisible();

  // Ensure it's the copy button
  const copyBtnIcon = copyBtn.locator('svg').first();
  await expect(copyBtnIcon).toBeVisible();

  // Click to trigger the clipboard rejection
  await copyBtn.click();

  // Validate error state
  await expect(copyBtn).toHaveClass(/isd-error/);
  await expect(copyBtn).toHaveClass(/isd-shake/);
  await expect(copyBtn).toHaveText(/Error/);
  await expect(copyBtn).toHaveAttribute('title', 'Copy Link #1 - Failed. Click to retry.');
});
