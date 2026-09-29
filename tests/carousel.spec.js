const { test, expect } = require('@playwright/test');
const { getScripts } = require('./test-helper');

test('carousel dynamically added items have incrementing indexes', async ({ page }) => {
  const { utilsJs, uiBaseJs, uiJs, observerJs } = getScripts();

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
    /const isArticleRoute = [^;]+;/s,
    "const isArticleRoute = true;"
  );

  const fullScript = utilsJs + '\n' + uiBaseJs + '\n' + uiJs + '\n' + modifiedObserverJs;

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

  const downloadBtns = page.locator('.isd-btn[title*="Image"]');
  await expect(downloadBtns).toHaveCount(2);
  await expect(downloadBtns.nth(0)).toHaveText(/Image #1/);
  await expect(downloadBtns.nth(1)).toHaveText(/Image #2/);

  const copyBtns = page.locator('.isd-btn[title*="Copy"]');
  await expect(copyBtns).toHaveCount(2);
  await expect(copyBtns.nth(0)).toHaveText(/Copy Link #1/);
  await expect(copyBtns.nth(1)).toHaveText(/Copy Link #2/);
});

test('carousel dynamically added items of mixed types have incrementing indexes', async ({ page }) => {
  const { utilsJs, uiBaseJs, uiJs, observerJs } = getScripts();

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
      <div id="content"></div>
    </body>
    </html>
  `);

  let modifiedObserverJs = observerJs.replace(
    /const isArticleRoute = [^;]+;/s,
    "const isArticleRoute = true;"
  );

  const fullScript = utilsJs + '\n' + uiBaseJs + '\n' + uiJs + '\n' + modifiedObserverJs;

  await page.evaluate(fullScript);

  // Initial render with one item (Image)
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

  // Second item added to carousel (Video)
  await page.evaluate(() => {
    const section = document.querySelector('section');
    const vid = document.createElement('video');
    vid.src = "test2.mp4";
    section.appendChild(vid);
  });

  await page.waitForTimeout(100);

  const downloadImageBtns = page.locator('.isd-btn[title*="Image"]');
  await expect(downloadImageBtns).toHaveCount(1);
  await expect(downloadImageBtns.nth(0)).toHaveText(/Image #1/);

  const downloadVideoBtns = page.locator('.isd-btn[title*="Video"]');
  await expect(downloadVideoBtns).toHaveCount(1);
  await expect(downloadVideoBtns.nth(0)).toHaveText(/Video #2/);

  const copyBtns = page.locator('.isd-btn[title*="Copy"]');
  await expect(copyBtns).toHaveCount(2);
  await expect(copyBtns.nth(0)).toHaveText(/Copy Link #1/);
  await expect(copyBtns.nth(1)).toHaveText(/Copy Link #2/);
});

test('carousel correctly identifies existing elements using download-button attribute instead of title', async ({ page }) => {
  const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf-8');
  const utilsJs = read('utils.js');
  const uiBaseJs = read('ui-base.js');
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
    /const isArticleRoute = [^;]+;/s,
    "const isArticleRoute = true;"
  );

  const fullScript = utilsJs + '\n' + uiBaseJs + '\n' + uiJs + '\n' + modifiedObserverJs;

  await page.evaluate(fullScript);

  await page.evaluate(() => {
    const content = document.getElementById('content');
    const article = document.createElement('article');
    const section = document.createElement('section');

    // Simulate an existing element already processed
    const existingImg = document.createElement('img');
    existingImg.srcset = "existing.jpg 1x";
    existingImg.src = "existing.jpg";
    existingImg.setAttribute('download-button', 'ok');

    // Simulate a new element
    const newImg = document.createElement('img');
    newImg.srcset = "new.jpg 1x";
    newImg.src = "new.jpg";

    section.appendChild(existingImg);
    section.appendChild(newImg);
    article.appendChild(section);
    content.appendChild(article);
  });

  await page.waitForTimeout(100);

  // Since existingImg already has download-button="ok", it shouldn't get a new button.
  // The newImg should be processed and get index 2 because there is already 1 element with download-button="ok".
  const downloadBtns = page.locator('.isd-btn[title*="Image"]');
  await expect(downloadBtns).toHaveCount(1);
  await expect(downloadBtns.nth(0)).toHaveText(/Image #2/);
});
