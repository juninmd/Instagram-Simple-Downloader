const { test, expect } = require('@playwright/test');
const { getScripts } = require('./test-helper');

test('observer handles missing target elements gracefully', async ({ page }) => {
  const { utilsJs, uiBaseJs, uiJs, observerJs } = getScripts();

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <div id="content"></div>
    </body>
    </html>
  `);

  let modifiedObserverJs = observerJs.replace(
    /const url = new URL\(window\.location\.href\);/s,
    "const url = new URL('https://instagram.com/stories/test/');"
  );

  const fullScript = utilsJs + '\n' + uiBaseJs + '\n' + uiJs + '\n' + modifiedObserverJs;

  // Execution should not throw error if section is not found
  await page.evaluate(fullScript);

  let downloadBtn = page.locator('.isd-btn[title*="Image"]');
  await expect(downloadBtn).toHaveCount(0);

  // Re-run for profile page where article is not found
  await page.setContent(`<!DOCTYPE html><html><body></body></html>`);

  modifiedObserverJs = observerJs.replace(
    /const url = new URL\(window\.location\.href\);/s,
    "const url = new URL('https://instagram.com/p/123/');"
  );

  const fullScriptProfile = utilsJs + '\n' + uiBaseJs + '\n' + uiJs + '\n' + modifiedObserverJs;
  await page.evaluate(fullScriptProfile);

  downloadBtn = page.locator('.isd-btn[title*="Image"]');
  await expect(downloadBtn).toHaveCount(0);

  // Re-run for exception handling in URL parsing
  await page.setContent(`<!DOCTYPE html><html><body></body></html>`);

  modifiedObserverJs = observerJs.replace(
    /const url = new URL\(window\.location\.href\);/s,
    "throw new Error('URL parse error');"
  );

  const fullScriptException = utilsJs + '\n' + uiBaseJs + '\n' + uiJs + '\n' + modifiedObserverJs;
  // Execution should not throw error up to global scope
  await page.evaluate(fullScriptException);

  // Re-run for media items without src
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <article>
        <!-- Image without src -->
        <img srcset="test" />
        <!-- Video without src or source -->
        <video></video>
        <!-- Video with source but no src -->
        <video><source /></video>
        <!-- Video with valid source src -->
        <video><source src="test.mp4" /></video>
        <!-- Video with multiple sources -->
        <video><source /><source src="real.mp4" /></video>
      </article>
    </body>
    </html>
  `);

  modifiedObserverJs = observerJs.replace(
    /const url = new URL\(window\.location\.href\);/s,
    "const url = new URL('https://instagram.com/p/123/');"
  );

  const fullScriptNoSrc = utilsJs + '\n' + uiBaseJs + '\n' + uiJs + '\n' + modifiedObserverJs;
  await page.evaluate(fullScriptNoSrc);

  // Since there are 5 media tags matched by MEDIA_SELECTOR, 3 are missing 'src'
  // and 2 have 'src', we expect exactly 2 sets of buttons to be injected.
  const allBtns = page.locator('.isd-btn');
  // 2 download buttons, 2 copy buttons
  await expect(allBtns).toHaveCount(4);

  const downloadBtnVideo1 = page.locator('.isd-btn[title*="Video #1"]');
  await expect(downloadBtnVideo1).toHaveCount(1);

  const downloadBtnVideo2 = page.locator('.isd-btn[title*="Video #2"]');
  await expect(downloadBtnVideo2).toHaveCount(1);
});
