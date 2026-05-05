const b = typeof browser !== 'undefined' ? browser : chrome;

b.runtime.onMessage.addListener(function (request) {

    function onStartedDownload(id) {
        console.log(`Started downloading: ${id}`);
    }

    function onFailed(error) {
        console.log(`Download failed: ${error}`);
    }

    const options = {
        url: request.url,
        filename: request.type === 'image' ? 'image.jpg' : 'video.mp4',
        conflictAction: 'uniquify',
        saveAs: true
    };

    const downloading = new Promise((resolve, reject) => {
        try {
            const res = b.downloads.download(options, (id) => {
                if (b.runtime.lastError) return reject(b.runtime.lastError);
                resolve(id);
            });
            if (res && typeof res.then === 'function') {
                res.then(resolve, reject);
            }
        } catch (err) {
            reject(err);
        }
    });

    downloading.then(onStartedDownload, onFailed);
});
