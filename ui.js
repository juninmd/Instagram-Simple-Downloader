/**
 * UI Component Logic.
 * @namespace ISD_UI
 */
(function() {
  window.ISD_UI = window.ISD_UI || {};
  const U = window.ISD_UTILS, C = U.CONSTANTS, el = U.el;

  const b = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : {});

  /**
   * Creates a download button specific to the media type.
   * Integrates with the background script to trigger downloads.
   * @param {string} url - The URL of the media file to download.
   * @param {string} type - The media type, either 'video' or 'image'.
   * @param {number} index - The dynamic carousel index of the media item to ensure uniqueness.
   * @returns {HTMLButtonElement} The configured download button.
   */
  window.ISD_UI.createDownloadButton = (url, type, index) => {
    const label = `${type === 'video' ? 'Video' : 'Image'} #${index}`;
    return window.ISD_UI.createBaseButton({
      label,
      title: `${label} - Download full resolution ${type}`,
      icon: C.ICON_DOWNLOAD,
      background: type === 'video' ? C.VIDEO_COLOR : C.IMAGE_COLOR,
      loadingText: `${label} - Downloading...`,
      successText: `${label} - Started!`,
      errorText: `${label} - Error`,
      errorTitle: `${label} - Failed. Click to retry.`,
      onClick: () => new Promise((resolve, reject) => {
        try {
          const cb = (r) => {
            if (b.runtime.lastError) return reject(new Error(b.runtime.lastError.message || b.runtime.lastError));
            if (r && r.error) return reject(new Error(r.error));
            resolve(r);
          };
          const res = b.runtime.sendMessage({ url, type }, cb);
          if (res && typeof res.then === 'function') res.then(cb, reject);
        } catch (err) { reject(err); }
      })
    });
  };

  /**
   * Creates a copy link utility button.
   * Writes the provided URL directly to the user's clipboard.
   * @param {string} url - The URL to copy.
   * @param {number} index - The dynamic carousel index of the media item to ensure uniqueness.
   * @returns {HTMLButtonElement} The configured copy button.
   */
  window.ISD_UI.createCopyButton = (url, index) => {
    const label = index ? `Copy Link #${index}` : 'Copy Link';
    return window.ISD_UI.createBaseButton({
      label,
      title: `${label} - Copy link`,
      icon: C.ICON_COPY,
      background: C.COPY_COLOR,
      loadingText: `${label} - Processing...`,
      successText: `${label} - Copied!`,
      errorText: `${label} - Error`,
      errorTitle: `${label} - Failed. Click to retry.`,
      onClick: async () => await navigator.clipboard.writeText(url),
      onSuccess: (btn) => U.createConfetti(btn.getBoundingClientRect())
    });
  };

  /**
   * Appends the action buttons (download and copy) to a target DOM container.
   * Wraps buttons in a flexbox layout to ensure consistent styling.
   * @param {HTMLElement} container - The parent DOM element (typically an `<article>` or `<section>`) containing the media.
   * @param {string} src - The URL of the media to be manipulated by the buttons.
   * @param {string} type - The media type, either 'video' or 'image'.
   * @param {number} index - The calculated index of the item within the dynamic container.
   * @returns {void}
   */
  window.ISD_UI.appendButtons = (container, src, type, index) => {
    const target = container.tagName === 'SECTION' ? container : (container.querySelector('section') || container);
    if (!target) return;
    let wrapper = target.querySelector('.isd-wrapper');
    if (!wrapper) {
      wrapper = el('div', 'isd-wrapper', {}, { display: 'flex', flexWrap: 'wrap', marginBlockEnd: '8px', zIndex: 1000, position: 'relative' });
      target.prepend(wrapper);
    }
    wrapper.appendChild(window.ISD_UI.createDownloadButton(src, type, index));
    wrapper.appendChild(window.ISD_UI.createCopyButton(src, index));
  };
})();
