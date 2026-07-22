const b = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : {});

/**
 * Listens for messages from the content script to trigger a download.
 * Extracts the filename from the URL or falls back to a default based on the media type.
 * Ensures compatibility between callback-based (Manifest V2) and promise-based implementations.
 * @param {Object} request - The message payload.
 * @param {string} request.url - The URL of the media file to download.
 * @param {string} request.type - The media type ('image' or 'video').
 * @param {Object} sender - The sender of the message.
 * @param {Function} sendResponse - Callback function to send a response back to the content script.
 * @returns {boolean} Returns true to indicate that the response will be sent asynchronously.
 */
b.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    let parsedFilename = '';
    try {
        const urlObj = new URL(request.url);
        parsedFilename = urlObj.pathname.split('/').pop();
    } catch {
        // Ignore URL parsing errors
    }

    if (!parsedFilename) {
        parsedFilename = request.type === 'image' ? 'image.jpg' : 'video.mp4';
    }

    const options = {
        url: request.url,
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

    // Return true to indicate that we will send a response asynchronously
    return true;
});
