const { test, expect } = require('@playwright/test');
const { getScripts } = require('./test-helper');

test('background script validates request, sender, scheme, host, type, and sanitizes filenames', async ({ page }) => {
  const { bgJs } = getScripts();

  await page.setContent(`<!DOCTYPE html><html><body></body></html>`);

  await page.evaluate((script) => {
    window.downloadArgs = null;
    window.sendResponseArgs = null;

    window.browser = {
      runtime: {
        id: 'test-ext-id',
        onMessage: {
          addListener: (fn) => { window.bgListener = fn; }
        }
      },
      downloads: {
        download: (options, cb) => {
          window.downloadArgs = options;
          if (cb) cb(888);
        }
      }
    };

    window.validSender = {
      id: 'test-ext-id',
      tab: { url: 'https://www.instagram.com/p/C123/' }
    };

    eval(script);
  }, bgJs);

  // Helper to send message
  const sendMessage = async (request, sender) => {
    return await page.evaluate(({ req, send }) => {
      let result = null;
      const isAsync = window.bgListener(req, send, (res) => { result = res; });
      return { isAsync, result };
    }, { req: request, send: sender });
  };

  // 1. Valid request accepts https://scontent-gru1-1.cdninstagram.com/v/t51/abc.jpg
  const validSenderObj = await page.evaluate(() => window.validSender);
  const validRes = await sendMessage({ url: 'https://scontent-gru1-1.cdninstagram.com/v/t51/abc.jpg', type: 'image' }, validSenderObj);
  expect(validRes.isAsync).toBe(true);
  await page.waitForTimeout(50);
  const downloadArgs = await page.evaluate(() => window.downloadArgs);
  expect(downloadArgs.filename).toBe('abc.jpg');

  // 2. Reject http://
  const httpRes = await sendMessage({ url: 'http://scontent-gru1-1.cdninstagram.com/v/t51/abc.jpg', type: 'image' }, validSenderObj);
  expect(httpRes.isAsync).toBe(false);
  expect(httpRes.result.error).toBe('Blocked: protocol must be https:.');

  // 3. Reject blob:
  const blobRes = await sendMessage({ url: 'blob:https://www.instagram.com/1234-5678', type: 'image' }, validSenderObj);
  expect(blobRes.isAsync).toBe(false);
  expect(blobRes.result.error).toBe('Blocked: protocol must be https:.');

  // 4. Reject data:
  const dataRes = await sendMessage({ url: 'data:image/jpeg;base64,1234', type: 'image' }, validSenderObj);
  expect(dataRes.isAsync).toBe(false);
  expect(dataRes.result.error).toBe('Blocked: protocol must be https:.');

  // 5. Reject file:
  const fileRes = await sendMessage({ url: 'file:///etc/passwd', type: 'image' }, validSenderObj);
  expect(fileRes.isAsync).toBe(false);
  expect(fileRes.result.error).toBe('Blocked: protocol must be https:.');

  // 6. Reject host outside allowed list
  const hostRes = await sendMessage({ url: 'http://example.invalid/x.exe', type: 'image' }, validSenderObj);
  expect(hostRes.isAsync).toBe(false);
  expect(hostRes.result.error).toBe('Blocked: protocol must be https:.');

  const unallowedHostRes = await sendMessage({ url: 'https://evilcdninstagram.com/x.jpg', type: 'image' }, validSenderObj);
  expect(unallowedHostRes.isAsync).toBe(false);
  expect(unallowedHostRes.result.error).toBe('Blocked: unsupported media host.');

  // 7. Reject invalid media type
  const typeRes = await sendMessage({ url: 'https://scontent-gru1-1.cdninstagram.com/v/t51/abc.jpg', type: 'exe' }, validSenderObj);
  expect(typeRes.isAsync).toBe(false);
  expect(typeRes.result.error).toBe('Blocked: invalid media type.');

  // 8. Reject different sender.id
  const wrongSenderRes = await sendMessage({ url: 'https://scontent-gru1-1.cdninstagram.com/v/t51/abc.jpg', type: 'image' }, { id: 'wrong-id', tab: { url: 'https://www.instagram.com/' } });
  expect(wrongSenderRes.isAsync).toBe(false);
  expect(wrongSenderRes.result.error).toBe('Blocked: invalid request sender.');

  // 9. Reject tab origin that is not instagram.com
  const wrongOriginRes = await sendMessage({ url: 'https://scontent-gru1-1.cdninstagram.com/v/t51/abc.jpg', type: 'image' }, { id: 'test-ext-id', tab: { url: 'https://evil.com/' } });
  expect(wrongOriginRes.isAsync).toBe(false);
  expect(wrongOriginRes.result.error).toBe('Blocked: request origin must be instagram.com.');

  // 10. Test evil.exe with type: 'image' becomes evil.jpg
  await sendMessage({ url: 'https://scontent-gru1-1.cdninstagram.com/v/t51/evil.exe', type: 'image' }, validSenderObj);
  await page.waitForTimeout(50);
  const evilExeArgs = await page.evaluate(() => window.downloadArgs);
  expect(evilExeArgs.filename).toBe('evil.jpg');

  // 11. Test filename with ..%2F is sanitized
  await sendMessage({ url: 'https://scontent-gru1-1.cdninstagram.com/v/t51/..%2Fevil.exe', type: 'image' }, validSenderObj);
  await page.waitForTimeout(50);
  const pathTraversalArgs = await page.evaluate(() => window.downloadArgs);
  expect(pathTraversalArgs.filename).toBe('evil.jpg');

  // 12. Reject URL exceeding max length (4096)
  const longUrl = 'https://scontent-gru1-1.cdninstagram.com/v/t51/' + 'a'.repeat(4100) + '.jpg';
  const longUrlRes = await sendMessage({ url: longUrl, type: 'image' }, validSenderObj);
  expect(longUrlRes.isAsync).toBe(false);
  expect(longUrlRes.result.error).toBe('Blocked: URL exceeds maximum length.');

  // 13. Test missing request validation
  const missingReqResult = await sendMessage(null, validSenderObj);
  expect(missingReqResult.isAsync).toBe(false);
  expect(missingReqResult.result.error).toBe('Invalid request: URL is missing.');

  // 14. Test missing URL validation
  const missingUrlResult = await sendMessage({}, validSenderObj);
  expect(missingUrlResult.isAsync).toBe(false);
  expect(missingUrlResult.result.error).toBe('Invalid request: URL is missing.');
});
