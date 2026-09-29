const { test, expect } = require('@playwright/test');
const { getScripts, read } = require('./test-helper');



test('buttons are injected in singular reel route without trailing slash', async ({ page }) => {
  const { utilsJs, uiBaseJs, uiJs, observerJs } = getScripts();

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
    /const url = new URL\(window\.location\.href\);/s,
    "const url = new URL('https://instagram.com/reel');"
  );

  const fullScript = utilsJs + '\n' + uiBaseJs + '\n' + uiJs + '\n' + modifiedObserverJs;
  await page.evaluate(fullScript);

  const downloadBtn = page.locator('.isd-btn[title*="Video"]');
  const copyBtn = page.locator('.isd-btn[title*="Copy Link #1"]');

  await expect(downloadBtn).toBeVisible({ timeout: 1000 });
  await expect(copyBtn).toBeVisible({ timeout: 1000 });
});

test('buttons are injected in post page without trailing slash', async ({ page }) => {
  const { utilsJs, uiBaseJs, uiJs, observerJs } = getScripts();

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
    /const url = new URL\(window\.location\.href\);/s,
    "const url = new URL('https://instagram.com/p');"
  );

  const fullScript = utilsJs + '\n' + uiBaseJs + '\n' + uiJs + '\n' + modifiedObserverJs;
  await page.evaluate(fullScript);

  const downloadBtn = page.locator('.isd-btn[title*="Image"]');
  const copyBtn = page.locator('.isd-btn[title*="Copy Link #1"]');

  await expect(downloadBtn).toBeVisible({ timeout: 1000 });
  await expect(copyBtn).toBeVisible({ timeout: 1000 });
});
