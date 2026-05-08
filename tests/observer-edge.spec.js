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

  let downloadBtn = page.locator('.isd-btn[aria-label*="Download"]');
  await expect(downloadBtn).toHaveCount(0);

  // Re-run for profile page where article is not found
  await page.setContent(`<!DOCTYPE html><html><body></body></html>`);

  modifiedObserverJs = observerJs.replace(
    /const url = new URL\(window\.location\.href\);/s,
    "const url = new URL('https://instagram.com/p/123/');"
  );

  const fullScriptProfile = utilsJs + '\n' + uiJs + '\n' + modifiedObserverJs;
  await page.evaluate(fullScriptProfile);

  downloadBtn = page.locator('.isd-btn[aria-label*="Download"]');
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
});
