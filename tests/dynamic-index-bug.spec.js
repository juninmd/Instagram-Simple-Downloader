const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('carousel indexes are correct even if a previous button is clicked and changing state', async ({ page }) => {
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf-8');
  const utilsJs = read('utils.js');
  const uiJs = read('ui.js');
  const observerJs = read('observer.js');

  await page.setContent(`<!DOCTYPE html><html><body><div id="content"></div></body></html>`);

  let modifiedObserverJs = observerJs.replace(
    /const isFeedOrReels = [^;]+;/s,
    "const isFeedOrReels = true;"
  );

  await page.evaluate(() => {
    window.browser = {
      runtime: {
        sendMessage: (msg, cb) => {
          // never resolves, so button stays in 'Downloading...' state
          return true;
        }
      }
    };
  });

  const fullScript = utilsJs + '\n' + uiJs + '\n' + modifiedObserverJs;
  await page.evaluate(fullScript);

  await page.evaluate(() => {
    const content = document.getElementById('content');
    const article = document.createElement('article');
    const section = document.createElement('section');

    const img1 = document.createElement('img');
    img1.srcset = "test1.jpg 1x";
    img1.src = "test1.jpg";
    section.appendChild(img1);

    article.appendChild(section);
    content.appendChild(article);
  });

  await page.waitForTimeout(200);

  const firstBtn = page.locator('.isd-btn').first();
  await expect(firstBtn).toHaveText(/Image #1/);

  await firstBtn.click();

  // Wait for it to become "Downloading..."
  await expect(firstBtn).toHaveText(/Downloading.../);

  await page.evaluate(() => {
    const section = document.querySelector('section');
    const img2 = document.createElement('img');
    img2.srcset = "test2.jpg 1x";
    img2.src = "test2.jpg";
    section.appendChild(img2);
  });

  await page.waitForTimeout(200);

  const buttons = page.locator('.isd-wrapper .isd-btn').filter({ hasText: /Image #/ });
  const allTexts = await buttons.allTextContents();

  expect(allTexts.some(t => t.includes('#2'))).toBe(true);
});
