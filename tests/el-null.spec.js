const { test, expect } = require('@playwright/test');
const fs = require('fs');
const { getScripts } = require('./test-helper');
const path = require('path');

test('el handles null attrs and style gracefully', async ({ page }) => {
  const { utilsJs } = getScripts();
  await page.setContent(`<!DOCTYPE html><html><body></body></html>`);
  await page.evaluate(utilsJs);

  const elementProps = await page.evaluate(() => {
    const el = window.ISD_UTILS.el('p', null, null, null);
    return {
      tagName: el.tagName
    };
  });

  expect(elementProps.tagName).toBe('P');
});
