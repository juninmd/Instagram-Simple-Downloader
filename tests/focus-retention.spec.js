const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('button retains focus and uses aria-disabled', async ({ page }) => {
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

  await page.evaluate(() => {
    window.browser = {
      runtime: {
        sendMessage: () => new Promise(resolve => setTimeout(resolve, 500))
      }
    };
  });

  let modifiedObserverJs = observerJs.replace(
    "if (url === 'https://www.instagram.com/' || url.includes('instagram.com/?') || url.includes('instagram.com/reels'))",
    "if (true)"
  );

  let modifiedUiJs = uiJs.replace(/await browser\.runtime/g, 'await window.browser.runtime');

  const fullScript = utilsJs + '\n' + modifiedUiJs + '\n' + modifiedObserverJs;

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

  const button = page.locator('.isd-btn').first();
  await expect(button).toBeVisible();

  await button.focus();
  await expect(button).toBeFocused();

  await button.click();

  const isFocused = await page.evaluate(() => {
    const btn = document.querySelector('.isd-btn');
    return document.activeElement === btn;
  });

  expect(isFocused).toBe(true, 'Focus should be retained on the button');

  await expect(button).toHaveAttribute('aria-disabled', 'true');
  const isDisabledProperty = await page.evaluate(() => document.querySelector('.isd-btn').disabled);
  expect(isDisabledProperty).toBe(false, 'Button disabled property should be false');

  const marginInlineEnd = await page.evaluate(() => {
    const styleTag = document.querySelector('style');
    return styleTag.textContent.includes('margin-inline-end') ? 'present' : 'missing';
  });

  expect(marginInlineEnd).toBe('present', 'CSS should use margin-inline-end');
});
