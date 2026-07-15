const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('observer handles missing target elements gracefully', async ({ page }) => {
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf-8');
  const utilsJs = read('utils.js');
  const uiJs = read('ui.js');
  const observerJs = read('observer.js');

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

  const fullScript = utilsJs + '\n' + uiJs + '\n' + modifiedObserverJs;

  // Execution should not throw error if section is not found
  await page.evaluate(fullScript);

  let downloadBtn = page.locator('.isd-btn[aria-label*="Image"]');
  await expect(downloadBtn).toHaveCount(0);

  // Re-run for profile page where article is not found
  await page.setContent(`<!DOCTYPE html><html><body></body></html>`);

  modifiedObserverJs = observerJs.replace(
    /const url = new URL\(window\.location\.href\);/s,
    "const url = new URL('https://instagram.com/p/123/');"
  );

  const fullScriptProfile = utilsJs + '\n' + uiJs + '\n' + modifiedObserverJs;
  await page.evaluate(fullScriptProfile);

  downloadBtn = page.locator('.isd-btn[aria-label*="Image"]');
  await expect(downloadBtn).toHaveCount(0);

  // Re-run for exception handling in URL parsing
  await page.setContent(`<!DOCTYPE html><html><body></body></html>`);

  modifiedObserverJs = observerJs.replace(
    /const url = new URL\(window\.location\.href\);/s,
    "throw new Error('URL parse error');"
  );

  const fullScriptException = utilsJs + '\n' + uiJs + '\n' + modifiedObserverJs;
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
      </article>
    </body>
    </html>
  `);

  modifiedObserverJs = observerJs.replace(
    /const url = new URL\(window\.location\.href\);/s,
    "const url = new URL('https://instagram.com/p/123/');"
  );

  const fullScriptNoSrc = utilsJs + '\n' + uiJs + '\n' + modifiedObserverJs;
  await page.evaluate(fullScriptNoSrc);

  // Since there are 4 media tags matched by MEDIA_SELECTOR, 3 are missing 'src'
  // and 1 has 'src', we expect exactly 1 set of buttons to be injected.
  const allBtns = page.locator('.isd-btn');
  // 1 download button, 1 copy button
  await expect(allBtns).toHaveCount(2);

  const downloadBtnVideo = page.locator('.isd-btn[aria-label="Video #1"]');
  await expect(downloadBtnVideo).toHaveCount(1);
});
