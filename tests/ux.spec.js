import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('UX Verification', () => {
  test('should verify download button states', async ({ page }) => {
    // Load the local HTML file
    const filePath = path.resolve(__dirname, '../ux-verify.html');
    await page.goto(`file://${filePath}`);

    // Wait for button to be available
    const button = page.locator('button.isd-btn');
    await expect(button).toBeVisible();

    // Get initial cursor style
    const cursorInitial = await button.evaluate((el) => getComputedStyle(el).cursor);
    console.log(`Initial cursor: ${cursorInitial}`);
    expect(cursorInitial).toBe('pointer');

    // Check High Contrast border
    const borderInitial = await button.evaluate((el) => getComputedStyle(el).borderTopWidth);
    console.log(`Border width: ${borderInitial}`);
    // Should be 1px or 2px depending on browser/implementation default
    expect(parseInt(borderInitial, 10)).toBeGreaterThan(0);

    // Click the button
    await button.click();

    // Wait for "Downloading..." text
    await expect(button).toHaveText('Downloading...');

    // Check Loading cursor
    const cursorLoading = await button.evaluate((el) => getComputedStyle(el).cursor);
    const opacityLoading = await button.evaluate((el) => getComputedStyle(el).opacity);
    console.log(`Loading cursor: ${cursorLoading}, Opacity: ${opacityLoading}`);
    expect(cursorLoading).toBe('progress');
    expect(opacityLoading).toBe('1');

    // Wait for "Started!" text
    await expect(button).toHaveText('Started!');

    // Check Success cursor
    const cursorSuccess = await button.evaluate((el) => getComputedStyle(el).cursor);
    const opacitySuccess = await button.evaluate((el) => getComputedStyle(el).opacity);
    console.log(`Success cursor: ${cursorSuccess}, Opacity: ${opacitySuccess}`);
    expect(cursorSuccess).toBe('default');
    expect(opacitySuccess).toBe('1');

    // Wait for Reset (2s + buffer)
    await page.waitForTimeout(2500);

    // Check Reset state
    await expect(button).toContainText('Download #1');
    const cursorReset = await button.evaluate((el) => getComputedStyle(el).cursor);
    console.log(`Reset cursor: ${cursorReset}`);
    expect(cursorReset).toBe('pointer');
  });
});
