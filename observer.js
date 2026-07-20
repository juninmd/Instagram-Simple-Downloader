/**
 * Main Observer Logic.
 * @namespace ISD_OBSERVER
 */
(function() {
  const U = window.ISD_UTILS;
  const UI = window.ISD_UI;

  // Inject styles immediately
  U.injectStyles();

  const MEDIA_SELECTOR = 'img[srcset]:not([download-button="ok"]), video:not([download-button="ok"])';

  /**
   * Processes a list of media elements (images or videos), extracts their source URLs,
   * calculates dynamic indices for uniqueness, and appends the action buttons to their container.
   * @param {HTMLElement} container - The parent container element (e.g., an article or section).
   * @param {NodeList|HTMLElement[]} items - A collection of media elements matching the MEDIA_SELECTOR.
   */
  const processItems = (container, items) => {
    let existingCount = container.querySelectorAll('.isd-wrapper [aria-label^="Video"], .isd-wrapper [aria-label^="Image"]').length;
    items.forEach((item) => {
      let src = item.src;
      if (!src && item.nodeName === 'VIDEO') {
        const source = item.querySelector('source');
        if (source) src = source.src;
      }
      if (!src) return;

      existingCount++;
      const type = item.nodeName === 'VIDEO' ? 'video' : 'image';
      UI.appendButtons(container, src, type, existingCount);
      item.setAttribute('download-button', 'ok');
    });
  };

  /**
   * Scans the DOM for Instagram feed posts and Reels, which use `<article>` elements.
   * Identifies un-processed media items and dispatches them for button injection.
   */
  const searchFeed = () => {
    const articles = document.querySelectorAll('article');
    articles.forEach((article) => {
      const items = article.querySelectorAll(MEDIA_SELECTOR);
      processItems(article, items);
    });
  };

  /**
   * Scans the DOM for Instagram Stories, which typically use a specialized `<section>` layout.
   * Identifies un-processed media items and dispatches them for button injection.
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
   * Scans the DOM for the active post modal or detail view on a user profile.
   * Identifies un-processed media items and dispatches them for button injection.
   */
  const searchProfile = () => {
    const article = document.querySelector('article');
    if (!article) return;
    const items = article.querySelectorAll(MEDIA_SELECTOR);
    processItems(article, items);
  };

  /**
   * The core logic executed periodically to evaluate the current route.
   * Parses the URL pathname and delegates DOM scanning to route-specific handler functions.
   */
  const observerCallback = () => {
    try {
      const url = new URL(window.location.href);
      const pathname = url.pathname;

      const isFeedOrReels = pathname === '/' || pathname.startsWith('/reels/');

      if (isFeedOrReels) {
        searchFeed();
      } else if (pathname.startsWith('/stories/')) {
        searchStories();
      } else if (pathname.startsWith('/p/')) {
        searchProfile();
      }
    } catch {
      // Ignore URL parsing errors
    }
  };

  let timeoutId = null;

  /**
   * A debounced wrapper for the main observer callback to optimize performance.
   * Prevents browser lag by rate-limiting intensive DOM queries during rapid mutations.
   */
  const debouncedObserverCallback = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      observerCallback();
      timeoutId = null;
    }, 100);
  };

  const observer = new MutationObserver(debouncedObserverCallback);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial run
  observerCallback();
})();
