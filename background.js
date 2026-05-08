const b = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : {});

b.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    const options = {
        url: request.url,
        filename: request.type === 'image' ? 'image.jpg' : 'video.mp4',
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
