const { test, expect } = require('@playwright/test');
const { getScripts } = require('./test-helper');

test('observer dynamic counting avoids duplicating indices', async ({ page }) => {
  const { utilsJs, uiBaseJs, uiJs, observerJs } = getScripts();

  await page.setContent(`<!DOCTYPE html><html><body><div id="content"></div></body></html>`);

  let modifiedObserverJs = observerJs.replace(
    /const isArticleRoute = [^;]+;/s,
    "const isArticleRoute = true;"
  );

  const fullScript = utilsJs + '\n' + uiBaseJs + '\n' + uiJs + '\n' + modifiedObserverJs;
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

  expect(allTexts.some(t => t.includes('#1'))).toBe(true);
  expect(allTexts.some(t => t.includes('#2'))).toBe(true);
});
