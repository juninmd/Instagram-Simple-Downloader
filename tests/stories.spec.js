const { test, expect } = require('@playwright/test');
const { getScripts, read } = require('./test-helper');



test('buttons are injected in stories', async ({ page }) => {
  const { utilsJs, uiBaseJs, uiJs, observerJs } = getScripts();

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
    /const url = new URL\(window\.location\.href\);/s,
    "const url = new URL('https://instagram.com/stories/test/');"
  );

  const fullScript = utilsJs + '\n' + uiBaseJs + '\n' + uiJs + '\n' + modifiedObserverJs;
  await page.evaluate(fullScript);

  const downloadBtn = page.locator('.isd-btn[title*="Image"]');
  await expect(downloadBtn).toBeVisible({ timeout: 1000 });
});
