const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('carousel dynamically added items have incrementing indexes', async ({ page }) => {
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

  // Mock location check in observer.js
  let modifiedObserverJs = observerJs.replace(
    "if (url === 'https://www.instagram.com/' || url.includes('instagram.com/?') || url.includes('instagram.com/reels'))",
    "if (true)"
  );

  const fullScript = utilsJs + '\n' + uiJs + '\n' + modifiedObserverJs;

  await page.evaluate(fullScript);

  // Initial render with one item
  await page.evaluate(() => {
    const content = document.getElementById('content');
    const article = document.createElement('article');
    const section = document.createElement('section');
    const img = document.createElement('img');
    img.srcset = "test1.jpg 1x";
    img.src = "test1.jpg";
    section.appendChild(img);
    article.appendChild(section);
    content.appendChild(article);
  });

  // Second item added to carousel
  await page.evaluate(() => {
    const section = document.querySelector('section');
    const img2 = document.createElement('img');
    img2.srcset = "test2.jpg 1x";
    img2.src = "test2.jpg";
    section.appendChild(img2);
  });

  // Since playwright evaluate won't automatically trigger mutation observers for dynamically added content unless we wait,
  // we can wait a small amount of time for the observer to catch the second image addition.
  await page.waitForTimeout(100);

  const downloadBtns = page.locator('.isd-btn[aria-label*="Download"]');

  await expect(downloadBtns).toHaveCount(2);
  await expect(downloadBtns.nth(0)).toHaveText(/Download Image #1/);
  await expect(downloadBtns.nth(1)).toHaveText(/Download Image #2/);
});
