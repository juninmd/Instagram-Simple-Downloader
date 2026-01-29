const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('both download and copy buttons are injected', async ({ page }) => {
  const appJsPath = path.join(__dirname, '..', 'app.js');
  const appJsContent = fs.readFileSync(appJsPath, 'utf-8');

  await page.setContent(`<!DOCTYPE html><html><body><div id="content"></div></body></html>`);

  let modifiedAppJs = appJsContent.replace("if (window.location.href === 'https://www.instagram.com/')", "if (true)");
  await page.evaluate(modifiedAppJs);

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

  const downloadBtn = page.locator('.download-button');
  const copyBtn = page.locator('.copy-button');

  await expect(downloadBtn).toBeVisible();
  await expect(copyBtn).toBeVisible();

  await expect(downloadBtn).toHaveText(/Download Image #1/);
  await expect(copyBtn).toHaveText(/Copy Link/);
});
