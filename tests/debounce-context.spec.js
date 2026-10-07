const { test, expect } = require('@playwright/test');
const { getScripts } = require('./test-helper');

test('debounce correctly preserves context and arguments', async ({ page }) => {
  const { utilsJs } = getScripts();

  await page.evaluate(utilsJs);

  const result = await page.evaluate(async () => {
    return new Promise((resolve) => {
      const context = {
        value: 42,
        debouncedMethod: window.ISD_UTILS.debounce(function(arg1, arg2) {
          resolve({
            thisValue: this.value,
            args: [arg1, arg2]
          });
        }, 50)
      };

      context.debouncedMethod('hello', 'world');
    });
  });

  expect(result.thisValue).toBe(42);
  expect(result.args).toEqual(['hello', 'world']);
});