const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('buttons are injected in post page', async ({ page }) => {
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
          <img src="profile.jpg" srcset="profile.jpg 1x">
        </article>
      </div>
    </body>
    </html>
  `);

  let modifiedObserverJs = observerJs.replace(
    "const url = new URL(window.location.href);",
    "const url = new URL('https://instagram.com/p/123/');"
  );

  const fullScript = utilsJs + '\n' + uiJs + '\n' + modifiedObserverJs;
  await page.evaluate(fullScript);

  const downloadBtn = page.locator('.isd-btn[aria-label*="Download"]');
  const copyBtn = page.locator('.isd-btn[aria-label="Copy Link #1"]');

  await expect(downloadBtn).toBeVisible({ timeout: 1000 });
  await expect(copyBtn).toBeVisible({ timeout: 1000 });
});
