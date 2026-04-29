const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('both download and copy buttons are injected', async ({ page }) => {
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf-8');
  const utilsJs = read('utils.js');
  const uiJs = read('ui.js');
  const observerJs = read('observer.js');

  await page.setContent(`<!DOCTYPE html><html><body><div id="content"></div></body></html>`);

  // Mock location check in observer.js
  let modifiedObserverJs = observerJs.replace(
    "if (url === 'https://www.instagram.com/' || url.includes('instagram.com/?') || url.includes('instagram.com/reels'))",
    "if (true)"
  );

  // Combine scripts
  const fullScript = utilsJs + '\n' + uiJs + '\n' + modifiedObserverJs;

  await page.evaluate(fullScript);

  await page.evaluate(() => {
    const content = document.getElementById('content');
    const article = document.createElement('article');
    const section = document.createElement('section');
    const img = document.createElement('img');
    img.srcset = "test.jpg 1x";
    img.src = "test.jpg";
    section.appendChild(img);
    article.appendChild(section);
    content.appendChild(article);
  });

  const downloadBtn = page.locator('.isd-btn[aria-label*="Download"]');
  const copyBtn = page.locator('.isd-btn[aria-label="Copy Link #1"]');

  await expect(downloadBtn).toBeVisible();
  await expect(copyBtn).toBeVisible();

  await expect(downloadBtn).toHaveText(/Download Image #1/);
  await expect(copyBtn).toHaveText(/Copy Link #1/);
});
