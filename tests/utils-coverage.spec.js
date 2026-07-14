const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('el creates DOM elements with missing classes and multiple attributes', async ({ page }) => {
  const utilsJs = fs.readFileSync(path.join(__dirname, '..', 'utils.js'), 'utf-8');
  await page.setContent(`<!DOCTYPE html><html><body></body></html>`);
  await page.evaluate(utilsJs);

  const elementProps = await page.evaluate(() => {
    const el = window.ISD_UTILS.el('p', null, { 'data-info': '123' }, { marginTop: '10px' });
    return {
      tagName: el.tagName,
      className: el.className,
      dataInfo: el.getAttribute('data-info'),
      marginTop: el.style.marginTop
    };
  });

  expect(elementProps.tagName).toBe('P');
  expect(elementProps.className).toBe('');
  expect(elementProps.dataInfo).toBe('123');
  expect(elementProps.marginTop).toBe('10px');
});

test('el creates DOM elements with only tag and attributes', async ({ page }) => {
  const utilsJs = fs.readFileSync(path.join(__dirname, '..', 'utils.js'), 'utf-8');
  await page.setContent(`<!DOCTYPE html><html><body></body></html>`);
  await page.evaluate(utilsJs);

  const elementProps = await page.evaluate(() => {
    const el = window.ISD_UTILS.el('input', undefined, { type: 'text' });
    return {
      tagName: el.tagName,
      type: el.getAttribute('type')
    };
  });

  expect(elementProps.tagName).toBe('INPUT');
  expect(elementProps.type).toBe('text');
});
