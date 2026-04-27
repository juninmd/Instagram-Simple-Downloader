const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('buttons are injected in reels', async ({ page }) => {
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf-8');
  const utilsJs = read('utils.js');
  const uiJs = read('ui.js');
  const observerJs = read('observer.js');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <div id="content">
        <article>
          <video src="reels.mp4"></video>
        </article>
      </div>
    </body>
    </html>
  `);

  let modifiedObserverJs = observerJs.replace(
    "const url = window.location.href;",
    "const url = 'https://instagram.com/reels/123/';"
  );

  const fullScript = utilsJs + '\n' + uiJs + '\n' + modifiedObserverJs;
  await page.evaluate(fullScript);

  const downloadBtn = page.locator('.isd-btn[aria-label*="Download"]');
  const copyBtn = page.locator('.isd-btn[aria-label="Copy Link"]');

  await expect(downloadBtn).toBeVisible({ timeout: 1000 });
  await expect(copyBtn).toBeVisible({ timeout: 1000 });
});