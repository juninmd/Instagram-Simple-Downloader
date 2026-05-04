const b = typeof browser !== 'undefined' ? browser : chrome;

b.runtime.onMessage.addListener(function (request) {

    function onStartedDownload(id) {
        console.log(`Started downloading: ${id}`);
    }

    function onFailed(error) {
        console.log(`Download failed: ${error}`);
    }

    const downloading = b.downloads.download({
        url: request.url,
        filename: request.type === 'image' ? 'image.jpg' : 'video.mp4',
        conflictAction: 'uniquify',
        saveAs: true
    });

    downloading.then(onStartedDownload, onFailed);
});
