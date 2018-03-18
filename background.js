browser.runtime.onMessage.addListener(function (arg, sender, sendResponse) {
    function onStartedDownload(id) {
        console.log(`Started downloading: ${id}`);
    }

    function onFailed(error) {
        console.log(`Download failed: ${error}`);
    }

    let downloading = browser.downloads.download({
        url: arg,
        filename: 'foto.jpg',
        conflictAction: 'uniquify',
        saveAs: true
    });

    downloading.then(onStartedDownload, onFailed);
});
