browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    function onStartedDownload(id) {
        console.log(`Started downloading: ${id}`);
    }

    function onFailed(error) {
        console.log(`Download failed: ${error}`);
    }

    const downloading = browser.downloads.download({
        url: request.url,
        filename: request.type === 'image' ? 'image.jpg' : 'video.mp4',
        conflictAction: 'uniquify',
        saveAs: true
    });

    downloading.then(onStartedDownload, onFailed);
});
