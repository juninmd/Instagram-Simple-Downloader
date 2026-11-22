/**
 * Main Observer Logic.
 * @namespace ISD_OBSERVER
 */
(function() {
  const U = window.ISD_UTILS;
  const UI = window.ISD_UI;

  // Inject styles immediately
  U.injectStyles();
  if (U.injectAperture) U.injectAperture();

  const MEDIA_SELECTOR = 'img[srcset]:not([download-button="ok"]), video:not([download-button="ok"])';

  /**
   * Picks the largest candidate of an img srcset (`w` descriptors first, then `x`).
   * @param {string} srcset - The raw srcset attribute.
   * @returns {string|null} The URL of the largest candidate, or null when none has a valid descriptor.
   */
  const pickLargestFromSrcset = (srcset) => {
    const best = { w: null, x: null };
    for (const [, url, num, unit] of (srcset || '').matchAll(/(\S+?)\s+(\d+(?:\.\d+)?)([wx])(?:,|\s|$)/g)) {
      const size = parseFloat(num);
      if (!best[unit] || size > best[unit].size) best[unit] = { url, size };
    }
    return (best.w || best.x || {}).url || null;
  };

  /**
   * Helper function to extract the media source URL from an HTML element.
   * @param {HTMLElement} item - The media element (img or video).
   * @returns {string|null} The source URL, or null if not found.
   */
  const getMediaSource = (item) => {
    // currentSrc is the variant the browser picked for this layout, usually not the largest one.
    let src = (item.nodeName === 'IMG' && pickLargestFromSrcset(item.getAttribute('srcset'))) || item.currentSrc || item.src;
    if (!src && item.nodeName === 'VIDEO') {
      const source = item.querySelector('source[src]');
      if (source) src = source.src;
    }
    // blob: URLs are local MSE handles the background script can never download.
    if (!src || /^blob:/i.test(src)) return null;
    return src;
  };

  /**
   * Processes a list of media elements (images or videos), extracts their source URLs,
   * calculates dynamic indices for uniqueness, and appends the action buttons to their container.
   * @param {HTMLElement} container - The parent container element (e.g., an article or section).
   * @param {NodeList|HTMLElement[]} items - A collection of media elements matching the MEDIA_SELECTOR.
   * @returns {void}
   */
  const processItems = (container, items) => {
    if (!items || items.length === 0) return;

    // Calculate dynamic numbering indices by querying the count of existing elements in the DOM container
    // rather than using the loop index to prevent duplicate numbering of newly loaded items in carousels.
    let existingCount = container.querySelectorAll('[download-button="ok"]').length;
    items.forEach((item) => {
      const src = getMediaSource(item);
      if (!src) return;

      existingCount++;
      const type = item.nodeName === 'VIDEO' ? 'video' : 'image';
      UI.appendButtons(container, src, type, existingCount);
      item.setAttribute('download-button', 'ok');
    });
  };

  /**
   * Scans the DOM for Instagram feed posts, Reels, and profile post modals, which use `<article>` elements.
   * Identifies un-processed media items and dispatches them for button injection.
   * @returns {void}
   */
  const searchArticles = () => {
    const articles = document.querySelectorAll('article');
    articles.forEach((article) => {
      const items = article.querySelectorAll(MEDIA_SELECTOR);
      processItems(article, items);
    });
  };

  /**
   * Fallback for the logged-out permalink layout (/p/<id>/), which has no `<article>`
   * and serves the main image without `srcset`. Only the primary post media is handled.
   * @returns {void}
   */
  const searchMainPost = () => {
    if (document.querySelector('article')) return;
    const main = document.querySelector('main');
    if (!main) return;
    const candidates = [...main.querySelectorAll('video, img[src*="cdninstagram"]')];
    const media = candidates.find((m) => m.nodeName === 'VIDEO' || m.naturalWidth >= 300);
    if (media) return media.getAttribute('download-button') === 'ok' || processItems(main, [media]);
    // naturalWidth stays 0 until decode and a load is no childList mutation: rescan on load (deduped listener).
    candidates.forEach((m) => m.complete || m.addEventListener('load', observerCallback, { once: true }));
  };

  /**
   * Scans the DOM for Instagram Stories, which typically use a specialized `<section>` layout.
   * Identifies un-processed media items and dispatches them for button injection.
   * @returns {void}
   */
  const searchStories = () => {
    const section = document.querySelector('section[style]');
    if (!section) return;
    const items = section.querySelectorAll(MEDIA_SELECTOR);

    items.forEach((item) => {
      processItems(item.parentElement, [item]);
    });
  };

  /**
   * The core logic executed periodically to evaluate the current route.
   * Parses the URL pathname and delegates DOM scanning to route-specific handler functions.
   * @returns {void}
   */
  const observerCallback = () => {
    try {
      const pathname = window.location.pathname;

      const isArticleRoute = pathname === '/' || /^\/(reels?|p)(\/|$)/.test(pathname);

      if (isArticleRoute) {
        searchArticles();
        searchMainPost();
      } else if (pathname.startsWith('/stories/')) {
        searchStories();
      }
    } catch {
      // Ignore URL parsing errors
    }
  };

  /**
   * A debounced wrapper for the main observer callback to optimize performance.
   * Prevents browser lag by rate-limiting intensive DOM queries during rapid mutations.
   */
  const debouncedObserverCallback = U.debounce(observerCallback, U.CONSTANTS.OBSERVER_DEBOUNCE_MS);

  const observer = new MutationObserver(debouncedObserverCallback);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial run
  observerCallback();
})();
