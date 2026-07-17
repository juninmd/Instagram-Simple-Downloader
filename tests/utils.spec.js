const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Utility functions', () => {
  test.beforeEach(async ({ page }) => {
    const utilsJs = fs.readFileSync(path.join(__dirname, '..', 'utils.js'), 'utf-8');
    await page.setContent(`<!DOCTYPE html><html><head></head><body></body></html>`);
    await page.evaluate(utilsJs);
  });

  test('el creates DOM elements correctly', async ({ page }) => {
    const elementProps = await page.evaluate(() => {
      const el = window.ISD_UTILS.el('div', 'my-class', { id: 'my-id', 'data-test': 'value' }, { color: 'red' });
      return {
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        dataTest: el.getAttribute('data-test'),
        color: el.style.color
      };
    });

    expect(elementProps.tagName).toBe('DIV');
    expect(elementProps.className).toBe('my-class');
    expect(elementProps.id).toBe('my-id');
    expect(elementProps.dataTest).toBe('value');
    expect(elementProps.color).toBe('red');
  });

  test('el creates DOM elements correctly with default arguments', async ({ page }) => {
    const elementProps = await page.evaluate(() => {
      const el = window.ISD_UTILS.el('span');
      return {
        tagName: el.tagName,
        className: el.className
      };
    });

    expect(elementProps.tagName).toBe('SPAN');
    expect(elementProps.className).toBe('');
  });

  test('injectStyles appends styles to the document', async ({ page }) => {
    const styleCountBefore = await page.locator('style').count();

    await page.evaluate(() => {
      window.ISD_UTILS.injectStyles();
    });

    const styleCountAfter = await page.locator('style').count();
    expect(styleCountAfter).toBe(styleCountBefore + 1);

    const styleText = await page.locator('style').last().textContent();
    expect(styleText).toContain('.isd-btn');
    expect(styleText).toContain('.isd-spinner');
    expect(styleText).toContain('@keyframes isd-pop');
  });

  test('el creates DOM elements with default tag div if omitted or falsy', async ({ page }) => {
    const tagName = await page.evaluate(() => {
      const e = window.ISD_UTILS.el('');
      return e.tagName;
    });
    expect(tagName).toBe('DIV');
  });

  test('createConfetti handles missing or invalid rect object', async ({ page }) => {
    // Should not throw or create any confetti
    const confettiCount = await page.evaluate(() => {
      window.ISD_UTILS.createConfetti(null);
      window.ISD_UTILS.createConfetti({ left: 10 }); // Invalid
      return document.querySelectorAll('.isd-confetti').length;
    });
    expect(confettiCount).toBe(0);
  });

  test('createConfetti renders elements', async ({ page }) => {
    await page.evaluate(() => {
      window.ISD_UTILS.createConfetti({ left: 100, top: 100, width: 50, height: 50 });
    });

    // We should expect around 12 confetti elements based on the utils code
    const confettiElements = page.locator('.isd-confetti');
    await expect(confettiElements).toHaveCount(12);

    // We inject the styles so position is actually fixed via CSS class.
    await page.evaluate(() => {
      window.ISD_UTILS.injectStyles();
    });

    const firstConfettiStyle = await confettiElements.first().evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        position: computed.position,
        background: el.style.background
      };
    });

    expect(firstConfettiStyle.position).toBe('fixed');
    expect(firstConfettiStyle.background).not.toBe('');
  });
});
