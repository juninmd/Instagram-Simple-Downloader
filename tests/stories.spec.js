const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('buttons are injected in stories', async ({ page }) => {
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf-8');
  const utilsJs = read('utils.js');
  const uiJs = read('ui.js');
  const observerJs = read('observer.js');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <section style="height: 100vh;">
        <div>
          <img src="story.jpg" srcset="story.jpg 1x">
        </div>
      </section>
    </body>
    </html>
  `);

  let modifiedObserverJs = observerJs.replace(
    "const url = window.location.href;",
    "const url = 'https://instagram.com/stories/test/';"
  );

  const fullScript = utilsJs + '\n' + uiJs + '\n' + modifiedObserverJs;
  await page.evaluate(fullScript);

  const downloadBtn = page.locator('.isd-btn[aria-label*="Download"]');
  await expect(downloadBtn).toBeVisible({ timeout: 1000 });
});
