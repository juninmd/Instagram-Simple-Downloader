const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('button retains focus and uses aria-disabled', async ({ page }) => {
  // Read app.js
  const appJsPath = path.join(__dirname, '..', 'app.js');
  const appJsContent = fs.readFileSync(appJsPath, 'utf-8');

  // Setup basic page structure
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <div id="content"></div>
    </body>
    </html>
  `);

  // Mock window.browser explicitly in the page context
  await page.evaluate(() => {
    window.browser = {
      runtime: {
        sendMessage: () => new Promise(resolve => setTimeout(resolve, 500)) // 500ms delay
      }
    };
  });

  // Inject mocks and bypass location check in app.js
  // We use replace to patch the code for the test environment

  // 1. Force searchFeed to run regardless of URL
  let modifiedAppJs = appJsContent.replace(
    "if (window.location.href === 'https://www.instagram.com/')",
    "if (true)"
  );

  // 2. Use window.browser to ensure mock is accessible
  modifiedAppJs = modifiedAppJs.replace(
    /await browser\.runtime/g,
    'await window.browser.runtime'
  );

  // Evaluate app.js - this starts the observer
  await page.evaluate(modifiedAppJs);

  // Trigger mutation by adding an article with an image
  await page.evaluate(() => {
    const content = document.getElementById('content');
    const article = document.createElement('article');
    const section = document.createElement('section'); // appendDownloadButton looks for section
    const img = document.createElement('img');
    img.srcset = "test.jpg 1x";
    img.src = "test.jpg";

    section.appendChild(img);
    article.appendChild(section);
    content.appendChild(article);
  });

  // Wait for button to be injected
  const button = page.locator('.isd-btn').first();
  await expect(button).toBeVisible();

  // Focus the button
  await button.focus();
  await expect(button).toBeFocused();

  // Click the button
  await button.click();

  // CHECK 1: Focus retention
  // The key fix is that we use aria-disabled instead of disabled attribute,
  // so the button should remain the active element.
  const isFocused = await page.evaluate(() => {
    const btn = document.querySelector('.isd-btn');
    return document.activeElement === btn;
  });

  expect(isFocused).toBe(true, 'Focus should be retained on the button');

  // CHECK 2: aria-disabled usage
  await expect(button).toHaveAttribute('aria-disabled', 'true');
  const isDisabledProperty = await page.evaluate(() => document.querySelector('.isd-btn').disabled);
  expect(isDisabledProperty).toBe(false, 'Button disabled property should be false');

  // CHECK 3: RTL support (margin-inline-end)
  const marginInlineEnd = await page.evaluate(() => {
    // Check the injected style tag text content for 'margin-inline-end'.
    const styleTag = document.querySelector('style');
    return styleTag.textContent.includes('margin-inline-end') ? 'present' : 'missing';
  });

  expect(marginInlineEnd).toBe('present', 'CSS should use margin-inline-end');
});
