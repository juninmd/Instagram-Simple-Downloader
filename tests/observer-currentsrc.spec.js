const { test, expect } = require('@playwright/test');
const { getScripts } = require('./test-helper');

test('observer handles currentSrc properly', async ({ page }) => {
  const { utilsJs, uiBaseJs, uiJs, observerJs } = getScripts();

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <article>
        <img srcset="high-res.jpg 1000w" src="low-res.jpg" alt="test image" />
        <video>
            <source src="low-res-vid.mp4" />
        </video>
      </article>
    </body>
    </html>
  `);

  // We need to set currentSrc manually because Playwright doesn't simulate srcset loading fully
  await page.evaluate(() => {
    const img = document.querySelector('img');
    Object.defineProperty(img, 'currentSrc', { value: 'high-res.jpg' });

    const video = document.querySelector('video');
    Object.defineProperty(video, 'currentSrc', { value: 'high-res-vid.mp4' });

    // Mock browser API so we can capture the URL sent to sendMessage
    window.browser = {
      runtime: {
        sendMessage: (msg, cb) => {
          window.lastSentUrl = msg.url;
          if (cb) cb({ success: true });
        }
      }
    };
  });

  let modifiedObserverJs = observerJs.replace(
    /const url = new URL\(window\.location\.href\);/s,
    "const url = new URL('https://instagram.com/p/123/');"
  );

  const fullScript = utilsJs + '\n' + uiBaseJs + '\n' + uiJs + '\n' + modifiedObserverJs;
  await page.evaluate(fullScript);

  // Click image download button
  const imgBtn = page.locator('.isd-btn[title*="Image #1 - Download"]');
  await expect(imgBtn).toHaveCount(1);
  await imgBtn.click();

  let sentUrl = await page.evaluate(() => window.lastSentUrl);
  expect(sentUrl).toBe('high-res.jpg');

  // Click video download button
  const vidBtn = page.locator('.isd-btn[title*="Video #2 - Download"]');
  await expect(vidBtn).toHaveCount(1);
  await vidBtn.click();

  sentUrl = await page.evaluate(() => window.lastSentUrl);
  expect(sentUrl).toBe('high-res-vid.mp4');
});