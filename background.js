/** @type {Object} */
const b = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : {});

/**
 * Listens for messages from the content script to trigger a download.
 * Validates request sender, URL protocol/host, media type, and extracts sanitized filename.
 * Ensures compatibility between callback-based (Manifest V2) and promise-based implementations.
 * @param {Object} request - The message payload.
 * @param {Object} sender - The sender of the message.
 * @param {Function} sendResponse - Callback function to send a response back to the content script.
 * @returns {boolean} Returns true to indicate that the response will be sent asynchronously.
 */
b.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    const extensionId = (b.runtime && b.runtime.id) || (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
    const validation = window.ISD_BG_UTILS.validateRequest(request, sender, extensionId);

    if (!validation.ok) {
        sendResponse({ error: validation.error });
        return false; // Indicates synchronous response
    }

    const parsedFilename = window.ISD_BG_UTILS.extractFilename(validation.url, validation.type);

    const options = {
        url: validation.url,
        filename: parsedFilename,
        conflictAction: 'uniquify',
        saveAs: true
    };

    const downloading = new Promise((resolve, reject) => {
        try {
            const res = b.downloads.download(options, (id) => {
                if (b.runtime.lastError) return reject(new Error(b.runtime.lastError.message || b.runtime.lastError));
                resolve(id);
            });
            if (res && typeof res.then === 'function') {
                res.then(resolve, reject);
            }
        } catch (err) {
            reject(err);
        }
    });

    downloading
        .then((id) => {
            console.log(`Started downloading: ${id}`);
            sendResponse({ success: true, id });
        })
        .catch((error) => {
            console.error(`Download failed: ${error}`);
            sendResponse({ error: error.message || String(error) });
        });

    return true;
});
